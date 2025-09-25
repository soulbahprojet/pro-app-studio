-- Mettre à jour spécifiquement l'utilisateur actuel avec un nouvel ID unique
DO $$
DECLARE
    new_id TEXT;
    user_id_to_update UUID := 'aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c';
BEGIN
    -- Générer un nouvel ID unique
    LOOP
        new_id := LPAD(floor(random() * 1000)::int::text, 3, '0') || 
                  chr(65 + floor(random() * 26)::int) || 
                  chr(65 + floor(random() * 26)::int);
        
        -- Vérifier si cet ID existe déjà
        IF NOT EXISTS (SELECT 1 FROM profiles WHERE readable_id = new_id) THEN
            EXIT; -- Sortir de la boucle si l'ID est unique
        END IF;
    END LOOP;
    
    -- Mettre à jour l'utilisateur avec le nouvel ID
    UPDATE profiles 
    SET readable_id = new_id, updated_at = now()
    WHERE user_id = user_id_to_update;
    
    RAISE NOTICE 'Updated user % with new ID: %', user_id_to_update, new_id;
END $$;