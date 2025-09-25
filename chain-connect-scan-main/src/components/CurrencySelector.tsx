import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { currencyService } from "@/services/currencyService";
import { RefreshCw, Globe, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CurrencySelectorProps {
  value?: string;
  onValueChange?: (currency: string) => void;
  showRates?: boolean;
  className?: string;
}

export default function CurrencySelector({ 
  value, 
  onValueChange, 
  showRates = false,
  className = ""
}: CurrencySelectorProps) {
  const { toast } = useToast();
  const [currencies, setCurrencies] = useState<Array<{ code: string; name: string; symbol: string; rate: number; lastUpdated: Date }>>([]);
  const [selectedCurrency, setSelectedCurrency] = useState(value || currencyService.getPreferredCurrency());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    loadCurrencies();
    setLastUpdate(currencyService.getLastUpdate());
  }, []);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedCurrency(value);
    }
  }, [value]);

  const loadCurrencies = () => {
    const supportedCurrencies = currencyService.getSupportedCurrencies();
    setCurrencies(supportedCurrencies);
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setSelectedCurrency(newCurrency);
    currencyService.setPreferredCurrency(newCurrency);
    
    if (onValueChange) {
      onValueChange(newCurrency);
    }

    toast({
      title: "Devise mise à jour",
      description: `Devise préférée changée vers ${newCurrency}`,
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await currencyService.forceRefresh();
      loadCurrencies();
      setLastUpdate(currencyService.getLastUpdate());
      
      toast({
        title: "Taux de change mis à jour",
        description: "Les derniers taux de change ont été récupérés",
      });
    } catch (error) {
      toast({
        title: "Erreur de mise à jour",
        description: "Impossible de mettre à jour les taux de change",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Jamais';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffHours >= 24) {
      return `il y a ${Math.floor(diffHours / 24)} jour(s)`;
    } else if (diffHours >= 1) {
      return `il y a ${diffHours} heure(s)`;
    } else if (diffMinutes >= 1) {
      return `il y a ${diffMinutes} minute(s)`;
    } else {
      return 'À l\'instant';
    }
  };

  const getStatusColor = () => {
    if (!lastUpdate) return 'secondary';
    
    const now = new Date();
    const diffHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) return 'default';
    if (diffHours < 6) return 'secondary';
    if (diffHours < 24) return 'outline';
    return 'destructive';
  };

  return (
    <div className={className}>
      {showRates ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <CardTitle className="text-lg">Devises & Taux de Change</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusColor()}>
                  Mis à jour {formatLastUpdate(lastUpdate)}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
              </div>
            </div>
            <CardDescription>
              Sélectionnez votre devise préférée. Les prix seront automatiquement convertis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Devise préférée</label>
              <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner une devise" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm bg-muted px-1 rounded">
                          {currency.symbol}
                        </span>
                        <span>{currency.code}</span>
                        <span className="text-muted-foreground">- {currency.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Taux de change (base USD)</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {currencies.filter(c => c.code !== 'USD').map((currency) => (
                  <div key={currency.code} className="p-3 border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm font-medium">{currency.code}</span>
                      <span className="text-xs text-muted-foreground">{currency.symbol}</span>
                    </div>
                    <div className="text-sm font-semibold">
                      1 USD = {currency.rate.toLocaleString('fr-FR', { 
                        minimumFractionDigits: currency.code === 'GNF' ? 0 : 2,
                        maximumFractionDigits: currency.code === 'GNF' ? 0 : 4
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {currency.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex items-center gap-2">
          <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Devise" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-muted px-1 rounded">
                      {currency.symbol}
                    </span>
                    <span>{currency.code}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Actualiser les taux de change"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      )}
    </div>
  );
}