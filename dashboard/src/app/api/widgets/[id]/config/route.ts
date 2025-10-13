import { createClient as createBrowserClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Use public client to allow unauthenticated access
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: widget, error } = await supabase
      .from('widgets')
      .select('config, is_active')
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

    return NextResponse.json(widget.config, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('Error fetching widget config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
