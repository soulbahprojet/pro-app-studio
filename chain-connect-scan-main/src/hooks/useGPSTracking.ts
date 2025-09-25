import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  altitude?: number;
}

interface GPSTrackingData {
  id: string;
  user_id: string;
  order_id?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  altitude?: number;
  timestamp: string;
  is_active: boolean;
  profiles?: {
    readable_id: string;
    full_name: string;
    role: string;
  };
}

interface UseGPSTrackingProps {
  orderId?: string;
  autoUpdate?: boolean;
  interval?: number;
}

export const useGPSTracking = ({ 
  orderId, 
  autoUpdate = false, 
  interval = 10000 
}: UseGPSTrackingProps = {}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [position, setPosition] = useState<GPSPosition | null>(null);
  const [trackingData, setTrackingData] = useState<GPSTrackingData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const watchId = useRef<number | null>(null);
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Start GPS tracking
  const startTracking = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setIsTracking(true);
    setError(null);

    // Start watching position
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newPosition: GPSPosition = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed || undefined,
          heading: pos.coords.heading || undefined,
          altitude: pos.coords.altitude || undefined,
        };
        setPosition(newPosition);

        // Auto-update if enabled
        if (autoUpdate) {
          updatePosition(newPosition);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError(`GPS Error: ${err.message}`);
        toast({
          title: "Erreur GPS",
          description: err.message,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    // Set up auto-update interval
    if (autoUpdate && interval > 0) {
      intervalId.current = setInterval(() => {
        if (position) {
          updatePosition(position);
        }
      }, interval);
    }
  }, [autoUpdate, interval, orderId, toast]);

  // Stop GPS tracking
  const stopTracking = useCallback(() => {
    setIsTracking(false);
    
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
  }, []);

  // Update position to server
  const updatePosition = useCallback(async (pos: GPSPosition) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('gps-tracking', {
        body: {
          orderId,
          latitude: pos.latitude,
          longitude: pos.longitude,
          accuracy: pos.accuracy,
          speed: pos.speed,
          heading: pos.heading,
          altitude: pos.altitude,
        },
      });

      if (error) throw error;

      console.log('Position updated successfully:', data);
      
    } catch (err) {
      console.error('Failed to update position:', err);
      setError('Failed to update position');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  // Fetch tracking data
  const fetchTrackingData = useCallback(async (filterOrderId?: string, filterUserId?: string) => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams();
      if (filterOrderId) params.append('orderId', filterOrderId);
      if (filterUserId) params.append('userId', filterUserId);
      
      const { data, error } = await supabase.functions.invoke('gps-tracking', {
        body: null,
      });

      if (error) throw error;

      setTrackingData(data.data || []);
      
    } catch (err) {
      console.error('Failed to fetch tracking data:', err);
      setError('Failed to fetch tracking data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('gps-tracking-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'gps_tracking',
          filter: orderId ? `order_id=eq.${orderId}` : undefined,
        },
        (payload) => {
          console.log('New GPS position:', payload);
          // Refresh tracking data
          if (orderId) {
            fetchTrackingData(orderId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, fetchTrackingData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    isTracking,
    position,
    trackingData,
    error,
    isLoading,
    startTracking,
    stopTracking,
    updatePosition,
    fetchTrackingData,
  };
};