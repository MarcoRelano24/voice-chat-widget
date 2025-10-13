-- Add public read access for widget configs
-- This allows the embed widget to fetch configuration without authentication
-- Run this in Supabase SQL Editor

-- Create policy to allow anonymous read access to active widgets
CREATE POLICY "Public can read active widget configs"
  ON widgets FOR SELECT
  USING (is_active = true);

-- This policy allows anyone (authenticated or not) to read widgets that are active
-- The API will still filter to only return config and is_active fields
