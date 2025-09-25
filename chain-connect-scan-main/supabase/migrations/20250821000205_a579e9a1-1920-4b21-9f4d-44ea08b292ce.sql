-- Migration pour le nouveau format d'ID : 4 chiffres + 2 lettres
-- Partie 1: Fonctions de base

-- Fonction pour générer le nouveau format d'ID (4 chiffres + 2 lettres)
CREATE OR REPLACE FUNCTION public.generate_new_client_id()
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  number_part TEXT;
  letter_part TEXT;
  client_id TEXT;
BEGIN
  -- Générer 4 chiffres aléatoires
  number_part := LPAD(floor(random() * 10000)::int::text, 4, '0');
  
  -- Générer 2 lettres aléatoires de A à Z
  letter_part := chr(65 + floor(random() * 26)::int) || chr(65 + floor(random() * 26)::int);
  
  -- Combiner pour former l'ID (4 chiffres + 2 lettres)
  client_id := number_part || letter_part;
  
  RETURN client_id;
END;
$function$