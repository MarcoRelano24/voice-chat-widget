-- Add domain restrictions for widgets
-- This allows widgets to be restricted to specific domains via CORS

-- Add allowed_domains column (array of text)
ALTER TABLE widgets
ADD COLUMN IF NOT EXISTS allowed_domains TEXT[] DEFAULT NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_widgets_allowed_domains
ON widgets USING GIN (allowed_domains);

-- Add comment
COMMENT ON COLUMN widgets.allowed_domains IS 'Array of allowed domains where this widget can be embedded. NULL or empty means no restrictions. Supports wildcards like *.example.com';

-- Example data:
-- allowed_domains = NULL                              → Allow all domains (no restrictions)
-- allowed_domains = []                                → Allow all domains (no restrictions)
-- allowed_domains = ['example.com']                   → Only example.com
-- allowed_domains = ['example.com', 'www.example.com'] → Multiple specific domains
-- allowed_domains = ['*.example.com']                 → All subdomains of example.com
-- allowed_domains = ['localhost', '127.0.0.1']        → Local development only
