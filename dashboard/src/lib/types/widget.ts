export type WidgetType = 'floating' | 'inline' | 'page';

export interface WidgetConfig {
  type: WidgetType;
  display: {
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
    offsetX?: number;
    offsetY?: number;
    zIndex?: number;
  };
  dimensions: {
    buttonSize?: number;
    panelWidth?: number;
    panelHeight?: number;
    width?: string;
    height?: string;
  };
  colors: {
    primary: string;
    secondary?: string;
    background: string;
    text: string;
    buttonBackground?: string;
    buttonText?: string;
  };
  typography?: {
    fontFamily?: string;
    fontSize?: {
      title?: number;
      body?: number;
      small?: number;
    };
    fontWeight?: {
      title?: number;
      body?: number;
    };
  };
  borders?: {
    radius?: number;
    width?: number;
    color?: string;
    style?: string;
  };
  shadows?: {
    button?: string;
    panel?: string;
  };
  animations?: {
    entrance?: string;
    exit?: string;
    hover?: string;
    duration?: number;
    speed?: 'fast' | 'medium' | 'slow';
  };
  content: {
    companyName: string;
    logoUrl?: string;
    welcomeMessage: string;
    buttonIcon?: string;
  };
  behavior?: {
    autoOpen?: boolean;
    autoOpenDelay?: number;
    closeOnClickOutside?: boolean;
    draggable?: boolean;
    minimizable?: boolean;
  };
  vapi: {
    publicApiKey: string;
    assistantId: string;
  };
  // Inline widget specific options
  inline?: {
    enableSymbol?: boolean;
    symbolText?: string;
    symbolPosition?: 'left' | 'right';
    symbolBackgroundColor?: string;
    symbolTextColor?: string;
    symbolSize?: number;
    symbolBorderRadius?: number;
    enableSlideEffect?: boolean;
    hoverText?: string;
    slideDirection?: 'up' | 'down' | 'left' | 'right';
    hoverTransitionType?: 'text' | 'background' | 'both';
    hoverColor?: string;
    hoverScale?: number;
    activeColor?: string;
    connectingText?: string;
    activeText?: string;
    enableRipple?: boolean;
  };
  // Mute button configuration
  muteButton?: {
    enabled?: boolean;
    muteText?: string;
    unmuteText?: string;
    color?: string;
    mutedColor?: string;
  };
  // Consent modal configuration
  consent?: {
    enabled?: boolean;
    title?: string;
    message?: string;
    acceptText?: string;
    declineText?: string;
    privacyUrl?: string;
    termsUrl?: string;
  };
  customCSS?: string;
  customJS?: string;
  // Target container for custom placement
  targetContainer?: string;
}

export interface Widget {
  id: string;
  user_id: string;
  name: string;
  type: WidgetType;
  config: WidgetConfig;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WidgetAnalytics {
  id: string;
  widget_id: string;
  event_type: string;
  session_id?: string;
  page_url?: string;
  user_agent?: string;
  timestamp: string;
}
