import { createClient as createBrowserClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { isDomainAllowed, getCorsHeaders } from '@/lib/utils/cors'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get origin from request headers
    const origin = request.headers.get('origin') || request.headers.get('referer')

    // Use public client to allow unauthenticated access
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: widget, error } = await supabase
      .from('widgets')
      .select('config, is_active, allowed_domains')
      .eq('id', id)
      .single()

    if (error || !widget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404 }
      )
    }

    if (!widget.is_active) {
      return NextResponse.json(
        { error: 'Widget is not active' },
        { status: 403 }
      )
    }

    // Check domain restrictions
    if (!isDomainAllowed(origin, widget.allowed_domains)) {
      return NextResponse.json(
        { error: 'Domain not authorized to use this widget' },
        {
          status: 403,
          headers: {
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      )
    }

    // Get appropriate CORS headers
    const corsHeaders = getCorsHeaders(origin, widget.allowed_domains)

    // Inject environment variable Vapi Public API Key if widget doesn't have one
    const config = { ...widget.config }
    if (!config.vapi?.publicApiKey && process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
      config.vapi = {
        ...config.vapi,
        publicApiKey: process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY,
      }
    }

    return NextResponse.json(config, {
      headers: corsHeaders,
    })
  } catch (error) {
    console.error('Error fetching widget config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: Request) {
  // Get origin for CORS preflight
  const origin = request.headers.get('origin')

  // For OPTIONS, we allow all origins to respond to preflight
  // The actual domain check happens in the GET request
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
