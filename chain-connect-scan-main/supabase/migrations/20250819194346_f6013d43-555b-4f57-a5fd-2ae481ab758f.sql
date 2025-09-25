-- Activer les notifications temps réel pour les commandes
ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- Ajouter la table orders à la publication realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;