import { useState, useEffect, useCallback } from 'react';
import { currencyService } from '@/services/currencyService';

interface CurrencyHookReturn {
  preferredCurrency: string;
  setPreferredCurrency: (currency: string) => void;
  convert: (amount: number, fromCurrency: string, toCurrency?: string) => Promise<number>;
  formatAmount: (amount: number, currency?: string, showAlternative?: boolean) => string;
  isLoading: boolean;
  lastUpdate: Date | null;
  refreshRates: () => Promise<void>;
}

export function useCurrency(): CurrencyHookReturn {
  const [preferredCurrency, setPreferredCurrencyState] = useState(() => 
    currencyService.getPreferredCurrency()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(() => 
    currencyService.getLastUpdate()
  );

  const setPreferredCurrency = useCallback((currency: string) => {
    currencyService.setPreferredCurrency(currency);
    setPreferredCurrencyState(currency);
  }, []);

  const convert = useCallback(async (
    amount: number, 
    fromCurrency: string, 
    toCurrency?: string
  ): Promise<number> => {
    const targetCurrency = toCurrency || preferredCurrency;
    
    try {
      const result = await currencyService.convert(amount, fromCurrency, targetCurrency);
      return result.convertedAmount;
    } catch (error) {
      console.error('Currency conversion failed:', error);
      return amount; // Fallback to original amount
    }
  }, [preferredCurrency]);

  const formatAmount = useCallback((
    amount: number, 
    currency?: string, 
    showAlternative = false
  ): string => {
    const targetCurrency = currency || preferredCurrency;
    return currencyService.formatAmount(amount, targetCurrency, showAlternative);
  }, [preferredCurrency]);

  const refreshRates = useCallback(async () => {
    setIsLoading(true);
    try {
      await currencyService.refreshRates();
      setLastUpdate(currencyService.getLastUpdate());
    } catch (error) {
      console.error('Failed to refresh currency rates:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Vérifier les taux au montage du composant
  useEffect(() => {
    if (!currencyService.isCacheValid()) {
      refreshRates();
    }
  }, [refreshRates]);

  return {
    preferredCurrency,
    setPreferredCurrency,
    convert,
    formatAmount,
    isLoading,
    lastUpdate,
    refreshRates
  };
}