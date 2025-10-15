'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  description: string
  created_at: string
}

interface Widget {
  id: string
  name: string
  type: string
  is_active: boolean
  config: any
  created_at: string
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string
  const supabase = createClient()

  const [client, setClient] = useState<Client | null>(null)
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [widgetToDelete, setWidgetToDelete] = useState<Widget | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchClientData()
  }, [clientId])

  const fetchClientData = async () => {
    try {
      // Fetch client details
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()

      if (clientError) throw clientError
      setClient(clientData)

      // Fetch widgets for this client
      const { data: widgetsData, error: widgetsError } = await supabase
        .from('widgets')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (widgetsError) throw widgetsError
      setWidgets(widgetsData || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openDeleteModal = (widget: Widget) => {
    setWidgetToDelete(widget)
    setDeleteConfirmText('')
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setDeleteModalOpen(false)
    setWidgetToDelete(null)
    setDeleteConfirmText('')
  }

  const handleDelete = async () => {
    if (!widgetToDelete || deleteConfirmText !== widgetToDelete.name) {
      return
    }

    setDeleting(true)

    try {
      const { error: deleteError } = await supabase
        .from('widgets')
        .delete()
        .eq('id', widgetToDelete.id)

      if (deleteError) throw deleteError

      // Remove from local state
      setWidgets(widgets.filter(w => w.id !== widgetToDelete.id))
      closeDeleteModal()
    } catch (err: any) {
      alert(`Failed to delete widget: ${err.message}`)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="max-w-2xl">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error || 'Client not found'}
        </div>
        <Link
          href="/dashboard"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium mt-4 inline-block"
        >
          ← Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium mb-4 inline-block"
        >
          ← Back to Dashboard
        </Link>
        <div className="flex items-start justify-between mt-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
            {client.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">{client.description}</p>
            )}
          </div>
          <Link
            href={`/dashboard/widgets/new?client=${clientId}`}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            + Create Widget
          </Link>
        </div>
      </div>

      {widgets.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No widgets yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first voice chat widget for this client</p>
          <Link
            href={`/dashboard/widgets/new?client=${clientId}`}
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Create Your First Widget
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{widget.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">{widget.type} widget</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    widget.is_active
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {widget.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: widget.config.colors?.primary || '#667eea' }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {widget.config.content?.companyName || 'No name'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href={`/dashboard/widgets/${widget.id}`}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                >
                  Edit →
                </Link>
                <div className="flex items-center space-x-3">
                  <Link
                    href={`/dashboard/widgets/${widget.id}/embed`}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium"
                  >
                    Get Code
                  </Link>
                  <button
                    onClick={() => openDeleteModal(widget)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && widgetToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Delete Widget</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to delete <strong className="dark:text-gray-200">{widgetToDelete.name}</strong>? This action cannot be undone.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type the widget name to confirm: <strong className="dark:text-gray-200">{widgetToDelete.name}</strong>
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={widgetToDelete.name}
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting || deleteConfirmText !== widgetToDelete.name}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  {deleting ? 'Deleting...' : 'Delete Widget'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
