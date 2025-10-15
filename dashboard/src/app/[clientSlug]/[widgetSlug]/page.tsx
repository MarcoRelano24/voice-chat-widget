'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Script from 'next/script'
import { createClient } from '@/lib/supabase/client'
import type { Widget, Client } from '@/lib/types/widget'

// Helper function to generate URL slug from client name
function generateClientSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

export default function WidgetLandingPage() {
  const params = useParams()
  const clientSlug = params.clientSlug as string
  const widgetSlug = params.widgetSlug as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [widget, setWidget] = useState<Widget | null>(null)
  const [client, setClient] = useState<Client | null>(null)

  useEffect(() => {
    async function fetchLandingPage() {
      try {
        // Fetch widget by landing_page_slug
        const { data: widgetData, error: widgetError } = await supabase
          .from('widgets')
          .select('*')
          .eq('landing_page_slug', widgetSlug)
          .eq('landing_page_enabled', true)
          .eq('is_active', true)
          .single()

        if (widgetError || !widgetData) {
          setError('Landing page not found')
          setLoading(false)
          return
        }

        setWidget(widgetData)

        // Fetch client
        if (widgetData.client_id) {
          const { data: clientData, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('id', widgetData.client_id)
            .single()

          if (clientError || !clientData) {
            setError('Client not found')
            setLoading(false)
            return
          }

          // Verify that the clientSlug matches the actual client
          const expectedSlug = generateClientSlug(clientData.name)
          if (expectedSlug !== clientSlug) {
            setError('Invalid landing page URL')
            setLoading(false)
            return
          }

          setClient(clientData)
        }
      } catch (err) {
        console.error('Error fetching landing page:', err)
        setError('Failed to load landing page')
      } finally {
        setLoading(false)
      }
    }

    fetchLandingPage()
  }, [clientSlug, widgetSlug, supabase])

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

  if (error || !widget) {
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
  const companyName = config.content?.companyName || client?.name || 'Voice Assistant'
  const defaultWelcomeMessage = config.content?.welcomeMessage || `Welcome to ${companyName}`
  const primaryColor = config.colors?.primary || '#667eea'
  const textColor = config.colors?.text || '#333333'

  // Landing page customization
  const pageTitle = widget.landing_page_title || defaultWelcomeMessage
  const pageDescription = widget.landing_page_description || client?.description || ''
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

      {/* Header (conditional) */}
      {showDefaultContent && (
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
      )}

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
        {/* Title and Description (conditional) */}
        {showDefaultContent && (
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: textColor }}>
              {pageTitle}
            </h2>
            {pageDescription && (
              <p className="text-lg text-gray-600 mb-8">{pageDescription}</p>
            )}
          </div>
        )}

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

      {/* Footer (conditional) */}
      {showDefaultContent && (
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
      )}

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
