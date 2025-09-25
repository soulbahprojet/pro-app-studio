-- Migration pour le nouveau format d'ID : 4 chiffres + 2 lettres
-- Et ajout des tables nécessaires pour l'interface PDG

-- Fonction pour générer le nouveau format d'ID (4 chiffres + 2 lettres)
CREATE OR REPLACE FUNCTION public.generate_new_client_id()
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  number_part TEXT;
  letter_part TEXT;
  client_id TEXT;
BEGIN
  -- Générer 4 chiffres aléatoires
  number_part := LPAD(floor(random() * 10000)::int::text, 4, '0');
  
  -- Générer 2 lettres aléatoires de A à Z
  letter_part := chr(65 + floor(random() * 26)::int) || chr(65 + floor(random() * 26)::int);
  
  -- Combiner pour former l'ID (4 chiffres + 2 lettres)
  client_id := number_part || letter_part;
  
  RETURN client_id;
END;
$function$

-- Mise à jour de la fonction handle_new_user pour utiliser le nouveau format
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  generated_client_id TEXT;
BEGIN
  -- Générer l'ID client avec le nouveau format
  generated_client_id := generate_new_client_id();
  
  -- S'assurer que l'ID est unique
  WHILE EXISTS (SELECT 1 FROM profiles WHERE readable_id = generated_client_id) LOOP
    generated_client_id := generate_new_client_id();
  END LOOP;
  
  -- Insert profile for new user
  INSERT INTO public.profiles (
    user_id, 
    email, 
    full_name, 
    role, 
    phone, 
    country, 
    address,
    readable_id
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'fullName', ''),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'role')::public.user_role
      ELSE 'client'::public.user_role
    END,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'country', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    generated_client_id
  );
  
  -- Insert wallet for new user
  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$

-- Table pour les rôles PDG et staff professionnel
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL CHECK (role_type IN ('pdg', 'staff_pro')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role_type)
);

-- Enable RLS on admin_roles
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Politique pour admin_roles
CREATE POLICY "PDG can manage all admin roles" ON public.admin_roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles ar 
    WHERE ar.user_id = auth.uid() AND ar.role_type = 'pdg'
  )
);

-- Table pour les abonnements PDG
CREATE TABLE IF NOT EXISTS public.pdg_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('permanent', 'temporary')),
  duration_days INTEGER, -- NULL pour permanent, nombre de jours pour temporaire
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on pdg_subscriptions
ALTER TABLE public.pdg_subscriptions ENABLE ROW LEVEL SECURITY;

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

-- Politique pour affiliate_commissions
CREATE POLICY "Users can view their commissions" ON public.affiliate_commissions
FOR SELECT USING (auth.uid() = affiliate_id OR auth.uid() = referral_id);

CREATE POLICY "PDG can manage all commissions" ON public.affiliate_commissions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles ar 
    WHERE ar.user_id = auth.uid() AND ar.role_type = 'pdg'
  )
);

-- Table pour les salaires et bulletins
CREATE TABLE IF NOT EXISTS public.staff_salaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES auth.users(id),
  readable_id TEXT UNIQUE DEFAULT generate_new_client_id(),
  amount NUMERIC NOT NULL,
  currency currency_type NOT NULL DEFAULT 'GNF',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  pdf_url TEXT,
  notes TEXT,
  paid_by UUID REFERENCES auth.users(id),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on staff_salaries
ALTER TABLE public.staff_salaries ENABLE ROW LEVEL SECURITY;

-- Politique pour staff_salaries
CREATE POLICY "Employees can view their own salaries" ON public.staff_salaries
FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "PDG can manage all salaries" ON public.staff_salaries
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles ar 
    WHERE ar.user_id = auth.uid() AND ar.role_type = 'pdg'
  )
);

-- Table pour la communication interne
CREATE TABLE IF NOT EXISTS public.internal_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  recipient_id UUID REFERENCES auth.users(id), -- NULL pour message de groupe
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'voice', 'image', 'file')),
  content TEXT,
  file_url TEXT,
  is_group_message BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on internal_messages
ALTER TABLE public.internal_messages ENABLE ROW LEVEL SECURITY;

-- Politique pour internal_messages
CREATE POLICY "Staff can view their messages" ON public.internal_messages
FOR SELECT USING (
  auth.uid() = sender_id OR 
  auth.uid() = recipient_id OR
  (is_group_message = true AND EXISTS (
    SELECT 1 FROM public.admin_roles ar 
    WHERE ar.user_id = auth.uid() AND ar.role_type IN ('pdg', 'staff_pro')
  ))
);

CREATE POLICY "Staff can send messages" ON public.internal_messages
FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND EXISTS (
    SELECT 1 FROM public.admin_roles ar 
    WHERE ar.user_id = auth.uid() AND ar.role_type IN ('pdg', 'staff_pro')
  )
);

-- Table pour les logs d'audit
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Politique pour audit_logs
CREATE POLICY "PDG can view all audit logs" ON public.audit_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles ar 
    WHERE ar.user_id = auth.uid() AND ar.role_type = 'pdg'
  )
);

-- Table pour les alertes IA
CREATE TABLE IF NOT EXISTS public.ai_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('security', 'balance', 'bug', 'intrusion', 'anomaly')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ai_alerts
ALTER TABLE public.ai_alerts ENABLE ROW LEVEL SECURITY;

-- Politique pour ai_alerts
CREATE POLICY "PDG can manage all alerts" ON public.ai_alerts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles ar 
    WHERE ar.user_id = auth.uid() AND ar.role_type = 'pdg'
  )
);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_roles_updated_at BEFORE UPDATE ON public.admin_roles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_pdg_subscriptions_updated_at BEFORE UPDATE ON public.pdg_subscriptions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_affiliate_commissions_updated_at BEFORE UPDATE ON public.affiliate_commissions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_staff_salaries_updated_at BEFORE UPDATE ON public.staff_salaries FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Mise à jour des IDs existants vers le nouveau format (préservation de l'historique)
UPDATE public.profiles 
SET readable_id = generate_new_client_id() 
WHERE readable_id IS NULL OR length(readable_id) != 6;