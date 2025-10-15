'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Script from 'next/script'
import { createClient } from '@/lib/supabase/client'
import type { Widget, Client } from '@/lib/types/widget'

// Helper function to generate URL slug from client name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

export default function ClientLandingPage() {
  const params = useParams()
  const clientSlug = params.clientSlug as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [widget, setWidget] = useState<Widget | null>(null)
  const [client, setClient] = useState<Client | null>(null)

  useEffect(() => {
    async function fetchLandingPage() {
      try {
        // Fetch all clients and find one with matching slug
        const { data: clients, error: clientsError } = await supabase
          .from('clients')
          .select('*')

        if (clientsError) throw clientsError

        // Find client with matching slug
        const matchingClient = clients?.find(c => generateSlug(c.name) === clientSlug)

        if (!matchingClient) {
          setError('Landing page not found')
          setLoading(false)
          return
        }

        setClient(matchingClient)

        // Fetch widget for this client with landing page enabled
        const { data: widgets, error: widgetsError } = await supabase
          .from('widgets')
          .select('*')
          .eq('client_id', matchingClient.id)
          .eq('landing_page_enabled', true)
          .eq('is_active', true)
          .limit(1)
          .single()

        if (widgetsError || !widgets) {
          setError('No active landing page found for this client')
          setLoading(false)
          return
        }

        setWidget(widgets)
      } catch (err) {
        console.error('Error fetching landing page:', err)
        setError('Failed to load landing page')
      } finally {
        setLoading(false)
      }
    }

    fetchLandingPage()
  }, [clientSlug, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !widget || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md px-6">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The page you are looking for does not exist.'}</p>
          <a
            href="https://www.romea.ai"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Visit Romea AI
          </a>
        </div>
      </div>
    )
  }

  const config = widget.config
  const companyName = config.content?.companyName || client.name
  const welcomeMessage = config.content?.welcomeMessage || `Welcome to ${companyName}`
  const primaryColor = config.colors?.primary || '#667eea'
  const backgroundColor = config.colors?.background || '#ffffff'
  const textColor = config.colors?.text || '#333333'

  return (
    <div className="min-h-screen" style={{ backgroundColor }}>
      {/* Header */}
      <header className="border-b" style={{ backgroundColor, borderColor: `${primaryColor}20` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {config.content?.logoUrl && (
                <img
                  src={config.content.logoUrl}
                  alt={companyName}
                  className="h-12 w-auto object-contain"
                />
              )}
              <h1 className="text-2xl font-bold" style={{ color: primaryColor }}>
                {companyName}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4" style={{ color: textColor }}>
            {welcomeMessage}
          </h2>
          {client.description && (
            <p className="text-lg text-gray-600 mb-8">{client.description}</p>
          )}
        </div>

        {/* Widget Container */}
        <div className="flex justify-center">
          <div id="voice-widget-container"></div>
        </div>

        {/* Instructions */}
        <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold mb-3" style={{ color: textColor }}>
            How to use:
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Click the button below to start a voice conversation</li>
            <li>Allow microphone access when prompted</li>
            <li>Speak naturally - our AI assistant will help you</li>
            <li>Click &quot;End Call&quot; when you&apos;re done</li>
          </ol>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20" style={{ borderColor: `${primaryColor}20` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Powered by{' '}
            <a
              href="https://www.romea.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
              style={{ color: primaryColor }}
            >
              Romea AI
            </a>
          </p>
        </div>
      </footer>

      {/* Load Widget Script */}
      <Script
        src={`https://voice.romea.ai/widget-loader.js?id=${widget.id}&target=voice-widget-container`}
        strategy="afterInteractive"
      />
    </div>
  )
}
