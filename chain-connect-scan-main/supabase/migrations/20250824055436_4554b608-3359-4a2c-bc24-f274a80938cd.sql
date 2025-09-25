-- Insérer les services de proximité manquants pour la Guinée
INSERT INTO services (name, type, country, description, is_active) VALUES
('Services de motards', 'motard', 'GN', 'Services de transport par moto pour livraisons rapides', true),
('Services de livreurs', 'livreur', 'GN', 'Services de livraison professionnelle à domicile', true),
('Boutiques générales', 'boutique', 'GN', 'Boutiques de proximité pour vos achats quotidiens', true),
('Produits physiques', 'physical-products', 'GN', 'Magasins vendant des produits physiques variés', true),
('Services numériques', 'digital-services', 'GN', 'Prestataires de services numériques et IT', true),
('Restaurants', 'restaurant', 'GN', 'Restaurants et services de restauration', true),
('Salons de beauté', 'beauty-salon', 'GN', 'Salons de coiffure et centres de beauté', true),
('Services professionnels', 'professional-services', 'GN', 'Consultants et services professionnels', true),
('Événementiel', 'events', 'GN', 'Organisation d''événements et cérémonies', true),
('Éducation', 'education', 'GN', 'Centres de formation et écoles', true),
('Santé et bien-être', 'health-wellness', 'GN', 'Services de santé et centres de bien-être', true),
('Artisanat', 'artisanal', 'GN', 'Artisans et créateurs locaux', true),
('Automobile', 'automotive', 'GN', 'Garages, mécaniciens et services auto', true),
('Immobilier', 'real-estate', 'GN', 'Agences immobilières et services fonciers', true),
('Services à domicile', 'home-services', 'GN', 'Plombiers, électriciens, services de ménage', true);

-- Mettre à jour les boutiques existantes sans business_type
UPDATE seller_shops 
SET business_type = 'boutique', shop_category = 'Boutique générale' 
WHERE business_type IS NULL AND is_active = true;