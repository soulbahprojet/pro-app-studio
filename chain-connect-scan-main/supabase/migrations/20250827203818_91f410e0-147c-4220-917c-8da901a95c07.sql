-- Fix security warnings pour les nouvelles fonctions du module Taxi Moto
-- Ajouter SET search_path = 'public' aux fonctions pour corriger les warnings de sécurité

CREATE OR REPLACE FUNCTION public.create_driver_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.driver_wallets (driver_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public';

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
    UPDATE rides 
    SET 
      commission_amount = v_commission_amount,
      driver_earnings = v_driver_earnings,
      completed_at = COALESCE(NEW.completed_at, now())
    WHERE id = NEW.id;
    
    -- Trouver le wallet du chauffeur
    SELECT id INTO v_wallet_id 
    FROM driver_wallets 
    WHERE driver_id = NEW.driver_id;
    
    IF v_wallet_id IS NOT NULL THEN
      -- Créditer le wallet du chauffeur
      UPDATE driver_wallets 
      SET 
        balance_gnf = balance_gnf + v_driver_earnings,
        total_earned = total_earned + v_driver_earnings,
        updated_at = now()
      WHERE id = v_wallet_id;
      
      -- Enregistrer la transaction des gains
      INSERT INTO driver_transactions (
        wallet_id, ride_id, type, amount, currency, description
      ) VALUES (
        v_wallet_id, NEW.id, 'earning', v_driver_earnings, NEW.currency,
        'Earnings from ride #' || NEW.id::text
      );
      
      -- Enregistrer la transaction de commission (pour audit)
      INSERT INTO driver_transactions (
        wallet_id, ride_id, type, amount, currency, description
      ) VALUES (
        v_wallet_id, NEW.id, 'commission', -v_commission_amount, NEW.currency,
        'Platform commission from ride #' || NEW.id::text
      );
      
      -- Mettre à jour les stats du chauffeur
      UPDATE drivers 
      SET 
        total_rides = total_rides + 1,
        total_earnings = total_earnings + v_driver_earnings,
        updated_at = now()
      WHERE id = NEW.driver_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public';

CREATE OR REPLACE FUNCTION public.update_driver_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_avg_rating DECIMAL(3, 2);
BEGIN
  -- Calculer la nouvelle moyenne
  SELECT AVG(rating)::DECIMAL(3, 2) INTO v_avg_rating
  FROM driver_reviews
  WHERE driver_id = COALESCE(NEW.driver_id, OLD.driver_id);
  
  -- Mettre à jour la note du chauffeur
  UPDATE drivers
  SET 
    rating_average = COALESCE(v_avg_rating, 0.00),
    updated_at = now()
  WHERE id = COALESCE(NEW.driver_id, OLD.driver_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public';

CREATE OR REPLACE FUNCTION public.log_ride_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO ride_logs (
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
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public';