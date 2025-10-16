'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from './ThemeProvider'

type Theme = 'light' | 'dark' | 'system'

interface Client {
  id: string
  name: string
}

interface SidebarProps {
  userEmail: string
}

export default function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [logoutSuccess, setLogoutSuccess] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setLogoutSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 1000)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const toggleTheme = () => {
    console.log('Current theme:', theme)
    let newTheme: Theme
    if (theme === 'light') {
      newTheme = 'dark'
    } else if (theme === 'dark') {
      newTheme = 'system'
    } else {
      newTheme = 'light'
    }
    console.log('Setting theme to:', newTheme)
    setTheme(newTheme)
  }

  const getThemeIcon = () => {
    if (theme === 'system') {
      return '💻'
    }
    return resolvedTheme === 'dark' ? '🌙' : '☀️'
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          {mobileMenuOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out z-40 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center justify-center h-20 px-4 py-2">
            <h1 className="text-base font-bold text-gray-900 dark:text-white text-center leading-tight">
              Voice Chat Widget<br />Management
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">by Romea AI</p>
          </div>

          {/* Theme Toggle */}
          <div className="px-4 pb-3">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
              title={`Current theme: ${theme}`}
            >
              <span className="text-gray-700 dark:text-gray-300 font-medium">Theme</span>
              <span className="text-lg">{getThemeIcon()}</span>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {/* Main Links */}
          <div className="space-y-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive('/dashboard') && !pathname.includes('/clients')
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-xl mr-3">📊</span>
              <span className="font-medium">All Widgets</span>
            </Link>
            <Link
              href="/dashboard/analytics"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive('/dashboard/analytics')
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-400'
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
                onClick={() => setMobileMenuOpen(false)}
                className="text-indigo-600 dark:text-indigo-400 hover:text-purple-600 dark:hover:text-purple-400 text-xl"
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
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      pathname === `/dashboard/clients/${client.id}`
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-400'
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
          {logoutSuccess && (
            <div className="mb-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-3 py-2 rounded-lg text-xs">
              Logged out successfully! Redirecting...
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">
                  {userEmail?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{userEmail}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={logoutSuccess}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-sm ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
