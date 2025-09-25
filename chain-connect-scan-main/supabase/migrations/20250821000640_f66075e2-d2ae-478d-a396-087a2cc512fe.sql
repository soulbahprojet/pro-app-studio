-- Migration partie 4: Politiques pour pdg_subscriptions et mise à jour des IDs existants

-- Politique pour pdg_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.pdg_subscriptions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "PDG can manage all subscriptions" ON public.pdg_subscriptions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles ar 
    WHERE ar.user_id = auth.uid() AND ar.role_type = 'pdg'
  )
);

-- Table pour les commissions et affiliés
CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES auth.users(id),
  referral_id UUID NOT NULL REFERENCES auth.users(id),
  transaction_id UUID REFERENCES public.transactions(id),
  commission_rate NUMERIC NOT NULL DEFAULT 0.05,
  commission_amount NUMERIC NOT NULL,
  currency currency_type NOT NULL DEFAULT 'GNF',
  commission_type TEXT NOT NULL CHECK (commission_type IN ('transaction', 'subscription', 'sale')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on affiliate_commissions
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;

-- Politiques pour affiliate_commissions
CREATE POLICY "Users can view their commissions" ON public.affiliate_commissions
FOR SELECT USING (auth.uid() = affiliate_id OR auth.uid() = referral_id);

CREATE POLICY "PDG can manage all commissions" ON public.affiliate_commissions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles ar 
    WHERE ar.user_id = auth.uid() AND ar.role_type = 'pdg'
  )
);