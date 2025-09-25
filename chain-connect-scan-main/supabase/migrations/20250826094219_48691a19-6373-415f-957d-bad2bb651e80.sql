-- Nettoyer et recréer les profils correctement

-- Supprimer tous les profils existants pour repartir proprement  
DELETE FROM public.profiles;
DELETE FROM public.wallets;

-- Recréer les profils pour tous les utilisateurs existants
-- en s'assurant que les readable_id sont uniques
DO $$
DECLARE
  user_record RECORD;
  new_readable_id TEXT;
  counter INTEGER := 1;
BEGIN
  FOR user_record IN 
    SELECT u.id, u.email, u.raw_user_meta_data
    FROM auth.users u
    WHERE u.email IS NOT NULL
    ORDER BY u.created_at
  LOOP
    -- Générer un readable_id unique basé sur le compteur
    CASE 
      WHEN user_record.raw_user_meta_data->>'role' = 'seller' THEN
        new_readable_id := 'VDR-' || LPAD(counter::TEXT, 4, '0');
      WHEN user_record.raw_user_meta_data->>'role' = 'courier' THEN
        new_readable_id := 'DLV-' || LPAD(counter::TEXT, 4, '0');
      ELSE
        new_readable_id := 'CLT-' || LPAD(counter::TEXT, 4, '0');
    END CASE;
    
    INSERT INTO public.profiles (
      user_id,
      email,
      full_name,
      phone,
      role,
      country,
      address,
      gps_verified,
      language,
      readable_id,
      preferred_currency
    ) VALUES (
      user_record.id,
      user_record.email,
      COALESCE(user_record.raw_user_meta_data->>'full_name', 'Utilisateur'),
      COALESCE(user_record.raw_user_meta_data->>'phone', ''),
      CASE 
        WHEN user_record.raw_user_meta_data->>'role' IS NOT NULL 
        THEN (user_record.raw_user_meta_data->>'role')::public.user_role
        ELSE 'client'::public.user_role
      END,
      COALESCE(user_record.raw_user_meta_data->>'country', 'GN'),
      COALESCE(user_record.raw_user_meta_data->>'address', ''),
      COALESCE((user_record.raw_user_meta_data->>'gps_verified')::boolean, false),
      'fr',
      new_readable_id,
      'GNF'
    );
    
    -- Créer le portefeuille
    INSERT INTO public.wallets (user_id) VALUES (user_record.id);
    
    counter := counter + 1;
    
  END LOOP;
END
$$;