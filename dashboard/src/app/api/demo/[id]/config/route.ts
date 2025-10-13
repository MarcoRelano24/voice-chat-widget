import { NextResponse } from 'next/server'
import type { WidgetConfig } from '@/lib/types/widget'

// Demo widget configurations
const demoConfigs: Record<string, WidgetConfig> = {
  'demo-floating-widget': {
    type: 'floating',
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
      primary: '#667eea',
      secondary: '#764ba2',
      background: '#ffffff',
      text: '#333333',
      buttonBackground: '#667eea',
      buttonText: '#ffffff',
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: {
        title: 18,
        body: 15,
        small: 13,
      },
      fontWeight: {
        title: 600,
        body: 400,
      },
    },
    borders: {
      radius: 16,
      width: 0,
      color: '#e0e0e0',
      style: 'solid',
    },
    shadows: {
      button: '0 4px 12px rgba(102, 126, 234, 0.3)',
      panel: '0 8px 32px rgba(0, 0, 0, 0.12)',
    },
    animations: {
      entrance: 'slideUp',
      exit: 'slideDown',
      hover: 'scale',
      speed: 'medium',
    },
    content: {
      companyName: 'Demo Company',
      logoUrl: '',
      welcomeMessage: 'Welcome! Try our voice chat demo.',
      buttonIcon: '',
    },
    behavior: {
      autoOpen: false,
      autoOpenDelay: 0,
      closeOnClickOutside: true,
      draggable: true,
      minimizable: true,
    },
    vapi: {
      publicApiKey: 'demo-public-key',
      assistantId: 'demo-assistant-id',
    },
    muteButton: {
      enabled: true,
      muteText: 'Mute',
      unmuteText: 'Unmute',
      color: '#6b7280',
      mutedColor: '#dc3545',
    },
  },
  'demo-inline-widget-1': {
    type: 'inline',
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
      primary: '#11998e',
      secondary: '#38ef7d',
      background: '#ffffff',
      text: '#333333',
      buttonBackground: '#11998e',
      buttonText: '#ffffff',
    },
    content: {
      companyName: 'Voice Chat',
      logoUrl: '',
      welcomeMessage: 'Start Voice Call',
      buttonIcon: '',
    },
    vapi: {
      publicApiKey: 'demo-public-key',
      assistantId: 'demo-assistant-id',
    },
    inline: {
      enableSymbol: true,
      symbolText: '📞',
      symbolPosition: 'left',
      symbolBackgroundColor: '#ffffff',
      symbolTextColor: '#11998e',
      symbolSize: 32,
      symbolBorderRadius: 50,
      enableSlideEffect: true,
      hoverText: 'Click to Call!',
      slideDirection: 'up',
      hoverTransitionType: 'both',
      hoverColor: '#38ef7d',
      hoverScale: 1.05,
      activeColor: '#dc3545',
      connectingText: 'Connecting...',
      activeText: 'End Call',
      enableRipple: true,
    },
  },
  'demo-inline-widget-hero': {
    type: 'inline',
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
      primary: '#5e72e4',
      background: '#ffffff',
      text: '#333333',
      buttonBackground: '#5e72e4',
      buttonText: '#ffffff',
    },
    content: {
      companyName: 'Voice Chat',
      logoUrl: '',
      welcomeMessage: 'Talk to Sales',
      buttonIcon: '',
    },
    vapi: {
      publicApiKey: 'demo-public-key',
      assistantId: 'demo-assistant-id',
    },
    inline: {
      enableSymbol: true,
      symbolText: '💬',
      symbolPosition: 'left',
      hoverColor: '#324cdd',
      hoverScale: 1.08,
      enableRipple: true,
    },
  },
  'demo-inline-widget-card': {
    type: 'inline',
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
      primary: '#2dce89',
      background: '#ffffff',
      text: '#333333',
      buttonBackground: '#2dce89',
      buttonText: '#ffffff',
    },
    content: {
      companyName: 'Voice Chat',
      logoUrl: '',
      welcomeMessage: 'Get Help',
      buttonIcon: '',
    },
    vapi: {
      publicApiKey: 'demo-public-key',
      assistantId: 'demo-assistant-id',
    },
    inline: {
      enableSymbol: true,
      symbolText: '🎧',
      symbolPosition: 'left',
      hoverColor: '#24a46d',
      enableRipple: true,
    },
  },
  'demo-inline-widget-form': {
    type: 'inline',
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
      primary: '#fb6340',
      background: '#ffffff',
      text: '#333333',
      buttonBackground: '#fb6340',
      buttonText: '#ffffff',
    },
    content: {
      companyName: 'Voice Chat',
      logoUrl: '',
      welcomeMessage: 'Need Assistance?',
      buttonIcon: '',
    },
    vapi: {
      publicApiKey: 'demo-public-key',
      assistantId: 'demo-assistant-id',
    },
    inline: {
      enableSymbol: true,
      symbolText: '🆘',
      symbolPosition: 'left',
      hoverColor: '#ec3617',
      enableRipple: true,
    },
  },
  'demo-page-widget': {
    type: 'page',
    display: {
      position: 'center',
      offsetX: 0,
      offsetY: 0,
      zIndex: 9999,
    },
    dimensions: {
      buttonSize: 60,
      panelWidth: 500,
      panelHeight: 600,
    },
    colors: {
      primary: '#f093fb',
      secondary: '#f5576c',
      background: '#ffffff',
      text: '#333333',
      buttonBackground: '#f093fb',
      buttonText: '#ffffff',
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: {
        title: 20,
        body: 16,
        small: 14,
      },
      fontWeight: {
        title: 700,
        body: 400,
      },
    },
    borders: {
      radius: 20,
      width: 0,
      color: '#e0e0e0',
      style: 'solid',
    },
    shadows: {
      button: '0 8px 20px rgba(240, 147, 251, 0.4)',
      panel: '0 20px 60px rgba(0, 0, 0, 0.3)',
    },
    animations: {
      entrance: 'fadeIn',
      exit: 'fadeOut',
      hover: 'glow',
      speed: 'medium',
    },
    content: {
      companyName: 'Full-Screen Demo',
      logoUrl: '',
      welcomeMessage: 'Experience our immersive voice chat interface',
      buttonIcon: '',
    },
    behavior: {
      autoOpen: true,
      autoOpenDelay: 500,
      closeOnClickOutside: false,
      draggable: false,
      minimizable: true,
    },
    vapi: {
      publicApiKey: 'demo-public-key',
      assistantId: 'demo-assistant-id',
    },
    muteButton: {
      enabled: true,
      muteText: 'Mute',
      unmuteText: 'Unmute',
      color: '#6b7280',
      mutedColor: '#dc3545',
    },
  },
  'demo-advanced-widget': {
    type: 'floating',
    display: {
      position: 'bottom-right',
      offsetX: 30,
      offsetY: 30,
      zIndex: 9999,
    },
    dimensions: {
      buttonSize: 65,
      panelWidth: 400,
      panelHeight: 650,
    },
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      background: '#ffffff',
      text: '#333333',
      buttonBackground: '#667eea',
      buttonText: '#ffffff',
    },
    typography: {
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: {
        title: 18,
        body: 15,
        small: 13,
      },
      fontWeight: {
        title: 700,
        body: 400,
      },
    },
    borders: {
      radius: 20,
      width: 2,
      color: '#e0e0e0',
      style: 'solid',
    },
    shadows: {
      button: '0 8px 20px rgba(102, 126, 234, 0.4)',
      panel: '0 20px 60px rgba(0, 0, 0, 0.25)',
    },
    animations: {
      entrance: 'scale',
      exit: 'fadeOut',
      hover: 'lift',
      speed: 'fast',
    },
    content: {
      companyName: 'Advanced Demo',
      logoUrl: '',
      welcomeMessage: 'Explore all customization features!',
      buttonIcon: '',
    },
    behavior: {
      autoOpen: false,
      autoOpenDelay: 0,
      closeOnClickOutside: true,
      draggable: true,
      minimizable: true,
    },
    vapi: {
      publicApiKey: 'demo-public-key',
      assistantId: 'demo-assistant-id',
    },
    muteButton: {
      enabled: true,
      muteText: 'Mute',
      unmuteText: 'Unmute',
      color: '#6b7280',
      mutedColor: '#dc3545',
    },
    consent: {
      enabled: true,
      title: 'Privacy & Terms',
      message: 'By using this voice assistant, you agree to our Terms of Service and Privacy Policy. This is a demo and no data is actually collected.',
      acceptText: 'I Agree',
      declineText: 'Decline',
      privacyUrl: '#',
      termsUrl: '#',
    },
  },
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const config = demoConfigs[id]

    if (!config) {
      return NextResponse.json(
        { error: 'Demo widget not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(config, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('Error fetching demo widget config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
