import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePDGStatus = () => {
  const [isPDG, setIsPDG] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkPDGStatus = async () => {
      if (!user) {
        setIsPDG(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('admin_roles')
          .select('role_type')
          .eq('user_id', user.id)
          .eq('role_type', 'pdg')
          .limit(1);

        if (error) {
          console.error('PDG check error:', error);
          setIsPDG(false);
        } else {
          setIsPDG(data && data.length > 0);
        }
      } catch (error) {
        console.error('PDG check failed:', error);
        setIsPDG(false);
      } finally {
        setLoading(false);
      }
    };

    checkPDGStatus();
  }, [user]);

  return { isPDG, loading };
};