# Quick Start Deployment Guide

Get your widget deployed in under 5 minutes!

## Prerequisites

- [ ] Vapi account ([sign up here](https://vapi.ai))
- [ ] Public API Key from Vapi dashboard
- [ ] Assistant ID from Vapi dashboard
- [ ] Git installed
- [ ] Node.js 18+ installed

## Step-by-Step Deployment

### 1. Get Vapi Credentials

1. Go to [Vapi Dashboard](https://dashboard.vapi.ai)
2. Copy your **Public API Key**
3. Create an Assistant and copy its **ID**

### 2. Build the Widget

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

This creates optimized files in the `dist/` folder.

### 3. Choose Your Deployment Method

#### Option A: Netlify (Easiest - Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

Your widget will be available at: `https://your-site.netlify.app/widget.iife.js`

#### Option B: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

Your widget will be available at: `https://your-project.vercel.app/widget.iife.js`

#### Option C: GitHub Pages

```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/voice-chat-widget.git
git push -u origin main
```

Then in GitHub:
1. Go to Settings → Pages
2. Source: GitHub Actions
3. The workflow will auto-deploy

Your widget will be at: `https://yourusername.github.io/voice-chat-widget/widget.iife.js`

### 4. Share with Your Clients

Provide your clients with this code snippet:

```html
<!-- Add this before closing </body> tag -->
<script>
  window.voiceChatWidgetConfig = {
    publicApiKey: 'YOUR_VAPI_PUBLIC_API_KEY',
    assistantId: 'YOUR_VAPI_ASSISTANT_ID',
    primaryColor: '#007bff',
    position: 'bottom-right',
    companyName: 'Your Company'
  };
</script>
<script src="https://YOUR-DEPLOYMENT-URL/widget.iife.js"></script>
```

Replace:
- `YOUR_VAPI_PUBLIC_API_KEY` with your Vapi public API key
- `YOUR_VAPI_ASSISTANT_ID` with your assistant ID
- `YOUR-DEPLOYMENT-URL` with your actual deployment URL

## Test Your Deployment

```bash
# Make scripts executable (Linux/Mac)
chmod +x scripts/test-deployment.sh

# Run test
./scripts/test-deployment.sh https://your-deployment-url/widget.iife.js
```

Or create a test HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Widget Test</title>
</head>
<body>
  <h1>Testing Voice Chat Widget</h1>

  <script>
    window.voiceChatWidgetConfig = {
      publicApiKey: 'YOUR_VAPI_PUBLIC_API_KEY',
      assistantId: 'YOUR_VAPI_ASSISTANT_ID'
    };
  </script>
  <script src="https://your-deployment-url/widget.iife.js"></script>
</body>
</html>
```

Open in browser and click the floating button in the bottom-right corner.

## Common Customizations

### Change Colors

```javascript
window.voiceChatWidgetConfig = {
  publicApiKey: 'YOUR_KEY',
  assistantId: 'YOUR_ID',
  primaryColor: '#6366f1'  // Your brand color
};
```

### Change Position

```javascript
window.voiceChatWidgetConfig = {
  publicApiKey: 'YOUR_KEY',
  assistantId: 'YOUR_ID',
  position: 'bottom-left'  // or 'top-right', 'top-left'
};
```

### Add Logo and Company Name

```javascript
window.voiceChatWidgetConfig = {
  publicApiKey: 'YOUR_KEY',
  assistantId: 'YOUR_ID',
  logoUrl: 'https://yourcompany.com/logo.png',
  companyName: 'Your Company'
};
```

### Custom Welcome Message

```javascript
window.voiceChatWidgetConfig = {
  publicApiKey: 'YOUR_KEY',
  assistantId: 'YOUR_ID',
  welcomeMessage: 'Hi! How can I help you today?'
};
```

## Updating the Widget

### For Clients

Clients don't need to do anything! Just rebuild and redeploy:

```bash
npm run build
netlify deploy --prod
# or
vercel --prod
```

The widget will auto-update for all clients.

### Version Management

To create a new version:

```bash
# Patch version (1.0.0 → 1.0.1)
npm run release:patch

# Minor version (1.0.0 → 1.1.0)
npm run release:minor

# Major version (1.0.0 → 2.0.0)
npm run release:major
```

## Troubleshooting

### Widget doesn't appear

1. Check browser console for errors
2. Verify the script URL is correct
3. Ensure you're using HTTPS on both sites
4. Check CORS headers are set

### "Invalid API Key" error

1. Verify your Vapi Public API Key
2. Don't use your Private API Key (must be Public)
3. Check for typos

### Voice not working

1. Ensure microphone permissions are granted
2. Check browser console for errors
3. Verify assistant ID is correct
4. Test in Chrome (best browser support)

## Need More Help?

- 📖 [Full Deployment Guide](./DEPLOYMENT.md)
- 📚 [Complete Documentation](./README.md)
- 🐛 [Report Issues](https://github.com/your-org/voice-chat-widget/issues)
- 📧 Email: support@yourdomain.com

## Next Steps

- [ ] Set up custom domain
- [ ] Add analytics tracking
- [ ] Create multiple assistants for different use cases
- [ ] Customize widget appearance to match your brand
- [ ] Set up monitoring and alerts

---

**Congratulations!** 🎉 Your voice chat widget is now deployed and ready to use!
