-- Supprimer dans le bon ordre pour éviter les contraintes
DELETE FROM public.transactions;
DELETE FROM public.orders;
DELETE FROM public.products;
DELETE FROM public.seller_shops;
DELETE FROM public.digital_shops;
DELETE FROM public.wallets;
DELETE FROM public.profiles;