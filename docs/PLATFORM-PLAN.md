# Voice Chat Widget Builder - SaaS Platform Plan

## Overview
A web application where users can create, customize, and deploy voice chat widgets for their websites.

## Architecture

### 1. **Frontend Dashboard** (React/Next.js)
Where users create and customize their widgets
- User authentication
- Widget builder interface (visual editor)
- Widget management (list, edit, delete)
- Analytics dashboard
- Billing/subscription management

### 2. **Widget Rendering Engine** (Vanilla JS/TypeScript)
The actual widget that runs on client websites
- Lightweight (~50KB)
- Framework-agnostic
- Supports multiple display types
- Real-time customization rendering

### 3. **Backend API** (Next.js API routes or Express)
- User management
- Widget CRUD operations
- Configuration storage
- Analytics tracking
- Embed code generation

### 4. **Database** (PostgreSQL/MongoDB/Supabase)
Stores:
- User accounts
- Widget configurations
- Analytics data
- Vapi credentials

## Features Breakdown

### Phase 1: Core Platform (MVP)
1. ✅ User authentication (email/password, OAuth)
2. ✅ Widget builder interface
3. ✅ Three widget types: Floating, Inline, Full Page
4. ✅ Visual customization panel
5. ✅ Embed code generation
6. ✅ Basic widget rendering engine

### Phase 2: Advanced Customization
1. ✅ Full CSS editor
2. ✅ Custom styling options:
   - Colors (primary, secondary, background, text)
   - Dimensions (width, height, border radius)
   - Spacing (padding, margin)
   - Typography (font family, size, weight)
   - Borders (width, style, color)
   - Shadows (box-shadow, text-shadow)
   - Animations (hover, click, entrance, exit)
   - Positioning (fixed, absolute, relative)
3. ✅ Live preview
4. ✅ Responsive design settings

### Phase 3: Widget Types

#### A. **Floating Widget**
- Position: fixed to viewport
- Placement: 9-point positioning system
  - Top: left, center, right
  - Middle: left, center, right
  - Bottom: left, center, right
- Customizable offset (x, y)
- Z-index control
- Minimize/maximize behavior
- Draggable option

#### B. **Inline Widget**
- Embeds in page content
- Div-based placement
- Full width or custom width
- Responsive sizing
- Custom container styling

#### C. **Full Page Widget**
- Takes entire viewport
- Modal overlay
- Lightbox mode
- Custom background overlay
- Close button positioning

### Phase 4: Advanced Features
1. ✅ Custom CSS injection
2. ✅ JavaScript hooks
3. ✅ Multiple widgets per account
4. ✅ Widget versioning
5. ✅ A/B testing
6. ✅ Analytics integration
7. ✅ White-labeling

## Technical Stack

### Recommended Stack:
```
Frontend: Next.js 14 (App Router)
UI: Tailwind CSS + shadcn/ui
Auth: NextAuth.js or Clerk
Database: Supabase (PostgreSQL + Auth + Storage)
Hosting: Vercel
CDN: Vercel Edge Network
Widget: TypeScript + Vite
```

### Alternative Stack:
```
Frontend: React + Vite
Backend: Express.js
Auth: Firebase Auth
Database: MongoDB Atlas
Hosting: Netlify/Vercel
Widget: Vanilla TypeScript
```

## Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  subscription_tier VARCHAR(50) DEFAULT 'free'
);

-- Widgets table
CREATE TABLE widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'floating', 'inline', 'page'
  config JSONB NOT NULL, -- All customization settings
  vapi_public_key VARCHAR(255),
  vapi_assistant_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Widget analytics table
CREATE TABLE widget_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id UUID REFERENCES widgets(id) ON DELETE CASCADE,
  event_type VARCHAR(50), -- 'view', 'open', 'close', 'call_start', 'call_end'
  session_id VARCHAR(255),
  user_agent TEXT,
  ip_address INET,
  page_url TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Widget versions (for A/B testing)
CREATE TABLE widget_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id UUID REFERENCES widgets(id) ON DELETE CASCADE,
  version_name VARCHAR(255),
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Widget Configuration JSON Structure

```json
{
  "type": "floating",
  "display": {
    "position": "bottom-right",
    "offsetX": 20,
    "offsetY": 20,
    "zIndex": 9999
  },
  "dimensions": {
    "buttonSize": 60,
    "panelWidth": 380,
    "panelHeight": 600
  },
  "colors": {
    "primary": "#667eea",
    "secondary": "#764ba2",
    "background": "#ffffff",
    "text": "#333333",
    "buttonBackground": "#667eea",
    "buttonText": "#ffffff"
  },
  "typography": {
    "fontFamily": "Inter, sans-serif",
    "fontSize": {
      "title": 16,
      "body": 14,
      "small": 12
    },
    "fontWeight": {
      "title": 600,
      "body": 400
    }
  },
  "borders": {
    "radius": 16,
    "width": 0,
    "color": "#e5e5e5",
    "style": "solid"
  },
  "shadows": {
    "button": "0 4px 12px rgba(0, 0, 0, 0.15)",
    "panel": "0 8px 32px rgba(0, 0, 0, 0.12)"
  },
  "animations": {
    "entrance": "fadeIn",
    "exit": "fadeOut",
    "hover": "scale",
    "duration": 300
  },
  "content": {
    "companyName": "Your Company",
    "logoUrl": "",
    "welcomeMessage": "How can we help?",
    "buttonIcon": "microphone"
  },
  "behavior": {
    "autoOpen": false,
    "autoOpenDelay": 3000,
    "closeOnClickOutside": true,
    "draggable": false,
    "minimizable": true
  },
  "vapi": {
    "publicApiKey": "pk_...",
    "assistantId": "asst_..."
  },
  "customCSS": "",
  "customJS": ""
}
```

## User Flow

### 1. **Sign Up / Login**
```
User → Register → Verify Email → Dashboard
```

### 2. **Create Widget**
```
Dashboard → "Create Widget"
  → Choose Type (Floating/Inline/Page)
  → Enter Vapi Credentials
  → Customize Appearance
  → Preview Live
  → Save Widget
  → Get Embed Code
```

### 3. **Embed Widget**
```
Copy Embed Code → Paste in Website → Widget Appears
```

### Example Embed Code:
```html
<!-- Floating Widget -->
<script>
  window.VoiceWidgetConfig = {
    widgetId: 'wid_abc123xyz'
  };
</script>
<script src="https://cdn.yourplatform.com/widget.js"></script>

<!-- Inline Widget -->
<div id="voice-widget-container"></div>
<script src="https://cdn.yourplatform.com/widget.js?id=wid_abc123xyz&type=inline"></script>

<!-- Page Widget -->
<script src="https://cdn.yourplatform.com/widget.js?id=wid_abc123xyz&type=page"></script>
```

## Monetization Strategy

### Free Tier
- 1 widget
- 100 conversations/month
- Basic customization
- Branding watermark

### Pro Tier ($29/month)
- 5 widgets
- 1,000 conversations/month
- Full customization
- No branding
- Analytics

### Business Tier ($99/month)
- Unlimited widgets
- 10,000 conversations/month
- A/B testing
- Priority support
- White-labeling

### Enterprise (Custom)
- Everything in Business
- Custom deployment
- Dedicated support
- SLA

## Next Steps

### Immediate (Current Project)
1. ✅ Build basic widget engine ← We're here
2. ✅ Create simple visual builder
3. ✅ Deploy to Vercel

### Phase 1 (MVP - 2-3 weeks)
1. Build Next.js dashboard
2. Add authentication (Clerk/NextAuth)
3. Set up Supabase database
4. Create widget builder UI
5. Build configuration management
6. Implement embed code generation

### Phase 2 (Full Platform - 4-6 weeks)
1. Advanced customization panel
2. Live preview system
3. Multiple widget types
4. Analytics dashboard
5. User management

### Phase 3 (Scale - Ongoing)
1. A/B testing
2. White-labeling
3. API access
4. Integrations
5. Mobile app

## Questions to Decide:

1. **Authentication**: Clerk (easiest) vs NextAuth (flexible) vs Supabase Auth (integrated)?
2. **Database**: Supabase (all-in-one) vs PostgreSQL + custom backend?
3. **Hosting**: All on Vercel vs separate CDN for widgets?
4. **Pricing**: Free tier or paid-only?
5. **Tech Stack**: Next.js (recommended) vs React + Express?

## Recommendation

Start with:
- **Next.js 14** for the dashboard
- **Supabase** for auth + database
- **Current widget code** as the rendering engine
- **Vercel** for hosting everything
- **Free + paid tiers** for monetization

This gives you a full-stack platform with minimal setup!

Would you like me to start building this platform now?
