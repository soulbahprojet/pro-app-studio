import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

export const useErrorBoundary = () => {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorId: null
  });

  const captureError = useCallback((error: Error, context?: string) => {
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.error(`[${errorId}] Error in ${context || 'Unknown context'}:`, error);
    
    setErrorState({
      hasError: true,
      error,
      errorId
    });

    // Show user-friendly error message
    toast({
      title: "Une erreur s'est produite",
      description: `Erreur ID: ${errorId}. Veuillez réessayer ou contacter le support.`,
      variant: "destructive",
    });

    // Send to error tracking service (Sentry, LogRocket, etc.)
    if (typeof window !== 'undefined') {
      // Check if gtag is available (Google Analytics)
      const gtag = (window as any).gtag;
      if (typeof gtag === 'function') {
        gtag('event', 'exception', {
          description: error.message,
          fatal: false,
          error_id: errorId,
          context: context || 'unknown'
        });
      }
    }

    return errorId;
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorId: null
    });
  }, []);

  const retryOperation = useCallback((operation: () => void | Promise<void>) => {
    clearError();
    try {
      const result = operation();
      if (result instanceof Promise) {
        result.catch((error) => captureError(error, 'Retry operation'));
      }
    } catch (error) {
      captureError(error as Error, 'Retry operation');
    }
  }, [clearError, captureError]);

  return {
    ...errorState,
    captureError,
    clearError,
    retryOperation
  };
};