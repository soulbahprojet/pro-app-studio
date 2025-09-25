-- Activer la synchronisation temps réel pour les tables principales
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.seller_shops REPLICA IDENTITY FULL;

-- Ajouter les tables à la publication temps réel (orders déjà incluse)
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.seller_shops;