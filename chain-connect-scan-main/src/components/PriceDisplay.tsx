import { useState, useEffect } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface PriceDisplayProps {
  amount: number;
  currency: string;
  showAlternative?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function PriceDisplay({ 
  amount, 
  currency, 
  showAlternative = false,
  className = "",
  size = 'md'
}: PriceDisplayProps) {
  const { preferredCurrency, convert, formatAmount } = useCurrency();
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currency === preferredCurrency) {
      setConvertedAmount(amount);
      return;
    }

    setIsLoading(true);
    convert(amount, currency, preferredCurrency)
      .then(setConvertedAmount)
      .catch(() => setConvertedAmount(amount))
      .finally(() => setIsLoading(false));
  }, [amount, currency, preferredCurrency, convert]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg font-semibold';
      default:
        return 'text-base font-medium';
    }
  };

  if (isLoading || convertedAmount === null) {
    return <Skeleton className={`h-5 w-20 ${className}`} />;
  }

  // Affichage simple si même devise
  if (currency === preferredCurrency) {
    return (
      <span className={`${getSizeClasses()} ${className}`}>
        {formatAmount(amount, currency, showAlternative)}
      </span>
    );
  }

  // Affichage avec conversion
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={getSizeClasses()}>
        {formatAmount(convertedAmount, preferredCurrency)}
      </span>
      {showAlternative && currency !== preferredCurrency && (
        <Badge variant="outline" className="text-xs">
          {formatAmount(amount, currency)}
        </Badge>
      )}
    </div>
  );
}