-- Supprimer la contrainte existante qui référence digital_shops
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_shop_id_fkey;

-- Créer une nouvelle contrainte qui référence seller_shops
ALTER TABLE products 
ADD CONSTRAINT products_shop_id_fkey 
FOREIGN KEY (shop_id) REFERENCES seller_shops(id) ON DELETE SET NULL;

-- Associer les produits existants aux bonnes boutiques seller_shops
UPDATE products 
SET shop_id = seller_shops.id
FROM seller_shops
WHERE products.seller_id = seller_shops.seller_id
  AND products.shop_id IS NULL;

-- Mettre à jour le compteur de produits des boutiques
UPDATE seller_shops 
SET product_count = (
  SELECT COUNT(*) 
  FROM products 
  WHERE products.shop_id = seller_shops.id 
    AND products.is_active = true
);

-- Créer un trigger pour maintenir automatiquement le product_count à jour
CREATE OR REPLACE FUNCTION update_shop_product_count_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.shop_id IS NOT NULL AND NEW.is_active = true THEN
      UPDATE seller_shops 
      SET product_count = product_count + 1 
      WHERE id = NEW.shop_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Si le produit change de boutique ou de statut
    IF OLD.shop_id IS DISTINCT FROM NEW.shop_id OR OLD.is_active IS DISTINCT FROM NEW.is_active THEN
      -- Décrémenter l'ancienne boutique si nécessaire
      IF OLD.shop_id IS NOT NULL AND OLD.is_active = true THEN
        UPDATE seller_shops 
        SET product_count = product_count - 1 
        WHERE id = OLD.shop_id;
      END IF;
      -- Incrémenter la nouvelle boutique si nécessaire
      IF NEW.shop_id IS NOT NULL AND NEW.is_active = true THEN
        UPDATE seller_shops 
        SET product_count = product_count + 1 
        WHERE id = NEW.shop_id;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.shop_id IS NOT NULL AND OLD.is_active = true THEN
      UPDATE seller_shops 
      SET product_count = product_count - 1 
      WHERE id = OLD.shop_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_update_shop_product_count ON products;
CREATE TRIGGER trigger_update_shop_product_count
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_shop_product_count_trigger();