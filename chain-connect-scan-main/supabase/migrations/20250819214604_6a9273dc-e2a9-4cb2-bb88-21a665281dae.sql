-- Créer la fonction pour générer des IDs uniques lisibles
CREATE OR REPLACE FUNCTION generate_readable_id(prefix TEXT, table_name TEXT, id_column TEXT DEFAULT 'readable_id')
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_id TEXT;
  counter INTEGER := 1;
BEGIN
  LOOP
    new_id := prefix || '-' || LPAD(counter::TEXT, 4, '0');
    
    -- Vérifier si l'ID existe déjà
    EXECUTE format('SELECT 1 FROM %I WHERE %I = %L', table_name, id_column, new_id);
    
    IF NOT FOUND THEN
      RETURN new_id;
    END IF;
    
    counter := counter + 1;
  END LOOP;
END;
$$;

-- Ajouter des colonnes readable_id aux tables existantes
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS readable_id TEXT UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS readable_id TEXT UNIQUE;

-- Créer une table pour les positions GPS en temps réel
CREATE TABLE IF NOT EXISTS gps_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(5, 2),
  speed DECIMAL(5, 2),
  heading DECIMAL(5, 2),
  altitude DECIMAL(7, 2),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances sur les requêtes GPS
CREATE INDEX IF NOT EXISTS idx_gps_tracking_user_active ON gps_tracking(user_id, is_active, timestamp);
CREATE INDEX IF NOT EXISTS idx_gps_tracking_order_active ON gps_tracking(order_id, is_active, timestamp);
CREATE INDEX IF NOT EXISTS idx_gps_tracking_timestamp ON gps_tracking(timestamp);

-- Créer une table pour les notifications push
CREATE TABLE IF NOT EXISTS push_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('order_assigned', 'pickup_ready', 'in_transit', 'delivered', 'position_update')),
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Index pour les notifications
CREATE INDEX IF NOT EXISTS idx_push_notifications_user_unread ON push_notifications(user_id, is_read, sent_at);

-- Activer RLS sur les nouvelles tables
ALTER TABLE gps_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_notifications ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour gps_tracking
CREATE POLICY "Users can insert their own GPS positions" ON gps_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view GPS positions related to their orders" ON gps_tracking
  FOR SELECT USING (
    user_id = auth.uid() OR
    order_id IN (
      SELECT id FROM orders 
      WHERE customer_id = auth.uid() OR seller_id = auth.uid() OR courier_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own GPS positions" ON gps_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- Politiques RLS pour push_notifications
CREATE POLICY "Users can view their own notifications" ON push_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON push_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Fonction pour générer les IDs lisibles lors de l'insertion
CREATE OR REPLACE FUNCTION set_readable_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.readable_id IS NULL THEN
    CASE TG_TABLE_NAME
      WHEN 'profiles' THEN
        CASE NEW.role
          WHEN 'client' THEN NEW.readable_id := generate_readable_id('CLT', 'profiles');
          WHEN 'seller' THEN NEW.readable_id := generate_readable_id('VDR', 'profiles');
          WHEN 'courier' THEN NEW.readable_id := generate_readable_id('DLV', 'profiles');
          WHEN 'admin' THEN NEW.readable_id := generate_readable_id('ADM', 'profiles');
          ELSE NEW.readable_id := generate_readable_id('USR', 'profiles');
        END CASE;
      WHEN 'orders' THEN
        NEW.readable_id := generate_readable_id('ORD', 'orders');
    END CASE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour auto-générer les IDs
DROP TRIGGER IF EXISTS set_readable_id_profiles ON profiles;
CREATE TRIGGER set_readable_id_profiles
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_readable_id();

DROP TRIGGER IF EXISTS set_readable_id_orders ON orders;
CREATE TRIGGER set_readable_id_orders
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION set_readable_id();

-- Mettre à jour les profils existants avec des IDs lisibles
DO $$
DECLARE
  profile_rec RECORD;
BEGIN
  FOR profile_rec IN SELECT id, role FROM profiles WHERE readable_id IS NULL LOOP
    UPDATE profiles 
    SET readable_id = CASE profile_rec.role
      WHEN 'client' THEN generate_readable_id('CLT', 'profiles')
      WHEN 'seller' THEN generate_readable_id('VDR', 'profiles')
      WHEN 'courier' THEN generate_readable_id('DLV', 'profiles')
      WHEN 'admin' THEN generate_readable_id('ADM', 'profiles')
      ELSE generate_readable_id('USR', 'profiles')
    END
    WHERE id = profile_rec.id;
  END LOOP;
END $$;

-- Mettre à jour les commandes existantes avec des IDs lisibles
UPDATE orders SET readable_id = generate_readable_id('ORD', 'orders') WHERE readable_id IS NULL;

-- Activer les mises à jour temps réel pour le tracking GPS
ALTER TABLE gps_tracking REPLICA IDENTITY FULL;
ALTER TABLE push_notifications REPLICA IDENTITY FULL;