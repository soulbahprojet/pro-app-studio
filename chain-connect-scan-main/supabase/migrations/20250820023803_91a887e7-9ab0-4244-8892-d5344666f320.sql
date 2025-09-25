-- Create manual_invoices table
CREATE TABLE public.manual_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency currency_type DEFAULT 'GNF',
  invoice_number TEXT UNIQUE NOT NULL,
  pdf_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid')),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.manual_invoices ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Sellers can manage their own invoices" 
ON public.manual_invoices 
FOR ALL 
USING (auth.uid() = seller_id);

-- Create sequence for invoice numbers
CREATE SEQUENCE public.invoice_number_seq START 1;

-- Create function to generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'INV-' || LPAD(nextval('invoice_number_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_manual_invoices_updated_at
  BEFORE UPDATE ON public.manual_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();