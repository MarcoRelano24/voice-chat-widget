'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme | null
      console.log('ThemeProvider initializing with theme:', savedTheme || 'system')
      return savedTheme || 'system'
    }
    return 'system'
  })
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    console.log('ThemeProvider mounted')
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement

    const applyTheme = () => {
      console.log('Applying theme:', theme)
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          root.classList.add('dark')
          setResolvedTheme('dark')
          console.log('Applied: dark (system preference)')
        } else {
          root.classList.remove('dark')
          setResolvedTheme('light')
          console.log('Applied: light (system preference)')
        }
      } else if (theme === 'dark') {
        root.classList.add('dark')
        setResolvedTheme('dark')
        console.log('Applied: dark')
      } else {
        root.classList.remove('dark')
        setResolvedTheme('light')
        console.log('Applied: light')
      }

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', theme)
      }
    }

    applyTheme()

    // Listen for system theme changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme()
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [theme, mounted])

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    // Return safe defaults instead of throwing
    console.warn('useTheme: ThemeProvider not found in context tree!')
    return {
      theme: 'system' as Theme,
      setTheme: (newTheme: Theme) => {
        console.warn('setTheme called but ThemeProvider not found. Attempted to set:', newTheme)
      },
      resolvedTheme: 'light' as 'light' | 'dark'
    }
  }
  console.log('useTheme: Context found, current theme:', context.theme)
  return context
}
