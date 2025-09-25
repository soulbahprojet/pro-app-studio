-- Fix RLS policies and add triggers for automatic profile/wallet creation

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile for new user
  INSERT INTO public.profiles (user_id, email, full_name, role, phone, country)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'fullName', NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')::user_role,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'country', '')
  );
  
  -- Insert wallet for new user
  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add missing RLS policies for order_items
CREATE POLICY "Users can insert order items for their orders" ON public.order_items FOR INSERT WITH CHECK (
  order_id IN (
    SELECT id FROM public.orders 
    WHERE customer_id = auth.uid()
  )
);

-- Add missing RLS policies for transactions
CREATE POLICY "System can insert transactions" ON public.transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert their own transactions" ON public.transactions FOR INSERT WITH CHECK (
  wallet_id IN (SELECT id FROM public.wallets WHERE user_id = auth.uid())
);

-- Add missing RLS policies for digital_access
CREATE POLICY "System can manage digital access" ON public.digital_access FOR ALL USING (true);

-- Add function to create QR code for orders
CREATE OR REPLACE FUNCTION public.generate_qr_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'QR-' || encode(gen_random_bytes(8), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Update orders table to auto-generate QR codes
ALTER TABLE public.orders ALTER COLUMN qr_code SET DEFAULT public.generate_qr_code();