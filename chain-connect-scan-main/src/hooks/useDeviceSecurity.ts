import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LocationData {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
}

interface DeviceSecurityData {
  user_id: string;
  device_imei: string;
  device_model?: string;
  device_os?: string;
  device_brand?: string;
  is_blocked: boolean;
  security_status: string;
  blocked_reason?: string;
}

export const useDeviceSecurity = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [lastLocation, setLastLocation] = useState<LocationData | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceSecurityData | null>(null);
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([]);

  // Initialize device security
  useEffect(() => {
    initializeDeviceSecurity();
    loadSecurityAlerts();
  }, []);

  const initializeDeviceSecurity = async () => {
    try {
      // Get device information
      const deviceData = {
        user_agent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screen: {
          width: screen.width,
          height: screen.height,
          colorDepth: screen.colorDepth
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      // Generate device fingerprint (simple implementation)
      const deviceFingerprint = btoa(JSON.stringify(deviceData)).substring(0, 20);

      // Register or update device in Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('device_security')
          .upsert({
            user_id: user.id,
            device_imei: deviceFingerprint,
            device_model: getDeviceModel(),
            device_os: getDeviceOS(),
            device_brand: getDeviceBrand(),
            last_seen_at: new Date().toISOString()
          });

        if (error) {
          console.error('Failed to register device:', error);
        }
      }
    } catch (error) {
      console.error('Failed to initialize device security:', error);
    }
  };

  const loadSecurityAlerts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSecurityAlerts(data || []);
    } catch (error) {
      console.error('Failed to load security alerts:', error);
    }
  };

  const startLocationTracking = async () => {
    if (!navigator.geolocation) {
      toast.error('Géolocalisation non supportée');
      return;
    }

    setIsTracking(true);

    const trackLocation = () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData: LocationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };

          setLastLocation(locationData);

          try {
            const { error } = await supabase.functions.invoke('device-security', {
              body: {
                action: 'track_location',
                data: locationData
              }
            });

            if (error) {
              console.error('Failed to track location:', error);
            }
          } catch (error) {
            console.error('Location tracking error:', error);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Erreur de géolocalisation');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    };

    // Track location immediately and then every 5 minutes
    trackLocation();
    const interval = setInterval(trackLocation, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
      setIsTracking(false);
    };
  };

  const sendEmergencyAlert = async (emergencyType: 'theft' | 'lost' | 'suspicious_activity', message: string) => {
    try {
      if (!navigator.geolocation) {
        toast.error('Géolocalisation requise pour l\'alerte d\'urgence');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const alertData = {
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: Date.now()
            },
            message,
            emergency_type: emergencyType
          };

          const { error } = await supabase.functions.invoke('device-security', {
            body: {
              action: 'emergency_alert',
              data: alertData
            }
          });

          if (error) {
            throw error;
          }

          toast.success('Alerte d\'urgence envoyée');
        },
        (error) => {
          console.error('Failed to get location for emergency:', error);
          toast.error('Impossible d\'obtenir la localisation');
        }
      );
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
      toast.error('Erreur lors de l\'envoi de l\'alerte');
    }
  };

  const executeRemoteCommand = async (command: 'block_device' | 'wipe_data' | 'force_logout', deviceId: string, reason?: string) => {
    try {
      const { error } = await supabase.functions.invoke('device-security', {
        body: {
          action: 'remote_command',
          data: {
            command,
            device_id: deviceId,
            reason
          }
        }
      });

      if (error) {
        throw error;
      }

      toast.success(`Commande ${command} exécutée avec succès`);
      
      // If blocking device, handle logout
      if (command === 'block_device' || command === 'force_logout') {
        await supabase.auth.signOut();
        window.location.href = '/auth';
      }

    } catch (error) {
      console.error('Failed to execute remote command:', error);
      toast.error('Erreur lors de l\'exécution de la commande');
    }
  };

  const checkDeviceStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('device_security')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setDeviceInfo(data);
        
        // Check if device is blocked
        if (data.is_blocked) {
          toast.error(`Appareil bloqué: ${data.blocked_reason}`);
          await supabase.auth.signOut();
          window.location.href = '/auth';
        }
      }
    } catch (error) {
      console.error('Failed to check device status:', error);
    }
  };

  // Helper functions to get device information
  const getDeviceModel = (): string => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('iPad')) return 'iPad';
    if (userAgent.includes('Android')) return 'Android Device';
    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Mac')) return 'Mac';
    return 'Unknown Device';
  };

  const getDeviceOS = (): string => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows NT 10.0')) return 'Windows 10';
    if (userAgent.includes('Windows NT 6.3')) return 'Windows 8.1';
    if (userAgent.includes('Windows NT 6.1')) return 'Windows 7';
    if (userAgent.includes('Mac OS X')) return 'macOS';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone OS')) return 'iOS';
    return 'Unknown OS';
  };

  const getDeviceBrand = (): string => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'Apple';
    if (userAgent.includes('Samsung')) return 'Samsung';
    if (userAgent.includes('Huawei')) return 'Huawei';
    if (userAgent.includes('Xiaomi')) return 'Xiaomi';
    return 'Unknown Brand';
  };

  return {
    isTracking,
    lastLocation,
    deviceInfo,
    securityAlerts,
    startLocationTracking,
    sendEmergencyAlert,
    executeRemoteCommand,
    checkDeviceStatus,
    loadSecurityAlerts
  };
};