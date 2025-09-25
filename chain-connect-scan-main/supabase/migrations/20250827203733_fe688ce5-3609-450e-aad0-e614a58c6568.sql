-- Migration pour le Module Taxi Moto (224SOLUTIONS)

-- 1. Table drivers (chauffeurs)
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  license_number TEXT NOT NULL,
  vehicle_type TEXT NOT NULL DEFAULT 'moto',
  vehicle_model TEXT,
  vehicle_plate TEXT,
  vehicle_year INTEGER,
  vehicle_color TEXT,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  current_lat DECIMAL(10, 8),
  current_lng DECIMAL(11, 8),
  last_location_update TIMESTAMPTZ DEFAULT now(),
  rating_average DECIMAL(3, 2) DEFAULT 0.00,
  total_rides INTEGER DEFAULT 0,
  total_earnings DECIMAL(12, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Table rides (courses)
CREATE TABLE IF NOT EXISTS public.rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'in_progress', 'completed', 'cancelled')),
  pickup_address TEXT,
  pickup_lat DECIMAL(10, 8) NOT NULL,
  pickup_lng DECIMAL(11, 8) NOT NULL,
  dropoff_address TEXT,
  dropoff_lat DECIMAL(10, 8) NOT NULL,
  dropoff_lng DECIMAL(11, 8) NOT NULL,
  distance_km DECIMAL(8, 2),
  estimated_fare DECIMAL(10, 2),
  fare DECIMAL(10, 2),
  commission_rate DECIMAL(5, 4) DEFAULT 0.10,
  commission_amount DECIMAL(10, 2),
  driver_earnings DECIMAL(10, 2),
  currency TEXT DEFAULT 'GNF',
  payment_method TEXT DEFAULT 'wallet',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  requested_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Table driver_wallets (portefeuilles chauffeurs)
CREATE TABLE IF NOT EXISTS public.driver_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL UNIQUE REFERENCES public.drivers(id) ON DELETE CASCADE,
  balance_gnf DECIMAL(12, 2) DEFAULT 0.00,
  balance_usd DECIMAL(12, 2) DEFAULT 0.00,
  balance_eur DECIMAL(12, 2) DEFAULT 0.00,
  total_earned DECIMAL(12, 2) DEFAULT 0.00,
  total_withdrawn DECIMAL(12, 2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Table driver_transactions (historique transactions)
CREATE TABLE IF NOT EXISTS public.driver_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.driver_wallets(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES public.rides(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('earning', 'commission', 'withdrawal', 'bonus', 'penalty')),
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'GNF',
  description TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Table driver_reviews (avis chauffeurs)
CREATE TABLE IF NOT EXISTS public.driver_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES public.rides(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, ride_id)
);

-- 6. Table ride_logs (audit trail - optionnel mais recommandé)
CREATE TABLE IF NOT EXISTS public.ride_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour drivers
CREATE POLICY "Drivers can view and update their own profile"
  ON public.drivers FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view active drivers"
  ON public.drivers FOR SELECT
  USING (is_active = true AND is_verified = true);

-- RLS Policies pour rides
CREATE POLICY "Users can view their own rides"
  ON public.rides FOR SELECT
  USING (auth.uid() = client_id OR driver_id IN (
    SELECT id FROM public.drivers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Clients can create rides"
  ON public.rides FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Drivers can update rides they're assigned to"
  ON public.rides FOR UPDATE
  USING (driver_id IN (
    SELECT id FROM public.drivers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Clients can update their own rides"
  ON public.rides FOR UPDATE
  USING (auth.uid() = client_id);

CREATE POLICY "Drivers can view requested rides"
  ON public.rides FOR SELECT
  USING (status = 'requested');

-- RLS Policies pour driver_wallets
CREATE POLICY "Drivers can view their own wallet"
  ON public.driver_wallets FOR SELECT
  USING (driver_id IN (
    SELECT id FROM public.drivers WHERE user_id = auth.uid()
  ));

CREATE POLICY "System can manage wallets"
  ON public.driver_wallets FOR ALL
  USING (true);

-- RLS Policies pour driver_transactions
CREATE POLICY "Drivers can view their own transactions"
  ON public.driver_transactions FOR SELECT
  USING (wallet_id IN (
    SELECT dw.id FROM public.driver_wallets dw
    JOIN public.drivers d ON d.id = dw.driver_id
    WHERE d.user_id = auth.uid()
  ));

-- RLS Policies pour driver_reviews
CREATE POLICY "Anyone can view reviews"
  ON public.driver_reviews FOR SELECT
  USING (true);

CREATE POLICY "Clients can create reviews"
  ON public.driver_reviews FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own reviews"
  ON public.driver_reviews FOR UPDATE
  USING (auth.uid() = client_id);

-- Trigger Functions

-- 1. Fonction pour créer automatiquement un wallet pour un nouveau chauffeur
CREATE OR REPLACE FUNCTION public.create_driver_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.driver_wallets (driver_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fonction pour créditer le chauffeur à la fin d'une course
CREATE OR REPLACE FUNCTION public.credit_driver_on_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_wallet_id UUID;
  v_commission_amount DECIMAL(10, 2);
  v_driver_earnings DECIMAL(10, 2);
BEGIN
  -- Vérifier que le statut passe à 'completed' et qu'il y a un fare
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.fare IS NOT NULL AND NEW.driver_id IS NOT NULL THEN
    
    -- Calculer la commission et les gains du chauffeur
    v_commission_amount := NEW.fare * COALESCE(NEW.commission_rate, 0.10);
    v_driver_earnings := NEW.fare - v_commission_amount;
    
    -- Mettre à jour la course avec les montants calculés
    UPDATE public.rides 
    SET 
      commission_amount = v_commission_amount,
      driver_earnings = v_driver_earnings,
      completed_at = COALESCE(NEW.completed_at, now())
    WHERE id = NEW.id;
    
    -- Trouver le wallet du chauffeur
    SELECT id INTO v_wallet_id 
    FROM public.driver_wallets 
    WHERE driver_id = NEW.driver_id;
    
    IF v_wallet_id IS NOT NULL THEN
      -- Créditer le wallet du chauffeur
      UPDATE public.driver_wallets 
      SET 
        balance_gnf = balance_gnf + v_driver_earnings,
        total_earned = total_earned + v_driver_earnings,
        updated_at = now()
      WHERE id = v_wallet_id;
      
      -- Enregistrer la transaction des gains
      INSERT INTO public.driver_transactions (
        wallet_id, ride_id, type, amount, currency, description
      ) VALUES (
        v_wallet_id, NEW.id, 'earning', v_driver_earnings, NEW.currency,
        'Earnings from ride #' || NEW.id::text
      );
      
      -- Enregistrer la transaction de commission (pour audit)
      INSERT INTO public.driver_transactions (
        wallet_id, ride_id, type, amount, currency, description
      ) VALUES (
        v_wallet_id, NEW.id, 'commission', -v_commission_amount, NEW.currency,
        'Platform commission from ride #' || NEW.id::text
      );
      
      -- Mettre à jour les stats du chauffeur
      UPDATE public.drivers 
      SET 
        total_rides = total_rides + 1,
        total_earnings = total_earnings + v_driver_earnings,
        updated_at = now()
      WHERE id = NEW.driver_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Fonction pour mettre à jour la note moyenne des chauffeurs
CREATE OR REPLACE FUNCTION public.update_driver_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_avg_rating DECIMAL(3, 2);
BEGIN
  -- Calculer la nouvelle moyenne
  SELECT AVG(rating)::DECIMAL(3, 2) INTO v_avg_rating
  FROM public.driver_reviews
  WHERE driver_id = COALESCE(NEW.driver_id, OLD.driver_id);
  
  -- Mettre à jour la note du chauffeur
  UPDATE public.drivers
  SET 
    rating_average = COALESCE(v_avg_rating, 0.00),
    updated_at = now()
  WHERE id = COALESCE(NEW.driver_id, OLD.driver_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Fonction pour logger les changements de statut des courses
CREATE OR REPLACE FUNCTION public.log_ride_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.ride_logs (
      ride_id, user_id, action, old_status, new_status, details
    ) VALUES (
      NEW.id, 
      auth.uid(), 
      'status_change',
      OLD.status,
      NEW.status,
      jsonb_build_object(
        'fare', NEW.fare,
        'driver_id', NEW.driver_id,
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers

-- Créer wallet automatiquement pour nouveau chauffeur
CREATE TRIGGER trigger_create_driver_wallet
  AFTER INSERT ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.create_driver_wallet();

-- Créditer chauffeur à la fin d'une course
CREATE TRIGGER trigger_credit_driver_on_completion
  AFTER UPDATE ON public.rides
  FOR EACH ROW
  EXECUTE FUNCTION public.credit_driver_on_completion();

-- Mettre à jour note moyenne des chauffeurs
CREATE TRIGGER trigger_update_driver_rating_insert
  AFTER INSERT ON public.driver_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_driver_rating();

CREATE TRIGGER trigger_update_driver_rating_update
  AFTER UPDATE ON public.driver_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_driver_rating();

CREATE TRIGGER trigger_update_driver_rating_delete
  AFTER DELETE ON public.driver_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_driver_rating();

-- Logger les changements de statut
CREATE TRIGGER trigger_log_ride_changes
  AFTER UPDATE ON public.rides
  FOR EACH ROW
  EXECUTE FUNCTION public.log_ride_changes();

-- Triggers pour updated_at
CREATE TRIGGER trigger_drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_rides_updated_at
  BEFORE UPDATE ON public.rides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_driver_wallets_updated_at
  BEFORE UPDATE ON public.driver_wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON public.drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_location ON public.drivers(current_lat, current_lng) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_drivers_active ON public.drivers(is_active, is_verified);

CREATE INDEX IF NOT EXISTS idx_rides_client_id ON public.rides(client_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver_id ON public.rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON public.rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_location_pickup ON public.rides(pickup_lat, pickup_lng);
CREATE INDEX IF NOT EXISTS idx_rides_created_at ON public.rides(created_at);

CREATE INDEX IF NOT EXISTS idx_driver_wallets_driver_id ON public.driver_wallets(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_transactions_wallet_id ON public.driver_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_driver_transactions_ride_id ON public.driver_transactions(ride_id);

CREATE INDEX IF NOT EXISTS idx_driver_reviews_driver_id ON public.driver_reviews(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_reviews_client_id ON public.driver_reviews(client_id);

CREATE INDEX IF NOT EXISTS idx_ride_logs_ride_id ON public.ride_logs(ride_id);

-- Commentaires pour documentation
COMMENT ON TABLE public.drivers IS 'Table des chauffeurs taxi-moto';
COMMENT ON TABLE public.rides IS 'Table des courses taxi-moto';
COMMENT ON TABLE public.driver_wallets IS 'Portefeuilles des chauffeurs';
COMMENT ON TABLE public.driver_transactions IS 'Historique des transactions chauffeurs';
COMMENT ON TABLE public.driver_reviews IS 'Avis et notes des chauffeurs';
COMMENT ON TABLE public.ride_logs IS 'Logs d''audit des courses';