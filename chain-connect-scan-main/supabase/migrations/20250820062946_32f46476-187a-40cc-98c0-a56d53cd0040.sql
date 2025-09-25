-- Mettre à jour tous les utilisateurs existants avec le nouveau format d'ID (3 chiffres + 2 lettres)
UPDATE profiles 
SET readable_id = (
  SELECT LPAD(floor(random() * 1000)::int::text, 3, '0') || 
         chr(65 + floor(random() * 26)::int) || 
         chr(65 + floor(random() * 26)::int)
)
WHERE readable_id LIKE 'CLT-%' OR readable_id LIKE 'VDR-%' OR readable_id LIKE 'DLV-%' OR readable_id LIKE 'ADM-%' OR readable_id LIKE 'USR-%';

-- S'assurer qu'il n'y a pas de doublons (très peu probable mais par sécurité)
UPDATE profiles 
SET readable_id = (
  SELECT LPAD(floor(random() * 1000)::int::text, 3, '0') || 
         chr(65 + floor(random() * 26)::int) || 
         chr(65 + floor(random() * 26)::int)
)
WHERE id IN (
  SELECT id FROM (
    SELECT id, readable_id, ROW_NUMBER() OVER (PARTITION BY readable_id ORDER BY created_at) as rn
    FROM profiles 
    WHERE LENGTH(readable_id) = 5
  ) t WHERE t.rn > 1
);