'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Script from 'next/script'
import { createClient } from '@/lib/supabase/client'
import type { Widget, Client } from '@/lib/types/widget'

// Helper function to generate URL slug from client name and widget type
function generateSlug(name: string, widgetType?: string): string {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')

  return widgetType ? `${baseSlug}-${widgetType}` : baseSlug
}

// Helper function to parse slug and extract client name pattern and widget type
function parseSlug(slug: string): { widgetType: 'floating' | 'inline' | 'page' | null, clientSlugPattern: string } {
  const validTypes = ['floating', 'inline', 'page']
  const parts = slug.split('-')

  // Check if last part is a valid widget type
  const lastPart = parts[parts.length - 1]
  if (validTypes.includes(lastPart)) {
    return {
      widgetType: lastPart as 'floating' | 'inline' | 'page',
      clientSlugPattern: parts.slice(0, -1).join('-')
    }
  }

  // No widget type found in slug
  return {
    widgetType: null,
    clientSlugPattern: slug
  }
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
        // Parse the slug to extract widget type and client slug pattern
        const { widgetType, clientSlugPattern } = parseSlug(clientSlug)

        if (!widgetType) {
          setError('Invalid landing page URL - widget type not specified')
          setLoading(false)
          return
        }

        // Fetch all clients and find one with matching slug
        const { data: clients, error: clientsError } = await supabase
          .from('clients')
          .select('*')

        if (clientsError) throw clientsError

        // Find client with matching slug (without widget type)
        const matchingClient = clients?.find(c => generateSlug(c.name) === clientSlugPattern)

        if (!matchingClient) {
          setError('Landing page not found')
          setLoading(false)
          return
        }

        setClient(matchingClient)

        // Fetch widget for this client with landing page enabled AND matching type
        const { data: widgets, error: widgetsError } = await supabase
          .from('widgets')
          .select('*')
          .eq('client_id', matchingClient.id)
          .eq('type', widgetType)
          .eq('landing_page_enabled', true)
          .eq('is_active', true)
          .limit(1)
          .single()

        if (widgetsError || !widgets) {
          setError(`No active ${widgetType} landing page found for this client`)
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
  const defaultWelcomeMessage = config.content?.welcomeMessage || `Welcome to ${companyName}`
  const primaryColor = config.colors?.primary || '#667eea'
  const textColor = config.colors?.text || '#333333'

  // Landing page customization
  const pageTitle = widget.landing_page_title || defaultWelcomeMessage
  const pageDescription = widget.landing_page_description || client.description || ''
  const pageBackgroundColor = widget.landing_page_background_color || '#ffffff'
  const headerImage = widget.landing_page_header_image
  const showDefaultContent = widget.landing_page_show_default_content !== false
  const customHTML = widget.landing_page_custom_html
  const customCSS = widget.landing_page_custom_css
  const customJS = widget.landing_page_custom_js

  return (
    <div className="min-h-screen" style={{ backgroundColor: pageBackgroundColor }}>
      {/* Custom CSS */}
      {customCSS && (
        <style dangerouslySetInnerHTML={{ __html: customCSS }} />
      )}

      {/* Header */}
      <header className="border-b" style={{ backgroundColor: pageBackgroundColor, borderColor: `${primaryColor}20` }}>
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

      {/* Header Image */}
      {headerImage && (
        <div className="w-full" style={{ maxHeight: '400px', overflow: 'hidden' }}>
          <img
            src={headerImage}
            alt="Header"
            className="w-full h-full object-cover"
            style={{ maxHeight: '400px' }}
          />
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4" style={{ color: textColor }}>
            {pageTitle}
          </h2>
          {pageDescription && (
            <p className="text-lg text-gray-600 mb-8">{pageDescription}</p>
          )}
        </div>

        {/* Custom HTML Content */}
        {customHTML && (
          <div
            className="mb-12"
            dangerouslySetInnerHTML={{ __html: customHTML }}
          />
        )}

        {/* Widget Container */}
        <div className="flex justify-center">
          <div id="voice-widget-container"></div>
        </div>

        {/* Default Instructions (conditional) */}
        {showDefaultContent && (
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
        )}
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

      {/* Custom JavaScript */}
      {customJS && (
        <Script
          id="custom-landing-page-js"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: customJS }}
        />
      )}
    </div>
  )
}
