-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('client', 'seller', 'courier', 'transitaire', 'admin');
CREATE TYPE subscription_plan AS ENUM ('basic', 'standard', 'premium');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
CREATE TYPE product_type AS ENUM ('physical', 'digital');
CREATE TYPE transaction_type AS ENUM ('payment', 'withdrawal', 'transfer', 'commission');
CREATE TYPE currency_type AS ENUM ('GNF', 'USD', 'EUR', 'XOF', 'CNY');

-- Profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'client',
  avatar_url TEXT,
  address TEXT,
  country TEXT,
  language TEXT DEFAULT 'fr',
  subscription_plan subscription_plan DEFAULT 'basic',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN DEFAULT false,
  kyc_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Wallets table
CREATE TABLE public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(user_id) NOT NULL UNIQUE,
  balance_gnf DECIMAL(15,2) DEFAULT 0,
  balance_usd DECIMAL(15,2) DEFAULT 0,
  balance_eur DECIMAL(15,2) DEFAULT 0,
  balance_xof DECIMAL(15,2) DEFAULT 0,
  balance_cny DECIMAL(15,2) DEFAULT 0,
  is_frozen BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID REFERENCES public.wallets(id) NOT NULL,
  type transaction_type NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency currency_type NOT NULL,
  description TEXT,
  reference_id UUID,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Warehouses table
CREATE TABLE public.warehouses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(user_id) NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  country TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(user_id) NOT NULL,
  warehouse_id UUID REFERENCES public.warehouses(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency currency_type NOT NULL DEFAULT 'GNF',
  type product_type NOT NULL DEFAULT 'physical',
  stock_quantity INTEGER DEFAULT 0,
  digital_file_url TEXT,
  download_limit INTEGER DEFAULT 0,
  category TEXT,
  images TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(user_id) NOT NULL,
  seller_id UUID REFERENCES public.profiles(user_id) NOT NULL,
  courier_id UUID REFERENCES public.profiles(user_id),
  total_amount DECIMAL(10,2) NOT NULL,
  currency currency_type NOT NULL,
  status order_status DEFAULT 'pending',
  qr_code TEXT UNIQUE,
  delivery_address TEXT,
  notes TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Digital access table for digital product downloads
CREATE TABLE public.digital_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(user_id) NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  download_count INTEGER DEFAULT 0,
  download_limit INTEGER NOT NULL,
  access_token TEXT UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employees table for seller staff management
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(user_id) NOT NULL,
  employee_id UUID REFERENCES public.profiles(user_id) NOT NULL,
  role TEXT NOT NULL,
  permissions TEXT[],
  is_active BOOLEAN DEFAULT true,
  hired_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for wallets
CREATE POLICY "Users can view their own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own wallet" ON public.wallets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own wallet" ON public.wallets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (
  wallet_id IN (SELECT id FROM public.wallets WHERE user_id = auth.uid())
);

-- RLS Policies for warehouses
CREATE POLICY "Sellers can manage their own warehouses" ON public.warehouses FOR ALL USING (auth.uid() = seller_id);
CREATE POLICY "Anyone can view active warehouses" ON public.warehouses FOR SELECT USING (is_active = true);

-- RLS Policies for products
CREATE POLICY "Sellers can manage their own products" ON public.products FOR ALL USING (auth.uid() = seller_id);
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = true);

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (
  auth.uid() = customer_id OR auth.uid() = seller_id OR auth.uid() = courier_id
);
CREATE POLICY "Customers can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Sellers and couriers can update orders" ON public.orders FOR UPDATE USING (
  auth.uid() = seller_id OR auth.uid() = courier_id
);

-- RLS Policies for order items
CREATE POLICY "Users can view order items for their orders" ON public.order_items FOR SELECT USING (
  order_id IN (
    SELECT id FROM public.orders 
    WHERE customer_id = auth.uid() OR seller_id = auth.uid() OR courier_id = auth.uid()
  )
);

-- RLS Policies for digital access
CREATE POLICY "Users can view their own digital access" ON public.digital_access FOR SELECT USING (auth.uid() = customer_id);

-- RLS Policies for employees
CREATE POLICY "Sellers can manage their employees" ON public.employees FOR ALL USING (auth.uid() = seller_id);
CREATE POLICY "Employees can view their employment" ON public.employees FOR SELECT USING (auth.uid() = employee_id);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX idx_transactions_wallet_id ON public.transactions(wallet_id);
CREATE INDEX idx_products_seller_id ON public.products(seller_id);
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX idx_orders_status ON public.orders(status);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();