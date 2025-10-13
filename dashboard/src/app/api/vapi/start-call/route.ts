import { NextResponse } from 'next/server'
import Vapi from '@vapi-ai/web'

export async function POST(request: Request) {
  try {
    const { assistantId, publicKey } = await request.json()

    console.log('Starting call with assistantId:', assistantId)

    // Use Vapi SDK to start the call
    const vapi = new Vapi(publicKey)

    // Start returns a promise that resolves when connected
    await vapi.start(assistantId)

    // Get the call info
    const callInfo = {
      success: true,
      message: 'Call started successfully'
    }

    return NextResponse.json(callInfo, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error: unknown) {
    console.error('Error starting call:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to start call', message: errorMessage },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
