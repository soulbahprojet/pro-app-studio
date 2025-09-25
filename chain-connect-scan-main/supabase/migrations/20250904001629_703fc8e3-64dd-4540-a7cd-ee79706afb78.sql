-- Table de journalisation des publications Facebook
CREATE TABLE IF NOT EXISTS public.boost_posts_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  vendor_id UUID NOT NULL,
  plan_tier TEXT NOT NULL,
  product_id UUID,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  fb_post_id TEXT,
  error_message TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_boost_posts_log_vendor_id ON public.boost_posts_log(vendor_id);
CREATE INDEX IF NOT EXISTS idx_boost_posts_log_created_at ON public.boost_posts_log(created_at DESC);

-- Vue des vendeurs éligibles basée sur la table profiles
CREATE OR REPLACE VIEW public.eligible_boost_vendors AS
SELECT 
  p.user_id as vendor_id,
  COALESCE(p.subscription_plan::text, 'basic') as plan_tier,
  p.subscription_expires_at as end_date
FROM public.profiles p
WHERE p.role = 'seller'
  AND p.is_verified = true
  AND (p.subscription_expires_at IS NULL OR p.subscription_expires_at > NOW());

-- RLS pour la table de logs (admin seulement)
ALTER TABLE public.boost_posts_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only PDG can manage boost logs" ON public.boost_posts_log
FOR ALL USING (is_pdg_user())
WITH CHECK (is_pdg_user());