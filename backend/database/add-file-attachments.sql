-- Create storage bucket for complaint attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'complaint-attachments',
  'complaint-attachments',
  false, -- Files will be private
  5242880, -- 5MB limit
  ARRAY['text/plain', 'application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create file_attachments table
CREATE TABLE IF NOT EXISTS file_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for file_attachments table
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users (admin/agents) to select all attachments
CREATE POLICY "Allow authenticated users to view attachments" ON file_attachments
FOR SELECT TO authenticated
USING (true);

-- Policy: Allow anyone to insert attachments (for complaint submission)
CREATE POLICY "Allow public insert of attachments" ON file_attachments
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Policy: Allow authenticated users to delete attachments
CREATE POLICY "Allow authenticated users to delete attachments" ON file_attachments
FOR DELETE TO authenticated
USING (true);

-- Create storage policies for the bucket
CREATE POLICY "Allow public upload to complaint-attachments bucket" ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'complaint-attachments');

CREATE POLICY "Allow authenticated users to view complaint attachments" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'complaint-attachments');

CREATE POLICY "Allow authenticated users to delete complaint attachments" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'complaint-attachments');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_file_attachments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_file_attachments_updated_at
  BEFORE UPDATE ON file_attachments
  FOR EACH ROW
  EXECUTE FUNCTION update_file_attachments_updated_at();

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_file_attachments_complaint_id ON file_attachments(complaint_id);