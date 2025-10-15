'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Client {
  id: string
  name: string
}

export default function NewWidgetPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(true)

  const clientIdFromUrl = searchParams.get('client')

  const [formData, setFormData] = useState({
    name: '',
    type: 'floating' as 'floating' | 'inline' | 'page',
    clientId: clientIdFromUrl || '',
    vapiPublicKey: '',
    vapiAssistantId: '',
    companyName: '',
    primaryColor: '#667eea',
    welcomeMessage: 'How can we help you today?',
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('id, name')
        .order('name', { ascending: true })

      if (!fetchError && data) {
        setClients(data)
      }
    } catch (err) {
      console.error('Error fetching clients:', err)
    } finally {
      setLoadingClients(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Not authenticated')
      }

      const widgetConfig = {
        type: formData.type,
        display: {
          position: 'bottom-right',
          offsetX: 20,
          offsetY: 20,
          zIndex: 9999,
        },
        dimensions: {
          buttonSize: 60,
          panelWidth: 380,
          panelHeight: 600,
        },
        colors: {
          primary: formData.primaryColor,
          background: '#ffffff',
          text: '#333333',
        },
        content: {
          companyName: formData.companyName,
          welcomeMessage: formData.welcomeMessage,
        },
        vapi: {
          publicApiKey: formData.vapiPublicKey || undefined, // Use env variable if not provided
          assistantId: formData.vapiAssistantId,
        },
      }

      const widgetData: any = {
        user_id: user.id,
        name: formData.name,
        type: formData.type,
        config: widgetConfig,
        is_active: true,
      }

      // Add client_id if selected
      if (formData.clientId) {
        widgetData.client_id = formData.clientId
      }

      const { error: insertError } = await supabase
        .from('widgets')
        .insert(widgetData)
        .select()
        .single()

      if (insertError) throw insertError

      // Redirect to client page if widget was created for a specific client
      if (formData.clientId) {
        router.push(`/dashboard/clients/${formData.clientId}`)
      } else {
        router.push('/dashboard')
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create widget'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Widget</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Set up your voice chat widget</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Widget Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Widget Name *
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="e.g., Support Widget"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This is for your reference only</p>
        </div>

        {/* Client Selection */}
        <div>
          <label htmlFor="client" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Client (Optional)
          </label>
          {loadingClients ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">Loading clients...</div>
          ) : (
            <select
              id="client"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">None - General Widget</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Assign this widget to a specific client for better organization
          </p>
        </div>

        {/* Widget Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Widget Type *
          </label>
          <div className="grid grid-cols-3 gap-4">
            {(['floating', 'inline', 'page'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, type })}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  formData.type === type
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-white'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-900 dark:text-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">
                  {type === 'floating' && '💬'}
                  {type === 'inline' && '📄'}
                  {type === 'page' && '🖥️'}
                </div>
                <div className="font-medium capitalize">{type}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Vapi Configuration */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vapi Configuration</h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="vapiPublicKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vapi Public API Key (Optional)
              </label>
              <input
                id="vapiPublicKey"
                type="text"
                value={formData.vapiPublicKey}
                onChange={(e) => setFormData({ ...formData, vapiPublicKey: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                placeholder="pk_... (leave empty to use environment variable)"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                If left empty, the widget will use the NEXT_PUBLIC_VAPI_PUBLIC_KEY from your environment variables.
              </p>
            </div>

            <div>
              <label htmlFor="vapiAssistantId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vapi Assistant ID *
              </label>
              <input
                id="vapiAssistantId"
                type="text"
                required
                value={formData.vapiAssistantId}
                onChange={(e) => setFormData({ ...formData, vapiAssistantId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                placeholder="asst_..."
              />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Name
              </label>
              <input
                id="companyName"
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Your Company"
              />
            </div>

            <div>
              <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  id="primaryColor"
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="h-10 w-20 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Welcome Message
              </label>
              <textarea
                id="welcomeMessage"
                rows={3}
                value={formData.welcomeMessage}
                onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="How can we help you today?"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Widget'}
          </button>
        </div>
      </form>
    </div>
  )
}
