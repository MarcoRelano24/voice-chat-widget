-- Create storage bucket for widget uploads (logos, icons, etc.)

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'widget-uploads',
  'widget-uploads',
  true,  -- Public bucket so logos are accessible
  5242880,  -- 5MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'widget-uploads');

-- Allow authenticated users to update their files
CREATE POLICY "Authenticated users can update files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'widget-uploads');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'widget-uploads');

-- Allow public read access (so logos can be displayed)
CREATE POLICY "Public can read files"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'widget-uploads');

-- Success message
SELECT 'Storage bucket created successfully!' AS message;
