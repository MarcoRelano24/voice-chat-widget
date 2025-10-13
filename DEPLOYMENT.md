# Voice Chat Widget Management - Deployment Guide

**By Romea AI** - A multi-tenant platform for creating and managing voice chat widgets powered by Vapi.

## Prerequisites

Before deploying to Vercel, ensure you have:

1. A Vercel account (https://vercel.com)
2. Supabase project with the database schema applied
3. Vapi account with API keys
4. **IMPORTANT**: Run the new client management migration (see Database Setup section)

## Environment Variables

You need to configure the following environment variables in Vercel:

### Required Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### How to Get These Values

1. **Supabase URL and Anon Key**:
   - Go to your Supabase project dashboard
   - Click on "Settings" (gear icon)
   - Go to "API" section
   - Copy "Project URL" for `NEXT_PUBLIC_SUPABASE_URL`
   - Copy "anon public" key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **App URL**:
   - This will be your Vercel deployment URL
   - Example: `https://your-widget-app.vercel.app`
   - You can set this after initial deployment

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/voice-chat-widget.git
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select the repository
   - Configure project:
     - Framework Preset: Next.js
     - Root Directory: `dashboard`
     - Build Command: `npm run build`
     - Output Directory: `.next`

3. **Add Environment Variables**:
   - In the "Environment Variables" section, add all three variables listed above
   - Make sure to check "Production", "Preview", and "Development"

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Navigate to dashboard directory**:
   ```bash
   cd dashboard
   ```

4. **Deploy**:
   ```bash
   vercel
   ```

5. **Set Environment Variables** (first time only):
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add NEXT_PUBLIC_APP_URL
   ```

6. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## Post-Deployment Configuration

### 1. Update NEXT_PUBLIC_APP_URL

After your first deployment:

1. Copy your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
2. Go to your Vercel project settings
3. Navigate to "Environment Variables"
4. Update `NEXT_PUBLIC_APP_URL` with your actual deployment URL
5. Redeploy the application

### 2. Update Supabase Authentication Settings

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" → "URL Configuration"
3. Add your Vercel deployment URL to "Site URL"
4. Add the following to "Redirect URLs":
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app/dashboard`

### 3. Test Widget Embed Code

After deployment, the embed code will use your production URL:

```html
<!-- Load Daily.co SDK (required) -->
<script src="https://unpkg.com/@daily-co/daily-js"></script>

<!-- Load Vapi SDK -->
<script src="https://your-app.vercel.app/api/vapi-sdk"></script>

<!-- Configure and load widget -->
<script>
  window.voiceWidgetConfig = {
    widgetId: 'your-widget-id-here'
  };
</script>
<script src="https://your-app.vercel.app/widget.js"></script>
```

## Database Setup (CRITICAL!)

**⚠️ MUST BE COMPLETED BEFORE DEPLOYMENT**

Make sure you've run these SQL scripts in your Supabase SQL editor:

1. **Main schema** (`supabase-schema.sql`):
   - Creates widgets and analytics tables
   - Sets up RLS policies for authenticated users

2. **Public access** (`supabase-public-access.sql`):
   - Allows public read access to active widgets
   - Required for embed functionality

3. **🆕 Client Management Migration** (`dashboard/supabase/migrations/20250113_add_clients.sql`):
   - **This is REQUIRED for the multi-tenant features**
   - Creates `clients` table for organizing widgets by client
   - Adds `client_id` column to `widgets` table
   - Sets up RLS policies for client access

   **How to Run:**
   1. Go to your Supabase project dashboard
   2. Navigate to **SQL Editor**
   3. Open `dashboard/supabase/migrations/20250113_add_clients.sql`
   4. Copy and paste the entire SQL content
   5. Click "Run" to execute
   6. Verify success by checking:
      - `clients` table exists in Database → Tables
      - `widgets` table has `client_id` column
      - RLS policies show on `clients` table

## Troubleshooting

### Build Error: "No Next.js version detected"

If you get this error during Vercel deployment:
```
Error: No Next.js version detected. Make sure your package.json has "next" in either "dependencies" or "devDependencies".
```

**Solution:**
1. Go to your Vercel project **Settings** → **General**
2. Under "Build & Development Settings", set **Root Directory** to: `dashboard`
3. Framework Preset should be: **Next.js**
4. Go to **Deployments** and click **Redeploy**

**Why this happens:** The Next.js project is in the `dashboard` subdirectory, not in the root. Vercel needs to know where to find the `package.json` file.

### Widget not loading on external sites

- **Check CORS**: Ensure the API routes have proper CORS headers (already configured)
- **Check widget status**: Make sure `is_active = true` in the database
- **Check browser console**: Look for any JavaScript errors

### Authentication issues

- **Verify environment variables**: Double-check all Supabase credentials
- **Check Supabase redirect URLs**: Make sure they match your deployment URL
- **Clear browser cache**: Sometimes old cookies can cause issues

### Build failures

- **Check Node version**: Vercel uses Node 18+ by default
- **Verify dependencies**: Run `npm install` locally to check for issues
- **Check build logs**: Vercel provides detailed logs in the deployment dashboard

## Monitoring

After deployment, monitor:

1. **Vercel Analytics**: Track page views and performance
2. **Supabase Logs**: Monitor database queries and auth events
3. **Browser Console**: Check for client-side errors

## Custom Domain (Optional)

To use a custom domain:

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update `NEXT_PUBLIC_APP_URL` to your custom domain
6. Update Supabase redirect URLs to use custom domain

## Security Notes

- Never commit `.env.local` files
- Rotate API keys regularly
- Monitor Supabase usage for unusual activity
- Use Supabase RLS policies to protect sensitive data
- The anon key is safe to expose (it's public by design)

## New Features - Multi-Tenant Client Management

### Key Features Added
1. **Client Management**: Create and organize widgets by client
2. **Sidebar Navigation**: Clients appear in sidebar for quick access
3. **Safe Deletion**: Widget deletion requires typing the exact widget name
4. **Type-Specific Embed Code**: Inline widgets get container div automatically

### Client Management Workflow

**Creating a Client:**
1. Click "+ New Client" in sidebar or dashboard
2. Enter client name and description
3. Client appears in sidebar immediately

**Creating Widgets for Clients:**
1. Navigate to client page from sidebar
2. Click "+ Create Widget"
3. Widget is automatically assigned to that client
4. Or select client from dropdown when creating widget

**Widget Organization:**
- **Dashboard (`/dashboard`)**: Shows ALL widgets across all clients
- **Client Page (`/dashboard/clients/[id]`)**: Shows only that client's widgets
- Widgets show client name badge if assigned

### Safe Widget Deletion

To prevent accidental deletions:
1. Click "Delete" on any widget card
2. Modal appears with confirmation
3. **User must type the exact widget name** to enable delete
4. Only then can widget be deleted

This ensures users don't accidentally delete important widgets.

### Inline Widget Embed Code

Inline widgets now get proper embed instructions:
- Includes `<div id="voice-widget-container"></div>` in code
- Includes `targetContainer` in config
- Shows visual example of placement within page content
- Explains container can be customized

Floating and Page widgets continue to use simple body-tag placement.

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check Supabase logs
3. Review browser console errors
4. Verify all environment variables are set correctly
5. Ensure database migrations were run successfully

---

Built with ❤️ by **Romea AI**
