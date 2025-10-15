-- Add landing page enabled field to widgets table
ALTER TABLE widgets
ADD COLUMN IF NOT EXISTS landing_page_enabled BOOLEAN DEFAULT FALSE;

-- Add index for efficient landing page queries
CREATE INDEX IF NOT EXISTS idx_widgets_landing_page_enabled ON widgets(landing_page_enabled) WHERE landing_page_enabled = TRUE;

-- Comment
COMMENT ON COLUMN widgets.landing_page_enabled IS 'When enabled, this widget will be accessible via a hosted landing page at /[client-slug]';
