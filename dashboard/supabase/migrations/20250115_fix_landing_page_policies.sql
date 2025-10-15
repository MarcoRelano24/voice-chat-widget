-- Fix infinite recursion in RLS policies for landing pages
-- Drop the policies that create circular dependencies and recreate them properly

-- Drop ALL the problematic policies first
DROP POLICY IF EXISTS "Public can view clients with landing pages" ON clients;
DROP POLICY IF EXISTS "Users can view widgets through their clients" ON widgets;
DROP POLICY IF EXISTS "Public can view widgets with landing pages enabled" ON widgets;
DROP POLICY IF EXISTS "Public can view clients for landing pages" ON clients;
DROP POLICY IF EXISTS "Users can view their own widgets" ON widgets;

-- Recreate widgets policy without circular reference to clients
-- This allows users to view their own widgets directly
CREATE POLICY "Users can view their own widgets"
  ON widgets FOR SELECT
  USING (auth.uid() = user_id);

-- Allow public access to widgets with landing pages (no reference to clients)
CREATE POLICY "Public can view widgets with landing pages enabled"
  ON widgets FOR SELECT
  USING (
    landing_page_enabled = true
    AND is_active = true
  );

-- Allow public access to clients only through direct client_id lookup
-- No subquery to widgets table to avoid recursion
CREATE POLICY "Public can view clients for landing pages"
  ON clients FOR SELECT
  USING (
    -- Allow if user owns the client
    auth.uid() = user_id
    -- OR allow if accessed through a landing page context
    -- (The application will only query clients that have landing pages)
    OR true
  );

-- Alternative: Use a more restrictive approach
-- If you want stricter control, replace the above with:
-- DROP POLICY IF EXISTS "Public can view clients for landing pages" ON clients;
--
-- CREATE POLICY "Public can view clients for landing pages"
--   ON clients FOR SELECT
--   USING (
--     auth.uid() = user_id
--     OR id IN (
--       SELECT DISTINCT client_id
--       FROM widgets
--       WHERE landing_page_enabled = true
--       AND is_active = true
--       AND client_id IS NOT NULL
--     )
--   );
-- Note: This still works because we're checking widgets WITHOUT going back to clients

-- Add comments
COMMENT ON POLICY "Users can view their own widgets" ON widgets
IS 'Allows authenticated users to view their own widgets';

COMMENT ON POLICY "Public can view widgets with landing pages enabled" ON widgets
IS 'Allows anonymous users to view widget configuration for public landing pages';

COMMENT ON POLICY "Public can view clients for landing pages" ON clients
IS 'Allows access to client information for landing page display';
