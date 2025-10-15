-- Add landing_page_slug for unique landing page URLs
-- This allows multiple widgets of the same type per client to have separate landing pages

-- Add the column (nullable initially for migration)
ALTER TABLE widgets
ADD COLUMN IF NOT EXISTS landing_page_slug TEXT;

-- Create unique index on landing_page_slug (only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_widgets_landing_page_slug
ON widgets(landing_page_slug)
WHERE landing_page_slug IS NOT NULL;

-- Function to generate random 8-character alphanumeric slug
CREATE OR REPLACE FUNCTION generate_random_slug() RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Generate unique slugs for existing widgets with landing pages enabled
DO $$
DECLARE
  widget_record RECORD;
  new_slug TEXT;
  slug_exists BOOLEAN;
BEGIN
  FOR widget_record IN
    SELECT id FROM widgets WHERE landing_page_enabled = true AND landing_page_slug IS NULL
  LOOP
    -- Generate unique slug
    LOOP
      new_slug := generate_random_slug();

      -- Check if slug already exists
      SELECT EXISTS(
        SELECT 1 FROM widgets WHERE landing_page_slug = new_slug
      ) INTO slug_exists;

      -- Exit loop if unique
      EXIT WHEN NOT slug_exists;
    END LOOP;

    -- Update widget with unique slug
    UPDATE widgets
    SET landing_page_slug = new_slug
    WHERE id = widget_record.id;
  END LOOP;
END $$;

-- Add comment
COMMENT ON COLUMN widgets.landing_page_slug IS 'Unique slug for landing page URL. Allows multiple landing pages per client/type combination.';

-- Note: The landing_page_slug should be auto-generated when landing_page_enabled is set to true
-- This will be handled in the application code
