-- Add landing page customization fields to widgets table
ALTER TABLE widgets
ADD COLUMN IF NOT EXISTS landing_page_title TEXT,
ADD COLUMN IF NOT EXISTS landing_page_description TEXT,
ADD COLUMN IF NOT EXISTS landing_page_custom_html TEXT,
ADD COLUMN IF NOT EXISTS landing_page_custom_css TEXT,
ADD COLUMN IF NOT EXISTS landing_page_custom_js TEXT,
ADD COLUMN IF NOT EXISTS landing_page_show_default_content BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS landing_page_background_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS landing_page_header_image TEXT;

-- Add comments
COMMENT ON COLUMN widgets.landing_page_title IS 'Custom title for the landing page (overrides default)';
COMMENT ON COLUMN widgets.landing_page_description IS 'Custom description text for the landing page';
COMMENT ON COLUMN widgets.landing_page_custom_html IS 'Custom HTML content to inject into the landing page';
COMMENT ON COLUMN widgets.landing_page_custom_css IS 'Custom CSS styles for the landing page';
COMMENT ON COLUMN widgets.landing_page_custom_js IS 'Custom JavaScript code for the landing page';
COMMENT ON COLUMN widgets.landing_page_show_default_content IS 'Whether to show the default instructions and content sections';
COMMENT ON COLUMN widgets.landing_page_background_color IS 'Background color for the entire landing page';
COMMENT ON COLUMN widgets.landing_page_header_image IS 'URL to a custom header/hero image for the landing page';
