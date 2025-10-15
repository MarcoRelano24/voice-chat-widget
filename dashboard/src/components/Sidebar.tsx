'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Client {
  id: string
  name: string
}

interface SidebarProps {
  userEmail: string
}

export default function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname()
  const supabase = createClient()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .order('name', { ascending: true })

      if (!error && data) {
        setClients(data)
      }
    } catch (err) {
      console.error('Error fetching clients:', err)
    } finally {
      setLoading(false)
    }
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(path)
  }

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700 px-4">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white text-center leading-tight">
            Voice Chat Widget<br />Management
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {/* Main Links */}
          <div className="space-y-2">
            <Link
              href="/dashboard"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive('/dashboard') && !pathname.includes('/clients')
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-xl mr-3">📊</span>
              <span className="font-medium">All Widgets</span>
            </Link>
            <Link
              href="/dashboard/analytics"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive('/dashboard/analytics')
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-xl mr-3">📈</span>
              <span className="font-medium">Analytics</span>
            </Link>
          </div>

          {/* Clients Section */}
          <div>
            <div className="flex items-center justify-between px-4 mb-3">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Clients
              </h3>
              <Link
                href="/dashboard/clients/new"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xl"
                title="Add new client"
              >
                +
              </Link>
            </div>
            <div className="space-y-1">
              {loading ? (
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">Loading...</div>
              ) : clients.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No clients yet
                </div>
              ) : (
                clients.map((client) => (
                  <Link
                    key={client.id}
                    href={`/dashboard/clients/${client.id}`}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      pathname === `/dashboard/clients/${client.id}`
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-base mr-3">👤</span>
                    <span className="text-sm font-medium truncate">{client.name}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">
                  {userEmail?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{userEmail}</p>
              </div>
            </div>
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-sm ml-2"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
