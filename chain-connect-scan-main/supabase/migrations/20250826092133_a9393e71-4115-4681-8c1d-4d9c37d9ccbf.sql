-- Supprimer tous les profils
DELETE FROM public.profiles;

-- Supprimer tous les portefeuilles
DELETE FROM public.wallets;

-- Supprimer toutes les données utilisateur
DELETE FROM public.digital_shops;
DELETE FROM public.seller_shops;
DELETE FROM public.products;
DELETE FROM public.orders;
DELETE FROM public.transactions;