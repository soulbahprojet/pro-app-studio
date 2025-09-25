-- Corriger la fonction pour générer 3 chiffres et 2 lettres alphabétiques
CREATE OR REPLACE FUNCTION public.generate_client_id()
RETURNS text
LANGUAGE plpgsql
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