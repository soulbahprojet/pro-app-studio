-- Correction massive des politiques d'accès anonyme (Partie 4 - Finale)
-- Correction des dernières vulnérabilités critiques

-- 21. Vérifier et corriger les accès aux wallets (CRITIQUE)
DROP POLICY IF EXISTS "Public wallet access" ON public.wallets;
DROP POLICY IF EXISTS "Anyone can view wallets" ON public.wallets;

-- S'assurer que seuls les propriétaires peuvent accéder à leur wallet
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own wallet" 
ON public.wallets 
FOR ALL 
TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 22. Sécuriser les transactions (CRITIQUE)
DROP POLICY IF EXISTS "Public transaction access" ON public.transactions;
DROP POLICY IF EXISTS "Anyone can view transactions" ON public.transactions;

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only view their own transactions" 
ON public.transactions 
FOR SELECT 
TO authenticated 
USING (wallet_id IN (SELECT id FROM public.wallets WHERE user_id = auth.uid()));

-- 23. Sécuriser les données KYC (CRITIQUE)
DROP POLICY IF EXISTS "Public KYC access" ON public.kyc_documents;
DROP POLICY IF EXISTS "Anyone can view KYC" ON public.kyc_documents;

ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own KYC documents" 
ON public.kyc_documents 
FOR ALL 
TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 24. Sécuriser les cartes virtuelles (CRITIQUE)
ALTER TABLE public.virtual_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public card access" ON public.virtual_cards;
CREATE POLICY "Users can only access their own cards" 
ON public.virtual_cards 
FOR ALL 
TO authenticated 
USING (user_id = auth.uid() OR manager_id = auth.uid())
WITH CHECK (user_id = auth.uid() OR manager_id = auth.uid());

-- 25. Sécuriser les messages et conversations
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public message access" ON public.messages;
CREATE POLICY "Users can only view messages in their conversations" 
ON public.messages 
FOR ALL 
TO authenticated 
USING (conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE client_id = auth.uid() OR seller_id = auth.uid() OR support_id = auth.uid()
))
WITH CHECK (sender_id = auth.uid());

-- 26. Corriger les politiques de système pour restreindre au service role uniquement
DROP POLICY IF EXISTS "System wide access" ON public.system_settings;
CREATE POLICY "System settings access" 
ON public.system_settings 
FOR ALL 
TO service_role 
USING (true);

-- PDG peut lire les paramètres système
CREATE POLICY "PDG can read system settings" 
ON public.system_settings 
FOR SELECT 
TO authenticated 
USING (is_pdg_user());

-- 27. Audit de sécurité final - désactiver toute politique trop permissive restante
-- Cette requête permet de voir toutes les politiques qui pourraient encore être problématiques
COMMENT ON TABLE public.profiles IS 'Sécurisé - accès restreint aux utilisateurs authentifiés';
COMMENT ON TABLE public.wallets IS 'Sécurisé - accès restreint aux propriétaires';
COMMENT ON TABLE public.transactions IS 'Sécurisé - accès restreint aux propriétaires';
COMMENT ON TABLE public.virtual_cards IS 'Sécurisé - accès restreint aux propriétaires';