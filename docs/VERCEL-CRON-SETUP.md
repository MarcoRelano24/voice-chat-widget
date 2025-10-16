# Vercel Cron Job Setup Guide

This guide will help you deploy and verify the analytics cleanup cron job on Vercel.

## Overview

The cron job automatically runs every 30 minutes to complete abandoned call sessions for accurate billing. It finds `call_start` events without matching `call_end` events and creates inferred end events.

## What's Already Configured

✅ **vercel.json** - Contains cron job configuration
✅ **API Endpoint** - `/api/analytics/cleanup` with Vercel cron authentication
✅ **Schedule** - Runs every 30 minutes (`*/30 * * * *`)

## Deployment Steps

### 1. Push to GitHub (Already Done)
```bash
git push origin main
```

### 2. Vercel Will Auto-Deploy
- Vercel automatically detects the `vercel.json` file
- The cron job will be configured automatically
- No additional setup needed in Vercel dashboard

### 3. Verify Cron Job is Active

**Option A: Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Select your project: `voice-chat-widget`
3. Go to **Settings** → **Cron Jobs**
4. You should see:
   ```
   Path: /api/analytics/cleanup
   Schedule: */30 * * * *
   Status: Active
   ```

**Option B: Check Logs**
1. Go to **Deployments** → Select latest deployment
2. Click **Functions** tab
3. After 30 minutes, you'll see logs from `/api/analytics/cleanup`

## How Authentication Works

### Vercel Cron (Automatic)
Vercel automatically authenticates cron requests with a special header:
```
x-vercel-cron-id: <unique-id>
```
No additional configuration needed! ✅

### Manual Testing (Optional)
If you want to manually trigger the cleanup job, you can set up a secret:

**Step 1: Add Environment Variable in Vercel**
1. Go to **Settings** → **Environment Variables**
2. Add new variable:
   - **Name**: `CRON_SECRET`
   - **Value**: (generate a secure random string, e.g., `openssl rand -base64 32`)
   - **Environments**: Production, Preview, Development
3. Click **Save**
4. Redeploy your project

**Step 2: Test Manually**
```bash
curl -X POST https://voice.romea.ai/api/analytics/cleanup \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Expected response:
```json
{
  "success": true,
  "message": "Completed 0 incomplete session(s)",
  "completed": 0,
  "checked": 0
}
```

## Monitoring the Cron Job

### View Execution Logs
1. Go to Vercel Dashboard → Your Project
2. Click **Logs** tab
3. Filter by `/api/analytics/cleanup`
4. You'll see logs every 30 minutes

### Check Database
Query to see inferred end events:
```sql
SELECT
  widget_id,
  session_id,
  event_type,
  timestamp
FROM widget_analytics
WHERE event_type = 'call_end'
  AND page_url IS NULL
  AND user_agent IS NULL
ORDER BY timestamp DESC;
```

(Inferred events have NULL `page_url` and `user_agent`)

### Monitor Success Rate
```sql
-- Find sessions without end events (should be minimal after 30 min)
SELECT COUNT(*) as incomplete_sessions
FROM widget_analytics a1
WHERE a1.event_type = 'call_start'
  AND a1.timestamp < NOW() - INTERVAL '30 minutes'
  AND NOT EXISTS (
    SELECT 1 FROM widget_analytics a2
    WHERE a2.session_id = a1.session_id
      AND a2.event_type IN ('call_end', 'call_error')
  );
```

## Troubleshooting

### Cron Job Not Running

**Problem**: No logs appearing after deployment
**Solution**:
1. Verify `vercel.json` is in the root directory (not in `/dashboard`)
2. Check Vercel Settings → Cron Jobs shows the job as "Active"
3. Wait at least 30 minutes after deployment
4. Check project is on a paid Vercel plan (cron jobs may require Pro plan)

### Unauthorized Errors

**Problem**: Getting 401 errors in logs
**Solution**:
- Vercel cron jobs should work automatically (no auth needed)
- If you set `CRON_SECRET`, ensure it's deployed to all environments
- Check logs for the `x-vercel-cron-id` header presence

### No Sessions Being Completed

**Problem**: Cron runs but `completed: 0` always
**Solution**:
- This is normal if all calls are ending properly!
- Check if widgets are tracking `call_end` events correctly
- Test by creating a manual `call_start` event >30 min old

## Cron Schedule Reference

Current schedule: `*/30 * * * *` (every 30 minutes)

Other options:
- Every 15 minutes: `*/15 * * * *`
- Every hour: `0 * * * *`
- Every 6 hours: `0 */6 * * *`
- Daily at midnight: `0 0 * * *`

To change the schedule:
1. Edit `vercel.json`
2. Update the `schedule` value
3. Push to GitHub
4. Vercel will update automatically

## Testing Before Production

### Local Testing
```bash
# Start the development server
npm run dev

# In another terminal, test the cleanup endpoint
curl -X POST http://localhost:3000/api/analytics/cleanup
```

### Preview Deployment Testing
1. Push to a feature branch
2. Vercel creates a preview deployment
3. Test the cleanup endpoint on preview URL
4. Merge to main when verified

## Cost Considerations

**Vercel Cron Jobs**:
- Free tier: May have limitations
- Pro plan: Unlimited cron job executions
- Executions count toward function invocations

**Current Usage**:
- Runs every 30 minutes = 48 times/day
- Each run = 1 function invocation
- Total: ~1,440 invocations/month

This is minimal and well within most plans.

## Next Steps

1. ✅ Code is already pushed to GitHub
2. ⏳ Wait for Vercel to deploy (1-2 minutes)
3. ✅ Verify cron job appears in Vercel Settings
4. ⏳ Wait 30 minutes for first execution
5. ✅ Check logs to confirm it's working
6. 🎉 You're done!

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables are set correctly
3. Test the endpoint manually
4. Check the database for any errors in widget_analytics table
