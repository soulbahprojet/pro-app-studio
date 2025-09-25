-- Création du module Paiement & Escrow Alibaba-style (version corrigée)

-- Créer d'abord la séquence pour les numéros de PI
CREATE SEQUENCE IF NOT EXISTS pi_sequence START 1;

-- Table pour les Proforma Invoices (PI)
CREATE TABLE public.draft_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pi_number TEXT UNIQUE NOT NULL DEFAULT 'PI-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(nextval('pi_sequence')::TEXT, 4, '0'),
  seller_id UUID NOT NULL,
  buyer_id UUID NULL, -- Sera rempli quand le client paie
  buyer_email TEXT NOT NULL, -- Email du client pour envoyer le payment link
  
  -- Informations sur les articles
  items JSONB NOT NULL DEFAULT '[]', -- [{sku, description, qty, unit_price, tax}]
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  shipping_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  currency currency_type NOT NULL DEFAULT 'GNF',
  
  -- Payment Link et statut
  stripe_payment_link_id TEXT NULL,
  stripe_invoice_id TEXT NULL,
  payment_link_url TEXT NULL,
  
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'awaiting_payment', 'paid', 'in_escrow', 'released', 'refunded', 'dispute', 'expired')),
  
  -- Dates importantes
  expires_at TIMESTAMP WITH TIME ZONE NULL, -- Date d'expiration du payment link
  paid_at TIMESTAMP WITH TIME ZONE NULL,
  escrow_created_at TIMESTAMP WITH TIME ZONE NULL,
  
  -- Métadonnées
  notes TEXT NULL,
  payment_terms TEXT NULL DEFAULT 'Paiement à la commande, livraison après confirmation',
  delivery_terms TEXT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les enregistrements d'escrow détaillés
CREATE TABLE public.payment_escrows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_order_id UUID NOT NULL REFERENCES public.draft_orders(id) ON DELETE CASCADE,
  
  -- Références Stripe
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_charge_id TEXT NULL,
  stripe_customer_id TEXT NULL,
  
  -- Montants
  total_amount NUMERIC NOT NULL,
  seller_amount NUMERIC NOT NULL, -- Montant pour le vendeur après commission
  commission_amount NUMERIC NOT NULL, -- Commission plateforme
  commission_rate NUMERIC NOT NULL DEFAULT 0.20, -- 20% par défaut
  currency currency_type NOT NULL,
  
  -- Statut et dates
  status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'released', 'refunded', 'disputed')),
  held_since TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  release_date TIMESTAMP WITH TIME ZONE NULL,
  dispute_opened_at TIMESTAMP WITH TIME ZONE NULL,
  resolution TEXT NULL,
  
  -- Politique de libération
  auto_release_after_days INTEGER DEFAULT 7, -- Libération automatique après X jours
  auto_release_at TIMESTAMP WITH TIME ZONE NULL,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour l'audit trail / ledger des transactions
CREATE TABLE public.payment_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Références
  draft_order_id UUID NULL REFERENCES public.draft_orders(id),
  escrow_id UUID NULL REFERENCES public.payment_escrows(id),
  user_from UUID NULL,
  user_to UUID NULL,
  
  -- Transaction details
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('charge', 'transfer', 'payout', 'fee', 'refund', 'commission')),
  amount NUMERIC NOT NULL,
  currency currency_type NOT NULL,
  
  -- Références externes
  stripe_reference_id TEXT NULL, -- charge_id, transfer_id, etc.
  reference_type TEXT NULL, -- 'charge', 'transfer', 'refund'
  
  -- Métadonnées
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les notifications d'événements
CREATE TABLE public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Références
  draft_order_id UUID NULL REFERENCES public.draft_orders(id),
  escrow_id UUID NULL REFERENCES public.payment_escrows(id),
  user_id UUID NULL, -- Utilisateur concerné
  
  -- Event details
  event_type TEXT NOT NULL CHECK (event_type IN (
    'pi_created', 'payment_link_generated', 'payment_received', 
    'escrow_created', 'escrow_released', 'escrow_refunded', 
    'dispute_opened', 'dispute_resolved', 'auto_release_scheduled'
  )),
  
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'success')),
  
  -- Métadonnées
  metadata JSONB DEFAULT '{}',
  read_at TIMESTAMP WITH TIME ZONE NULL,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes pour les performances
CREATE INDEX idx_draft_orders_seller ON public.draft_orders(seller_id);
CREATE INDEX idx_draft_orders_status ON public.draft_orders(status);
CREATE INDEX idx_draft_orders_pi_number ON public.draft_orders(pi_number);
CREATE INDEX idx_payment_escrows_draft_order ON public.payment_escrows(draft_order_id);
CREATE INDEX idx_payment_escrows_status ON public.payment_escrows(status);
CREATE INDEX idx_payment_ledger_escrow ON public.payment_ledger(escrow_id);
CREATE INDEX idx_payment_events_user ON public.payment_events(user_id);

-- Enable RLS
ALTER TABLE public.draft_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_escrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour draft_orders
CREATE POLICY "Sellers can manage their draft orders" ON public.draft_orders
  FOR ALL USING (auth.uid() = seller_id);

CREATE POLICY "Buyers can view their paid draft orders" ON public.draft_orders
  FOR SELECT USING (auth.uid() = buyer_id AND status != 'draft');

-- RLS Policies pour payment_escrows
CREATE POLICY "Users can view their escrows" ON public.payment_escrows
  FOR SELECT USING (
    draft_order_id IN (
      SELECT id FROM public.draft_orders 
      WHERE seller_id = auth.uid() OR buyer_id = auth.uid()
    )
  );

CREATE POLICY "System can manage escrows" ON public.payment_escrows
  FOR ALL USING (true);

-- RLS Policies pour payment_ledger
CREATE POLICY "Users can view their ledger entries" ON public.payment_ledger
  FOR SELECT USING (
    user_from = auth.uid() OR user_to = auth.uid() OR
    draft_order_id IN (
      SELECT id FROM public.draft_orders 
      WHERE seller_id = auth.uid() OR buyer_id = auth.uid()
    )
  );

CREATE POLICY "System can manage ledger" ON public.payment_ledger
  FOR ALL USING (true);

-- RLS Policies pour payment_events
CREATE POLICY "Users can view their events" ON public.payment_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage events" ON public.payment_events
  FOR ALL USING (true);

-- Trigger pour auto-update updated_at
CREATE OR REPLACE FUNCTION update_payment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_draft_orders_updated_at
  BEFORE UPDATE ON public.draft_orders
  FOR EACH ROW EXECUTE FUNCTION update_payment_updated_at();

CREATE TRIGGER update_payment_escrows_updated_at
  BEFORE UPDATE ON public.payment_escrows
  FOR EACH ROW EXECUTE FUNCTION update_payment_updated_at();

-- Fonction pour calculer l'auto-release date
CREATE OR REPLACE FUNCTION calculate_auto_release_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.auto_release_at = NEW.held_since + (NEW.auto_release_after_days || ' days')::INTERVAL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_auto_release_date
  BEFORE INSERT ON public.payment_escrows
  FOR EACH ROW EXECUTE FUNCTION calculate_auto_release_date();