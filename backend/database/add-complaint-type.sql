-- Add complaint type column to existing complaints table
-- This migration adds the complaint_type column with predefined categories

-- Add the complaint_type column
ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS complaint_type VARCHAR(50) DEFAULT 'General' 
CHECK (complaint_type IN ('Technical', 'Billing', 'Service', 'General', 'Product', 'Account', 'Other'));

-- Update existing complaints with NULL or empty complaint_type to 'General'
UPDATE complaints 
SET complaint_type = 'General' 
WHERE complaint_type IS NULL OR complaint_type = '';

-- Create an index on complaint_type for better query performance
CREATE INDEX IF NOT EXISTS idx_complaints_type ON complaints(complaint_type);

-- Update the updated_at timestamp trigger to include complaint_type changes
-- (Assuming there's already a trigger for updated_at, this ensures it fires for type changes too)

COMMENT ON COLUMN complaints.complaint_type IS 'Category of the complaint: Technical, Billing, Service, General, Product, Account, Other';