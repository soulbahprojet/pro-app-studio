-- Créer une table pour logger les webhooks Pay.Africa
CREATE TABLE IF NOT EXISTS public.payment_webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  reference TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer un index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_reference 
ON public.payment_webhooks(reference);

CREATE INDEX IF NOT EXISTS idx_payment_webhooks_transaction_id 
ON public.payment_webhooks(transaction_id);

CREATE INDEX IF NOT EXISTS idx_payment_webhooks_provider 
ON public.payment_webhooks(provider);

-- Activer RLS
ALTER TABLE public.payment_webhooks ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux admins de voir tous les webhooks
CREATE POLICY "Admins can view all payment webhooks" 
ON public.payment_webhooks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Politique pour permettre l'insertion depuis les edge functions
CREATE POLICY "Allow webhook insertions" 
ON public.payment_webhooks 
FOR INSERT 
WITH CHECK (true);