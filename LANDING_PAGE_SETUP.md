# Landing Page Feature Setup

This guide explains how to set up and use the hosted landing page feature.

## Overview

The landing page feature allows you to create a public-facing page for each client at a custom URL like:
```
https://voice.romea.ai/client-name
```

## Database Migration

Before using this feature, you need to run the database migration to add the `landing_page_enabled` column to the `widgets` table.

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Open the file `dashboard/supabase/migrations/20250115_add_landing_page.sql`
4. Copy its contents and paste into the SQL Editor
5. Click "Run" to execute the migration

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
cd dashboard
supabase db push
```

## How to Use

### 1. Associate Widget with Client

Before enabling landing pages, make sure your widget is associated with a client:

1. Go to the Clients page
2. Create a client or select an existing one
3. When creating/editing a widget, select the client from the dropdown

### 2. Enable Landing Page

1. Go to Dashboard → Widgets
2. Click on a widget to edit it
3. Scroll to the "Enable Hosted Landing Page" toggle
4. Check the box to enable
5. The landing page URL will be displayed (e.g., `https://voice.romea.ai/acme-corp`)
6. Click "Save Widget"

### 3. URL Generation

The landing page URL is automatically generated from the client name:
- Spaces are replaced with hyphens
- All characters are lowercase
- Special characters are removed

**Examples:**
- "Acme Corp" → `https://voice.romea.ai/acme-corp`
- "John's Bakery" → `https://voice.romea.ai/johns-bakery`
- "ABC Company Inc." → `https://voice.romea.ai/abc-company-inc`

### 4. Landing Page Content

The landing page includes:
- Client logo (if configured)
- Company name
- Welcome message
- Client description
- Embedded voice widget
- Instructions for use
- Branded footer

All styling and colors are pulled from the widget configuration.

## Requirements

- Widget must be associated with a client
- Widget must have `landing_page_enabled = true`
- Widget must have `is_active = true`
- Client must exist in the database

## Technical Details

### Route
- File: `dashboard/src/app/[clientSlug]/page.tsx`
- Dynamic route that matches any URL segment

### Database Schema
```sql
ALTER TABLE widgets
ADD COLUMN landing_page_enabled BOOLEAN DEFAULT FALSE;
```

### TypeScript Interface
```typescript
interface Widget {
  // ... other fields
  landing_page_enabled?: boolean;
}
```

## Troubleshooting

### "Landing page not found" error
- Verify the client exists
- Check that the URL slug matches the client name
- Ensure the widget has `landing_page_enabled = true`

### Widget not loading
- Check that `is_active = true` on the widget
- Verify the widget ID in the database
- Check browser console for JavaScript errors

### Wrong widget appearing
- Each client can only have ONE widget with `landing_page_enabled = true`
- If multiple widgets are enabled, only the first one will be shown
- Disable landing pages on other widgets for that client
