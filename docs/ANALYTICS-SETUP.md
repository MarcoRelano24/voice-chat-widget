# Analytics Tracking Setup

## Overview
The analytics system tracks widget usage for billing and insights. It captures:
- Widget loads
- Widget opens (floating/page widgets)
- Call starts
- Call ends
- Call errors

## How It Works

### 1. Client-Side Tracking
The widget automatically sends events to `/api/analytics/track`:
- **Non-blocking**: Uses fire-and-forget fetch requests
- **Error-safe**: Wrapped in try-catch, never breaks widget functionality
- **Browser close handling**: Uses `sendBeacon` API for guaranteed delivery
- **Session tracking**: Each widget load gets a unique session ID

### 2. Server-Side Tracking
Events are stored in the `widget_analytics` table:
```sql
CREATE TABLE widget_analytics (
  id UUID PRIMARY KEY,
  widget_id UUID REFERENCES widgets(id),
  event_type VARCHAR(50), -- 'widget_load', 'call_start', 'call_end', etc.
  session_id VARCHAR(255), -- Groups events by user session
  page_url TEXT,          -- Where the widget was embedded
  user_agent TEXT,        -- Browser/device info
  timestamp TIMESTAMPTZ   -- When the event occurred
);
```

### 3. Session Completion (Cleanup Job)
Some call_end events may be missed (browser crashes, network issues, etc.).
The cleanup job ensures complete billing data.

## Setting Up the Cleanup Job

### Option 1: Vercel Cron Jobs (Recommended)
Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/analytics/cleanup",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

### Option 2: External Cron Service
Set up a cron job to call the endpoint every 30 minutes:

**With Authentication (Recommended):**
```bash
# Add to .env.local
CRON_SECRET=your-secret-key-here

# Cron command
*/30 * * * * curl -X POST \
  -H "Authorization: Bearer your-secret-key-here" \
  https://voice.romea.ai/api/analytics/cleanup
```

**Without Authentication (Internal Network Only):**
```bash
*/30 * * * * curl -X POST https://voice.romea.ai/api/analytics/cleanup
```

### Option 3: Manual Trigger
You can manually trigger the cleanup from your browser or admin dashboard:
```
GET https://voice.romea.ai/api/analytics/cleanup
```

## What the Cleanup Job Does

1. Finds all `call_start` events older than 30 minutes
2. Checks if each has a matching `call_end` or `call_error`
3. For incomplete sessions, creates an inferred `call_end` event
4. Estimates end time as `start_time + 30 minutes`

**Important:** No data is deleted. All original events are preserved.

## Billing Calculation

To calculate billable usage:
```sql
-- Get call duration for each session
SELECT
  widget_id,
  session_id,
  MIN(CASE WHEN event_type = 'call_start' THEN timestamp END) as start_time,
  MAX(CASE WHEN event_type = 'call_end' THEN timestamp END) as end_time,
  EXTRACT(EPOCH FROM (
    MAX(CASE WHEN event_type = 'call_end' THEN timestamp END) -
    MIN(CASE WHEN event_type = 'call_start' THEN timestamp END)
  )) as duration_seconds
FROM widget_analytics
WHERE event_type IN ('call_start', 'call_end')
GROUP BY widget_id, session_id;
```

## Testing

### Test Analytics Tracking
1. Embed a widget on a test page
2. Load the page → Should track `widget_load`
3. Open widget panel (floating/page) → Should track `widget_open`
4. Start a call → Should track `call_start`
5. End the call → Should track `call_end`

Check the database:
```sql
SELECT * FROM widget_analytics
WHERE widget_id = 'your-widget-id'
ORDER BY timestamp DESC;
```

### Test Browser Close Handling
1. Start a call
2. Close the browser tab immediately
3. Check database - should still have `call_end` event (via sendBeacon)

### Test Cleanup Job
1. Manually create a test `call_start` event dated 1 hour ago
2. Call `POST /api/analytics/cleanup`
3. Verify a `call_end` event was created for that session

## Security Notes

- Analytics endpoint allows unauthenticated access (for widgets on client sites)
- Domain restrictions are checked (widget must be active and domain allowed)
- Cleanup endpoint should be protected with `CRON_SECRET` in production
- All tracking errors are silently caught to prevent widget disruption

## Monitoring

Monitor these metrics:
- **Event delivery rate**: % of events successfully tracked
- **Session completion rate**: % of call_start with matching call_end
- **Cleanup job runs**: Check logs for how many sessions are being completed
- **API response times**: Ensure tracking doesn't slow down widgets

## Troubleshooting

**Widgets not tracking:**
- Check browser console for errors
- Verify widget is not a demo widget (demos don't track)
- Check CORS settings and domain restrictions

**High incomplete session rate:**
- Users may be closing browsers during calls (normal)
- Network issues preventing sendBeacon delivery
- Check cleanup job is running regularly

**Missing billing data:**
- Ensure cleanup job is running every 30 minutes
- Check for database errors in API logs
- Verify RLS policies allow inserts
