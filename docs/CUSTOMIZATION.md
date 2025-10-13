# Widget Customization Guide

This guide explains how to create custom widgets for your clients.

## Quick Start: Visual Builder

The easiest way to create a custom widget is using the **visual builder**:

1. Open `create-custom-widget.html` in your browser
2. Fill in your Vapi credentials and customization options
3. Copy the generated embed code
4. Share it with your client

## Customization Options

### 1. Visual Customization

**Primary Color**
- Changes the main theme color of the widget
- Use your client's brand color
- Example: `#3b82f6` (blue), `#10b981` (green), `#f59e0b` (orange)

**Position**
- `bottom-right` - Most common position
- `bottom-left` - Good for sites with right-side CTAs
- `top-right` - Less intrusive
- `top-left` - Rare, use when other corners are occupied

**Button Size**
- Range: 40-100 pixels
- Default: 60px
- Larger buttons (70-80px) are more visible
- Smaller buttons (50-60px) are more subtle

**Logo**
- Use square images (1:1 aspect ratio)
- Recommended size: 256x256px or larger
- Formats: PNG with transparency works best
- Displays in the widget header

**Company Name**
- Shows in the widget header
- Keep it short (2-3 words)
- Example: "Acme Support", "Sales Team"

### 2. Content Customization

**Welcome Message**
- First message users see
- Keep it friendly and brief
- Example: "Hi! How can I help you today?"
- Max recommended: 100 characters

**Show Transcript**
- `true` - Display live conversation (recommended)
- `false` - Voice only, no text display

**Enable Chat**
- `true` - Show chat interface (default)
- `false` - Voice-only mode

### 3. Behavior Customization

You can add custom event handlers:

```javascript
window.voiceChatWidgetConfig = {
  publicApiKey: 'pk_...',
  assistantId: 'asst_...',

  // Event callbacks
  onCallStart: () => {
    console.log('Call started');
    // Track analytics
    // Update page UI
  },

  onCallEnd: () => {
    console.log('Call ended');
    // Show feedback form
    // Track analytics
  },

  onError: (error) => {
    console.error('Widget error:', error);
    // Show error message
    // Report to error tracking service
  }
};
```

## Creating Custom Configurations

### Method 1: Using the Visual Builder

1. Open `http://localhost:5173/create-custom-widget.html`
2. Configure all options
3. Copy the generated code
4. Give it to your client

### Method 2: JSON Configuration Files

Create a JSON file in the `configs/` directory:

```json
{
  "name": "acme-corp",
  "publicApiKey": "pk_1234567890",
  "assistantId": "asst_abcdefgh",
  "primaryColor": "#3b82f6",
  "position": "bottom-right",
  "buttonSize": 70,
  "companyName": "Acme Corp",
  "logoUrl": "https://acmecorp.com/logo.png",
  "welcomeMessage": "Welcome to Acme! How can we help?",
  "showTranscript": true,
  "enableChat": true
}
```

### Method 3: Direct JavaScript Configuration

```html
<script>
  window.voiceChatWidgetConfig = {
    publicApiKey: 'pk_1234567890',
    assistantId: 'asst_abcdefgh',
    primaryColor: '#3b82f6',
    position: 'bottom-right',
    companyName: 'Acme Corp',
    logoUrl: 'https://acmecorp.com/logo.png'
  };
</script>
<script src="https://your-deployment-url.vercel.app/widget.iife.js"></script>
```

## Industry-Specific Examples

### Healthcare

```javascript
{
  primaryColor: '#10b981',
  companyName: 'HealthCare Support',
  welcomeMessage: 'Hello! How can we assist with your healthcare needs?',
  showTranscript: true
}
```

### E-commerce

```javascript
{
  primaryColor: '#f59e0b',
  companyName: 'Shopping Assistant',
  welcomeMessage: 'Hi! Need help finding something?',
  position: 'bottom-right'
}
```

### Financial Services

```javascript
{
  primaryColor: '#1e40af',
  companyName: 'Financial Advisor',
  welcomeMessage: 'Welcome! How can we help with your financial needs?',
  buttonSize: 70
}
```

### Tech Support

```javascript
{
  primaryColor: '#8b5cf6',
  companyName: 'Tech Support',
  welcomeMessage: 'Having technical issues? Let\'s fix it together!',
  showTranscript: true
}
```

## Advanced Customization

### Custom Styling

For deeper customization, you can override CSS:

```html
<style>
  /* Override widget styles */
  .voice-chat-widget .voice-chat-button {
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4) !important;
  }

  .voice-chat-widget .voice-chat-panel {
    border: 2px solid #667eea !important;
  }
</style>
```

### Multiple Widgets

You can have multiple widgets on the same page:

```html
<script type="module">
  import { VoiceChatWidget } from './src/index.ts';

  // Support widget
  const support = new VoiceChatWidget({
    publicApiKey: 'pk_...',
    assistantId: 'asst_support',
    position: 'bottom-right',
    primaryColor: '#3b82f6',
    companyName: 'Support'
  });
  support.mount();

  // Sales widget
  const sales = new VoiceChatWidget({
    publicApiKey: 'pk_...',
    assistantId: 'asst_sales',
    position: 'bottom-left',
    primaryColor: '#10b981',
    companyName: 'Sales'
  });
  sales.mount();
</script>
```

### Conditional Loading

Load widget only on specific pages:

```html
<script>
  // Only load on support pages
  if (window.location.pathname.includes('/support')) {
    window.voiceChatWidgetConfig = {
      publicApiKey: 'pk_...',
      assistantId: 'asst_...'
    };

    // Load widget script
    const script = document.createElement('script');
    script.src = 'https://your-deployment-url.vercel.app/widget.iife.js';
    document.body.appendChild(script);
  }
</script>
```

## Best Practices

1. **Test Before Deploying**
   - Test on the actual client website
   - Check mobile responsiveness
   - Verify colors match brand

2. **Performance**
   - Widget loads asynchronously
   - Doesn't block page rendering
   - Minimal bundle size (~50KB)

3. **Accessibility**
   - Widget has proper ARIA labels
   - Keyboard accessible
   - Screen reader friendly

4. **Security**
   - Always use Public API keys (not private)
   - Each client gets their own assistant
   - API keys are safe in client-side code

5. **Branding**
   - Use client's exact brand colors
   - Include their logo
   - Match their tone in messages

## Troubleshooting

**Widget not appearing?**
- Check browser console for errors
- Verify script URL is correct
- Ensure credentials are valid

**Wrong colors?**
- Check primaryColor format (must be hex: #RRGGBB)
- Clear browser cache
- Verify CSS isn't being overridden

**Widget in wrong position?**
- Check for CSS conflicts
- Verify z-index is high enough (default: 9999)
- Check if other elements are blocking it

## Client Onboarding Checklist

- [ ] Get Vapi credentials from client or create for them
- [ ] Determine brand colors and get logo
- [ ] Configure widget using visual builder
- [ ] Test on staging environment
- [ ] Get client approval
- [ ] Deploy to production
- [ ] Provide embed code to client
- [ ] Test on live website
- [ ] Monitor for issues

## Support

For customization help:
- See examples in `configs/` directory
- Use the visual builder at `create-custom-widget.html`
- Read the main README.md for technical details
