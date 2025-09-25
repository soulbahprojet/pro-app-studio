-- Activer RLS et créer des politiques pour les tables critiques

-- 1. Table freight_rates - Actuellement sans RLS
ALTER TABLE public.freight_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Transitaires peuvent gérer leurs tarifs" 
ON public.freight_rates 
FOR ALL 
TO authenticated 
USING (forwarder_id IN (
  SELECT id FROM freight_forwarders WHERE user_id = auth.uid()
))
WITH CHECK (forwarder_id IN (
  SELECT id FROM freight_forwarders WHERE user_id = auth.uid()
));

CREATE POLICY "Clients peuvent voir les tarifs actifs" 
ON public.freight_rates 
FOR SELECT 
TO authenticated 
USING (is_active = true);

-- 2. Table inventory - Gestion des stocks
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendeurs gèrent leur inventaire" 
ON public.inventory 
FOR ALL 
TO authenticated 
USING (product_id IN (
  SELECT id FROM products WHERE seller_id = auth.uid()
))
WITH CHECK (product_id IN (
  SELECT id FROM products WHERE seller_id = auth.uid()
));

-- 3. Table kyc_documents - Documents sensibles
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs voient leurs documents KYC" 
ON public.kyc_documents 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Utilisateurs créent leurs documents KYC" 
ON public.kyc_documents 
FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins peuvent gérer tous les documents KYC" 
ON public.kyc_documents 
FOR ALL 
TO authenticated 
USING (is_pdg_user());

-- 4. Table messages - Communications privées
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs voient leurs messages" 
ON public.messages 
FOR SELECT 
TO authenticated 
USING (
  sender_id = auth.uid() OR 
  conversation_id IN (
    SELECT id FROM conversations 
    WHERE client_id = auth.uid() OR seller_id = auth.uid() OR support_id = auth.uid()
  )
);

CREATE POLICY "Utilisateurs créent des messages" 
ON public.messages 
FOR INSERT 
TO authenticated 
WITH CHECK (sender_id = auth.uid());

-- 5. Table order_items - Détails des commandes
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs voient leurs articles de commande" 
ON public.order_items 
FOR SELECT 
TO authenticated 
USING (
  order_id IN (
    SELECT id FROM orders 
    WHERE customer_id = auth.uid() OR seller_id = auth.uid() OR courier_id = auth.uid()
  )
);

CREATE POLICY "Système peut gérer les articles de commande" 
ON public.order_items 
FOR ALL 
TO authenticated 
USING (
  order_id IN (
    SELECT id FROM orders 
    WHERE customer_id = auth.uid() OR seller_id = auth.uid()
  )
);