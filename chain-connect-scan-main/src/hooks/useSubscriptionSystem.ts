import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSubscriptionSystem = () => {
  const [isSubscriptionSystemEnabled, setIsSubscriptionSystemEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  const checkSubscriptionSystemStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'subscription_system_enabled')
        .maybeSingle();

      if (error) {
        console.error('Error checking subscription system status:', error);
        return;
      }

      if (data) {
        setIsSubscriptionSystemEnabled((data.setting_value as any)?.enabled ?? true);
      }
    } catch (error) {
      console.error('Error checking subscription system status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSubscriptionSystemStatus();
  }, []);

  return { 
    isSubscriptionSystemEnabled, 
    loading, 
    refreshStatus: checkSubscriptionSystemStatus 
  };
};