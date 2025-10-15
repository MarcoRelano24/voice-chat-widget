(function() {
  'use strict';

  // Extract widget ID and config from script URL query parameters
  function getWidgetConfig() {
    const scripts = document.getElementsByTagName('script');
    for (let script of scripts) {
      if (script.src && script.src.includes('widget-loader.js')) {
        const url = new URL(script.src);
        return {
          id: url.searchParams.get('id'),
          target: url.searchParams.get('target')
        };
      }
    }
    return { id: null, target: null };
  }

  // Get the base URL for API calls
  function getBaseUrl() {
    const scripts = document.getElementsByTagName('script');
    for (let script of scripts) {
      if (script.src && script.src.includes('widget-loader.js')) {
        const url = new URL(script.src);
        return `${url.protocol}//${url.host}`;
      }
    }
    // Fallback
    if (window.location.protocol === 'file:' || window.location.hostname === 'localhost') {
      return 'http://localhost:3000';
    }
    return window.location.origin;
  }

  const config = getWidgetConfig();
  const baseUrl = getBaseUrl();

  if (!config.id) {
    console.error('Voice Widget: Widget ID is required. Use: <script src="widget-loader.js?id=YOUR_WIDGET_ID"></script>');
    return;
  }

  console.log('Voice Widget Loader: Starting...', { widgetId: config.id, target: config.target, baseUrl });

  // Load a script dynamically
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load: ${src}`));
      document.head.appendChild(script);
    });
  }

  // Load Vapi SDK via dynamic import (ESM)
  async function loadVapiSDK() {
    if (window.Vapi) {
      console.log('Vapi SDK already loaded');
      return;
    }

    try {
      console.log('Loading Vapi SDK...');
      const module = await import('https://cdn.jsdelivr.net/npm/@vapi-ai/web@2.4.0/+esm');
      window.Vapi = module.default || module;
      console.log('Vapi SDK loaded successfully');
    } catch (error) {
      console.error('Failed to load Vapi SDK:', error);
      throw error;
    }
  }

  // Main initialization
  async function init() {
    try {
      // Step 1: Load Daily.co SDK (from local copy)
      console.log('Loading Daily.co SDK...');
      await loadScript(`${baseUrl}/daily-co.js`);
      console.log('Daily.co SDK loaded');

      // Step 2: Load Vapi SDK
      await loadVapiSDK();

      // Step 3: Set widget config
      window.voiceWidgetConfig = {
        widgetId: config.id,
        baseUrl: baseUrl
      };

      // Add target container if specified
      if (config.target) {
        window.voiceWidgetConfig.targetContainer = config.target;
      }

      // Step 4: Load main widget script
      console.log('Loading widget script...');
      await loadScript(`${baseUrl}/widget.js`);
      console.log('Widget loaded successfully');

    } catch (error) {
      console.error('Voice Widget Loader: Failed to initialize', error);
    }
  }

  // Start initialization
  init();
})();
