-- Ajouter une colonne image_url à la table services
ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Mettre à jour les services avec des images réelles
UPDATE services SET image_url = 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400' WHERE type = 'motard';
UPDATE services SET image_url = 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400' WHERE type = 'livreur';
UPDATE services SET image_url = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400' WHERE type = 'boutique';
UPDATE services SET image_url = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400' WHERE type = 'physical-products';
UPDATE services SET image_url = 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400' WHERE type = 'digital-services';
UPDATE services SET image_url = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' WHERE type = 'restaurant';
UPDATE services SET image_url = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400' WHERE type = 'beauty-salon';
UPDATE services SET image_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' WHERE type = 'professional-services';
UPDATE services SET image_url = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400' WHERE type = 'events';
UPDATE services SET image_url = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400' WHERE type = 'education';
UPDATE services SET image_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400' WHERE type = 'health-wellness';
UPDATE services SET image_url = 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400' WHERE type = 'artisanal';
UPDATE services SET image_url = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400' WHERE type = 'automotive';
UPDATE services SET image_url = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400' WHERE type = 'real-estate';
UPDATE services SET image_url = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400' WHERE type = 'home-services';