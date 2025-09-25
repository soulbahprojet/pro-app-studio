import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useCountryCurrency } from '@/hooks/useCountryCurrency';
import { currencyService } from '@/services/currencyService';

export function useAutoSetCurrency() {
  const { user } = useAuth();
  const { getCountryDefaultCurrency } = useCountryCurrency();

  useEffect(() => {
    const setUserDefaultCurrency = async () => {
      if (!user?.id) return;

      try {
        // Récupérer le profil utilisateur
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('country, preferred_currency')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }

        // Si l'utilisateur n'a pas encore de devise préférée définie
        if (!profile?.preferred_currency && profile?.country) {
          const defaultCurrency = getCountryDefaultCurrency(profile.country);
          
          // Mettre à jour le profil avec la devise par défaut
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ preferred_currency: defaultCurrency })
            .eq('user_id', user.id);

          if (updateError) {
            console.error('Error updating user currency:', updateError);
          } else {
            // Mettre à jour aussi le service de devises local
            currencyService.setPreferredCurrency(defaultCurrency);
            console.log(`Auto-set currency to ${defaultCurrency} for country ${profile.country}`);
          }
        } else if (profile?.preferred_currency) {
          // S'assurer que le service local est synchronisé
          currencyService.setPreferredCurrency(profile.preferred_currency);
        }
      } catch (error) {
        console.error('Error in auto-set currency:', error);
      }
    };

    setUserDefaultCurrency();
  }, [user?.id, getCountryDefaultCurrency]);
}