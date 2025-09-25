import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CountryCurrency {
  country_code: string;
  country_name: string;
  default_currency: string;
  currency_name: string;
  currency_symbol: string;
}

export function useCountryCurrency() {
  const [countryCurrencies, setCountryCurrencies] = useState<CountryCurrency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCountryCurrencies();
  }, []);

  const loadCountryCurrencies = async () => {
    try {
      const { data, error } = await supabase
        .from('country_currencies')
        .select('*')
        .order('country_name');

      if (error) {
        console.error('Error loading country currencies:', error);
        return;
      }

      setCountryCurrencies(data || []);
    } catch (error) {
      console.error('Error loading country currencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCountryDefaultCurrency = (countryCode: string): string => {
    const country = countryCurrencies.find(
      c => c.country_code.toLowerCase() === countryCode.toLowerCase()
    );
    return country?.default_currency || 'USD';
  };

  const getCurrencyByCountry = (countryCode: string): CountryCurrency | null => {
    return countryCurrencies.find(
      c => c.country_code.toLowerCase() === countryCode.toLowerCase()
    ) || null;
  };

  return {
    countryCurrencies,
    loading,
    getCountryDefaultCurrency,
    getCurrencyByCountry,
    refresh: loadCountryCurrencies
  };
}