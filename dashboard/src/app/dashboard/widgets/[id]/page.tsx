'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateRandomSlug, sanitizeSlug } from '@/lib/utils/slug'
import type { Client } from '@/lib/types/widget'
import Link from 'next/link'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PaintBrushIcon,
  DocumentTextIcon,
  CogIcon,
  SparklesIcon,
  EyeIcon,
  Squares2X2Icon,
  SwatchIcon
} from '@heroicons/react/24/outline'

// Helper functions for preview styles
function getShadowStyles(intensity: 'none' | 'light' | 'medium' | 'heavy') {
  const shadows = {
    none: 'none',
    light: '0 2px 8px rgba(0,0,0,0.1)',
    medium: '0 4px 12px rgba(0,0,0,0.15)',
    heavy: '0 8px 24px rgba(0,0,0,0.25)'
  }
  return `.preview-shadow { box-shadow: ${shadows[intensity]}; }`
}

function getAnimationStyles(speed: 'slow' | 'normal' | 'fast') {
  const duration = speed === 'fast' ? '0.15s' : speed === 'slow' ? '0.4s' : '0.25s'
  return `.preview-transition { transition: all ${duration} ease; }`
}

// Advanced Color Picker Component
interface ColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
  description?: string
}

const COLOR_PRESETS = [
  { name: 'Blue', color: '#667eea' },
  { name: 'Purple', color: '#9333ea' },
  { name: 'Pink', color: '#ec4899' },
  { name: 'Red', color: '#ef4444' },
  { name: 'Orange', color: '#f97316' },
  { name: 'Yellow', color: '#eab308' },
  { name: 'Green', color: '#22c55e' },
  { name: 'Teal', color: '#14b8a6' },
  { name: 'Cyan', color: '#06b6d4' },
  { name: 'Indigo', color: '#6366f1' },
  { name: 'Gray', color: '#6b7280' },
  { name: 'Black', color: '#000000' },
]

function ColorPicker({ label, value, onChange, description }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [recentColors, setRecentColors] = useState<string[]>([])
  const [hexInput, setHexInput] = useState(value)
  const [hue, setHue] = useState(0)
  const [saturation, setSaturation] = useState(100)
  const [lightness, setLightness] = useState(50)

  // Convert hex to HSL
  const hexToHSL = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
  }

  // Convert HSL to hex
  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100
    const a = s * Math.min(l, 1 - l) / 100
    const f = (n: number) => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color).toString(16).padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }

  useEffect(() => {
    setHexInput(value)
    const hsl = hexToHSL(value)
    setHue(hsl.h)
    setSaturation(hsl.s)
    setLightness(hsl.l)
  }, [value])

  const handleColorChange = (newColor: string) => {
    onChange(newColor)
    setHexInput(newColor)

    // Add to recent colors
    setRecentColors(prev => {
      const updated = [newColor, ...prev.filter(c => c !== newColor)]
      return updated.slice(0, 8)
    })
  }

  const handleHSLChange = (newH: number, newS: number, newL: number) => {
    setHue(newH)
    setSaturation(newS)
    setLightness(newL)
    const hex = hslToHex(newH, newS, newL)
    handleColorChange(hex)
  }

  const handleHexInput = (input: string) => {
    setHexInput(input)
    if (/^#[0-9A-Fa-f]{6}$/.test(input)) {
      onChange(input)
    }
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="relative w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors shadow-sm"
          style={{ backgroundColor: value }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5" />
        </button>

        <div className="flex-1">
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm uppercase"
            placeholder="#667eea"
            maxLength={7}
          />
        </div>
      </div>

      {description && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{description}</p>
      )}

      {showPicker && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setShowPicker(false)}
          />
          <div className="absolute z-[110] mt-2 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 dark:border-gray-700 w-80 max-h-[500px] overflow-y-auto left-0">
            {/* Color Spectrum Picker */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Color Picker</span>
              </div>

              {/* Saturation/Lightness Square */}
              <div className="relative w-full h-40 rounded-lg mb-3 cursor-crosshair overflow-hidden"
                style={{
                  background: `linear-gradient(to bottom,
                    hsl(${hue}, 100%, 100%) 0%,
                    hsl(${hue}, 100%, 50%) 50%,
                    hsl(${hue}, 100%, 0%) 100%)`
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = e.clientX - rect.left
                  const y = e.clientY - rect.top
                  const newS = Math.round((x / rect.width) * 100)
                  const newL = Math.round(100 - (y / rect.height) * 100)
                  handleHSLChange(hue, newS, newL)
                }}
              >
                <div
                  className="absolute w-full h-full"
                  style={{
                    background: 'linear-gradient(to right, #fff 0%, transparent 100%)'
                  }}
                />
                <div
                  className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${saturation}%`,
                    top: `${100 - lightness}%`,
                    backgroundColor: value
                  }}
                />
              </div>

              {/* Hue Slider */}
              <div className="mb-3">
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Hue</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={hue}
                  onChange={(e) => handleHSLChange(parseInt(e.target.value), saturation, lightness)}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                  }}
                />
              </div>

              {/* RGB Sliders */}
              <div className="space-y-2 mb-3">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block flex justify-between">
                    <span>Saturation</span>
                    <span>{saturation}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={saturation}
                    onChange={(e) => handleHSLChange(hue, parseInt(e.target.value), lightness)}
                    className="w-full h-2 rounded appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, hsl(${hue}, 0%, ${lightness}%), hsl(${hue}, 100%, ${lightness}%))`
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block flex justify-between">
                    <span>Lightness</span>
                    <span>{lightness}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={lightness}
                    onChange={(e) => handleHSLChange(hue, saturation, parseInt(e.target.value))}
                    className="w-full h-2 rounded appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, hsl(${hue}, ${saturation}%, 0%), hsl(${hue}, ${saturation}%, 50%), hsl(${hue}, ${saturation}%, 100%))`
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Presets</span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.color}
                    type="button"
                    onClick={() => handleColorChange(preset.color)}
                    className="w-full aspect-square rounded-lg border-2 hover:border-gray-400 dark:hover:border-gray-500 transition-all hover:scale-105"
                    style={{
                      backgroundColor: preset.color,
                      borderColor: value === preset.color ? '#3b82f6' : '#e5e7eb'
                    }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>

            {recentColors.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Recent</span>
                </div>
                <div className="grid grid-cols-8 gap-2">
                  {recentColors.map((color, idx) => (
                    <button
                      key={`${color}-${idx}`}
                      type="button"
                      onClick={() => handleColorChange(color)}
                      className="w-full aspect-square rounded-lg border-2 hover:border-gray-400 dark:hover:border-gray-500 transition-all hover:scale-105"
                      style={{
                        backgroundColor: color,
                        borderColor: value === color ? '#3b82f6' : '#e5e7eb'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// Image Upload Component
interface ImageUploadProps {
  label: string
  value: string
  onChange: (url: string) => void
  description?: string
}

function ImageUpload({ label, value, onChange, description }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useState<HTMLInputElement | null>(null)[0]

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Only images are allowed.')
      setTimeout(() => setError(''), 3000)
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 5MB.')
      setTimeout(() => setError(''), 3000)
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok && data.success) {
        onChange(data.url)
      } else {
        setError(data.error || 'Upload failed')
        setTimeout(() => setError(''), 3000)
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      setError('Upload failed. Please try again.')
      setTimeout(() => setError(''), 3000)
    } finally {
      setUploading(false)
      // Reset input
      if (e.target) e.target.value = ''
    }
  }

  const handleDelete = async () => {
    if (!value || !confirm('Are you sure you want to remove this image?')) return

    // Extract filename from URL
    const filename = value.split('/').pop()
    if (!filename) return

    try {
      const response = await fetch(`/api/upload?filename=${filename}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onChange('')
      }
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>

      {value ? (
        <div className="relative group">
          <div className="relative w-full h-32 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-900">
            <img
              src={value}
              alt="Uploaded logo"
              className="w-full h-full object-contain p-2"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => document.getElementById(`file-input-${label}`)?.click()}
                className="px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => document.getElementById(`file-input-${label}`)?.click()}
          className="relative w-full h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
        >
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Uploading...</p>
              </>
            ) : (
              <>
                <svg className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Click to upload image</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, GIF, WebP, SVG (max 5MB)</p>
              </>
            )}
          </div>
        </div>
      )}

      <input
        id={`file-input-${label}`}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{description}</p>
      )}
    </div>
  )
}

// Box Model Spacing Control Component
interface BoxModelControlProps {
  label: string
  values: {
    top: number
    right: number
    bottom: number
    left: number
  }
  onChange: (side: 'top' | 'right' | 'bottom' | 'left', value: number) => void
  min?: number
  max?: number
  unit?: string
}

function BoxModelControl({ label, values, onChange, min = 0, max = 100, unit = 'px' }: BoxModelControlProps) {
  const [linkedValues, setLinkedValues] = useState(true)

  const handleChange = (side: 'top' | 'right' | 'bottom' | 'left', value: number) => {
    if (linkedValues) {
      onChange('top', value)
      onChange('right', value)
      onChange('bottom', value)
      onChange('left', value)
    } else {
      onChange(side, value)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <button
          type="button"
          onClick={() => setLinkedValues(!linkedValues)}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            linkedValues ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}
          title={linkedValues ? 'Unlink values' : 'Link values'}
        >
          {linkedValues ? '🔗 Linked' : '⛓️ Unlinked'}
        </button>
      </div>

      <div className="relative">
        {/* Visual Box Model */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-2 items-center">
            {/* Top */}
            <div className="col-span-3 flex justify-center">
              <input
                type="number"
                value={values.top}
                onChange={(e) => handleChange('top', parseInt(e.target.value) || 0)}
                min={min}
                max={max}
                className="w-20 px-2 py-1 text-center text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Top"
              />
            </div>

            {/* Left, Center Label, Right */}
            <div className="flex justify-start">
              <input
                type="number"
                value={values.left}
                onChange={(e) => handleChange('left', parseInt(e.target.value) || 0)}
                min={min}
                max={max}
                className="w-20 px-2 py-1 text-center text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Left"
              />
            </div>

            <div className="flex items-center justify-center">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 dark:border-gray-600">
                {label}
              </div>
            </div>

            <div className="flex justify-end">
              <input
                type="number"
                value={values.right}
                onChange={(e) => handleChange('right', parseInt(e.target.value) || 0)}
                min={min}
                max={max}
                className="w-20 px-2 py-1 text-center text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Right"
              />
            </div>

            {/* Bottom */}
            <div className="col-span-3 flex justify-center">
              <input
                type="number"
                value={values.bottom}
                onChange={(e) => handleChange('bottom', parseInt(e.target.value) || 0)}
                min={min}
                max={max}
                className="w-20 px-2 py-1 text-center text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Bottom"
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Values in {unit} • {linkedValues ? 'All sides linked' : 'Individual side control'}
        </p>
      </div>
    </div>
  )
}

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  description?: string
}

function CollapsibleSection({ title, icon, children, defaultOpen = true, description }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 dark:border-gray-700 overflow-visible">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-700 dark:hover:to-gray-750 transition-all"
      >
        <div className="flex items-center gap-3">
          {icon && <div className="text-blue-600 dark:text-blue-400">{icon}</div>}
          <div className="text-left">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {isOpen ? (
          <ChevronUpIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />
        )}
      </button>

      {isOpen && (
        <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-700">
          {children}
        </div>
      )}
    </div>
  )
}

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

export default function EditWidgetPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'design' | 'content' | 'behavior' | 'advanced'>('design')
  const [previewState, setPreviewState] = useState<'idle' | 'hover' | 'active' | 'connecting'>('idle')
  const [showConsentPreview, setShowConsentPreview] = useState(false)
  const [showFloatingPanel, setShowFloatingPanel] = useState(false)
  const [consentAccepted, setConsentAccepted] = useState(false)
  const [vapiInstance, setVapiInstance] = useState<any>(null)
  const [transcript, setTranscript] = useState<Array<{role: string, text: string}>>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [clientName, setClientName] = useState<string>('')
  const [clients, setClients] = useState<Client[]>([])

  const [formData, setFormData] = useState({
    name: '',
    type: 'floating' as 'floating' | 'inline' | 'page',
    vapiPublicKey: '',
    vapiAssistantId: '',
    companyName: '',
    logoUrl: '',
    logoPosition: 'header' as 'header' | 'left' | 'none',
    // Logo customization
    logoAlignment: 'left' as 'left' | 'center' | 'right',
    companyNameAlignment: 'left' as 'left' | 'center' | 'right',
    logoShape: 'rounded' as 'circle' | 'rounded' | 'square',
    logoSize: 32,
    logoPadding: 4,
    logoOffsetX: 0,
    logoOffsetY: 0,
    logoBorderWidth: 0,
    logoBorderColor: '#e5e7eb',
    logoBorderStyle: 'solid' as 'solid' | 'dashed' | 'dotted',
    logoBackgroundColor: 'transparent',
    companyNameFontSize: 16,
    companyNameFontFamily: 'inherit',
    companyNameColor: '#ffffff',
    primaryColor: '#667eea',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    buttonTextColor: '#ffffff',
    welcomeMessage: 'How can we help you today?',
    buttonText: 'Start Call',

    // Dimensions
    buttonSize: 60,
    panelWidth: 380,
    panelHeight: 600,
    inlineButtonWidth: 'auto',
    inlineButtonHeight: 50,

    // Spacing
    buttonPadding: 14,
    panelPadding: 20,

    // Advanced Spacing (Padding)
    paddingTop: 14,
    paddingRight: 28,
    paddingBottom: 14,
    paddingLeft: 28,

    // Advanced Spacing (Margin)
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,

    // Border & Effects
    borderRadius: 50,
    borderWidth: 0,
    borderColor: '#000000',
    shadowIntensity: 'medium' as 'none' | 'light' | 'medium' | 'heavy',

    // Advanced Border
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopColor: '#000000',
    borderRightColor: '#000000',
    borderBottomColor: '#000000',
    borderLeftColor: '#000000',

    // Border Radius (Individual Corners)
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
    borderBottomLeftRadius: 50,

    // Inline Widget Hover Effects
    hoverColor: '#5568d3',
    hoverTextColor: '#ffffff',
    hoverText: 'Click to Call',
    hoverScale: 1.05,
    hoverTransitionType: 'both' as 'color' | 'text' | 'both',
    enableSlideEffect: true,
    slideDirection: 'up' as 'up' | 'down' | 'left' | 'right',

    // Inline Widget Border
    inlineBorderWidth: 0,
    inlineBorderStyle: 'solid' as 'solid' | 'dashed' | 'dotted' | 'none',
    inlineBorderColor: '#e5e7eb',

    // Inline Widget Symbol/Icon
    enableSymbol: false,
    symbolText: '📞',
    symbolPosition: 'left' as 'left' | 'right',
    symbolBackgroundColor: '#ffffff',
    symbolTextColor: '#667eea',
    symbolSize: 32,
    symbolBorderRadius: 50,

    // Inline Widget Layout
    textAlign: 'center' as 'left' | 'center' | 'right',
    hoverTextAlign: 'center' as 'left' | 'center' | 'right',
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,

    // Inline Widget Active Call Effects
    activeColor: '#dc3545',
    activeText: 'End Call',
    activeTextColor: '#ffffff',
    connectingText: 'Connecting...',

    // Animations
    enablePulse: true,
    enableRipple: true,
    enableGlow: false,
    animationSpeed: 'normal' as 'slow' | 'normal' | 'fast',

    // Typography
    fontSize: 16,
    fontWeight: '600' as '400' | '500' | '600' | '700',

    // Position
    position: 'bottom-right',
    offsetX: 20,
    offsetY: 20,
    isActive: true,
    clientId: '',
    allowedDomains: '',
    landingPageEnabled: false,
    landingPageSlug: '',

    // Landing Page Customization
    landingPageTitle: '',
    landingPageDescription: '',
    landingPageCustomHTML: '',
    landingPageCustomCSS: '',
    landingPageCustomJS: '',
    landingPageShowDefaultContent: true,
    landingPageBackgroundColor: '#ffffff',
    landingPageHeaderImage: '',

    // Legal & Consent
    enableConsent: false,
    consentDisplayType: 'modal' as 'modal' | 'inline',
    consentTitle: 'Terms & Privacy',
    consentMessage: 'By using this voice assistant, you agree to our Terms of Service and Privacy Policy. We may record this conversation for quality and training purposes.',
    consentAcceptText: 'I Agree',
    consentDeclineText: 'Decline',
    consentPrivacyUrl: '',
    consentTermsUrl: '',

    // Mute Button Customization
    enableMuteButton: true,
    muteButtonText: 'Mute',
    unmuteButtonText: 'Unmute',
    muteButtonColor: '#6b7280',
    mutedButtonColor: '#dc3545',
    muteButtonTextColor: '#ffffff',
    showMuteButtonIcon: true,
    muteButtonPosition: 'above' as 'above' | 'below',

    // Inline Widget Mute Button Specific
    inlineMuteButtonSize: 50,
    inlineMuteButtonBackground: '#ffffff',
    inlineMuteButtonPadding: 12,

    // Footer Customization
    enableFooter: true,
    footerText: 'Powered by',
    footerLinkText: 'Romea AI',
    footerLinkUrl: 'https://www.romea.ai/',
    footerTextColor: '#9ca3af',
    footerLinkColor: '',  // Empty means use primaryColor

    // Chat Bubble Customization
    userMessageBgColor: '#f0f0f0',
    userMessageTextColor: '#333333',
    assistantMessageBgColor: '',  // Empty means use primaryColor with opacity
    assistantMessageTextColor: '#333333',
  })

  // Initialize Vapi SDK
  useEffect(() => {
    const loadVapi = async () => {
      if (typeof window !== 'undefined') {
        if ((window as any).Vapi) {
          return
        }

        const existingScript = document.querySelector('script[src="/api/vapi-sdk"]')
        if (existingScript) {
          return
        }

        const script = document.createElement('script')
        script.src = '/api/vapi-sdk'
        script.async = true
        document.head.appendChild(script)

        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
        })
      }
    }

    loadVapi().catch(err => {
      console.error('Failed to load Vapi SDK:', err)
    })
  }, [])

  // Initialize Vapi instance when API key is available
  useEffect(() => {
    const initVapi = async () => {
      if (!formData.vapiPublicKey || typeof window === 'undefined') {
        return
      }

      let attempts = 0
      while (!(window as any).Vapi && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }

      if (!(window as any).Vapi) {
        console.error('Vapi SDK failed to load after 5 seconds')
        return
      }

      try {
        const Vapi = (window as any).Vapi.default || (window as any).Vapi
        const vapi = new Vapi(formData.vapiPublicKey)

        vapi.on('call-start', () => {
          console.log('Call started')
          setPreviewState('active')
          setTranscript([])
        })

        vapi.on('call-end', () => {
          console.log('Call ended')
          setPreviewState('idle')
          setIsSpeaking(false)
        })

        vapi.on('speech-start', () => {
          setIsSpeaking(true)
        })

        vapi.on('speech-end', () => {
          setIsSpeaking(false)
        })

        vapi.on('message', (msg: any) => {
          if (msg.type === 'transcript' && msg.transcript) {
            setTranscript(prev => [...prev, { role: msg.role, text: msg.transcript }])
          }
        })

        vapi.on('error', (e: any) => {
          console.error('Vapi Error:', e)
          setPreviewState('idle')
          setError(e.errorMsg || e.message || 'Call error occurred')
          setTimeout(() => setError(''), 5000)
        })

        setVapiInstance(vapi)
      } catch (err) {
        console.error('Failed to initialize Vapi:', err)
      }
    }

    initVapi()
  }, [formData.vapiPublicKey])

  useEffect(() => {
    async function fetchWidget() {
      const { data, error } = await supabase
        .from('widgets')
        .select('*, clients(name)')
        .eq('id', id)
        .single()

      if (!error && data) {
        // Set client name if it exists
        if (data.clients && typeof data.clients === 'object' && 'name' in data.clients) {
          setClientName(data.clients.name)
        }

        const config = data.config
        setFormData({
          name: data.name,
          type: data.type,
          vapiPublicKey: config.vapi?.publicApiKey || '',
          vapiAssistantId: config.vapi?.assistantId || '',
          companyName: config.content?.companyName || '',
          logoUrl: config.content?.logoUrl || config.branding?.logoUrl || '',
          logoPosition: config.branding?.logoPosition || 'header',
          logoAlignment: config.branding?.logoAlignment || 'left',
          companyNameAlignment: config.branding?.companyNameAlignment || 'left',
          logoShape: config.branding?.logoShape || 'rounded',
          logoSize: config.branding?.logoSize || 32,
          logoPadding: config.branding?.logoPadding ?? 4,
          logoOffsetX: config.branding?.logoOffsetX ?? 0,
          logoOffsetY: config.branding?.logoOffsetY ?? 0,
          logoBorderWidth: config.branding?.logoBorderWidth || 0,
          logoBorderColor: config.branding?.logoBorderColor || '#e5e7eb',
          logoBorderStyle: config.branding?.logoBorderStyle || 'solid',
          logoBackgroundColor: config.branding?.logoBackgroundColor || 'transparent',
          companyNameFontSize: config.branding?.companyNameFontSize || 16,
          companyNameFontFamily: config.branding?.companyNameFontFamily || 'inherit',
          companyNameColor: config.branding?.companyNameColor || '#ffffff',
          primaryColor: config.colors?.primary || '#667eea',
          backgroundColor: config.colors?.background || '#ffffff',
          textColor: config.colors?.text || '#333333',
          buttonTextColor: config.colors?.buttonText || '#ffffff',
          welcomeMessage: config.content?.welcomeMessage || 'How can we help you today?',
          buttonText: config.content?.buttonText || 'Start Call',

          // Dimensions
          buttonSize: config.dimensions?.buttonSize || 60,
          panelWidth: config.dimensions?.panelWidth || 380,
          panelHeight: config.dimensions?.panelHeight || 600,
          inlineButtonWidth: config.dimensions?.inlineButtonWidth || 'auto',
          inlineButtonHeight: config.dimensions?.inlineButtonHeight || 50,

          // Spacing
          buttonPadding: config.spacing?.buttonPadding || 14,
          panelPadding: config.spacing?.panelPadding || 20,

          // Advanced Spacing
          paddingTop: config.spacing?.paddingTop || 14,
          paddingRight: config.spacing?.paddingRight || 28,
          paddingBottom: config.spacing?.paddingBottom || 14,
          paddingLeft: config.spacing?.paddingLeft || 28,
          marginTop: config.spacing?.marginTop || 0,
          marginRight: config.spacing?.marginRight || 0,
          marginBottom: config.spacing?.marginBottom || 0,
          marginLeft: config.spacing?.marginLeft || 0,

          // Border & Effects
          borderRadius: config.effects?.borderRadius || 50,
          borderWidth: config.effects?.borderWidth || 0,
          borderColor: config.effects?.borderColor || '#000000',
          shadowIntensity: config.effects?.shadowIntensity || 'medium',

          // Advanced Borders
          borderTopWidth: config.effects?.borderTopWidth || 0,
          borderRightWidth: config.effects?.borderRightWidth || 0,
          borderBottomWidth: config.effects?.borderBottomWidth || 0,
          borderLeftWidth: config.effects?.borderLeftWidth || 0,
          borderTopColor: config.effects?.borderTopColor || '#000000',
          borderRightColor: config.effects?.borderRightColor || '#000000',
          borderBottomColor: config.effects?.borderBottomColor || '#000000',
          borderLeftColor: config.effects?.borderLeftColor || '#000000',
          borderTopLeftRadius: config.effects?.borderTopLeftRadius || 50,
          borderTopRightRadius: config.effects?.borderTopRightRadius || 50,
          borderBottomRightRadius: config.effects?.borderBottomRightRadius || 50,
          borderBottomLeftRadius: config.effects?.borderBottomLeftRadius || 50,

          // Inline Widget Hover Effects
          hoverColor: config.inline?.hoverColor || '#5568d3',
          hoverTextColor: config.inline?.hoverTextColor || '#ffffff',
          hoverText: config.inline?.hoverText || 'Click to Call',
          hoverScale: config.inline?.hoverScale || 1.05,
          hoverTransitionType: config.inline?.hoverTransitionType || 'both',
          enableSlideEffect: config.inline?.enableSlideEffect !== false,
          slideDirection: config.inline?.slideDirection || 'up',

          // Inline Widget Border
          inlineBorderWidth: config.inline?.borderWidth ?? 0,
          inlineBorderStyle: config.inline?.borderStyle || 'solid',
          inlineBorderColor: config.inline?.borderColor || '#e5e7eb',

          // Inline Widget Symbol/Icon
          enableSymbol: config.inline?.enableSymbol || false,
          symbolText: config.inline?.symbolText || '📞',
          symbolPosition: config.inline?.symbolPosition || 'left',
          symbolBackgroundColor: config.inline?.symbolBackgroundColor || '#ffffff',
          symbolTextColor: config.inline?.symbolTextColor || '#667eea',
          symbolSize: config.inline?.symbolSize || 32,
          symbolBorderRadius: config.inline?.symbolBorderRadius || 50,

          // Inline Widget Layout
          textAlign: config.inline?.textAlign || 'center',
          hoverTextAlign: config.inline?.hoverTextAlign || 'center',
          marginTop: config.inline?.marginTop ?? 0,
          marginRight: config.inline?.marginRight ?? 0,
          marginBottom: config.inline?.marginBottom ?? 0,
          marginLeft: config.inline?.marginLeft ?? 0,

          // Inline Widget Active Call Effects
          activeColor: config.inline?.activeColor || '#dc3545',
          activeText: config.inline?.activeText || 'End Call',
          activeTextColor: config.inline?.activeTextColor || '#ffffff',
          connectingText: config.inline?.connectingText || 'Connecting...',

          // Animations
          enablePulse: config.inline?.enablePulse ?? (config.animations?.enablePulse !== false),
          enableRipple: config.inline?.enableRipple ?? (config.animations?.enableRipple !== false),
          enableGlow: config.inline?.enableGlow ?? (config.animations?.enableGlow || false),
          animationSpeed: config.animations?.speed || 'normal',

          // Typography
          fontSize: config.typography?.fontSize || 16,
          fontWeight: config.typography?.fontWeight || '600',

          // Position
          position: config.display?.position || 'bottom-right',
          offsetX: config.display?.offsetX || 20,
          offsetY: config.display?.offsetY || 20,
          isActive: data.is_active,
          clientId: data.client_id || '',
          allowedDomains: data.allowed_domains ? data.allowed_domains.join('\n') : '',
          landingPageEnabled: data.landing_page_enabled || false,
          landingPageSlug: data.landing_page_slug || '',

          // Landing Page Customization
          landingPageTitle: data.landing_page_title || '',
          landingPageDescription: data.landing_page_description || '',
          landingPageCustomHTML: data.landing_page_custom_html || '',
          landingPageCustomCSS: data.landing_page_custom_css || '',
          landingPageCustomJS: data.landing_page_custom_js || '',
          landingPageShowDefaultContent: data.landing_page_show_default_content !== false,
          landingPageBackgroundColor: data.landing_page_background_color || '#ffffff',
          landingPageHeaderImage: data.landing_page_header_image || '',

          // Legal & Consent
          enableConsent: config.consent?.enabled || false,
          consentDisplayType: config.consent?.displayType || 'modal',
          consentTitle: config.consent?.title || 'Terms & Privacy',
          consentMessage: config.consent?.message || 'By using this voice assistant, you agree to our Terms of Service and Privacy Policy. We may record this conversation for quality and training purposes.',
          consentAcceptText: config.consent?.acceptText || 'I Agree',
          consentDeclineText: config.consent?.declineText || 'Decline',
          consentPrivacyUrl: config.consent?.privacyUrl || '',
          consentTermsUrl: config.consent?.termsUrl || '',

          // Mute Button Customization
          enableMuteButton: config.muteButton?.enabled !== false,
          muteButtonText: config.muteButton?.muteText || 'Mute',
          unmuteButtonText: config.muteButton?.unmuteText || 'Unmute',
          muteButtonColor: config.muteButton?.color || '#6b7280',
          mutedButtonColor: config.muteButton?.mutedColor || '#dc3545',
          muteButtonTextColor: config.muteButton?.textColor || '#ffffff',
          showMuteButtonIcon: config.muteButton?.showIcon !== false,
          muteButtonPosition: config.muteButton?.position || 'above',

          // Inline Widget Mute Button Specific
          inlineMuteButtonSize: config.muteButton?.inlineSize || 50,
          inlineMuteButtonBackground: config.muteButton?.inlineBackground || '#ffffff',
          inlineMuteButtonPadding: config.muteButton?.inlinePadding || 12,

          // Footer Customization
          enableFooter: config.footer?.enabled !== false,
          footerText: config.footer?.text || 'Powered by',
          footerLinkText: config.footer?.linkText || 'Romea AI',
          footerLinkUrl: config.footer?.linkUrl || 'https://www.romea.ai/',
          footerTextColor: config.footer?.textColor || '#9ca3af',
          footerLinkColor: config.footer?.linkColor || '',

          // Chat Bubble Customization
          userMessageBgColor: config.chat?.userMessageBgColor || '#f0f0f0',
          userMessageTextColor: config.chat?.userMessageTextColor || '#333333',
          assistantMessageBgColor: config.chat?.assistantMessageBgColor || '',
          assistantMessageTextColor: config.chat?.assistantMessageTextColor || '#333333',
        })
      }
      setLoading(false)
    }

    fetchWidget()
  }, [id, supabase])

  // Fetch all clients for dropdown
  useEffect(() => {
    async function fetchClients() {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name')

      if (!error && data) {
        setClients(data)
      }
    }

    fetchClients()
  }, [supabase])

  // Calculate text container width for preview
  useEffect(() => {
    if (formData.type === 'inline' && formData.enableSlideEffect && formData.hoverTransitionType !== 'color') {
      const textContainer = document.querySelector('.preview-button-text-container')
      if (textContainer) {
        // Create hidden measurement elements
        const measureMain = document.createElement('span')
        const measureHover = document.createElement('span')

        measureMain.style.cssText = 'position: absolute; visibility: hidden; white-space: nowrap; font-size: ' + formData.fontSize + 'px; font-weight: ' + formData.fontWeight + ';'
        measureHover.style.cssText = 'position: absolute; visibility: hidden; white-space: nowrap; font-size: ' + formData.fontSize + 'px; font-weight: ' + formData.fontWeight + ';'

        measureMain.textContent = formData.buttonText
        measureHover.textContent = formData.hoverText

        document.body.appendChild(measureMain)
        document.body.appendChild(measureHover)

        const mainWidth = measureMain.offsetWidth
        const hoverWidth = measureHover.offsetWidth
        const maxWidth = Math.max(mainWidth, hoverWidth)

        document.body.removeChild(measureMain)
        document.body.removeChild(measureHover)

        // Set the container width
        const container = textContainer as HTMLElement
        container.style.width = `${maxWidth}px`
      }
    }
  }, [formData.type, formData.enableSlideEffect, formData.hoverTransitionType, formData.buttonText, formData.hoverText, formData.fontSize, formData.fontWeight])

  const startCall = async () => {
    if (!vapiInstance) {
      setError('Vapi not initialized. Please check your API key.')
      setTimeout(() => setError(''), 3000)
      return
    }

    if (!formData.vapiAssistantId) {
      setError('Assistant ID is required to start a call.')
      setTimeout(() => setError(''), 3000)
      return
    }

    // Check consent if enabled
    if (formData.enableConsent && !consentAccepted) {
      setShowConsentPreview(true)
      return
    }

    try {
      setPreviewState('connecting')
      await vapiInstance.start(formData.vapiAssistantId)
    } catch (err: any) {
      console.error('Failed to start call:', err)
      setPreviewState('idle')
      setError(err.message || 'Failed to start call')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleConsentAccept = async () => {
    setConsentAccepted(true)
    setShowConsentPreview(false)
    // Start the call after consent
    try {
      setPreviewState('connecting')
      await vapiInstance.start(formData.vapiAssistantId)
    } catch (err: any) {
      console.error('Failed to start call:', err)
      setPreviewState('idle')
      setError(err.message || 'Failed to start call')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleConsentDecline = () => {
    setShowConsentPreview(false)
  }

  const stopCall = () => {
    if (vapiInstance) {
      vapiInstance.stop()
    }
    setPreviewState('idle')
    setIsSpeaking(false)
    setIsMuted(false)
  }

  const toggleMute = () => {
    if (!vapiInstance) return

    if (isMuted) {
      vapiInstance.setMuted(false)
      setIsMuted(false)
    } else {
      vapiInstance.setMuted(true)
      setIsMuted(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const widgetConfig = {
        type: formData.type,
        display: {
          position: formData.position,
          offsetX: formData.offsetX,
          offsetY: formData.offsetY,
          zIndex: 9999,
        },
        dimensions: {
          buttonSize: formData.buttonSize,
          panelWidth: formData.panelWidth,
          panelHeight: formData.panelHeight,
          inlineButtonWidth: formData.inlineButtonWidth,
          inlineButtonHeight: formData.inlineButtonHeight,
        },
        spacing: {
          buttonPadding: formData.buttonPadding,
          panelPadding: formData.panelPadding,
          paddingTop: formData.paddingTop,
          paddingRight: formData.paddingRight,
          paddingBottom: formData.paddingBottom,
          paddingLeft: formData.paddingLeft,
          marginTop: formData.marginTop,
          marginRight: formData.marginRight,
          marginBottom: formData.marginBottom,
          marginLeft: formData.marginLeft,
        },
        colors: {
          primary: formData.primaryColor,
          background: formData.backgroundColor,
          text: formData.textColor,
          buttonText: formData.buttonTextColor,
        },
        effects: {
          borderRadius: formData.borderRadius,
          borderWidth: formData.borderWidth,
          borderColor: formData.borderColor,
          shadowIntensity: formData.shadowIntensity,
          borderTopWidth: formData.borderTopWidth,
          borderRightWidth: formData.borderRightWidth,
          borderBottomWidth: formData.borderBottomWidth,
          borderLeftWidth: formData.borderLeftWidth,
          borderTopColor: formData.borderTopColor,
          borderRightColor: formData.borderRightColor,
          borderBottomColor: formData.borderBottomColor,
          borderLeftColor: formData.borderLeftColor,
          borderTopLeftRadius: formData.borderTopLeftRadius,
          borderTopRightRadius: formData.borderTopRightRadius,
          borderBottomRightRadius: formData.borderBottomRightRadius,
          borderBottomLeftRadius: formData.borderBottomLeftRadius,
        },
        content: {
          companyName: formData.companyName,
          welcomeMessage: formData.welcomeMessage,
          buttonText: formData.buttonText,
          logoUrl: formData.logoUrl,
        },
        branding: {
          logoUrl: formData.logoUrl,
          logoPosition: formData.logoPosition,
          logoAlignment: formData.logoAlignment,
          companyNameAlignment: formData.companyNameAlignment,
          logoShape: formData.logoShape,
          logoSize: formData.logoSize,
          logoPadding: formData.logoPadding,
          logoOffsetX: formData.logoOffsetX,
          logoOffsetY: formData.logoOffsetY,
          logoBorderWidth: formData.logoBorderWidth,
          logoBorderColor: formData.logoBorderColor,
          logoBorderStyle: formData.logoBorderStyle,
          logoBackgroundColor: formData.logoBackgroundColor,
          companyNameFontSize: formData.companyNameFontSize,
          companyNameFontFamily: formData.companyNameFontFamily,
          companyNameColor: formData.companyNameColor,
        },
        inline: {
          hoverColor: formData.hoverColor,
          hoverTextColor: formData.hoverTextColor,
          hoverText: formData.hoverText,
          hoverScale: formData.hoverScale,
          hoverTransitionType: formData.hoverTransitionType,
          enableSlideEffect: formData.enableSlideEffect,
          slideDirection: formData.slideDirection,
          borderWidth: formData.inlineBorderWidth,
          borderStyle: formData.inlineBorderStyle,
          borderColor: formData.inlineBorderColor,
          enableSymbol: formData.enableSymbol,
          symbolText: formData.symbolText,
          symbolPosition: formData.symbolPosition,
          symbolBackgroundColor: formData.symbolBackgroundColor,
          symbolTextColor: formData.symbolTextColor,
          symbolSize: formData.symbolSize,
          symbolBorderRadius: formData.symbolBorderRadius,
          textAlign: formData.textAlign,
          hoverTextAlign: formData.hoverTextAlign,
          marginTop: formData.marginTop,
          marginRight: formData.marginRight,
          marginBottom: formData.marginBottom,
          marginLeft: formData.marginLeft,
          activeColor: formData.activeColor,
          activeText: formData.activeText,
          activeTextColor: formData.activeTextColor,
          connectingText: formData.connectingText,
          enablePulse: formData.enablePulse,
          enableRipple: formData.enableRipple,
          enableGlow: formData.enableGlow,
        },
        animations: {
          speed: formData.animationSpeed,
        },
        typography: {
          fontSize: formData.fontSize,
          fontWeight: formData.fontWeight,
        },
        vapi: {
          publicApiKey: formData.vapiPublicKey || undefined, // Use env variable if not provided
          assistantId: formData.vapiAssistantId,
        },
        consent: {
          enabled: formData.enableConsent,
          displayType: formData.consentDisplayType,
          title: formData.consentTitle,
          message: formData.consentMessage,
          acceptText: formData.consentAcceptText,
          declineText: formData.consentDeclineText,
          privacyUrl: formData.consentPrivacyUrl,
          termsUrl: formData.consentTermsUrl,
        },
        muteButton: {
          enabled: formData.enableMuteButton,
          muteText: formData.muteButtonText,
          unmuteText: formData.unmuteButtonText,
          color: formData.muteButtonColor,
          mutedColor: formData.mutedButtonColor,
          textColor: formData.muteButtonTextColor,
          showIcon: formData.showMuteButtonIcon,
          position: formData.muteButtonPosition,
          inlineSize: formData.inlineMuteButtonSize,
          inlineBackground: formData.inlineMuteButtonBackground,
          inlinePadding: formData.inlineMuteButtonPadding,
        },
        footer: {
          enabled: formData.enableFooter,
          text: formData.footerText,
          linkText: formData.footerLinkText,
          linkUrl: formData.footerLinkUrl,
          textColor: formData.footerTextColor,
          linkColor: formData.footerLinkColor,
        },
        chat: {
          userMessageBgColor: formData.userMessageBgColor,
          userMessageTextColor: formData.userMessageTextColor,
          assistantMessageBgColor: formData.assistantMessageBgColor,
          assistantMessageTextColor: formData.assistantMessageTextColor,
        },
      }

      // Auto-generate landing page slug if enabled but slug is empty
      let landingPageSlug = formData.landingPageSlug
      if (formData.landingPageEnabled && !landingPageSlug) {
        landingPageSlug = generateRandomSlug()
        setFormData({ ...formData, landingPageSlug })
      }

      // Parse allowed domains (one per line)
      const allowedDomainsArray = formData.allowedDomains
        ? formData.allowedDomains
            .split('\n')
            .map(domain => domain.trim())
            .filter(domain => domain.length > 0)
        : null

      const { error: updateError } = await supabase
        .from('widgets')
        .update({
          name: formData.name,
          type: formData.type,
          config: widgetConfig,
          is_active: formData.isActive,
          client_id: formData.clientId || null,
          allowed_domains: allowedDomainsArray,
          landing_page_enabled: formData.landingPageEnabled,
          landing_page_slug: landingPageSlug || null,
          landing_page_title: formData.landingPageTitle || null,
          landing_page_description: formData.landingPageDescription || null,
          landing_page_custom_html: formData.landingPageCustomHTML || null,
          landing_page_custom_css: formData.landingPageCustomCSS || null,
          landing_page_custom_js: formData.landingPageCustomJS || null,
          landing_page_show_default_content: formData.landingPageShowDefaultContent,
          landing_page_background_color: formData.landingPageBackgroundColor || '#ffffff',
          landing_page_header_image: formData.landingPageHeaderImage || null,
        })
        .eq('id', id)

      if (updateError) throw updateError

      setSuccess('Widget updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update widget'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500">Loading widget...</div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'design' as const, name: 'Design', icon: <PaintBrushIcon className="w-5 h-5" /> },
    { id: 'content' as const, name: 'Content', icon: <DocumentTextIcon className="w-5 h-5" /> },
    { id: 'behavior' as const, name: 'Behavior', icon: <CogIcon className="w-5 h-5" /> },
    { id: 'advanced' as const, name: 'Advanced', icon: <SparklesIcon className="w-5 h-5" /> },
  ]

  return (
    <div className="max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium inline-flex items-center gap-1 mb-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Widgets
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Widget</h1>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 mt-1">Customize your voice chat widget</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Widget Type</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{formData.type}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-r-lg shadow-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-400 px-4 py-3 rounded-r-lg shadow-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        </div>
      )}

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="xl:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info Card */}
            <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Squares2X2Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Configure widget name, type, and status</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Widget Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="My Voice Widget"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Widget Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['floating', 'inline', 'page'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type })}
                        className={`p-4 border-2 rounded-xl text-center transition-all ${
                          formData.type === type
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-2xl mb-2">
                          {type === 'floating' && '💬'}
                          {type === 'inline' && '📄'}
                          {type === 'page' && '🖥️'}
                        </div>
                        <div className="font-medium capitalize text-sm">{type}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700 font-medium">
                    Widget is active and visible on your website
                  </label>
                </div>

                {/* Client Selector */}
                <div className="space-y-2">
                  <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
                    Associate with Client
                  </label>
                  <select
                    id="clientId"
                    value={formData.clientId}
                    onChange={(e) => {
                      const selectedClient = clients.find(c => c.id === e.target.value)
                      setFormData({ ...formData, clientId: e.target.value })
                      if (selectedClient) {
                        setClientName(selectedClient.name)
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No client (optional)</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                    Associate this widget with a client to enable landing pages
                  </p>
                </div>

                {/* Domain Restrictions */}
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Domain Restrictions (CORS)</h3>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
                    Restrict which domains can embed and use this widget. Leave empty to allow all domains.
                  </p>

                  <div className="space-y-2">
                    <label htmlFor="allowedDomains" className="block text-sm font-medium text-gray-700">
                      Allowed Domains (one per line)
                    </label>
                    <textarea
                      id="allowedDomains"
                      value={formData.allowedDomains}
                      onChange={(e) => setFormData({ ...formData, allowedDomains: e.target.value })}
                      placeholder={'example.com\nwww.example.com\n*.staging.example.com\nlocalhost'}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                    />
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                        <strong>Examples:</strong>
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1 ml-4">
                        <li>• <code className="bg-gray-200 px-1 rounded">example.com</code> - Exact domain only</li>
                        <li>• <code className="bg-gray-200 px-1 rounded">*.example.com</code> - All subdomains</li>
                        <li>• <code className="bg-gray-200 px-1 rounded">localhost</code> - Local development</li>
                        <li>• <code className="bg-gray-200 px-1 rounded">127.0.0.1</code> - Local IP</li>
                      </ul>
                    </div>
                  </div>

                  {formData.allowedDomains && (
                    <div className="p-2 bg-blue-50 rounded border border-blue-200">
                      <p className="text-xs text-blue-800">
                        <strong>⚠️ Widget will only work on the domains listed above.</strong> Make sure to include all domains where you want to use this widget, including development environments.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                      id="landingPageEnabled"
                      type="checkbox"
                      checked={formData.landingPageEnabled}
                      onChange={(e) => setFormData({ ...formData, landingPageEnabled: e.target.checked })}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-blue-300 rounded"
                      disabled={!clientName}
                    />
                    <div className="flex-1">
                      <label htmlFor="landingPageEnabled" className="text-sm text-blue-900 font-medium block">
                        Enable Hosted Landing Page
                      </label>
                      <p className="text-xs text-blue-700 mt-1">
                        {clientName ? 'Generate a public landing page for this widget' : 'Associate this widget with a client to enable landing pages'}
                      </p>
                    </div>
                  </div>

                  {formData.landingPageEnabled && clientName && (
                    <>
                      {/* Landing Page Slug Editor */}
                      <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <label htmlFor="landingPageSlug" className="block text-sm font-medium text-gray-700">
                          Landing Page Slug
                        </label>
                        <div className="flex gap-2">
                          <input
                            id="landingPageSlug"
                            type="text"
                            value={formData.landingPageSlug}
                            onChange={(e) => setFormData({ ...formData, landingPageSlug: sanitizeSlug(e.target.value) })}
                            placeholder="auto-generated-slug"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, landingPageSlug: generateRandomSlug() })}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                          >
                            Generate
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                          A unique identifier for your landing page URL. Click "Generate" for a random slug.
                        </p>
                      </div>

                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-xs text-green-900 dark:text-green-300 font-medium mb-2">Landing Page URL:</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 rounded border border-green-300 dark:border-green-700 text-sm text-green-800 dark:text-green-300 font-mono break-all">
                            https://voice.romea.ai/{generateSlug(clientName)}/{formData.landingPageSlug || 'your-slug-here'}
                          </code>
                          <button
                            type="button"
                            onClick={() => {
                              const url = `https://voice.romea.ai/${generateSlug(clientName)}/${formData.landingPageSlug}`
                              navigator.clipboard.writeText(url)
                              setSuccess('Landing page URL copied to clipboard!')
                              setTimeout(() => setSuccess(''), 2000)
                            }}
                            disabled={!formData.landingPageSlug}
                            className="w-full sm:w-auto px-3 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      {/* Landing Page Customization Section */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
                          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Landing Page Customization</h3>
                          <p className="text-xs text-gray-600 mt-1">Customize the appearance and content of your landing page</p>
                        </div>

                        <div className="p-4 space-y-4">
                          {/* Basic Information */}
                          <div className="space-y-3">
                            <div>
                              <label htmlFor="landingPageTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Page Title
                              </label>
                              <input
                                id="landingPageTitle"
                                type="text"
                                value={formData.landingPageTitle}
                                onChange={(e) => setFormData({ ...formData, landingPageTitle: e.target.value })}
                                placeholder="Welcome to our voice assistant (optional, defaults to company name)"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                            </div>

                            <div>
                              <label htmlFor="landingPageDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                              </label>
                              <textarea
                                id="landingPageDescription"
                                value={formData.landingPageDescription}
                                onChange={(e) => setFormData({ ...formData, landingPageDescription: e.target.value })}
                                placeholder="Describe your voice assistant and what it can help with..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                            </div>
                          </div>

                          {/* Visual Customization */}
                          <div className="space-y-3 pt-3 border-t">
                            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">Visual Settings</h4>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label htmlFor="landingPageBackgroundColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Background Color
                                </label>
                                <input
                                  id="landingPageBackgroundColor"
                                  type="color"
                                  value={formData.landingPageBackgroundColor}
                                  onChange={(e) => setFormData({ ...formData, landingPageBackgroundColor: e.target.value })}
                                  className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                                />
                              </div>

                              <div>
                                <label htmlFor="landingPageHeaderImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Header Image URL
                                </label>
                                <input
                                  id="landingPageHeaderImage"
                                  type="url"
                                  value={formData.landingPageHeaderImage}
                                  onChange={(e) => setFormData({ ...formData, landingPageHeaderImage: e.target.value })}
                                  placeholder="https://example.com/hero.jpg"
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <input
                                id="landingPageShowDefaultContent"
                                type="checkbox"
                                checked={formData.landingPageShowDefaultContent}
                                onChange={(e) => setFormData({ ...formData, landingPageShowDefaultContent: e.target.checked })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div className="flex-1">
                                <label htmlFor="landingPageShowDefaultContent" className="text-sm text-gray-700 font-medium block">
                                  Show default content
                                </label>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Includes header, title, instructions, and &quot;Powered by Romea AI&quot; footer
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Custom Code Section */}
                          <div className="space-y-3 pt-3 border-t">
                            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">Custom Code</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Add your own HTML, CSS, and JavaScript to customize the landing page</p>

                            <div>
                              <label htmlFor="landingPageCustomHTML" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Custom HTML
                              </label>
                              <textarea
                                id="landingPageCustomHTML"
                                value={formData.landingPageCustomHTML}
                                onChange={(e) => setFormData({ ...formData, landingPageCustomHTML: e.target.value })}
                                placeholder="<div>Your custom HTML content here...</div>"
                                rows={5}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                              />
                            </div>

                            <div>
                              <label htmlFor="landingPageCustomCSS" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Custom CSS
                              </label>
                              <textarea
                                id="landingPageCustomCSS"
                                value={formData.landingPageCustomCSS}
                                onChange={(e) => setFormData({ ...formData, landingPageCustomCSS: e.target.value })}
                                placeholder=".custom-class { color: blue; }"
                                rows={5}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                              />
                            </div>

                            <div>
                              <label htmlFor="landingPageCustomJS" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Custom JavaScript
                              </label>
                              <textarea
                                id="landingPageCustomJS"
                                value={formData.landingPageCustomJS}
                                onChange={(e) => setFormData({ ...formData, landingPageCustomJS: e.target.value })}
                                placeholder="console.log('Custom JS'); // Your code here"
                                rows={5}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                              />
                              <p className="text-xs text-amber-600 mt-1">⚠️ Be careful with custom JavaScript - test thoroughly before deploying</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="vapiPublicKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Vapi Public API Key (Optional)
                      </label>
                      <input
                        id="vapiPublicKey"
                        type="text"
                        value={formData.vapiPublicKey}
                        onChange={(e) => setFormData({ ...formData, vapiPublicKey: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        placeholder="pk_... (leave empty to use environment variable)"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        If left empty, the widget will use the NEXT_PUBLIC_VAPI_PUBLIC_KEY from your environment variables.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="vapiAssistantId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Vapi Assistant ID
                      </label>
                      <input
                        id="vapiAssistantId"
                        type="text"
                        required
                        value={formData.vapiAssistantId}
                        onChange={(e) => setFormData({ ...formData, vapiAssistantId: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        placeholder="asst_..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabbed Content */}
            <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 dark:border-gray-700">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-xl overflow-hidden">
                <nav className="flex -mb-px">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-4 px-4 text-center border-b-2 font-medium text-sm transition-all ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/30'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {tab.icon}
                        <span>{tab.name}</span>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Design Tab */}
                {activeTab === 'design' && (
                  <div className="space-y-4">
                    <CollapsibleSection
                      title="Colors"
                      icon={<SwatchIcon className="w-5 h-5" />}
                      description="Customize your widget's color scheme"
                      defaultOpen={true}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <ColorPicker
                          label="Primary Color"
                          value={formData.primaryColor}
                          onChange={(color) => setFormData({ ...formData, primaryColor: color })}
                          description="Main theme color for buttons and headers"
                        />
                        <ColorPicker
                          label="Background Color"
                          value={formData.backgroundColor}
                          onChange={(color) => setFormData({ ...formData, backgroundColor: color })}
                          description="Widget background color"
                        />
                        <ColorPicker
                          label="Text Color"
                          value={formData.textColor}
                          onChange={(color) => setFormData({ ...formData, textColor: color })}
                          description="Main text color"
                        />
                        <ColorPicker
                          label="Button Text Color"
                          value={formData.buttonTextColor}
                          onChange={(color) => setFormData({ ...formData, buttonTextColor: color })}
                          description="Text color for buttons"
                        />
                      </div>
                    </CollapsibleSection>

                    {(formData.type === 'floating' || formData.type === 'page') && (
                      <CollapsibleSection
                        title="Panel Dimensions"
                        icon={<Squares2X2Icon className="w-5 h-5" />}
                        description="Set the size of your widget panel"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="panelWidth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Width (px)
                            </label>
                            <input
                              id="panelWidth"
                              type="number"
                              min="300"
                              max="600"
                              value={formData.panelWidth}
                              onChange={(e) => setFormData({ ...formData, panelWidth: parseInt(e.target.value) })}
                              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label htmlFor="panelHeight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Height (px)
                            </label>
                            <input
                              id="panelHeight"
                              type="number"
                              min="400"
                              max="800"
                              value={formData.panelHeight}
                              onChange={(e) => setFormData({ ...formData, panelHeight: parseInt(e.target.value) })}
                              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label htmlFor="buttonPadding" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Button Padding (px)
                            </label>
                            <input
                              id="buttonPadding"
                              type="number"
                              min="0"
                              max="40"
                              value={formData.buttonPadding}
                              onChange={(e) => setFormData({ ...formData, buttonPadding: parseInt(e.target.value) })}
                              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label htmlFor="panelPadding" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Panel Padding (px)
                            </label>
                            <input
                              id="panelPadding"
                              type="number"
                              min="0"
                              max="40"
                              value={formData.panelPadding}
                              onChange={(e) => setFormData({ ...formData, panelPadding: parseInt(e.target.value) })}
                              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </CollapsibleSection>
                    )}

                    {formData.type === 'inline' && (
                      <CollapsibleSection
                        title="Button Dimensions"
                        icon={<Squares2X2Icon className="w-5 h-5" />}
                        description="Configure inline button size"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="inlineButtonWidth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Width
                            </label>
                            <input
                              id="inlineButtonWidth"
                              type="text"
                              value={formData.inlineButtonWidth}
                              onChange={(e) => setFormData({ ...formData, inlineButtonWidth: e.target.value })}
                              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="auto or 200px"
                            />
                          </div>
                          <div>
                            <label htmlFor="inlineButtonHeight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Height (px)
                            </label>
                            <input
                              id="inlineButtonHeight"
                              type="number"
                              min="40"
                              max="100"
                              value={formData.inlineButtonHeight}
                              onChange={(e) => setFormData({ ...formData, inlineButtonHeight: parseInt(e.target.value) })}
                              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label htmlFor="buttonPadding" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Padding (px)
                            </label>
                            <input
                              id="buttonPadding"
                              type="number"
                              min="0"
                              max="40"
                              value={formData.buttonPadding}
                              onChange={(e) => setFormData({ ...formData, buttonPadding: parseInt(e.target.value) })}
                              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </CollapsibleSection>
                    )}

                    {formData.type === 'inline' && (
                      <CollapsibleSection
                        title="Button Layout & Spacing"
                        icon={<Squares2X2Icon className="w-5 h-5" />}
                        description="Configure text alignment and margins"
                        defaultOpen={false}
                      >
                        <div className="space-y-4">
                          {/* Text Alignment */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Text Alignment
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                              {(['left', 'center', 'right'] as const).map((align) => (
                                <button
                                  key={align}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, textAlign: align })}
                                  className={`px-4 py-2.5 text-sm font-medium rounded-lg border-2 transition-all ${
                                    formData.textAlign === align
                                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700'
                                  }`}
                                >
                                  {align.charAt(0).toUpperCase() + align.slice(1)}
                                </button>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Alignment of text inside the button
                            </p>
                          </div>

                          {/* Hover Text Alignment */}
                          {formData.enableSlideEffect && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Hover Text Alignment
                              </label>
                              <div className="grid grid-cols-3 gap-3">
                                {(['left', 'center', 'right'] as const).map((align) => (
                                  <button
                                    key={align}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, hoverTextAlign: align })}
                                    className={`px-4 py-2.5 text-sm font-medium rounded-lg border-2 transition-all ${
                                      formData.hoverTextAlign === align
                                        ? 'border-green-600 bg-green-50 text-green-700'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700'
                                    }`}
                                  >
                                    {align.charAt(0).toUpperCase() + align.slice(1)}
                                  </button>
                                ))}
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Alignment of hover text (creates a shift effect on hover)
                              </p>
                            </div>
                          )}

                          {/* Margins */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Margins (px)
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="marginTop" className="block text-xs text-gray-600 mb-1">
                                  Top
                                </label>
                                <input
                                  id="marginTop"
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={formData.marginTop}
                                  onChange={(e) => setFormData({ ...formData, marginTop: parseInt(e.target.value) || 0 })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label htmlFor="marginRight" className="block text-xs text-gray-600 mb-1">
                                  Right
                                </label>
                                <input
                                  id="marginRight"
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={formData.marginRight}
                                  onChange={(e) => setFormData({ ...formData, marginRight: parseInt(e.target.value) || 0 })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label htmlFor="marginBottom" className="block text-xs text-gray-600 mb-1">
                                  Bottom
                                </label>
                                <input
                                  id="marginBottom"
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={formData.marginBottom}
                                  onChange={(e) => setFormData({ ...formData, marginBottom: parseInt(e.target.value) || 0 })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label htmlFor="marginLeft" className="block text-xs text-gray-600 mb-1">
                                  Left
                                </label>
                                <input
                                  id="marginLeft"
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={formData.marginLeft}
                                  onChange={(e) => setFormData({ ...formData, marginLeft: parseInt(e.target.value) || 0 })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Space around the button
                            </p>
                          </div>
                        </div>
                      </CollapsibleSection>
                    )}

                    <CollapsibleSection
                      title="Border & Effects"
                      description="Customize borders, shadows, and visual effects"
                      defaultOpen={false}
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="borderRadius" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Border Radius (px)
                            </label>
                            <input
                              id="borderRadius"
                              type="number"
                              min="0"
                              max="50"
                              value={formData.borderRadius}
                              onChange={(e) => setFormData({ ...formData, borderRadius: parseInt(e.target.value) })}
                              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label htmlFor="borderWidth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Border Width (px)
                            </label>
                            <input
                              id="borderWidth"
                              type="number"
                              min="0"
                              max="10"
                              value={formData.borderWidth}
                              onChange={(e) => setFormData({ ...formData, borderWidth: parseInt(e.target.value) })}
                              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>

                        {formData.borderWidth > 0 && (
                          <ColorPicker
                            label="Border Color"
                            value={formData.borderColor}
                            onChange={(color) => setFormData({ ...formData, borderColor: color })}
                          />
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Shadow Intensity
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {(['none', 'light', 'medium', 'heavy'] as const).map((intensity) => (
                              <button
                                key={intensity}
                                type="button"
                                onClick={() => setFormData({ ...formData, shadowIntensity: intensity })}
                                className={`p-3 border-2 rounded-lg text-center transition-all capitalize text-sm ${
                                  formData.shadowIntensity === intensity
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                {intensity}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection
                      title="Advanced Spacing"
                      description="Fine-tune padding and margins for each side"
                      defaultOpen={false}
                    >
                      <div className="space-y-6">
                        <BoxModelControl
                          label="Padding"
                          values={{
                            top: formData.paddingTop,
                            right: formData.paddingRight,
                            bottom: formData.paddingBottom,
                            left: formData.paddingLeft,
                          }}
                          onChange={(side, value) => {
                            setFormData({
                              ...formData,
                              [`padding${side.charAt(0).toUpperCase() + side.slice(1)}`]: value
                            })
                          }}
                          max={60}
                        />

                        <BoxModelControl
                          label="Margin"
                          values={{
                            top: formData.marginTop,
                            right: formData.marginRight,
                            bottom: formData.marginBottom,
                            left: formData.marginLeft,
                          }}
                          onChange={(side, value) => {
                            setFormData({
                              ...formData,
                              [`margin${side.charAt(0).toUpperCase() + side.slice(1)}`]: value
                            })
                          }}
                          min={-20}
                          max={60}
                        />
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection
                      title="Advanced Borders"
                      description="Individual border width and color for each side"
                      defaultOpen={false}
                    >
                      <div className="space-y-6">
                        <BoxModelControl
                          label="Border Width"
                          values={{
                            top: formData.borderTopWidth,
                            right: formData.borderRightWidth,
                            bottom: formData.borderBottomWidth,
                            left: formData.borderLeftWidth,
                          }}
                          onChange={(side, value) => {
                            setFormData({
                              ...formData,
                              [`border${side.charAt(0).toUpperCase() + side.slice(1)}Width`]: value
                            })
                          }}
                          max={20}
                        />

                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Border Colors</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <ColorPicker
                              label="Top Border"
                              value={formData.borderTopColor}
                              onChange={(color) => setFormData({ ...formData, borderTopColor: color })}
                            />
                            <ColorPicker
                              label="Right Border"
                              value={formData.borderRightColor}
                              onChange={(color) => setFormData({ ...formData, borderRightColor: color })}
                            />
                            <ColorPicker
                              label="Bottom Border"
                              value={formData.borderBottomColor}
                              onChange={(color) => setFormData({ ...formData, borderBottomColor: color })}
                            />
                            <ColorPicker
                              label="Left Border"
                              value={formData.borderLeftColor}
                              onChange={(color) => setFormData({ ...formData, borderLeftColor: color })}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Border Radius (Individual Corners)</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="borderTopLeftRadius" className="block text-xs font-medium text-gray-600 mb-2">
                                Top Left (px)
                              </label>
                              <input
                                id="borderTopLeftRadius"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.borderTopLeftRadius}
                                onChange={(e) => setFormData({ ...formData, borderTopLeftRadius: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label htmlFor="borderTopRightRadius" className="block text-xs font-medium text-gray-600 mb-2">
                                Top Right (px)
                              </label>
                              <input
                                id="borderTopRightRadius"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.borderTopRightRadius}
                                onChange={(e) => setFormData({ ...formData, borderTopRightRadius: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label htmlFor="borderBottomLeftRadius" className="block text-xs font-medium text-gray-600 mb-2">
                                Bottom Left (px)
                              </label>
                              <input
                                id="borderBottomLeftRadius"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.borderBottomLeftRadius}
                                onChange={(e) => setFormData({ ...formData, borderBottomLeftRadius: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label htmlFor="borderBottomRightRadius" className="block text-xs font-medium text-gray-600 mb-2">
                                Bottom Right (px)
                              </label>
                              <input
                                id="borderBottomRightRadius"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.borderBottomRightRadius}
                                onChange={(e) => setFormData({ ...formData, borderBottomRightRadius: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CollapsibleSection>

                    {formData.type === 'floating' && (
                      <CollapsibleSection
                        title="Position"
                        description="Widget placement on the page"
                        defaultOpen={false}
                      >
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Screen Position
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { value: 'bottom-right', label: 'Bottom Right' },
                                { value: 'bottom-left', label: 'Bottom Left' },
                                { value: 'top-right', label: 'Top Right' },
                                { value: 'top-left', label: 'Top Left' },
                              ].map((pos) => (
                                <button
                                  key={pos.value}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, position: pos.value })}
                                  className={`p-3 border-2 rounded-lg text-center transition-all ${
                                    formData.position === pos.value
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <span className="text-sm font-medium">{pos.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="offsetX" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Horizontal Offset (px)
                              </label>
                              <input
                                id="offsetX"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.offsetX}
                                onChange={(e) => setFormData({ ...formData, offsetX: parseInt(e.target.value) })}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label htmlFor="offsetY" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Vertical Offset (px)
                              </label>
                              <input
                                id="offsetY"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.offsetY}
                                onChange={(e) => setFormData({ ...formData, offsetY: parseInt(e.target.value) })}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      </CollapsibleSection>
                    )}
                  </div>
                )}

                {/* Content Tab */}
                {activeTab === 'content' && (
                  <div className="space-y-4">
                    <CollapsibleSection
                      title="Branding"
                      description="Configure your company logo and name"
                      defaultOpen={true}
                    >
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
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Your Company"
                          />
                        </div>

                        <ImageUpload
                          label="Company Logo"
                          value={formData.logoUrl}
                          onChange={(url) => setFormData({ ...formData, logoUrl: url })}
                          description="Upload your company logo (PNG, JPG, SVG recommended)"
                        />

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Logo Position
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { value: 'header', label: 'Header' },
                              { value: 'none', label: 'Hidden' },
                            ].map((pos) => (
                              <button
                                key={pos.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, logoPosition: pos.value as 'header' | 'none' })}
                                className={`p-3 border-2 rounded-lg text-center transition-all ${
                                  formData.logoPosition === pos.value
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <span className="text-sm font-medium">{pos.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Logo Customization */}
                        {formData.logoUrl && formData.logoPosition !== 'none' && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Logo Alignment
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                  {(['left', 'center', 'right'] as const).map((align) => (
                                    <button
                                      key={align}
                                      type="button"
                                      onClick={() => setFormData({ ...formData, logoAlignment: align })}
                                      className={`px-3 py-2 text-xs font-medium rounded-lg border-2 transition-all ${
                                        formData.logoAlignment === align
                                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700'
                                      }`}
                                    >
                                      {align.charAt(0).toUpperCase() + align.slice(1)}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Company Name Alignment
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                  {(['left', 'center', 'right'] as const).map((align) => (
                                    <button
                                      key={align}
                                      type="button"
                                      onClick={() => setFormData({ ...formData, companyNameAlignment: align })}
                                      className={`px-3 py-2 text-xs font-medium rounded-lg border-2 transition-all ${
                                        formData.companyNameAlignment === align
                                          ? 'border-green-600 bg-green-50 text-green-700'
                                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700'
                                      }`}
                                    >
                                      {align.charAt(0).toUpperCase() + align.slice(1)}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Logo Shape
                              </label>
                              <div className="grid grid-cols-3 gap-3">
                                {[
                                  { value: 'circle', label: 'Circle' },
                                  { value: 'rounded', label: 'Rounded' },
                                  { value: 'square', label: 'Square' }
                                ].map((shape) => (
                                  <button
                                    key={shape.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, logoShape: shape.value as 'circle' | 'rounded' | 'square' })}
                                    className={`px-4 py-2.5 text-sm font-medium rounded-lg border-2 transition-all ${
                                      formData.logoShape === shape.value
                                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700'
                                    }`}
                                  >
                                    {shape.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="logoSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Logo Size (px)
                                </label>
                                <input
                                  id="logoSize"
                                  type="number"
                                  min="16"
                                  max="128"
                                  value={formData.logoSize}
                                  onChange={(e) => setFormData({ ...formData, logoSize: parseInt(e.target.value) || 32 })}
                                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label htmlFor="logoPadding" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Logo Padding (px)
                                </label>
                                <input
                                  id="logoPadding"
                                  type="number"
                                  min="0"
                                  max="20"
                                  value={formData.logoPadding}
                                  onChange={(e) => setFormData({ ...formData, logoPadding: parseInt(e.target.value) || 0 })}
                                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="logoOffsetX" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Logo Offset X (px)
                                </label>
                                <input
                                  id="logoOffsetX"
                                  type="number"
                                  min="-20"
                                  max="20"
                                  value={formData.logoOffsetX}
                                  onChange={(e) => setFormData({ ...formData, logoOffsetX: parseInt(e.target.value) || 0 })}
                                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label htmlFor="logoOffsetY" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Logo Offset Y (px)
                                </label>
                                <input
                                  id="logoOffsetY"
                                  type="number"
                                  min="-20"
                                  max="20"
                                  value={formData.logoOffsetY}
                                  onChange={(e) => setFormData({ ...formData, logoOffsetY: parseInt(e.target.value) || 0 })}
                                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>
                            </div>

                            <div>
                              <label htmlFor="logoBackgroundColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Logo Background Color
                              </label>
                              <div className="flex items-center gap-3">
                                <input
                                  id="logoBackgroundColor"
                                  type="color"
                                  value={formData.logoBackgroundColor === 'transparent' ? '#ffffff' : formData.logoBackgroundColor}
                                  onChange={(e) => setFormData({ ...formData, logoBackgroundColor: e.target.value })}
                                  className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={formData.logoBackgroundColor}
                                  onChange={(e) => setFormData({ ...formData, logoBackgroundColor: e.target.value })}
                                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="#ffffff or transparent"
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Use 'transparent' for no background or a hex color (e.g., #ffffff for white)
                              </p>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-3">
                                Logo Border
                              </label>
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label htmlFor="logoBorderWidth" className="block text-xs text-gray-600 mb-1">
                                      Width (px)
                                    </label>
                                    <input
                                      id="logoBorderWidth"
                                      type="number"
                                      min="0"
                                      max="10"
                                      value={formData.logoBorderWidth}
                                      onChange={(e) => setFormData({ ...formData, logoBorderWidth: parseInt(e.target.value) || 0 })}
                                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>
                                  <div>
                                    <label htmlFor="logoBorderColor" className="block text-xs text-gray-600 mb-1">
                                      Color
                                    </label>
                                    <div className="flex items-center gap-2">
                                      <input
                                        id="logoBorderColor"
                                        type="color"
                                        value={formData.logoBorderColor}
                                        onChange={(e) => setFormData({ ...formData, logoBorderColor: e.target.value })}
                                        className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                                      />
                                      <input
                                        type="text"
                                        value={formData.logoBorderColor}
                                        onChange={(e) => setFormData({ ...formData, logoBorderColor: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <label htmlFor="logoBorderStyle" className="block text-xs text-gray-600 mb-1">
                                    Style
                                  </label>
                                  <select
                                    id="logoBorderStyle"
                                    value={formData.logoBorderStyle}
                                    onChange={(e) => setFormData({ ...formData, logoBorderStyle: e.target.value as 'solid' | 'dashed' | 'dotted' })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    <option value="solid">Solid</option>
                                    <option value="dashed">Dashed</option>
                                    <option value="dotted">Dotted</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4 mt-4">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">Company Name Font Settings</h4>

                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label htmlFor="companyNameFontSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Font Size (px)
                                  </label>
                                  <input
                                    id="companyNameFontSize"
                                    type="number"
                                    min="10"
                                    max="32"
                                    value={formData.companyNameFontSize}
                                    onChange={(e) => setFormData({ ...formData, companyNameFontSize: parseInt(e.target.value) || 16 })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label htmlFor="companyNameColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Font Color
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      id="companyNameColor"
                                      type="color"
                                      value={formData.companyNameColor}
                                      onChange={(e) => setFormData({ ...formData, companyNameColor: e.target.value })}
                                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                                    />
                                    <input
                                      type="text"
                                      value={formData.companyNameColor}
                                      onChange={(e) => setFormData({ ...formData, companyNameColor: e.target.value })}
                                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                      placeholder="#ffffff"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label htmlFor="companyNameFontFamily" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Font Family
                                </label>
                                <select
                                  id="companyNameFontFamily"
                                  value={formData.companyNameFontFamily}
                                  onChange={(e) => setFormData({ ...formData, companyNameFontFamily: e.target.value })}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                  <option value="inherit">Inherit (System Default)</option>
                                  <option value="Arial, sans-serif">Arial</option>
                                  <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
                                  <option value="'Times New Roman', Times, serif">Times New Roman</option>
                                  <option value="Georgia, serif">Georgia</option>
                                  <option value="'Courier New', Courier, monospace">Courier New</option>
                                  <option value="Verdana, sans-serif">Verdana</option>
                                  <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                                  <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
                                  <option value="Impact, sans-serif">Impact</option>
                                  <option value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">System UI</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-2">
                                  Select a font family for the company name
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </CollapsibleSection>

                    {(formData.type === 'floating' || formData.type === 'page') && (
                      <CollapsibleSection
                        title="Welcome Message"
                        description="Set the greeting message for users"
                        defaultOpen={true}
                      >
                        <div>
                          <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Message Text
                          </label>
                          <textarea
                            id="welcomeMessage"
                            rows={3}
                            value={formData.welcomeMessage}
                            onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="How can we help you today?"
                          />
                        </div>
                      </CollapsibleSection>
                    )}

                    <CollapsibleSection
                      title="Button Text"
                      description="Customize button labels"
                      defaultOpen={true}
                    >
                      <div>
                        <label htmlFor="buttonText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Start Call Button
                        </label>
                        <input
                          id="buttonText"
                          type="text"
                          value={formData.buttonText}
                          onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Start Call"
                        />
                      </div>
                    </CollapsibleSection>

                    {(formData.type === 'floating' || formData.type === 'page') && (
                      <>
                        <CollapsibleSection
                          title="Footer"
                          description="Customize the footer branding"
                          defaultOpen={true}
                        >
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="enableFooter"
                                checked={formData.enableFooter}
                                onChange={(e) => setFormData({ ...formData, enableFooter: e.target.checked })}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <label htmlFor="enableFooter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Enable Footer
                              </label>
                            </div>

                            {formData.enableFooter && (
                              <>
                                <div>
                                  <label htmlFor="footerText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Footer Text
                                  </label>
                                  <input
                                    id="footerText"
                                    type="text"
                                    value={formData.footerText}
                                    onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Powered by"
                                  />
                                </div>

                                <div>
                                  <label htmlFor="footerLinkText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Link Text
                                  </label>
                                  <input
                                    id="footerLinkText"
                                    type="text"
                                    value={formData.footerLinkText}
                                    onChange={(e) => setFormData({ ...formData, footerLinkText: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Romea AI"
                                  />
                                </div>

                                <div>
                                  <label htmlFor="footerLinkUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Link URL
                                  </label>
                                  <input
                                    id="footerLinkUrl"
                                    type="url"
                                    value={formData.footerLinkUrl}
                                    onChange={(e) => setFormData({ ...formData, footerLinkUrl: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="https://www.romea.ai/"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <ColorPicker
                                    label="Text Color"
                                    value={formData.footerTextColor}
                                    onChange={(color) => setFormData({ ...formData, footerTextColor: color })}
                                    description="Color of the footer text"
                                  />

                                  <ColorPicker
                                    label="Link Color"
                                    value={formData.footerLinkColor || formData.primaryColor}
                                    onChange={(color) => setFormData({ ...formData, footerLinkColor: color })}
                                    description="Color of the link (empty = primary color)"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </CollapsibleSection>

                        <CollapsibleSection
                          title="Chat Bubbles"
                          description="Customize message appearance"
                          defaultOpen={false}
                        >
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">User Messages</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <ColorPicker
                                  label="Background Color"
                                  value={formData.userMessageBgColor}
                                  onChange={(color) => setFormData({ ...formData, userMessageBgColor: color })}
                                  description="User bubble background"
                                />
                                <ColorPicker
                                  label="Text Color"
                                  value={formData.userMessageTextColor}
                                  onChange={(color) => setFormData({ ...formData, userMessageTextColor: color })}
                                  description="User bubble text"
                                />
                              </div>
                            </div>

                            <div className="border-t pt-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">Assistant Messages</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <ColorPicker
                                  label="Background Color"
                                  value={formData.assistantMessageBgColor || `${formData.primaryColor}15`}
                                  onChange={(color) => setFormData({ ...formData, assistantMessageBgColor: color })}
                                  description="Assistant bubble background"
                                />
                                <ColorPicker
                                  label="Text Color"
                                  value={formData.assistantMessageTextColor}
                                  onChange={(color) => setFormData({ ...formData, assistantMessageTextColor: color })}
                                  description="Assistant bubble text"
                                />
                              </div>
                            </div>
                          </div>
                        </CollapsibleSection>
                      </>
                    )}
                  </div>
                )}

                {/* Behavior Tab */}
                {activeTab === 'behavior' && (
                  <div className="space-y-4">
                    {formData.type === 'inline' && (
                      <>
                        <CollapsibleSection
                          title="Hover Effects"
                          description="Configure button hover interactions"
                          defaultOpen={true}
                        >
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <ColorPicker
                                label="Hover Background Color"
                                value={formData.hoverColor}
                                onChange={(color) => setFormData({ ...formData, hoverColor: color })}
                              />
                              <ColorPicker
                                label="Hover Text Color"
                                value={formData.hoverTextColor}
                                onChange={(color) => setFormData({ ...formData, hoverTextColor: color })}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="hoverScale" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Hover Scale
                                </label>
                                <input
                                  id="hoverScale"
                                  type="number"
                                  min="1"
                                  max="1.2"
                                  step="0.01"
                                  value={formData.hoverScale}
                                  onChange={(e) => setFormData({ ...formData, hoverScale: parseFloat(e.target.value) })}
                                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>
                            </div>

                            <div>
                              <label htmlFor="hoverText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Hover Text
                              </label>
                              <input
                                id="hoverText"
                                type="text"
                                value={formData.hoverText}
                                onChange={(e) => setFormData({ ...formData, hoverText: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Click to Call"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Transition Type
                              </label>
                              <div className="grid grid-cols-3 gap-2">
                                {['color', 'text', 'both'].map((type) => (
                                  <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, hoverTransitionType: type as any })}
                                    className={`p-3 border-2 rounded-lg text-center transition-all capitalize text-sm ${
                                      formData.hoverTransitionType === type
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                  >
                                    {type}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <input
                                id="enableSlideEffect"
                                type="checkbox"
                                checked={formData.enableSlideEffect}
                                onChange={(e) => setFormData({ ...formData, enableSlideEffect: e.target.checked })}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="enableSlideEffect" className="text-sm text-gray-700 font-medium">
                                Enable slide text effect
                              </label>
                            </div>

                            {formData.enableSlideEffect && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Slide Direction
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                  {['up', 'down', 'left', 'right'].map((dir) => (
                                    <button
                                      key={dir}
                                      type="button"
                                      onClick={() => setFormData({ ...formData, slideDirection: dir as any })}
                                      className={`p-3 border-2 rounded-lg text-center transition-all capitalize text-sm ${
                                        formData.slideDirection === dir
                                          ? 'border-blue-500 bg-blue-50'
                                          : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                    >
                                      {dir}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CollapsibleSection>

                        <CollapsibleSection
                          title="Border Configuration"
                          description="Configure button border styling"
                          defaultOpen={false}
                        >
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="inlineBorderWidth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Border Width (px)
                                </label>
                                <input
                                  id="inlineBorderWidth"
                                  type="number"
                                  min="0"
                                  max="10"
                                  value={formData.inlineBorderWidth}
                                  onChange={(e) => setFormData({ ...formData, inlineBorderWidth: parseInt(e.target.value) || 0 })}
                                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label htmlFor="inlineBorderStyle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Border Style
                                </label>
                                <select
                                  id="inlineBorderStyle"
                                  value={formData.inlineBorderStyle}
                                  onChange={(e) => setFormData({ ...formData, inlineBorderStyle: e.target.value as any })}
                                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="solid">Solid</option>
                                  <option value="dashed">Dashed</option>
                                  <option value="dotted">Dotted</option>
                                  <option value="none">None</option>
                                </select>
                              </div>
                            </div>

                            <ColorPicker
                              label="Border Color"
                              value={formData.inlineBorderColor}
                              onChange={(color) => setFormData({ ...formData, inlineBorderColor: color })}
                            />
                          </div>
                        </CollapsibleSection>

                        <CollapsibleSection
                          title="Symbol/Icon"
                          description="Add an icon to the inline button"
                          defaultOpen={false}
                        >
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <input
                                id="enableSymbol"
                                type="checkbox"
                                checked={formData.enableSymbol}
                                onChange={(e) => setFormData({ ...formData, enableSymbol: e.target.checked })}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="enableSymbol" className="text-sm text-gray-700 font-medium">
                                Show icon/emoji on button
                              </label>
                            </div>

                            {formData.enableSymbol && (
                              <>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label htmlFor="symbolText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      Symbol/Emoji
                                    </label>
                                    <input
                                      id="symbolText"
                                      type="text"
                                      value={formData.symbolText}
                                      onChange={(e) => setFormData({ ...formData, symbolText: e.target.value })}
                                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      Position
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                      {['left', 'right'].map((pos) => (
                                        <button
                                          key={pos}
                                          type="button"
                                          onClick={() => setFormData({ ...formData, symbolPosition: pos as any })}
                                          className={`p-3 border-2 rounded-lg text-center transition-all capitalize text-sm ${
                                            formData.symbolPosition === pos
                                              ? 'border-blue-500 bg-blue-50'
                                              : 'border-gray-200 hover:border-gray-300'
                                          }`}
                                        >
                                          {pos}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <ColorPicker
                                    label="Symbol Background"
                                    value={formData.symbolBackgroundColor}
                                    onChange={(color) => setFormData({ ...formData, symbolBackgroundColor: color })}
                                  />
                                  <ColorPicker
                                    label="Symbol Color"
                                    value={formData.symbolTextColor}
                                    onChange={(color) => setFormData({ ...formData, symbolTextColor: color })}
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label htmlFor="symbolSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      Size (px)
                                    </label>
                                    <input
                                      id="symbolSize"
                                      type="number"
                                      min="20"
                                      max="60"
                                      value={formData.symbolSize}
                                      onChange={(e) => setFormData({ ...formData, symbolSize: parseInt(e.target.value) })}
                                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                  </div>
                                  <div>
                                    <label htmlFor="symbolBorderRadius" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      Border Radius (px)
                                    </label>
                                    <input
                                      id="symbolBorderRadius"
                                      type="number"
                                      min="0"
                                      max="50"
                                      value={formData.symbolBorderRadius}
                                      onChange={(e) => setFormData({ ...formData, symbolBorderRadius: parseInt(e.target.value) })}
                                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </CollapsibleSection>

                        <CollapsibleSection
                          title="Call States"
                          description="Configure active and connecting states"
                          defaultOpen={false}
                        >
                          <div className="space-y-4">
                            <ColorPicker
                              label="Active Call Color"
                              value={formData.activeColor}
                              onChange={(color) => setFormData({ ...formData, activeColor: color })}
                              description="Button color during active call"
                            />

                            <div>
                              <label htmlFor="activeText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Active Call Text
                              </label>
                              <input
                                id="activeText"
                                type="text"
                                value={formData.activeText}
                                onChange={(e) => setFormData({ ...formData, activeText: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="End Call"
                              />
                            </div>

                            <div>
                              <label htmlFor="connectingText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Connecting Text
                              </label>
                              <input
                                id="connectingText"
                                type="text"
                                value={formData.connectingText}
                                onChange={(e) => setFormData({ ...formData, connectingText: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Connecting..."
                              />
                            </div>
                          </div>
                        </CollapsibleSection>
                      </>
                    )}

                    <CollapsibleSection
                      title="Animations"
                      description="Control animation effects and speed"
                      defaultOpen={formData.type === 'inline'}
                    >
                      <div className="space-y-4">
                        {formData.type === 'inline' && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <input
                                id="enablePulse"
                                type="checkbox"
                                checked={formData.enablePulse}
                                onChange={(e) => setFormData({ ...formData, enablePulse: e.target.checked })}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="enablePulse" className="text-sm text-gray-700 font-medium">
                                Enable pulse animation
                              </label>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <input
                                id="enableRipple"
                                type="checkbox"
                                checked={formData.enableRipple}
                                onChange={(e) => setFormData({ ...formData, enableRipple: e.target.checked })}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="enableRipple" className="text-sm text-gray-700 font-medium">
                                Enable ripple effect on click
                              </label>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <input
                                id="enableGlow"
                                type="checkbox"
                                checked={formData.enableGlow}
                                onChange={(e) => setFormData({ ...formData, enableGlow: e.target.checked })}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="enableGlow" className="text-sm text-gray-700 font-medium">
                                Enable glow effect
                              </label>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Animation Speed
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {['slow', 'normal', 'fast'].map((speed) => (
                              <button
                                key={speed}
                                type="button"
                                onClick={() => setFormData({ ...formData, animationSpeed: speed as any })}
                                className={`p-3 border-2 rounded-lg text-center transition-all capitalize text-sm ${
                                  formData.animationSpeed === speed
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                {speed}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection
                      title="Mute Button"
                      description="Configure microphone mute functionality"
                      defaultOpen={false}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <input
                            id="enableMuteButton"
                            type="checkbox"
                            checked={formData.enableMuteButton}
                            onChange={(e) => setFormData({ ...formData, enableMuteButton: e.target.checked })}
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="enableMuteButton" className="text-sm text-gray-700 font-medium">
                            Show mute button during calls
                          </label>
                        </div>

                        {formData.enableMuteButton && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="muteButtonText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Mute Button Text
                                </label>
                                <input
                                  id="muteButtonText"
                                  type="text"
                                  value={formData.muteButtonText}
                                  onChange={(e) => setFormData({ ...formData, muteButtonText: e.target.value })}
                                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label htmlFor="unmuteButtonText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Unmute Button Text
                                </label>
                                <input
                                  id="unmuteButtonText"
                                  type="text"
                                  value={formData.unmuteButtonText}
                                  onChange={(e) => setFormData({ ...formData, unmuteButtonText: e.target.value })}
                                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <ColorPicker
                                label="Mute Button Color"
                                value={formData.muteButtonColor}
                                onChange={(color) => setFormData({ ...formData, muteButtonColor: color })}
                              />
                              <ColorPicker
                                label="Muted State Color"
                                value={formData.mutedButtonColor}
                                onChange={(color) => setFormData({ ...formData, mutedButtonColor: color })}
                              />
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <input
                                id="showMuteButtonIcon"
                                type="checkbox"
                                checked={formData.showMuteButtonIcon}
                                onChange={(e) => setFormData({ ...formData, showMuteButtonIcon: e.target.checked })}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="showMuteButtonIcon" className="text-sm text-gray-700 font-medium">
                                Show microphone icon
                              </label>
                            </div>
                          </>
                        )}
                      </div>
                    </CollapsibleSection>
                  </div>
                )}

                {/* Advanced Tab */}
                {activeTab === 'advanced' && (
                  <div className="space-y-4">
                    <CollapsibleSection
                      title="Legal & Consent"
                      description="Configure consent requirements and legal notices"
                      defaultOpen={true}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <input
                            id="enableConsent"
                            type="checkbox"
                            checked={formData.enableConsent}
                            onChange={(e) => setFormData({ ...formData, enableConsent: e.target.checked })}
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="enableConsent" className="text-sm text-gray-700 font-medium">
                            Require user consent before starting calls
                          </label>
                        </div>

                        {formData.enableConsent && (
                          <>
                            {(formData.type === 'floating' || formData.type === 'page') && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Display Type
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                  {[
                                    { value: 'modal', label: 'Modal Popup' },
                                    { value: 'inline', label: 'Inline Panel' },
                                  ].map((type) => (
                                    <button
                                      key={type.value}
                                      type="button"
                                      onClick={() => setFormData({ ...formData, consentDisplayType: type.value as any })}
                                      className={`p-3 border-2 rounded-lg text-center transition-all ${
                                        formData.consentDisplayType === type.value
                                          ? 'border-blue-500 bg-blue-50'
                                          : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                    >
                                      <span className="text-sm font-medium">{type.label}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div>
                              <label htmlFor="consentTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Consent Title
                              </label>
                              <input
                                id="consentTitle"
                                type="text"
                                value={formData.consentTitle}
                                onChange={(e) => setFormData({ ...formData, consentTitle: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label htmlFor="consentMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Consent Message
                              </label>
                              <textarea
                                id="consentMessage"
                                rows={4}
                                value={formData.consentMessage}
                                onChange={(e) => setFormData({ ...formData, consentMessage: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="consentAcceptText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Accept Button
                                </label>
                                <input
                                  id="consentAcceptText"
                                  type="text"
                                  value={formData.consentAcceptText}
                                  onChange={(e) => setFormData({ ...formData, consentAcceptText: e.target.value })}
                                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label htmlFor="consentDeclineText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Decline Button
                                </label>
                                <input
                                  id="consentDeclineText"
                                  type="text"
                                  value={formData.consentDeclineText}
                                  onChange={(e) => setFormData({ ...formData, consentDeclineText: e.target.value })}
                                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="consentTermsUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Terms of Service URL
                                </label>
                                <input
                                  id="consentTermsUrl"
                                  type="url"
                                  value={formData.consentTermsUrl}
                                  onChange={(e) => setFormData({ ...formData, consentTermsUrl: e.target.value })}
                                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  placeholder="https://..."
                                />
                              </div>
                              <div>
                                <label htmlFor="consentPrivacyUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Privacy Policy URL
                                </label>
                                <input
                                  id="consentPrivacyUrl"
                                  type="url"
                                  value={formData.consentPrivacyUrl}
                                  onChange={(e) => setFormData({ ...formData, consentPrivacyUrl: e.target.value })}
                                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  placeholder="https://..."
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection
                      title="Typography"
                      description="Text size and weight settings"
                      defaultOpen={false}
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Font Size (px)
                          </label>
                          <input
                            id="fontSize"
                            type="number"
                            min="12"
                            max="24"
                            value={formData.fontSize}
                            onChange={(e) => setFormData({ ...formData, fontSize: parseInt(e.target.value) })}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Font Weight
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { value: '400', label: 'Normal' },
                              { value: '500', label: 'Medium' },
                              { value: '600', label: 'Semibold' },
                              { value: '700', label: 'Bold' },
                            ].map((weight) => (
                              <button
                                key={weight.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, fontWeight: weight.value as any })}
                                className={`p-2 border-2 rounded-lg text-center transition-all text-xs ${
                                  formData.fontWeight === weight.value
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                {weight.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CollapsibleSection>
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Ready to save?</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">Your changes will be applied immediately</p>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column - Live Preview */}
        <div className="xl:col-span-1">
          <div className="sticky top-6">
            <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <EyeIcon className="w-5 h-5 text-white" />
                  <h2 className="text-lg font-semibold text-white">Live Preview</h2>
                </div>
                <p className="text-blue-100 text-xs mt-1">See your changes in real-time</p>
              </div>

              {/* Inject preview styles */}
              <style>
                {`
                  ${getShadowStyles(formData.shadowIntensity)}
                  ${getAnimationStyles(formData.animationSpeed)}

                  .preview-inline-button {
                    transition: all ${formData.animationSpeed === 'fast' ? '0.15s' : formData.animationSpeed === 'slow' ? '0.4s' : '0.25s'} ease;
                    position: relative;
                    overflow: hidden;
                  }

                  .preview-inline-button:hover {
                    transform: scale(${formData.hoverScale}) translateY(-2px);
                  }

                  .preview-inline-button.active {
                    animation: ${formData.enablePulse ? 'preview-pulse 2s infinite' : 'none'};
                  }

                  .preview-inline-button.glow {
                    box-shadow: 0 0 20px ${formData.primaryColor}, 0 0 40px ${formData.primaryColor};
                    animation: preview-glow 1.5s ease-in-out infinite;
                  }

                  .preview-button-text-container {
                    position: relative;
                    overflow: hidden;
                    display: inline-block;
                  }

                  .preview-button-text {
                    display: block;
                    transition: transform ${formData.animationSpeed === 'fast' ? '0.15s' : formData.animationSpeed === 'slow' ? '0.4s' : '0.25s'} ease;
                  }

                  .preview-button-text-hover {
                    position: absolute;
                    transition: transform ${formData.animationSpeed === 'fast' ? '0.15s' : formData.animationSpeed === 'slow' ? '0.4s' : '0.25s'} ease;
                  }

                  .preview-inline-button:hover .preview-button-text.slide-up {
                    transform: translateY(-100%);
                  }
                  .preview-button-text-hover.slide-up {
                    top: 100%;
                    left: 0;
                    width: 100%;
                  }
                  .preview-inline-button:hover .preview-button-text-hover.slide-up {
                    transform: translateY(-100%);
                  }

                  .preview-inline-button:hover .preview-button-text.slide-down {
                    transform: translateY(100%);
                  }
                  .preview-button-text-hover.slide-down {
                    top: -100%;
                    left: 0;
                    width: 100%;
                  }
                  .preview-inline-button:hover .preview-button-text-hover.slide-down {
                    transform: translateY(100%);
                  }

                  .preview-inline-button:hover .preview-button-text.slide-left {
                    transform: translateX(-100%);
                  }
                  .preview-button-text-hover.slide-left {
                    top: 0;
                    left: 100%;
                    width: 100%;
                  }
                  .preview-inline-button:hover .preview-button-text-hover.slide-left {
                    transform: translateX(-100%);
                  }

                  .preview-inline-button:hover .preview-button-text.slide-right {
                    transform: translateX(100%);
                  }
                  .preview-button-text-hover.slide-right {
                    top: 0;
                    left: -100%;
                    width: 100%;
                  }
                  .preview-inline-button:hover .preview-button-text-hover.slide-right {
                    transform: translateX(100%);
                  }

                  @keyframes preview-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.85; }
                  }

                  @keyframes preview-glow {
                    0%, 100% { box-shadow: 0 0 10px ${formData.primaryColor}; }
                    50% { box-shadow: 0 0 25px ${formData.primaryColor}, 0 0 50px ${formData.primaryColor}; }
                  }

                  @keyframes preview-ripple {
                    0% {
                      transform: scale(0);
                      opacity: 1;
                    }
                    100% {
                      transform: scale(4);
                      opacity: 0;
                    }
                  }

                  .preview-ripple {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.6);
                    width: 20px;
                    height: 20px;
                    animation: preview-ripple 0.6s ease-out;
                    pointer-events: none;
                  }
                `}
              </style>

              <div className="p-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 min-h-[500px] relative border-2 border-dashed border-gray-300">
                  <div className="text-center text-gray-500 text-xs mb-6 font-medium">
                    {formData.type === 'floating' && '💬 Floating Widget'}
                    {formData.type === 'inline' && '📄 Inline Widget'}
                    {formData.type === 'page' && '🖥️ Page Widget'}
                  </div>

                  {/* Preview Widget */}
                  {formData.type === 'floating' && (
                    <div className="relative h-full" style={{ minHeight: '500px' }}>
                      <button
                        type="button"
                        onClick={() => setShowFloatingPanel(!showFloatingPanel)}
                        style={{
                          position: 'absolute',
                          ...(() => {
                            const pos = formData.position;
                            const style: any = {};
                            if (pos.includes('bottom')) style.bottom = `${formData.offsetY}px`;
                            if (pos.includes('top')) style.top = `${formData.offsetY}px`;
                            if (pos.includes('right')) style.right = `${formData.offsetX}px`;
                            if (pos.includes('left')) style.left = `${formData.offsetX}px`;
                            return style;
                          })(),
                          width: `${formData.buttonSize}px`,
                          height: `${formData.buttonSize}px`,
                          backgroundColor: formData.primaryColor,
                          color: formData.buttonTextColor,
                          border: formData.borderWidth > 0 ? `${formData.borderWidth}px solid ${formData.borderColor}` : 'none',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          boxShadow: formData.shadowIntensity === 'none'
                            ? 'none'
                            : formData.shadowIntensity === 'light'
                              ? '0 2px 8px rgba(0,0,0,0.1)'
                              : formData.shadowIntensity === 'medium'
                                ? '0 4px 12px rgba(0,0,0,0.15)'
                                : '0 8px 24px rgba(0,0,0,0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 1
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          style={{ width: `${formData.buttonSize * 0.5}px`, height: `${formData.buttonSize * 0.5}px` }}
                        >
                          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                        </svg>
                      </button>

                      {/* Floating Panel Preview */}
                      {showFloatingPanel && (
                        <div
                          style={{
                            position: 'absolute',
                            ...(() => {
                              const pos = formData.position;
                              const style: any = {};
                              // Position panel above or below button
                              if (pos.includes('bottom')) {
                                style.bottom = `${formData.offsetY + formData.buttonSize + 20}px`;
                              }
                              if (pos.includes('top')) {
                                style.top = `${formData.offsetY + formData.buttonSize + 20}px`;
                              }
                              // Align panel with button
                              if (pos.includes('right')) {
                                style.right = `${formData.offsetX}px`;
                              }
                              if (pos.includes('left')) {
                                style.left = `${formData.offsetX}px`;
                              }
                              return style;
                            })(),
                            width: `${formData.panelWidth}px`,
                            maxWidth: '90%',
                            backgroundColor: formData.backgroundColor,
                            borderRadius: `${formData.borderRadius}px`,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                            overflow: 'hidden',
                            zIndex: 10
                          }}
                        >
                          {/* Header */}
                          <div style={{
                            backgroundColor: formData.primaryColor,
                            color: 'white',
                            padding: '16px 20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              flex: 1
                            }}>
                              {formData.logoUrl && (
                                <div style={{
                                  display: 'flex',
                                  justifyContent: formData.logoAlignment === 'left' ? 'flex-start' : formData.logoAlignment === 'right' ? 'flex-end' : 'center',
                                  flex: formData.logoAlignment === 'center' ? 1 : 'none'
                                }}>
                                  <div style={{
                                    width: `${formData.logoSize}px`,
                                    height: `${formData.logoSize}px`,
                                    borderRadius: formData.logoShape === 'circle' ? '50%' : formData.logoShape === 'square' ? '0' : '8px',
                                    backgroundColor: formData.logoBackgroundColor,
                                    border: `${formData.logoBorderWidth}px ${formData.logoBorderStyle} ${formData.logoBorderColor}`,
                                    padding: `${formData.logoPadding}px`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden'
                                  }}>
                                    <img
                                      src={formData.logoUrl}
                                      alt="Logo"
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        transform: `translate(${formData.logoOffsetX}px, ${formData.logoOffsetY}px)`
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                              <div style={{
                                flex: 1,
                                textAlign: formData.companyNameAlignment
                              }}>
                                <div style={{
                                  fontSize: `${formData.companyNameFontSize}px`,
                                  fontWeight: formData.fontWeight,
                                  fontFamily: formData.companyNameFontFamily,
                                  color: formData.companyNameColor
                                }}>
                                  {formData.companyName || 'Voice Assistant'}
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                              {transcript.length > 0 && (
                                <button
                                  onClick={() => setTranscript([])}
                                  title="Clear chat"
                                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                                  </svg>
                                </button>
                              )}
                              <button
                                onClick={() => setShowFloatingPanel(false)}
                                style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer', padding: '0', width: '28px', height: '28px' }}
                              >
                                ×
                              </button>
                            </div>
                          </div>

                          {/* Body */}
                          <div style={{ padding: '20px', maxHeight: '300px', overflowY: 'auto', color: formData.textColor }}>
                            {/* Inline Consent */}
                            {showConsentPreview && formData.consentDisplayType === 'inline' && (
                              <div style={{
                                backgroundColor: '#f9fafb',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                border: '1px solid #e5e7eb',
                                padding: '16px'
                              }}>
                                <h3 style={{
                                  margin: '0 0 12px 0',
                                  fontSize: '16px',
                                  fontWeight: 600,
                                  color: '#111827'
                                }}>
                                  {formData.consentTitle}
                                </h3>
                                <p style={{
                                  margin: '0 0 12px 0',
                                  fontSize: '13px',
                                  lineHeight: '1.5',
                                  color: '#4b5563'
                                }}>
                                  {formData.consentMessage}
                                </p>
                                {(formData.consentPrivacyUrl || formData.consentTermsUrl) && (
                                  <div style={{
                                    fontSize: '13px',
                                    textAlign: 'center',
                                    marginBottom: '12px'
                                  }}>
                                    {formData.consentTermsUrl && (
                                      <a href={formData.consentTermsUrl} target="_blank" rel="noopener noreferrer" style={{
                                        color: formData.primaryColor,
                                        textDecoration: 'none',
                                        fontWeight: 500
                                      }}>
                                        Terms of Service
                                      </a>
                                    )}
                                    {formData.consentTermsUrl && formData.consentPrivacyUrl && ' • '}
                                    {formData.consentPrivacyUrl && (
                                      <a href={formData.consentPrivacyUrl} target="_blank" rel="noopener noreferrer" style={{
                                        color: formData.primaryColor,
                                        textDecoration: 'none',
                                        fontWeight: 500
                                      }}>
                                        Privacy Policy
                                      </a>
                                    )}
                                  </div>
                                )}
                                <div style={{
                                  display: 'flex',
                                  gap: '8px',
                                  justifyContent: 'flex-end'
                                }}>
                                  <button
                                    onClick={handleConsentDecline}
                                    style={{
                                      padding: '8px 16px',
                                      border: 'none',
                                      borderRadius: '6px',
                                      fontSize: '13px',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      backgroundColor: '#f3f4f6',
                                      color: '#374151'
                                    }}
                                  >
                                    {formData.consentDeclineText}
                                  </button>
                                  <button
                                    onClick={handleConsentAccept}
                                    style={{
                                      padding: '8px 16px',
                                      border: 'none',
                                      borderRadius: '6px',
                                      fontSize: '13px',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      backgroundColor: formData.primaryColor,
                                      color: 'white'
                                    }}
                                  >
                                    {formData.consentAcceptText}
                                  </button>
                                </div>
                              </div>
                            )}
                            {transcript.length === 0 ? (
                              <div style={{ textAlign: 'center', color: '#666', fontSize: `${formData.fontSize}px` }}>
                                {formData.welcomeMessage}
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {transcript.map((msg, idx) => (
                                  <div
                                    key={idx}
                                    style={{
                                      padding: '10px 14px',
                                      borderRadius: '12px',
                                      fontSize: `${formData.fontSize}px`,
                                      maxWidth: '80%',
                                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                      backgroundColor: msg.role === 'user' ? formData.userMessageBgColor : (formData.assistantMessageBgColor || `${formData.primaryColor}15`),
                                      color: msg.role === 'user' ? formData.userMessageTextColor : formData.assistantMessageTextColor,
                                      marginLeft: msg.role === 'user' ? 'auto' : '0'
                                    }}
                                  >
                                    {msg.text}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Controls */}
                          <div style={{ padding: '16px 20px', borderTop: '1px solid #eee' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {previewState === 'active' && formData.enableMuteButton && (
                                <button
                                  type="button"
                                  onClick={toggleMute}
                                  style={{
                                    flex: '1',
                                    padding: '12px',
                                    border: 'none',
                                    borderRadius: `${formData.borderRadius * 0.5}px`,
                                    fontSize: `${formData.fontSize}px`,
                                    fontWeight: formData.fontWeight,
                                    cursor: 'pointer',
                                    backgroundColor: isMuted ? formData.mutedButtonColor : formData.muteButtonColor,
                                    color: 'white'
                                  }}
                                >
                                  {isMuted ? formData.unmuteButtonText : formData.muteButtonText}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={previewState === 'active' ? stopCall : startCall}
                                disabled={previewState === 'connecting'}
                                style={{
                                  flex: '1',
                                  padding: '12px',
                                  border: 'none',
                                  borderRadius: `${formData.borderRadius * 0.5}px`,
                                  fontSize: `${formData.fontSize}px`,
                                  fontWeight: formData.fontWeight,
                                  cursor: previewState === 'connecting' ? 'not-allowed' : 'pointer',
                                  backgroundColor: previewState === 'active' ? '#dc3545' : formData.primaryColor,
                                  color: 'white',
                                  opacity: previewState === 'connecting' ? 0.6 : 1
                                }}
                              >
                                {previewState === 'connecting' ? 'Connecting...' : previewState === 'active' ? 'End Call' : formData.buttonText}
                              </button>
                            </div>
                          </div>

                          {/* Footer */}
                          {formData.enableFooter && (
                            <div style={{
                              padding: '12px 20px',
                              textAlign: 'center',
                              fontSize: '11px',
                              color: formData.footerTextColor,
                              borderTop: '1px solid #e5e7eb',
                              backgroundColor: formData.backgroundColor,
                            }}>
                              {formData.footerText}{' '}
                              <a
                                href={formData.footerLinkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: formData.footerLinkColor || formData.primaryColor,
                                  textDecoration: 'none',
                                  fontWeight: '500',
                                }}
                              >
                                {formData.footerLinkText}
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {formData.type === 'inline' && (
                    <div className="flex items-center justify-center h-full">
                      <button
                        type="button"
                        className={`preview-inline-button ${formData.enableGlow ? 'glow' : ''}`}
                        onClick={previewState === 'active' ? stopCall : startCall}
                        disabled={previewState === 'connecting'}
                        style={{
                          width: formData.inlineButtonWidth,
                          height: `${formData.inlineButtonHeight}px`,
                          backgroundColor: previewState === 'active' ? formData.activeColor : previewState === 'hover' ? formData.hoverColor : formData.primaryColor,
                          justifyContent: formData.textAlign === 'left' ? 'flex-start' : formData.textAlign === 'right' ? 'flex-end' : 'center',
                          marginTop: `${formData.marginTop}px`,
                          marginRight: `${formData.marginRight}px`,
                          marginBottom: `${formData.marginBottom}px`,
                          marginLeft: `${formData.marginLeft}px`,
                          color: previewState === 'active' ? formData.activeTextColor : previewState === 'hover' ? formData.hoverTextColor : formData.buttonTextColor,
                          border: formData.inlineBorderWidth > 0 ? `${formData.inlineBorderWidth}px ${formData.inlineBorderStyle} ${formData.inlineBorderColor}` : 'none',
                          borderRadius: `${formData.borderRadius}px`,
                          padding: `${formData.buttonPadding}px`,
                          cursor: previewState === 'connecting' ? 'not-allowed' : 'pointer',
                          fontSize: `${formData.fontSize}px`,
                          fontWeight: formData.fontWeight,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          boxShadow: formData.shadowIntensity === 'none'
                            ? 'none'
                            : formData.shadowIntensity === 'light'
                              ? '0 2px 8px rgba(0,0,0,0.1)'
                              : formData.shadowIntensity === 'medium'
                                ? '0 4px 12px rgba(0,0,0,0.15)'
                                : '0 8px 24px rgba(0,0,0,0.25)',
                          opacity: previewState === 'connecting' ? 0.6 : 1
                        }}
                        onMouseEnter={() => previewState === 'idle' && setPreviewState('hover')}
                        onMouseLeave={() => previewState === 'hover' && setPreviewState('idle')}
                      >
                        {formData.enableSymbol && formData.symbolPosition === 'left' && (
                          <div
                            style={{
                              width: `${formData.symbolSize}px`,
                              height: `${formData.symbolSize}px`,
                              backgroundColor: formData.symbolBackgroundColor,
                              color: formData.symbolTextColor,
                              borderRadius: `${formData.symbolBorderRadius}px`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: `${formData.symbolSize * 0.6}px`,
                            }}
                          >
                            {formData.symbolText}
                          </div>
                        )}

                        {previewState === 'active' ? (
                          <span>{formData.activeText}</span>
                        ) : previewState === 'connecting' ? (
                          <span>{formData.connectingText}</span>
                        ) : formData.enableSlideEffect && formData.hoverTransitionType !== 'color' ? (
                          <div className="preview-button-text-container">
                            <span className={`preview-button-text slide-${formData.slideDirection}`}>
                              {formData.buttonText}
                            </span>
                            <span className={`preview-button-text-hover slide-${formData.slideDirection}`}>
                              {formData.hoverText}
                            </span>
                          </div>
                        ) : (
                          <span>
                            {previewState === 'hover' && formData.hoverTransitionType !== 'color'
                              ? formData.hoverText
                              : formData.buttonText}
                          </span>
                        )}

                        {formData.enableSymbol && formData.symbolPosition === 'right' && (
                          <div
                            style={{
                              width: `${formData.symbolSize}px`,
                              height: `${formData.symbolSize}px`,
                              backgroundColor: formData.symbolBackgroundColor,
                              color: formData.symbolTextColor,
                              borderRadius: `${formData.symbolBorderRadius}px`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: `${formData.symbolSize * 0.6}px`,
                            }}
                          >
                            {formData.symbolText}
                          </div>
                        )}
                      </button>
                    </div>
                  )}

                  {formData.type === 'page' && (
                    <div className="flex items-center justify-center h-full">
                      <div
                        style={{
                          width: '100%',
                          maxWidth: `${formData.panelWidth}px`,
                          backgroundColor: formData.backgroundColor,
                          borderRadius: `${formData.borderRadius}px`,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Header */}
                        <div style={{
                          backgroundColor: formData.primaryColor,
                          color: 'white',
                          padding: `${formData.panelPadding}px`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            flex: 1
                          }}>
                            {formData.logoUrl && formData.logoPosition === 'header' && (
                              <div style={{
                                display: 'flex',
                                justifyContent: formData.logoAlignment === 'left' ? 'flex-start' : formData.logoAlignment === 'right' ? 'flex-end' : 'center',
                                flex: formData.logoAlignment === 'center' ? 1 : 'none'
                              }}>
                                <div style={{
                                  width: `${formData.logoSize}px`,
                                  height: `${formData.logoSize}px`,
                                  borderRadius: formData.logoShape === 'circle' ? '50%' : formData.logoShape === 'square' ? '0' : '8px',
                                  backgroundColor: formData.logoBackgroundColor,
                                  border: `${formData.logoBorderWidth}px ${formData.logoBorderStyle} ${formData.logoBorderColor}`,
                                  padding: `${formData.logoPadding}px`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  overflow: 'hidden'
                                }}>
                                  <img
                                    src={formData.logoUrl}
                                    alt="Logo"
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'contain',
                                      transform: `translate(${formData.logoOffsetX}px, ${formData.logoOffsetY}px)`
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                            <div style={{
                              flex: 1,
                              textAlign: formData.companyNameAlignment
                            }}>
                              <div style={{
                                fontSize: `${formData.companyNameFontSize}px`,
                                fontWeight: formData.fontWeight,
                                fontFamily: formData.companyNameFontFamily,
                                color: formData.companyNameColor
                              }}>
                                {formData.companyName || 'Voice Assistant'}
                              </div>
                            </div>
                          </div>
                          {transcript.length > 0 && (
                            <button
                              onClick={() => setTranscript([])}
                              title="Clear chat"
                              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* Body */}
                        <div style={{ padding: `${formData.panelPadding}px`, color: formData.textColor, maxHeight: '300px', overflowY: 'auto' }}>
                          {/* Inline Consent */}
                          {showConsentPreview && formData.consentDisplayType === 'inline' && (
                            <div style={{
                              backgroundColor: '#f9fafb',
                              borderRadius: '8px',
                              marginBottom: '16px',
                              border: '1px solid #e5e7eb',
                              padding: '16px'
                            }}>
                              <h3 style={{
                                margin: '0 0 12px 0',
                                fontSize: '16px',
                                fontWeight: 600,
                                color: '#111827'
                              }}>
                                {formData.consentTitle}
                              </h3>
                              <p style={{
                                margin: '0 0 12px 0',
                                fontSize: '13px',
                                lineHeight: '1.5',
                                color: '#4b5563'
                              }}>
                                {formData.consentMessage}
                              </p>
                              {(formData.consentPrivacyUrl || formData.consentTermsUrl) && (
                                <div style={{
                                  fontSize: '13px',
                                  textAlign: 'center',
                                  marginBottom: '12px'
                                }}>
                                  {formData.consentTermsUrl && (
                                    <a href={formData.consentTermsUrl} target="_blank" rel="noopener noreferrer" style={{
                                      color: formData.primaryColor,
                                      textDecoration: 'none',
                                      fontWeight: 500
                                    }}>
                                      Terms of Service
                                    </a>
                                  )}
                                  {formData.consentTermsUrl && formData.consentPrivacyUrl && ' • '}
                                  {formData.consentPrivacyUrl && (
                                    <a href={formData.consentPrivacyUrl} target="_blank" rel="noopener noreferrer" style={{
                                      color: formData.primaryColor,
                                      textDecoration: 'none',
                                      fontWeight: 500
                                    }}>
                                      Privacy Policy
                                    </a>
                                  )}
                                </div>
                              )}
                              <div style={{
                                display: 'flex',
                                gap: '8px',
                                justifyContent: 'flex-end'
                              }}>
                                <button
                                  onClick={handleConsentDecline}
                                  style={{
                                    padding: '8px 16px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151'
                                  }}
                                >
                                  {formData.consentDeclineText}
                                </button>
                                <button
                                  onClick={handleConsentAccept}
                                  style={{
                                    padding: '8px 16px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    backgroundColor: formData.primaryColor,
                                    color: 'white'
                                  }}
                                >
                                  {formData.consentAcceptText}
                                </button>
                              </div>
                            </div>
                          )}
                          {transcript.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#666', fontSize: `${formData.fontSize}px`, marginBottom: `${formData.panelPadding}px` }}>
                              {formData.welcomeMessage}
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: `${formData.panelPadding}px` }}>
                              {transcript.map((msg, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    padding: '10px 14px',
                                    borderRadius: '12px',
                                    fontSize: `${formData.fontSize}px`,
                                    maxWidth: '80%',
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    backgroundColor: msg.role === 'user' ? formData.userMessageBgColor : (formData.assistantMessageBgColor || `${formData.primaryColor}15`),
                                    color: msg.role === 'user' ? formData.userMessageTextColor : formData.assistantMessageTextColor,
                                    marginLeft: msg.role === 'user' ? 'auto' : '0'
                                  }}
                                >
                                  {msg.text}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Controls */}
                        <div style={{ padding: `${formData.panelPadding}px`, borderTop: '1px solid #eee' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {previewState === 'active' && formData.enableMuteButton && (
                              <button
                                type="button"
                                onClick={toggleMute}
                                style={{
                                  flex: '1',
                                  padding: `${formData.buttonPadding}px`,
                                  border: 'none',
                                  borderRadius: `${formData.borderRadius}px`,
                                  fontSize: `${formData.fontSize}px`,
                                  fontWeight: formData.fontWeight,
                                  cursor: 'pointer',
                                  backgroundColor: isMuted ? formData.mutedButtonColor : formData.muteButtonColor,
                                  color: 'white'
                                }}
                              >
                                {isMuted ? formData.unmuteButtonText : formData.muteButtonText}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={previewState === 'active' ? stopCall : startCall}
                              disabled={previewState === 'connecting'}
                              style={{
                                flex: '1',
                                width: '100%',
                                padding: `${formData.buttonPadding}px`,
                                border: 'none',
                                borderRadius: `${formData.borderRadius}px`,
                                fontSize: `${formData.fontSize}px`,
                                fontWeight: formData.fontWeight,
                                cursor: previewState === 'connecting' ? 'not-allowed' : 'pointer',
                                backgroundColor: previewState === 'active' ? '#dc3545' : formData.primaryColor,
                                color: formData.buttonTextColor,
                                opacity: previewState === 'connecting' ? 0.6 : 1
                              }}
                            >
                              {previewState === 'connecting' ? 'Connecting...' : previewState === 'active' ? 'End Call' : formData.buttonText}
                            </button>
                          </div>
                        </div>

                        {/* Footer */}
                        {formData.enableFooter && (
                          <div style={{
                            padding: '12px 20px',
                            textAlign: 'center',
                            fontSize: '11px',
                            color: formData.footerTextColor,
                            borderTop: '1px solid #e5e7eb',
                            backgroundColor: formData.backgroundColor,
                          }}>
                            {formData.footerText}{' '}
                            <a
                              href={formData.footerLinkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: formData.footerLinkColor || formData.primaryColor,
                                textDecoration: 'none',
                                fontWeight: '500',
                              }}
                            >
                              {formData.footerLinkText}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-800 text-center">
                    {vapiInstance ? (
                      <>
                        <span className="font-semibold">✨ Fully Functional Preview:</span> Click the button to start a real call and test your widget!
                      </>
                    ) : (
                      <>
                        <span className="font-semibold">Preview Mode:</span> Add your Vapi API credentials in the Advanced tab to test calls.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Consent Modal - Only show if displayType is 'modal' */}
        {showConsentPreview && formData.consentDisplayType === 'modal' && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '24px 24px 16px',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#111827'
                }}>
                  {formData.consentTitle}
                </h3>
              </div>
              <div style={{
                padding: '24px'
              }}>
                <p style={{
                  margin: '0 0 16px 0',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#4b5563'
                }}>
                  {formData.consentMessage}
                </p>
                {(formData.consentPrivacyUrl || formData.consentTermsUrl) && (
                  <div style={{
                    fontSize: '14px',
                    textAlign: 'center'
                  }}>
                    {formData.consentTermsUrl && (
                      <a href={formData.consentTermsUrl} target="_blank" rel="noopener noreferrer" style={{
                        color: formData.primaryColor,
                        textDecoration: 'none',
                        fontWeight: 500
                      }}>
                        Terms of Service
                      </a>
                    )}
                    {formData.consentTermsUrl && formData.consentPrivacyUrl && ' • '}
                    {formData.consentPrivacyUrl && (
                      <a href={formData.consentPrivacyUrl} target="_blank" rel="noopener noreferrer" style={{
                        color: formData.primaryColor,
                        textDecoration: 'none',
                        fontWeight: 500
                      }}>
                        Privacy Policy
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div style={{
                padding: '16px 24px 24px',
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={handleConsentDecline}
                  style={{
                    padding: '10px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: '#f3f4f6',
                    color: '#374151'
                  }}
                >
                  {formData.consentDeclineText}
                </button>
                <button
                  onClick={handleConsentAccept}
                  style={{
                    padding: '10px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: formData.primaryColor,
                    color: 'white'
                  }}
                >
                  {formData.consentAcceptText}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
