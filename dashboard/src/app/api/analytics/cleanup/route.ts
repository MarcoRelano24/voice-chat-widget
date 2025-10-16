import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Cleanup incomplete call sessions
 * This endpoint finds call_start events without matching call_end events
 * and creates inferred call_end events for billing accuracy
 *
 * Should be called periodically (e.g., every 30 minutes via cron)
 * Can also be called manually from admin dashboard
 */
export async function POST(request: Request) {
  try {
    // Authentication check for cron/admin access
    // Vercel cron jobs send a special header for authentication
    const isVercelCron = request.headers.get('x-vercel-cron-id')
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // Allow if request is from Vercel cron (automatic authentication)
    // OR if valid CRON_SECRET is provided (manual/admin access)
    const isAuthenticated = isVercelCron || (cronSecret && authHeader === `Bearer ${cronSecret}`)

    if (!isAuthenticated && cronSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Find call_start events without matching call_end
    // Look for calls older than 30 minutes without a call_end
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()

    // Get all call_start events older than 30 minutes
    const { data: startEvents, error: startError } = await supabase
      .from('widget_analytics')
      .select('widget_id, session_id, timestamp')
      .eq('event_type', 'call_start')
      .lt('timestamp', thirtyMinutesAgo)
      .order('timestamp', { ascending: false })

    if (startError) {
      console.error('Error fetching start events:', startError)
      return NextResponse.json(
        { error: 'Database error', details: startError.message },
        { status: 500 }
      )
    }

    if (!startEvents || startEvents.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No incomplete sessions found',
        completed: 0,
      })
    }

    // Check each start event for matching end event
    let completedCount = 0
    const incompleteEvents = []

    for (const startEvent of startEvents) {
      // Check if there's a call_end or call_error for this session
      const { data: endEvents, error: endError } = await supabase
        .from('widget_analytics')
        .select('id')
        .eq('session_id', startEvent.session_id)
        .in('event_type', ['call_end', 'call_error'])
        .limit(1)

      if (endError) {
        console.error('Error checking end events:', endError)
        continue
      }

      // If no end event found, this session is incomplete
      if (!endEvents || endEvents.length === 0) {
        incompleteEvents.push(startEvent)
      }
    }

    // Create inferred call_end events for incomplete sessions
    if (incompleteEvents.length > 0) {
      const inferredEndEvents = incompleteEvents.map((event) => {
        // Calculate estimated end time (start time + 30 minutes)
        const estimatedEndTime = new Date(
          new Date(event.timestamp).getTime() + 30 * 60 * 1000
        ).toISOString()

        return {
          widget_id: event.widget_id,
          session_id: event.session_id,
          event_type: 'call_end',
          page_url: null,
          user_agent: null,
          timestamp: estimatedEndTime,
        }
      })

      const { error: insertError } = await supabase
        .from('widget_analytics')
        .insert(inferredEndEvents)

      if (insertError) {
        console.error('Error inserting inferred end events:', insertError)
        return NextResponse.json(
          {
            error: 'Failed to complete sessions',
            details: insertError.message,
            found: incompleteEvents.length,
          },
          { status: 500 }
        )
      }

      completedCount = incompleteEvents.length
    }

    return NextResponse.json({
      success: true,
      message: `Completed ${completedCount} incomplete session(s)`,
      completed: completedCount,
      checked: startEvents.length,
    })
  } catch (error) {
    console.error('Error in cleanup job:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Allow GET requests for manual triggering from browser
export async function GET(request: Request) {
  return POST(request)
}
