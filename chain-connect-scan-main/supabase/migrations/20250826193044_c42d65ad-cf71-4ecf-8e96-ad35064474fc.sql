-- SECONDE VAGUE DE SÉCURISATION - Correction des fonctions restantes
-- Élimination finale des warnings "Function Search Path Mutable"

-- 7. Sécurisation des fonctions de gestion des entrepôts
CREATE OR REPLACE FUNCTION public.get_warehouse_public_info(warehouse_id uuid)
RETURNS TABLE(id uuid, name text, country text, is_active boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT w.id, w.name, w.country, w.is_active
  FROM warehouses w
  WHERE w.id = warehouse_id AND w.is_active = true;
END;
$$;

-- 8. Sécurisation des fonctions de mise à jour automatique
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 9. Sécurisation des fonctions de génération d'ID
CREATE OR REPLACE FUNCTION public.generate_client_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  number_part TEXT;
  letter_part TEXT;
  client_id TEXT;
BEGIN
  -- Générer 3 chiffres aléatoires
  number_part := LPAD(floor(random() * 1000)::int::text, 3, '0');
  
  -- Générer 2 lettres aléatoires de A à Z
  letter_part := chr(65 + floor(random() * 26)::int) || chr(65 + floor(random() * 26)::int);
  
  -- Combiner pour former l'ID (3 chiffres + 2 lettres)
  client_id := number_part || letter_part;
  
  RETURN client_id;
END;
$$;

-- 10. Sécurisation des fonctions de gestion des transactions
CREATE OR REPLACE FUNCTION public.generate_transaction_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  letter_code TEXT;
  number_part TEXT;
  full_code TEXT;
BEGIN
  -- Générer une lettre aléatoire de A à Z
  letter_code := chr(65 + floor(random() * 26)::int);
  
  -- Générer un nombre à 3 chiffres
  number_part := LPAD(nextval('transaction_code_seq')::TEXT, 3, '0');
  
  -- Si le nombre dépasse 999, remettre la séquence à 1
  IF nextval('transaction_code_seq') > 999 THEN
    ALTER SEQUENCE transaction_code_seq RESTART WITH 1;
    number_part := '001';
  END IF;
  
  full_code := letter_code || number_part;
  
  RETURN full_code;
END;
$$;

-- 11. Sécurisation des triggers de mise à jour
CREATE OR REPLACE FUNCTION public.set_readable_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.readable_id IS NULL THEN
    CASE TG_TABLE_NAME
      WHEN 'profiles' THEN
        CASE NEW.role
          WHEN 'client' THEN NEW.readable_id := generate_readable_id('CLT', 'profiles');
          WHEN 'seller' THEN NEW.readable_id := generate_readable_id('VDR', 'profiles');
          WHEN 'courier' THEN NEW.readable_id := generate_readable_id('DLV', 'profiles');
          WHEN 'admin' THEN NEW.readable_id := generate_readable_id('ADM', 'profiles');
          ELSE NEW.readable_id := generate_readable_id('USR', 'profiles');
        END CASE;
      WHEN 'orders' THEN
        NEW.readable_id := generate_readable_id('ORD', 'orders');
    END CASE;
  END IF;
  RETURN NEW;
END;
$$;

-- 12. Sécurisation des fonctions de génération de badges
CREATE OR REPLACE FUNCTION public.generate_badge_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  badge_num TEXT;
BEGIN
  badge_num := 'BDG-' || LPAD(EXTRACT(YEAR FROM NOW())::TEXT, 4, '0') || '-' || 
               LPAD((SELECT COUNT(*) + 1 FROM syndicat_members)::TEXT, 6, '0');
  RETURN badge_num;
END;
$$;

-- 13. Sécurisation des fonctions de gestion de stock
CREATE OR REPLACE FUNCTION public.confirm_sale(p_product_id uuid, p_quantity integer, p_order_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE inventory 
  SET 
    quantity_reserved = quantity_reserved - p_quantity,
    quantity_sold = quantity_sold + p_quantity,
    last_updated = now()
  WHERE product_id = p_product_id;
  
  RETURN FOUND;
END;
$$;

-- 14. Sécurisation des fonctions de libération de stock
CREATE OR REPLACE FUNCTION public.release_reservation(p_product_id uuid, p_quantity integer, p_order_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE inventory 
  SET 
    quantity_available = quantity_available + p_quantity,
    quantity_reserved = quantity_reserved - p_quantity,
    last_updated = now()
  WHERE product_id = p_product_id;
  
  RETURN FOUND;
END;
$$;

-- 15. Sécurisation de la fonction make_user_pdg
CREATE OR REPLACE FUNCTION public.make_user_pdg(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Trouver l'utilisateur par email
  SELECT user_id INTO target_user_id 
  FROM profiles 
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur avec email % non trouvé', user_email;
  END IF;
  
  -- Ajouter le rôle PDG
  INSERT INTO admin_roles (user_id, role_type, permissions)
  VALUES (target_user_id, 'pdg', '{"full_access": true}')
  ON CONFLICT (user_id, role_type) DO NOTHING;
  
  -- Mettre à jour le profil comme admin
  UPDATE profiles 
  SET role = 'admin', is_verified = true
  WHERE user_id = target_user_id;
END;
$$;

-- 16. Sécurisation des fonctions de calcul de stockage
CREATE OR REPLACE FUNCTION public.calculate_storage_usage(user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_size NUMERIC := 0;
  product_images_size NUMERIC := 0;
BEGIN
  -- Calculer la taille des images de produits (estimation basée sur le nombre d'images)
  SELECT COALESCE(SUM(array_length(images, 1)) * 0.5, 0) INTO product_images_size
  FROM products 
  WHERE seller_id = user_id;
  
  total_size := product_images_size;
  
  RETURN ROUND(total_size, 2);
END;
$$;

-- 17. Sécurisation de la fonction de nettoyage de sécurité
CREATE OR REPLACE FUNCTION public.cleanup_old_security_tracking()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Garder seulement les 30 derniers jours de tracking
  DELETE FROM security_tracking 
  WHERE created_at < (now() - interval '30 days');
  
  -- Garder seulement les 90 derniers jours d'alertes résolues
  DELETE FROM security_alerts 
  WHERE is_resolved = true 
  AND resolved_at < (now() - interval '90 days');
  
  -- Supprimer les commandes expirées
  DELETE FROM remote_security_commands 
  WHERE expires_at < now();
END;
$$;