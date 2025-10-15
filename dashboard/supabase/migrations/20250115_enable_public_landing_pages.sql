-- Enable public read access for landing pages
-- This allows anonymous users to view landing pages without authentication

-- Allow public read access to clients that have widgets with landing pages enabled
CREATE POLICY "Public can view clients with landing pages"
  ON clients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM widgets
      WHERE widgets.client_id = clients.id
      AND widgets.landing_page_enabled = true
      AND widgets.is_active = true
    )
  );

-- Allow public read access to widgets with landing pages enabled
CREATE POLICY "Public can view widgets with landing pages enabled"
  ON widgets FOR SELECT
  USING (
    landing_page_enabled = true
    AND is_active = true
  );

-- Add comment
COMMENT ON POLICY "Public can view clients with landing pages" ON clients
IS 'Allows anonymous users to view client information when they have active landing pages';

COMMENT ON POLICY "Public can view widgets with landing pages enabled" ON widgets
IS 'Allows anonymous users to view widget configuration for public landing pages';
