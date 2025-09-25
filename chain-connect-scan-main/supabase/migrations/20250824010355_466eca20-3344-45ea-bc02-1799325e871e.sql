-- Créer le bucket pour les produits numériques s'il n'existe pas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('digital-products', 'digital-products', false)
ON CONFLICT (id) DO NOTHING;

-- Créer les politiques de sécurité pour le bucket digital-products
CREATE POLICY "Users can upload their own digital products" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'digital-products' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own digital products" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'digital-products' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own digital products" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'digital-products' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own digital products" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'digital-products' AND auth.uid()::text = (storage.foldername(name))[1]);