# Deployment Guide

This guide covers multiple deployment options for the Voice Chat Widget.

## Table of Contents

1. [Quick Deploy Options](#quick-deploy-options)
2. [GitHub Pages](#github-pages)
3. [Netlify](#netlify)
4. [Vercel](#vercel)
5. [AWS S3 + CloudFront](#aws-s3--cloudfront)
6. [Custom Server](#custom-server)
7. [NPM Package](#npm-package)

---

## Quick Deploy Options

### Option 1: Netlify (Recommended - Easiest)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

1. Click the button above
2. Connect your GitHub repository
3. Netlify will automatically detect settings from `netlify.toml`
4. Click "Deploy site"
5. Your widget will be available at: `https://your-site.netlify.app/widget.iife.js`

### Option 2: Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the button above
2. Import your GitHub repository
3. Vercel will automatically detect settings from `vercel.json`
4. Click "Deploy"
5. Your widget will be available at: `https://your-site.vercel.app/widget.iife.js`

---

## GitHub Pages

### Setup

1. Enable GitHub Pages in your repository settings:
   - Go to Settings → Pages
   - Source: GitHub Actions

2. The included `.github/workflows/deploy.yml` will automatically:
   - Build on every push to main
   - Deploy to GitHub Pages
   - Make your widget available at: `https://yourusername.github.io/voice-chat-widget/widget.iife.js`

3. Push to main branch:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Usage

```html
<script>
  window.voiceChatWidgetConfig = {
    publicApiKey: 'YOUR_VAPI_PUBLIC_API_KEY',
    assistantId: 'YOUR_VAPI_ASSISTANT_ID'
  };
</script>
<script src="https://yourusername.github.io/voice-chat-widget/widget.iife.js"></script>
```

---

## Netlify

### Method 1: CLI Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

### Method 2: Git Integration

1. Push your code to GitHub
2. Go to [Netlify](https://app.netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Netlify will auto-detect `netlify.toml` settings
6. Click "Deploy site"

### Custom Domain

1. In Netlify dashboard, go to Domain settings
2. Add your custom domain (e.g., `widget.yourdomain.com`)
3. Update DNS records as instructed
4. SSL is automatically configured

### Usage

```html
<script src="https://your-site.netlify.app/widget.iife.js"></script>
```

Or with custom domain:
```html
<script src="https://widget.yourdomain.com/widget.iife.js"></script>
```

---

## Vercel

### Method 1: CLI Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Method 2: Git Integration

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Vercel will auto-detect `vercel.json` settings
6. Click "Deploy"

### Usage

```html
<script src="https://your-project.vercel.app/widget.iife.js"></script>
```

---

## AWS S3 + CloudFront

### Setup

1. **Build the widget:**
```bash
npm run build
```

2. **Create S3 bucket:**
```bash
aws s3 mb s3://your-widget-bucket
```

3. **Configure bucket for static hosting:**
```bash
aws s3 website s3://your-widget-bucket \
  --index-document index.html
```

4. **Set bucket policy (for public access):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-widget-bucket/*"
    }
  ]
}
```

5. **Upload files:**
```bash
aws s3 sync dist/ s3://your-widget-bucket/ \
  --cache-control "public, max-age=31536000" \
  --exclude "*.html"

aws s3 cp dist/index.html s3://your-widget-bucket/ \
  --cache-control "no-cache"
```

6. **Create CloudFront distribution:**
```bash
aws cloudfront create-distribution \
  --origin-domain-name your-widget-bucket.s3.amazonaws.com \
  --default-root-object index.html
```

### Configure CORS

Add to S3 bucket CORS configuration:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

### Usage

```html
<script src="https://d1234567890.cloudfront.net/widget.iife.js"></script>
```

---

## Custom Server

### Using Node.js + Express

```javascript
const express = require('express');
const path = require('path');
const app = express();

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Serve static files
app.use(express.static('dist', {
  maxAge: '1y',
  setHeaders: (res, path) => {
    if (path.endsWith('.js') || path.endsWith('.css')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

app.listen(3000, () => {
  console.log('Widget server running on http://localhost:3000');
});
```

### Using Nginx

```nginx
server {
    listen 80;
    server_name widget.yourdomain.com;

    root /var/www/voice-chat-widget/dist;
    index index.html;

    # Enable CORS
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type";

    # Cache static assets
    location ~* \.(js|css)$ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## NPM Package

### Publishing to NPM

1. **Update package.json:**
```json
{
  "name": "@your-org/voice-chat-widget",
  "version": "1.0.0",
  "author": "Your Name",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/voice-chat-widget.git"
  }
}
```

2. **Login to NPM:**
```bash
npm login
```

3. **Publish:**
```bash
npm publish --access public
```

### Using from NPM

```bash
npm install @your-org/voice-chat-widget
```

```javascript
import { VoiceChatWidget } from '@your-org/voice-chat-widget';

const widget = new VoiceChatWidget({
  publicApiKey: 'YOUR_KEY',
  assistantId: 'YOUR_ASSISTANT_ID'
});

widget.mount();
```

---

## CDN Usage (jsDelivr)

After publishing to NPM, your package is automatically available via jsDelivr:

```html
<script src="https://cdn.jsdelivr.net/npm/@your-org/voice-chat-widget@latest/dist/widget.iife.js"></script>
```

Or unpkg:
```html
<script src="https://unpkg.com/@your-org/voice-chat-widget@latest/dist/widget.iife.js"></script>
```

---

## Environment Variables

For sensitive configuration, use environment variables during build:

```bash
# .env
VITE_DEFAULT_API_KEY=your_default_key
VITE_DEFAULT_ASSISTANT_ID=your_default_assistant
```

Access in code:
```typescript
const apiKey = import.meta.env.VITE_DEFAULT_API_KEY;
```

---

## Automated Deployments

The included GitHub Actions workflow automatically:

- ✅ Builds on every push to main
- ✅ Runs type checking
- ✅ Creates build artifacts
- ✅ Deploys to GitHub Pages
- ✅ Publishes to NPM on releases

### Creating a Release

```bash
# Tag a new version
git tag v1.0.0
git push origin v1.0.0
```

This will trigger:
1. Build process
2. NPM publication
3. GitHub release creation

---

## Post-Deployment

### Verify Deployment

1. Check the widget loads:
```bash
curl -I https://your-domain.com/widget.iife.js
```

2. Test CORS headers:
```bash
curl -H "Origin: https://example.com" \
  -I https://your-domain.com/widget.iife.js
```

3. Test integration:
```html
<!DOCTYPE html>
<html>
<body>
  <h1>Test Page</h1>
  <script>
    window.voiceChatWidgetConfig = {
      publicApiKey: 'test_key',
      assistantId: 'test_assistant'
    };
  </script>
  <script src="https://your-domain.com/widget.iife.js"></script>
</body>
</html>
```

### Monitor Performance

- Use CloudFront/CDN analytics
- Monitor bundle size: `npm run build -- --analyze`
- Check load times with Lighthouse

---

## Troubleshooting

### CORS Errors

Ensure your server sends these headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### Widget Not Loading

1. Check browser console for errors
2. Verify the script URL is accessible
3. Check network tab for 404 errors
4. Ensure HTTPS if embedding on HTTPS sites

### Build Failures

```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build
```

---

## Best Practices

1. **Use CDN** - Leverage edge caching for global performance
2. **Enable CORS** - Required for cross-origin embedding
3. **Set Cache Headers** - Improve load times with proper caching
4. **HTTPS Only** - Always serve over HTTPS in production
5. **Version Control** - Use versioned URLs for updates
6. **Monitor Usage** - Track widget usage and errors
7. **Minification** - Ensure production builds are minified

---

## Support

For deployment issues:
- Check the [GitHub Issues](https://github.com/your-org/voice-chat-widget/issues)
- Review platform-specific documentation
- Contact support at support@yourdomain.com
