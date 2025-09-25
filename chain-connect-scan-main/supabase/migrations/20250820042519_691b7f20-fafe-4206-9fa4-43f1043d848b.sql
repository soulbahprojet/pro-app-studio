-- Créer le profil manquant pour l'utilisateur connecté
-- D'abord, vérifier et créer les profils manquants
INSERT INTO public.profiles (user_id, email, full_name, role, phone, country, address)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'fullName', ''),
    CASE 
        WHEN au.raw_user_meta_data->>'role' IS NOT NULL 
        THEN (au.raw_user_meta_data->>'role')::public.user_role
        ELSE 'client'::public.user_role
    END,
    COALESCE(au.raw_user_meta_data->>'phone', ''),
    COALESCE(au.raw_user_meta_data->>'country', 'Guinea'),
    COALESCE(au.raw_user_meta_data->>'address', '')
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.user_id IS NULL;

-- Créer les wallets manquants pour les utilisateurs
INSERT INTO public.wallets (user_id)
SELECT au.id
FROM auth.users au
LEFT JOIN public.wallets w ON w.user_id = au.id
WHERE w.user_id IS NULL;