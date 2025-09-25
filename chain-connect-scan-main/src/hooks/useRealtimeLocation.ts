import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LocationData {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: string;
  order_id?: string;
  user_details?: {
    full_name: string;
    role: string;
    readable_id: string;
  };
}

interface UseRealtimeLocationProps {
  orderId?: string;
  userId?: string;
  updateInterval?: number; // seconds
  enabled?: boolean;
}

export const useRealtimeLocation = ({
  orderId,
  userId,
  updateInterval = 10,
  enabled = true
}: UseRealtimeLocationProps = {}) => {
  const [currentPosition, setCurrentPosition] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
  } | null>(null);
  
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Get current position
  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      );
    });
  }, []);

  // Update location to server
  const updateLocationToServer = useCallback(async (position: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('gps-tracking', {
        body: {
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy,
          speed: position.speed,
          heading: position.heading,
          order_id: orderId
        }
      });

      if (error) {
        console.error('Failed to update location:', error);
        setError('Failed to update location to server');
      } else {
        console.log('Location updated successfully');
        setError(null);
      }
    } catch (error) {
      console.error('Location update error:', error);
      setError('Network error updating location');
    }
  }, [orderId]);

  // Start real-time location tracking
  const startTracking = useCallback(async () => {
    if (!enabled || !navigator.geolocation) {
      setError('Geolocation not available');
      return;
    }

    try {
      // Get initial position
      const position = await getCurrentPosition();
      const positionData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed || undefined,
        heading: position.coords.heading || undefined
      };

      setCurrentPosition(positionData);
      setIsTracking(true);
      setError(null);

      // Send initial position
      await updateLocationToServer(positionData);

      // Start watching position changes
      const id = navigator.geolocation.watchPosition(
        async (pos) => {
          const newPosition = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            speed: pos.coords.speed || undefined,
            heading: pos.coords.heading || undefined
          };

          setCurrentPosition(newPosition);
          
          // Update server periodically
          await updateLocationToServer(newPosition);
        },
        (error) => {
          console.error('Position tracking error:', error);
          setError(`GPS error: ${error.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        }
      );

      setWatchId(id);

      // Set up periodic server updates
      const interval = setInterval(async () => {
        if (currentPosition) {
          await updateLocationToServer(currentPosition);
        }
      }, updateInterval * 1000);

      // Store interval ID for cleanup
      return () => {
        clearInterval(interval);
      };

    } catch (error) {
      console.error('Failed to start tracking:', error);
      setError(`Failed to start tracking: ${error.message}`);
      setIsTracking(false);
    }
  }, [enabled, getCurrentPosition, updateLocationToServer, updateInterval, currentPosition]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
    setCurrentPosition(null);
    setError(null);
  }, [watchId]);

  // Fetch location history
  const fetchLocationHistory = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('gps-tracking', {
        body: {
          action: 'get_history',
          order_id: orderId,
          user_id: userId
        }
      });

      if (error) {
        console.error('Failed to fetch location history:', error);
        setError('Failed to fetch location history');
      } else {
        setLocationHistory(data || []);
      }
    } catch (error) {
      console.error('Location history error:', error);
      setError('Network error fetching history');
    }
  }, [orderId, userId]);

  // Subscribe to real-time location updates
  useEffect(() => {
    if (!enabled) return;

    let subscription: any;

    const setupRealtimeSubscription = async () => {
      try {
        // Subscribe to GPS tracking table changes
        subscription = supabase
          .channel('gps_tracking_updates')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'gps_tracking',
              filter: orderId ? `order_id=eq.${orderId}` : undefined
            },
            (payload) => {
              const newLocation = payload.new as any;
              setLocationHistory(prev => [newLocation, ...prev.slice(0, 99)]); // Keep last 100 positions
            }
          )
          .subscribe();

      } catch (error) {
        console.error('Realtime subscription error:', error);
      }
    };

    setupRealtimeSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [enabled, orderId]);

  // Auto-fetch history on mount
  useEffect(() => {
    if (enabled) {
      fetchLocationHistory();
    }
  }, [enabled, fetchLocationHistory]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    currentPosition,
    locationHistory,
    isTracking,
    error,
    startTracking,
    stopTracking,
    updateLocationToServer,
    fetchLocationHistory
  };
};