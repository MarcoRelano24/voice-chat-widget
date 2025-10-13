# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Create a new project:
   - Name: `voice-widget-platform`
   - Database Password: (save this securely)
   - Region: Choose closest to you

## 2. Get API Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy these values to `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3. Run Database Schema

1. In Supabase, go to **SQL Editor**
2. Click "New query"
3. Paste the SQL from `supabase-schema.sql` (I'll create this next)
4. Click "Run"

## 4. Enable Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Optional: Enable Google, GitHub, etc.

## 5. Set up Row Level Security (RLS)

The SQL schema includes RLS policies. Make sure they're enabled:
1. Go to **Authentication** → **Policies**
2. Verify policies are active for `widgets` table

## Done!

Your database is now ready. Update `.env.local` with your credentials and restart the dev server.
