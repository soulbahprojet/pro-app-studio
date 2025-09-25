-- Mise à jour de la fonction update_kyc_status pour ne vérifier que la pièce d'identité
CREATE OR REPLACE FUNCTION public.update_kyc_status()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  required_docs TEXT[] := ARRAY['identity']; -- Seule la pièce d'identité est requise maintenant
  approved_docs INTEGER;
  total_required INTEGER := array_length(required_docs, 1);
BEGIN
  -- Count approved documents for the user
  SELECT COUNT(*) INTO approved_docs
  FROM public.kyc_documents 
  WHERE user_id = NEW.user_id 
  AND document_type = ANY(required_docs)
  AND status = 'approved';
  
  -- Update profile KYC status based on document approval
  IF approved_docs = total_required THEN
    UPDATE public.profiles 
    SET kyc_status = 'approved', kyc_verified_at = now()
    WHERE user_id = NEW.user_id;
  ELSIF approved_docs > 0 THEN
    UPDATE public.profiles 
    SET kyc_status = 'under_review'
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$function$;