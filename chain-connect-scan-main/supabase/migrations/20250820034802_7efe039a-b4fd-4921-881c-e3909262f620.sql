-- Create storage bucket for shop images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'shop-images', 
  'shop-images', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for shop images bucket
CREATE POLICY "Users can upload their own shop images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'shop-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view shop images" ON storage.objects
FOR SELECT USING (bucket_id = 'shop-images');

CREATE POLICY "Users can update their own shop images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'shop-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own shop images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'shop-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);