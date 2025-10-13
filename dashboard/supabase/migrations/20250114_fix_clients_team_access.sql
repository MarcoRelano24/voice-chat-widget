-- Fix clients RLS policies to allow team access (match widgets behavior)
-- This allows all authenticated users to view/manage all clients

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;

-- Create new team-access policies (matching widgets table behavior)
CREATE POLICY "Users can view all clients"
  ON clients FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update all clients"
  ON clients FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete all clients"
  ON clients FOR DELETE
  USING (auth.role() = 'authenticated');

-- Keep the insert policy as-is (users can create clients)
-- This was already correct, no changes needed

-- Success message
SELECT 'Clients RLS policies updated to allow team access!' AS message;
