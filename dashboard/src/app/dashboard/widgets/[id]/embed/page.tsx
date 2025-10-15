'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Widget {
  id: string
  name: string
  type: string
  is_active: boolean
  config: {
    colors?: {
      primary?: string
    }
  }
}

export default function EmbedCodePage() {
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  const [widget, setWidget] = useState<Widget | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    async function fetchWidget() {
      const { data, error } = await supabase
        .from('widgets')
        .select('*')
        .eq('id', id)
        .single()

      if (!error && data) {
        setWidget(data as Widget)
      }
      setLoading(false)
    }

    fetchWidget()
  }, [id, supabase])

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!widget) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 dark:text-red-400">Widget not found</div>
      </div>
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Simple one-line embed code for floating and page widgets
  const baseEmbedCode = `<!-- Voice Widget by RomeaAI -->
<script src="${appUrl}/widget-loader.js?id=${widget.id}"></script>`

  // Inline widget embed code (needs container div)
  const inlineEmbedCode = `<!-- Voice Widget Container - Place this where you want the widget to appear -->
<div id="voice-widget-container"></div>

<!-- Voice Widget by RomeaAI -->
<script src="${appUrl}/widget-loader.js?id=${widget.id}&target=voice-widget-container"></script>`

  // Choose embed code based on widget type
  const embedCode = widget.type === 'inline' ? inlineEmbedCode : baseEmbedCode

  const reactCode = widget.type === 'inline'
    ? `import { useEffect } from 'react';

export default function MyComponent() {
  useEffect(() => {
    // Load voice widget
    const script = document.createElement('script');
    script.src = '${appUrl}/widget-loader.js?id=${widget.id}&target=voice-widget-container';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div>
      <h1>Welcome to My Website</h1>
      <p>Some content here...</p>

      {/* Widget will render here */}
      <div id="voice-widget-container"></div>

      <p>More content below...</p>
    </div>
  );
}`
    : `import { useEffect } from 'react';

export default function MyComponent() {
  useEffect(() => {
    // Load voice widget
    const script = document.createElement('script');
    script.src = '${appUrl}/widget-loader.js?id=${widget.id}';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div>Your content here</div>;
}`

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium mb-4 inline-block"
        >
          ← Back to Widgets
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">Add Widget to Your Website</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{widget.name}</p>
      </div>

      {/* Widget Status Warning */}
      {!widget.is_active && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="text-3xl">⚠️</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Widget is Inactive</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                This widget is currently inactive and will not appear on your website. Make sure to activate it in the{' '}
                <Link href={`/dashboard/widgets/${widget.id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                  widget settings
                </Link>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Start Guide */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
        <div className="flex items-start space-x-4">
          <div className="text-3xl">🚀</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Start - 3 Simple Steps</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Copy the code below</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Click the "Copy Code" button</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Open your website HTML file</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {widget.type === 'inline'
                      ? 'Find where you want the widget button to appear'
                      : `Find the closing `}
                    {widget.type !== 'inline' && <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">&lt;/body&gt;</code>}
                    {widget.type !== 'inline' && ' tag'}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {widget.type === 'inline'
                      ? 'Paste the code where you want the button'
                      : 'Paste the code just before it'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Save your file and refresh your website - done!</p>
                </div>
              </div>
            </div>

            {/* Visual Example */}
            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Example placement in your HTML:</p>
              {widget.type === 'inline' ? (
                <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`<!DOCTYPE html>
<html>
  <head>
    <title>My Website</title>
  </head>
  <body>

    <h1>Welcome to My Website</h1>
    <p>Some content here...</p>

    <!-- Paste the widget code here ↓ -->
    <div id="voice-widget-container"></div>
    <script src="${appUrl}/widget-loader.js?id=${widget.id}&target=voice-widget-container"></script>

    <p>More content below...</p>

  </body>
</html>`}
                </pre>
              ) : (
                <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`<!DOCTYPE html>
<html>
  <head>
    <title>My Website</title>
  </head>
  <body>

    <!-- Your website content here -->

    <!-- Paste the widget code here ↓ -->
    <script src="${appUrl}/widget-loader.js?id=${widget.id}"></script>

  </body>
</html>`}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* HTML Embed Code */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Widget Code</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Copy and paste this into your website</p>
          </div>
          <button
            onClick={() => copyToClipboard(embedCode, 'html')}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            {copied === 'html' ? '✓ Copied!' : 'Copy Code'}
          </button>
        </div>
        <div className="p-6">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm leading-relaxed">
            <code>{embedCode}</code>
          </pre>
          {widget.type === 'inline' ? (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-gray-700 dark:text-gray-300 font-medium mb-1">💡 Tip: Customize the container ID</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                You can change <code className="bg-white dark:bg-gray-800 px-1 rounded">voice-widget-container</code> to any ID you like. Just make sure the ID in the <code className="bg-white dark:bg-gray-800 px-1 rounded">&lt;div&gt;</code> matches the <code className="bg-white dark:bg-gray-800 px-1 rounded">target</code> parameter in the script URL!
              </p>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-xs text-gray-700 dark:text-gray-300 font-medium mb-1">✨ Simple one-line embed</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Just one script tag - no external dependencies! Works with any HTML website, WordPress, Wix, Squarespace, Webflow, and more.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Section - Collapsible */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <span className="text-lg">⚙️</span>
            <div className="text-left">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced: React/Next.js Integration</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">For developers using React or Next.js</p>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showAdvanced && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Use this code in your React or Next.js component</p>
              <button
                onClick={() => copyToClipboard(reactCode, 'react')}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {copied === 'react' ? '✓ Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{reactCode}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Widget Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Widget Details</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Widget ID</p>
              <p className="text-sm text-gray-900 dark:text-gray-100 font-mono break-all">{widget.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</p>
              <p className="text-sm text-gray-900 dark:text-gray-100 capitalize">{widget.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                  widget.is_active
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {widget.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Primary Color</p>
              <div className="flex items-center space-x-2">
                <div
                  className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: widget.config.colors?.primary || '#667eea' }}
                />
                <p className="text-sm text-gray-900 dark:text-gray-100">{widget.config.colors?.primary || '#667eea'}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href={`/dashboard/widgets/${widget.id}`}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
            >
              Edit Widget Settings →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
