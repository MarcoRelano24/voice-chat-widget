import { createClient as createBrowserClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { isDomainAllowed, getCorsHeaders } from '@/lib/utils/cors'

interface TrackingPayload {
  widget_id: string
  event_type: 'widget_load' | 'widget_open' | 'call_start' | 'call_end' | 'call_error'
  session_id?: string
  page_url?: string
  user_agent?: string
}

export async function POST(request: Request) {
  try {
    // Get origin for CORS
    const origin = request.headers.get('origin') || request.headers.get('referer')

    // Parse request body
    const body: TrackingPayload = await request.json()

    // Validate required fields
    if (!body.widget_id || !body.event_type) {
      return NextResponse.json(
        { error: 'Missing required fields: widget_id and event_type' },
        { status: 400 }
      )
    }

    // Use public client to allow unauthenticated access
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Verify widget exists and is active (with domain check)
    const { data: widget, error: widgetError } = await supabase
      .from('widgets')
      .select('id, is_active, allowed_domains')
      .eq('id', body.widget_id)
      .single()

    if (widgetError || !widget) {
      // Silently fail for non-existent widgets (don't expose internal info)
      const corsHeaders = getCorsHeaders(origin, null)
      return NextResponse.json(
        { success: false },
        { status: 404, headers: corsHeaders }
      )
    }

    if (!widget.is_active) {
      const corsHeaders = getCorsHeaders(origin, widget.allowed_domains)
      return NextResponse.json(
        { success: false },
        { status: 403, headers: corsHeaders }
      )
    }

    // Check domain restrictions
    if (!isDomainAllowed(origin, widget.allowed_domains)) {
      const corsHeaders = getCorsHeaders(origin, widget.allowed_domains)
      return NextResponse.json(
        { success: false },
        { status: 403, headers: corsHeaders }
      )
    }

    // Insert analytics event
    const { error: insertError } = await supabase
      .from('widget_analytics')
      .insert({
        widget_id: body.widget_id,
        event_type: body.event_type,
        session_id: body.session_id || null,
        page_url: body.page_url || null,
        user_agent: body.user_agent || null,
      })

    if (insertError) {
      console.error('Error inserting analytics:', insertError)
      // Still return success to client (don't break widget)
      const corsHeaders = getCorsHeaders(origin, widget.allowed_domains)
      return NextResponse.json(
        { success: true },
        { headers: corsHeaders }
      )
    }

    // Success response
    const corsHeaders = getCorsHeaders(origin, widget.allowed_domains)
    return NextResponse.json(
      { success: true },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Error processing analytics:', error)

    // Always return success to prevent breaking widget functionality
    const origin = request.headers.get('origin') || request.headers.get('referer')
    const corsHeaders = getCorsHeaders(origin, null)
    return NextResponse.json(
      { success: true },
      { status: 200, headers: corsHeaders }
    )
  }
}

export async function OPTIONS(request: Request) {
  // Get origin for CORS preflight
  const origin = request.headers.get('origin')

  // Allow all origins for preflight
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
