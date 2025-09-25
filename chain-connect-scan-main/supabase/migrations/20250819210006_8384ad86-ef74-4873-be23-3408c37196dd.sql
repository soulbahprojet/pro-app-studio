-- Add KYC fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN kyc_document_url TEXT,
ADD COLUMN kyc_document_type TEXT CHECK (kyc_document_type IN ('passport', 'id_card', 'driving_license')),
ADD COLUMN kyc_address_proof_url TEXT,
ADD COLUMN kyc_bank_document_url TEXT,
ADD COLUMN kyc_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN kyc_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN kyc_rejection_reason TEXT;

-- Update kyc_status to have more specific values
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_kyc_status_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_kyc_status_check 
CHECK (kyc_status IN ('pending', 'submitted', 'under_review', 'approved', 'rejected', 'incomplete'));

-- Create KYC documents table for better organization
CREATE TABLE public.kyc_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('identity', 'address_proof', 'bank_statement', 'business_registration')),
  document_url TEXT NOT NULL,
  document_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for KYC documents
CREATE POLICY "Users can view their own KYC documents" 
ON public.kyc_documents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own KYC documents" 
ON public.kyc_documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own KYC documents" 
ON public.kyc_documents 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Admin policy for reviewing KYC documents
CREATE POLICY "Admins can manage all KYC documents" 
ON public.kyc_documents 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create indexes for better performance
CREATE INDEX idx_kyc_documents_user_id ON public.kyc_documents(user_id);
CREATE INDEX idx_kyc_documents_status ON public.kyc_documents(status);
CREATE INDEX idx_kyc_documents_document_type ON public.kyc_documents(document_type);

-- Function to update KYC status automatically
CREATE OR REPLACE FUNCTION public.update_kyc_status()
RETURNS TRIGGER AS $$
DECLARE
  required_docs TEXT[] := ARRAY['identity', 'address_proof', 'bank_statement'];
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
$$ LANGUAGE plpgsql;

-- Create trigger for automatic KYC status updates
CREATE TRIGGER update_kyc_status_trigger
  AFTER INSERT OR UPDATE ON public.kyc_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_kyc_status();