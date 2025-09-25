/**
 * Service de gestion multi-devise avec API ExchangeRate-API
 * Gestion des taux de change en temps réel et conversion
 */

import { supabase } from "@/integrations/supabase/client";

interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rate: number;
  lastUpdated: Date;
}

interface ConversionResult {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  convertedAmount: number;
}

interface CacheEntry {
  rates: Map<string, CurrencyRate>;
  lastUpdated: Date;
}

// Configuration des devises supportées
const SUPPORTED_CURRENCIES = {
  'GNF': { name: 'Franc Guinéen', symbol: 'GNF' },
  'USD': { name: 'Dollar US', symbol: '$' },
  'EUR': { name: 'Euro', symbol: '€' },
  'XOF': { name: 'Franc CFA', symbol: 'FCFA' },
  'GBP': { name: 'Livre Sterling', symbol: '£' },
  'CHF': { name: 'Franc Suisse', symbol: 'CHF' },
  'CAD': { name: 'Dollar Canadien', symbol: 'C$' },
  'JPY': { name: 'Yen Japonais', symbol: '¥' },
  'CNY': { name: 'Yuan Chinois', symbol: '¥' },
  'NGN': { name: 'Naira Nigérian', symbol: '₦' },
  'ZAR': { name: 'Rand Sud-Africain', symbol: 'R' },
  'KES': { name: 'Shilling Kenyan', symbol: 'KSh' },
  'GHS': { name: 'Cedi Ghanéen', symbol: 'GH₵' },
  'XAF': { name: 'Franc CFA Central', symbol: 'FCFA' },
  'MAD': { name: 'Dirham Marocain', symbol: 'DH' },
  'EGP': { name: 'Livre Égyptienne', symbol: 'E£' }
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

class CurrencyService {
  private cache: CacheEntry | null = null;
  private refreshPromise: Promise<void> | null = null;

  constructor() {
    this.loadFromCache();
    this.scheduleAutoRefresh();
  }

  private loadFromCache() {
    try {
      const cached = localStorage.getItem('currency_cache');
      if (cached) {
        const data = JSON.parse(cached);
        const lastUpdated = new Date(data.lastUpdated);
        
        if (Date.now() - lastUpdated.getTime() < CACHE_DURATION) {
          const rates = new Map<string, CurrencyRate>();
          Object.entries(data.rates).forEach(([code, rate]: [string, any]) => {
            rates.set(code, {
              ...rate,
              lastUpdated: new Date(rate.lastUpdated)
            });
          });
          
          this.cache = { rates, lastUpdated };
          console.log('Loaded currency rates from cache');
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to load currency cache:', error);
    }
    
    // Cache invalide ou inexistant, charger les valeurs par défaut
    this.initializeDefaultRates();
  }

  private initializeDefaultRates() {
    const rates = new Map<string, CurrencyRate>();
    
    // Valeurs par défaut de base
    rates.set('USD', { code: 'USD', name: 'Dollar US', symbol: '$', rate: 1, lastUpdated: new Date() });
    rates.set('GNF', { code: 'GNF', name: 'Franc Guinéen', symbol: 'GNF', rate: 8600, lastUpdated: new Date() });
    rates.set('EUR', { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92, lastUpdated: new Date() });
    rates.set('XOF', { code: 'XOF', name: 'Franc CFA', symbol: 'FCFA', rate: 615, lastUpdated: new Date() });
    
    this.cache = {
      rates,
      lastUpdated: new Date(0) // Force le rafraîchissement
    };
    
    // Rafraîchir immédiatement les taux réels
    this.refreshRates();
  }

  private saveToCache() {
    if (!this.cache) return;
    
    try {
      const cacheData = {
        rates: Object.fromEntries(this.cache.rates.entries()),
        lastUpdated: this.cache.lastUpdated.toISOString()
      };
      localStorage.setItem('currency_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save currency cache:', error);
    }
  }

  private scheduleAutoRefresh() {
    // Vérifier toutes les heures si les taux doivent être rafraîchis
    setInterval(() => {
      if (this.shouldRefresh()) {
        this.refreshRates();
      }
    }, 60 * 60 * 1000); // 1 heure
  }

  private shouldRefresh(): boolean {
    if (!this.cache) return true;
    return Date.now() - this.cache.lastUpdated.getTime() > CACHE_DURATION;
  }

  /**
   * Rafraîchir les taux de change depuis l'API
   */
  async refreshRates(): Promise<void> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this._doRefreshRates();
    
    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async _doRefreshRates(): Promise<void> {
    try {
      console.log('Refreshing exchange rates...');
      
      const { data, error } = await supabase.functions.invoke('exchange-rates', {
        body: { action: 'refresh' }
      });

      if (error) {
        throw error;
      }

      // Recharger depuis la base de données
      await this.loadRatesFromDatabase();
      
      console.log('Exchange rates refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh exchange rates:', error);
      throw error;
    }
  }

  private async loadRatesFromDatabase(): Promise<void> {
    try {
      const { data: ratesData, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('last_updated', { ascending: false });

      if (error) {
        throw error;
      }

      const rates = new Map<string, CurrencyRate>();
      
      // Grouper par devise cible et garder la plus récente
      const latestRates = new Map<string, any>();
      ratesData?.forEach(rate => {
        const key = `${rate.base_currency}_${rate.target_currency}`;
        if (!latestRates.has(key) || 
            new Date(rate.last_updated) > new Date(latestRates.get(key).last_updated)) {
          latestRates.set(key, rate);
        }
      });

      // Convertir en format CurrencyRate
      latestRates.forEach(rate => {
        const currencyInfo = SUPPORTED_CURRENCIES[rate.target_currency as keyof typeof SUPPORTED_CURRENCIES];
        if (currencyInfo) {
          rates.set(rate.target_currency, {
            code: rate.target_currency,
            name: currencyInfo.name,
            symbol: currencyInfo.symbol,
            rate: parseFloat(rate.rate),
            lastUpdated: new Date(rate.last_updated)
          });
        }
      });

      // Toujours inclure USD comme base
      if (!rates.has('USD')) {
        rates.set('USD', {
          code: 'USD',
          name: 'Dollar US',
          symbol: '$',
          rate: 1,
          lastUpdated: new Date()
        });
      }

      this.cache = {
        rates,
        lastUpdated: new Date()
      };

      this.saveToCache();
    } catch (error) {
      console.error('Failed to load rates from database:', error);
    }
  }

  /**
   * Obtenir toutes les devises supportées
   */
  getSupportedCurrencies(): CurrencyRate[] {
    if (!this.cache) {
      this.initializeDefaultRates();
    }
    return Array.from(this.cache!.rates.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Obtenir le taux d'une devise
   */
  getRate(currencyCode: string): CurrencyRate | null {
    if (!this.cache) {
      this.initializeDefaultRates();
    }
    return this.cache!.rates.get(currencyCode.toUpperCase()) || null;
  }

  /**
   * Convertir un montant d'une devise à une autre
   */
  async convert(amount: number, fromCurrency: string, toCurrency: string): Promise<ConversionResult> {
    if (fromCurrency === toCurrency) {
      return {
        amount,
        fromCurrency,
        toCurrency,
        rate: 1,
        convertedAmount: amount
      };
    }

    try {
      // Essayer d'abord la conversion via l'API pour les taux les plus récents
      const { data, error } = await supabase.functions.invoke('exchange-rates', {
        body: { 
          action: 'convert',
          from: fromCurrency,
          to: toCurrency,
          amount: amount
        }
      });

      if (!error && data?.convertedAmount) {
        return {
          amount,
          fromCurrency,
          toCurrency,
          rate: data.rate,
          convertedAmount: data.convertedAmount
        };
      }
    } catch (error) {
      console.warn('API conversion failed, using local rates:', error);
    }

    // Fallback sur les taux locaux
    return this.convertLocal(amount, fromCurrency, toCurrency);
  }

  /**
   * Conversion locale (fallback)
   */
  convertLocal(amount: number, fromCurrency: string, toCurrency: string): ConversionResult {
    const from = this.getRate(fromCurrency);
    const to = this.getRate(toCurrency);

    if (!from || !to) {
      throw new Error(`Devise non supportée: ${fromCurrency} ou ${toCurrency}`);
    }

    // Conversion via USD comme devise de base
    let convertedAmount: number;
    let rate: number;

    if (fromCurrency === 'USD') {
      rate = to.rate;
      convertedAmount = amount * rate;
    } else if (toCurrency === 'USD') {
      rate = 1 / from.rate;
      convertedAmount = amount * rate;
    } else {
      // Conversion USD -> devise cible via USD
      const amountInUSD = amount / from.rate;
      convertedAmount = amountInUSD * to.rate;
      rate = to.rate / from.rate;
    }

    return {
      amount,
      fromCurrency: from.code,
      toCurrency: to.code,
      rate,
      convertedAmount: Math.round(convertedAmount * 100) / 100
    };
  }

  /**
   * Formater un montant avec le symbole de devise
   */
  formatAmount(amount: number, currencyCode: string, showAlternative = false): string {
    const currency = this.getRate(currencyCode);
    if (!currency) return amount.toLocaleString();

    const formatted = amount.toLocaleString('fr-FR', {
      minimumFractionDigits: currencyCode === 'GNF' ? 0 : 2,
      maximumFractionDigits: currencyCode === 'GNF' ? 0 : 2
    });
    
    let result: string;
    
    // Placer le symbole selon la devise
    switch (currency.code) {
      case 'USD':
      case 'EUR':
      case 'GBP':
      case 'CAD':
        result = `${currency.symbol}${formatted}`;
        break;
      default:
        result = `${formatted} ${currency.symbol}`;
    }

    // Ajouter la conversion en devise alternative si demandé
    if (showAlternative && currencyCode !== 'USD') {
      try {
        const usdConversion = this.convertLocal(amount, currencyCode, 'USD');
        result += ` (~$${usdConversion.convertedAmount.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })})`;
      } catch (error) {
        // Ignore les erreurs de conversion
      }
    }

    return result;
  }

  /**
   * Obtenir la devise préférée de l'utilisateur
   */
  getPreferredCurrency(): string {
    return localStorage.getItem('preferred_currency') || 'USD';
  }

  /**
   * Définir la devise préférée de l'utilisateur
   */
  setPreferredCurrency(currencyCode: string): void {
    localStorage.setItem('preferred_currency', currencyCode.toUpperCase());
  }

  /**
   * Vérifier si le cache est valide
   */
  isCacheValid(): boolean {
    if (!this.cache) return false;
    return Date.now() - this.cache.lastUpdated.getTime() < CACHE_DURATION;
  }

  /**
   * Forcer le rafraîchissement des taux
   */
  async forceRefresh(): Promise<void> {
    this.cache = null;
    await this.refreshRates();
  }

  /**
   * Obtenir la dernière mise à jour
   */
  getLastUpdate(): Date | null {
    return this.cache?.lastUpdated || null;
  }
}

export const currencyService = new CurrencyService();
export type { CurrencyRate, ConversionResult };