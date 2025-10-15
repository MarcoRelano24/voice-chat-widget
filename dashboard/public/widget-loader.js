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
    return;
  }

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

  // Load voice SDK via dynamic import (ESM)
  async function loadVoiceSDK() {
    if (window.Vapi) {
      return;
    }

    try {
      const module = await import('https://cdn.jsdelivr.net/npm/@vapi-ai/web@2.4.0/+esm');
      window.Vapi = module.default || module;
    } catch (error) {
      throw error;
    }
  }

  // Main initialization
  async function init() {
    try {
      // Step 1: Load communication SDK (from local copy)
      await loadScript(`${baseUrl}/daily-co.js`);

      // Step 2: Load voice SDK
      await loadVoiceSDK();

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
      await loadScript(`${baseUrl}/widget.js`);

    } catch (error) {
      // Silently fail
    }
  }

  // Start initialization
  init();
})();
