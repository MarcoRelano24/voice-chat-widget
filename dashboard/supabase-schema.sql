-- Voice Widget Platform Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create widgets table
CREATE TABLE IF NOT EXISTS widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('floating', 'inline', 'page')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create widget analytics table
CREATE TABLE IF NOT EXISTS widget_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  widget_id UUID REFERENCES widgets(id) ON DELETE CASCADE NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  session_id VARCHAR(255),
  page_url TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_widgets_user_id ON widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_widgets_created_at ON widgets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_widget_id ON widget_analytics(widget_id);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON widget_analytics(timestamp DESC);

-- Enable Row Level Security
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for widgets table
-- Users can view all widgets (team access)
CREATE POLICY "Users can view all widgets"
  ON widgets FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can insert their own widgets
CREATE POLICY "Users can insert widgets"
  ON widgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update all widgets (team access)
CREATE POLICY "Users can update widgets"
  ON widgets FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Users can delete all widgets (team access)
CREATE POLICY "Users can delete widgets"
  ON widgets FOR DELETE
  USING (auth.role() = 'authenticated');

-- RLS Policies for analytics table
-- Allow public read access for analytics (widgets need to log events)
CREATE POLICY "Public can insert analytics"
  ON widget_analytics FOR INSERT
  WITH CHECK (true);

-- Users can view analytics for all widgets
CREATE POLICY "Users can view analytics"
  ON widget_analytics FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_widgets_updated_at
  BEFORE UPDATE ON widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample widget for testing (optional)
-- You can delete this after verifying setup
INSERT INTO widgets (user_id, name, type, config)
SELECT
  auth.uid(),
  'Sample Widget',
  'floating',
  jsonb_build_object(
    'type', 'floating',
    'display', jsonb_build_object(
      'position', 'bottom-right',
      'offsetX', 20,
      'offsetY', 20,
      'zIndex', 9999
    ),
    'dimensions', jsonb_build_object(
      'buttonSize', 60,
      'panelWidth', 380,
      'panelHeight', 600
    ),
    'colors', jsonb_build_object(
      'primary', '#667eea',
      'background', '#ffffff',
      'text', '#333333'
    ),
    'content', jsonb_build_object(
      'companyName', 'Your Company',
      'welcomeMessage', 'How can we help you today?'
    ),
    'vapi', jsonb_build_object(
      'assistantId', 'YOUR_ASSISTANT_ID'
    )
  )
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Database schema created successfully!' AS message;
