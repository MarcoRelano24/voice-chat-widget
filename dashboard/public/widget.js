(function() {
  'use strict';

  // Get widget configuration
  const config = window.voiceWidgetConfig;
  if (!config || !config.widgetId) {
    console.error('Voice Widget: widgetId is required');
    return;
  }

  // Determine API URL based on environment
  // For development: use localhost
  // For production: use the origin where the widget script is loaded from
  const API_URL = (() => {
    // Check if we're in development (file:// protocol or localhost)
    if (window.location.protocol === 'file:' || window.location.hostname === 'localhost') {
      return 'http://localhost:3000';
    }

    // In production, try to get the URL from the script tag
    const scripts = document.getElementsByTagName('script');
    for (let script of scripts) {
      if (script.src && script.src.includes('widget.js')) {
        const url = new URL(script.src);
        return `${url.protocol}//${url.host}`;
      }
    }

    // Fallback to current origin
    return window.location.origin;
  })();

  // Determine API endpoint - use demo endpoint for demo widgets
  const isDemoWidget = config.widgetId.startsWith('demo-');
  const apiPath = isDemoWidget
    ? `/api/demo/${config.widgetId}/config`
    : `/api/widgets/${config.widgetId}/config`;

  // Fetch widget configuration from API
  fetch(`${API_URL}${apiPath}`)
    .then(response => {
      if (!response.ok) throw new Error('Failed to load widget configuration');
      return response.json();
    })
    .then(widgetConfig => {
      // Initialize widget with fetched config
      initWidget(widgetConfig);
    })
    .catch(error => {
      console.error('Voice Widget Error:', error);
    });

  function initWidget(widgetConfig) {
    console.log('Initializing widget with config:', widgetConfig);

    // Add widgetId to config for consent storage
    widgetConfig.widgetId = config.widgetId;

    // Simply create the widget - we'll load Vapi differently
    createWidget(widgetConfig);
  }

  function createWidget(config) {
    // Create widget container
    const container = document.createElement('div');
    container.id = 'voice-widget-' + Date.now();
    container.className = 'voice-chat-widget';

    // Add styles
    injectStyles(config);

    // Determine widget type and position
    if (config.type === 'floating') {
      createFloatingWidget(container, config);
    } else if (config.type === 'inline') {
      createInlineWidget(container, config);
    } else if (config.type === 'page') {
      createPageWidget(container, config);
    }

    // Check if a target container is specified
    const targetContainerId = window.voiceWidgetConfig?.targetContainer;
    if (targetContainerId) {
      const targetElement = document.getElementById(targetContainerId);
      if (targetElement) {
        targetElement.appendChild(container);
      } else {
        console.warn(`Target container #${targetContainerId} not found, appending to body`);
        document.body.appendChild(container);
      }
    } else {
      document.body.appendChild(container);
    }

    // Initialize Vapi using dynamic import
    initializeVapi(container, config);
  }

  async function initializeVapi(container, config) {
    try {
      // Wait for Vapi SDK to be loaded from CDN (from embed code)
      let attempts = 0;
      while (typeof window.Vapi === 'undefined' && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (typeof window.Vapi !== 'undefined') {
        console.log('Vapi SDK loaded from CDN');
        console.log('window.Vapi type:', typeof window.Vapi);
        console.log('window.Vapi:', window.Vapi);

        // Handle both default export and named export
        const VapiClass = window.Vapi.default || window.Vapi;
        console.log('VapiClass:', VapiClass);

        const vapi = new VapiClass(config.vapi.publicApiKey);
        setupWidgetFunctionality(container, vapi, config);
        setupBehaviorFeatures(container, config);
        executeCustomJS(config, container, vapi);
        console.log('Widget created and Vapi initialized');
      } else {
        throw new Error('Vapi SDK not loaded after 3 seconds');
      }
    } catch (error) {
      console.error('Failed to initialize Vapi SDK:', error);
      console.log('Widget UI created but voice functionality disabled');
      setupBasicFunctionality(container);
      setupBehaviorFeatures(container, config);
      executeCustomJS(config, container, null);
    }
  }

  function executeCustomJS(config, container, vapi) {
    // Execute custom JS if provided
    if (config.customJS) {
      try {
        // Create a function scope with access to widget elements
        const customFunction = new Function('container', 'config', 'vapi', config.customJS);
        customFunction(container, config, vapi);
      } catch (error) {
        console.error('Error executing custom JS:', error);
      }
    }
  }

  function setupBehaviorFeatures(container, config) {
    const behavior = config.behavior || {};
    const panel = container.querySelector('.voice-widget-panel');
    const button = container.querySelector('.voice-widget-button');

    // Auto-open feature
    if (behavior.autoOpen && panel) {
      const delay = behavior.autoOpenDelay || 0;
      setTimeout(() => {
        panel.classList.remove('hidden');
        panel.classList.add('visible');
      }, delay);
    }

    // Close on click outside
    if (behavior.closeOnClickOutside && panel) {
      document.addEventListener('click', (e) => {
        if (!container.contains(e.target) && panel.classList.contains('visible')) {
          panel.classList.add('hidden');
          panel.classList.remove('visible');
        }
      });
    }

    // Draggable feature (for floating widgets)
    if (behavior.draggable && config.type === 'floating') {
      makeDraggable(container);
    }

    // Minimizable feature - already partially supported via close button
    // Add minimize button if requested
    if (behavior.minimizable && panel) {
      const header = panel.querySelector('.voice-widget-header');
      const closeBtn = panel.querySelector('.voice-widget-close');
      if (header && closeBtn) {
        const minimizeBtn = document.createElement('button');
        minimizeBtn.className = 'voice-widget-minimize';
        minimizeBtn.innerHTML = '−';
        minimizeBtn.setAttribute('aria-label', 'Minimize');
        minimizeBtn.style.cssText = `
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          margin-right: 8px;
        `;
        minimizeBtn.addEventListener('mouseover', () => {
          minimizeBtn.style.background = 'rgba(255,255,255,0.1)';
        });
        minimizeBtn.addEventListener('mouseout', () => {
          minimizeBtn.style.background = 'none';
        });
        minimizeBtn.addEventListener('click', () => {
          panel.classList.add('hidden');
          panel.classList.remove('visible');
        });
        closeBtn.parentNode.insertBefore(minimizeBtn, closeBtn);
      }
    }
  }

  function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const button = element.querySelector('.voice-widget-button');
    const panel = element.querySelector('.voice-widget-panel');

    if (!button) return;

    button.style.cursor = 'move';
    button.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;

      // Update position
      const newTop = element.offsetTop - pos2;
      const newLeft = element.offsetLeft - pos1;

      element.style.top = newTop + 'px';
      element.style.left = newLeft + 'px';
      element.style.bottom = 'auto';
      element.style.right = 'auto';
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setupInlineWidget(button, vapi, config) {
    let isActive = false;
    let isMuted = false;
    const buttonTextEl = button.querySelector('.button-text');
    const buttonTextHoverEl = button.querySelector('.button-text-hover');
    const symbolEl = button.querySelector('.voice-widget-symbol');
    const inlineConfig = config.inline || {};
    const originalText = config.content?.buttonText || config.content?.welcomeMessage || 'Start Voice Call';
    const originalHoverText = inlineConfig.hoverText || 'Click to Call';
    const connectingText = inlineConfig.connectingText || 'Connecting...';
    const activeText = inlineConfig.activeText || 'End Call';
    const enableRipple = inlineConfig.enableRipple !== false;
    const enableSlideEffect = inlineConfig.enableSlideEffect !== false;

    // Mute button configuration
    const muteButtonConfig = config.muteButton || {};
    const muteButtonEnabled = muteButtonConfig.enabled !== false;
    const muteButtonText = muteButtonConfig.muteText || 'Mute';
    const unmuteButtonText = muteButtonConfig.unmuteText || 'Unmute';
    const showMuteIcon = muteButtonConfig.showIcon !== false;
    const muteButtonColor = muteButtonConfig.color || '#6b7280';
    const mutedButtonColor = muteButtonConfig.mutedColor || '#dc3545';
    const muteButtonTextColor = muteButtonConfig.textColor || '#ffffff';
    const inlineMuteSize = muteButtonConfig.inlineSize || (inlineConfig.symbolSize || 32);
    const inlineMutePadding = muteButtonConfig.inlinePadding || 0;

    // Store original symbol HTML and dimensions
    const originalSymbolHTML = symbolEl ? symbolEl.outerHTML : null;
    const symbolSize = inlineConfig.symbolSize || 32;
    const symbolBorderRadius = inlineConfig.symbolBorderRadius || 50;

    // Check if consent is required
    const consentConfig = config.consent || {};
    const consentRequired = consentConfig.enabled === true;
    const consentStorageKey = `voice-widget-consent-${config.widgetId || 'default'}`;

    // Check if user has already consented
    function hasUserConsented() {
      try {
        return localStorage.getItem(consentStorageKey) === 'true';
      } catch (e) {
        console.warn('localStorage not available, consent will be required each time');
        return false;
      }
    }

    // Debug: Log consent configuration
    console.log('Consent Configuration:', {
      consentConfig,
      consentRequired,
      consentStorageKey,
      hasConsented: hasUserConsented()
    });

    // Add ripple effect on click if enabled
    if (enableRipple) {
      button.addEventListener('click', (e) => {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');

        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        button.appendChild(ripple);

        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    }

    // Update button text helper (sets same text for both main and hover - used during calls)
    function updateButtonText(text) {
      // Find the text container (could be .button-text-container or just .button-text)
      const textContainer = button.querySelector('.button-text-container');

      if (textContainer) {
        // If we have a text container (slide effects enabled), update both spans
        const mainText = textContainer.querySelector('.button-text');
        const hoverText = textContainer.querySelector('.button-text-hover');

        if (mainText) mainText.textContent = text;
        if (hoverText) hoverText.textContent = text;
      } else if (buttonTextEl) {
        // Simple text update
        buttonTextEl.textContent = text;
      }

      // Also update hover text element if it exists separately
      if (buttonTextHoverEl && !textContainer) {
        buttonTextHoverEl.textContent = text;
      }
    }

    // Restore original button and hover texts (used after call ends)
    function restoreOriginalTexts() {
      const textContainer = button.querySelector('.button-text-container');

      if (textContainer && enableSlideEffect) {
        // If we have a text container (slide effects enabled), restore both original texts
        const mainText = textContainer.querySelector('.button-text');
        const hoverText = textContainer.querySelector('.button-text-hover');

        if (mainText) mainText.textContent = originalText;
        if (hoverText) hoverText.textContent = originalHoverText;
      } else if (buttonTextEl) {
        // Simple text update
        buttonTextEl.textContent = originalText;
      }

      // Update separate hover text element if it exists
      if (buttonTextHoverEl && !textContainer) {
        buttonTextHoverEl.textContent = originalHoverText;
      }
    }

    // Transform symbol to mute button
    function transformToMuteButton() {
      if (!symbolEl || !muteButtonEnabled) return;

      const muteIconSVG = `
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      `;

      const mutedIconSVG = `
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      `;

      symbolEl.innerHTML = showMuteIcon ? (isMuted ? mutedIconSVG : muteIconSVG) : (isMuted ? unmuteButtonText : muteButtonText);
      symbolEl.style.width = `${inlineMuteSize}px`;
      symbolEl.style.height = `${inlineMuteSize}px`;
      symbolEl.style.backgroundColor = isMuted ? mutedButtonColor : muteButtonColor;
      symbolEl.style.color = muteButtonTextColor;
      symbolEl.style.padding = `${inlineMutePadding}px`;
      symbolEl.style.cursor = 'pointer';
      symbolEl.style.transition = 'all 0.2s ease';

      // Add click handler for mute toggle
      symbolEl.onclick = (e) => {
        e.stopPropagation();
        toggleMute();
      };
    }

    // Restore original symbol
    function restoreOriginalSymbol() {
      if (!symbolEl || !originalSymbolHTML) return;

      const parent = symbolEl.parentNode;
      const position = Array.from(parent.children).indexOf(symbolEl);
      symbolEl.remove();

      // Re-insert at the same position
      if (position === 0 || parent.children.length === 0) {
        parent.insertAdjacentHTML('afterbegin', originalSymbolHTML);
      } else {
        parent.children[Math.min(position - 1, parent.children.length - 1)].insertAdjacentHTML('afterend', originalSymbolHTML);
      }

      // Remove onclick handler by recreating the element reference
      symbolEl.onclick = null;
    }

    // Toggle mute function
    function toggleMute() {
      if (!isActive) return;

      isMuted = !isMuted;
      vapi.setMuted(isMuted);
      transformToMuteButton(); // Update icon/text
    }

    // Show consent modal
    function showConsentModal() {
      return new Promise((resolve, reject) => {
        const modal = createConsentModal(config, resolve, reject);
        document.body.appendChild(modal);
      });
    }

    // Click to start/end call
    button.addEventListener('click', async () => {
      if (isActive) {
        console.log('Stopping active call');
        vapi.stop();
      } else {
        console.log('Starting call - Checking consent...', {
          consentRequired,
          hasConsented: hasUserConsented()
        });

        // Check if consent is required and user hasn't consented yet
        if (consentRequired && !hasUserConsented()) {
          console.log('Consent required but not given - showing modal');
          try {
            await showConsentModal();
            console.log('User accepted consent');
            // User accepted, save consent
            try {
              localStorage.setItem(consentStorageKey, 'true');
              console.log('Consent saved to localStorage');
            } catch (e) {
              console.warn('Could not save consent to localStorage');
            }
            // Continue with call
          } catch (error) {
            // User declined
            console.log('User declined consent - aborting call');
            return;
          }
        } else {
          console.log('Consent not required or already given - proceeding with call');
        }

        // Start the call
        try {
          console.log('Updating button text to:', connectingText);
          updateButtonText(connectingText);
          button.disabled = true;
          await vapi.start(config.vapi.assistantId);
        } catch (error) {
          console.error('Failed to start call:', error);
          updateButtonText(originalText);
          button.disabled = false;
          alert('Failed to start call. Please check your configuration.');
        }
      }
    });

    // Store animation classes for restore later
    const enablePulse = inlineConfig.enablePulse !== false;
    const enableGlow = inlineConfig.enableGlow || false;

    // Get active colors from config for use in event handlers
    const activeColor = inlineConfig.activeColor || '#dc3545';
    const activeTextColor = inlineConfig.activeTextColor || config.colors?.buttonText || '#ffffff';

    // Vapi event listeners for inline widget
    vapi.on('call-start', () => {
      console.log('Call started - updating to active state');
      console.log('Setting active text to:', activeText);
      console.log('Applying colors:', { activeColor, activeTextColor });

      isActive = true;
      isMuted = false;
      button.disabled = false;
      button.classList.add('active');
      // Remove animations during call
      button.classList.remove('pulse', 'glow');

      // Apply inline styles with !important for maximum specificity
      button.style.setProperty('background-color', activeColor, 'important');
      button.style.setProperty('background', activeColor, 'important');
      button.style.setProperty('background-image', 'none', 'important');
      button.style.setProperty('color', activeTextColor, 'important');
      button.style.setProperty('animation', 'none', 'important');

      updateButtonText(activeText);
      console.log('Button text updated, button classes:', button.className);

      // Debug: Check computed styles after inline styles applied
      const computedStyle = window.getComputedStyle(button);
      const textElement = button.querySelector('.button-text, span');
      const textComputedStyle = textElement ? window.getComputedStyle(textElement) : null;
      console.log('🎨 Active State Styles (after inline styles):', {
        buttonBackgroundColor: computedStyle.backgroundColor,
        buttonColor: computedStyle.color,
        textElementColor: textComputedStyle ? textComputedStyle.color : 'No text element',
        inlineStylesApplied: {
          backgroundColor: button.style.backgroundColor,
          background: button.style.background,
          color: button.style.color
        }
      });

      // Transform symbol to mute button
      transformToMuteButton();
    });

    vapi.on('call-end', () => {
      isActive = false;
      isMuted = false;
      button.classList.remove('active');
      // Remove inline styles to restore original colors
      button.style.removeProperty('background-color');
      button.style.removeProperty('background');
      button.style.removeProperty('background-image');
      button.style.removeProperty('color');
      button.style.removeProperty('animation');
      // Restore animations after call
      if (enablePulse) button.classList.add('pulse');
      if (enableGlow) button.classList.add('glow');
      restoreOriginalTexts();
      // Restore original symbol
      restoreOriginalSymbol();
    });

    vapi.on('error', (error) => {
      console.error('Vapi error:', error);
      isActive = false;
      isMuted = false;
      button.disabled = false;
      button.classList.remove('active');
      // Remove inline styles to restore original colors
      button.style.removeProperty('background-color');
      button.style.removeProperty('background');
      button.style.removeProperty('background-image');
      button.style.removeProperty('color');
      button.style.removeProperty('animation');
      // Restore animations on error
      if (enablePulse) button.classList.add('pulse');
      if (enableGlow) button.classList.add('glow');
      restoreOriginalTexts();
      // Restore original symbol
      restoreOriginalSymbol();
    });
  }

  function setupBasicFunctionality(container) {
    const button = container.querySelector('.voice-widget-button');
    const panel = container.querySelector('.voice-widget-panel');
    const closeBtn = container.querySelector('.voice-widget-close');
    const inlineButton = container.querySelector('.voice-widget-inline-button');

    // Toggle panel for floating/page widgets
    button?.addEventListener('click', () => {
      panel?.classList.toggle('hidden');
      panel?.classList.toggle('visible');
    });

    closeBtn?.addEventListener('click', () => {
      panel?.classList.add('hidden');
      panel?.classList.remove('visible');
    });

    // For inline widget without Vapi
    if (inlineButton) {
      inlineButton.addEventListener('click', () => {
        alert('Voice functionality is currently unavailable. Please refresh the page.');
      });
    }
  }

  function createConsentModal(config, onAccept, onDecline) {
    const consentConfig = config.consent || {};
    const displayType = consentConfig.displayType || 'modal';
    const title = consentConfig.title || 'Terms & Privacy';
    const message = consentConfig.message || 'By using this voice assistant, you agree to our Terms of Service and Privacy Policy.';
    const acceptText = consentConfig.acceptText || 'I Agree';
    const declineText = consentConfig.declineText || 'Decline';
    const privacyUrl = consentConfig.privacyUrl;
    const termsUrl = consentConfig.termsUrl;
    const primaryColor = config.colors?.primary || '#667eea';

    // Build links HTML if URLs are provided
    let linksHTML = '';
    if (privacyUrl || termsUrl) {
      const links = [];
      if (termsUrl) links.push(`<a href="${termsUrl}" target="_blank" rel="noopener noreferrer">Terms of Service</a>`);
      if (privacyUrl) links.push(`<a href="${privacyUrl}" target="_blank" rel="noopener noreferrer">Privacy Policy</a>`);
      linksHTML = `<div class="consent-links">${links.join(' • ')}</div>`;
    }

    const element = document.createElement('div');

    if (displayType === 'inline') {
      // Inline consent panel (shows inside widget panel for floating/page types)
      element.className = 'voice-widget-consent-inline';
      element.innerHTML = `
        <div class="consent-inline-content">
          <div class="consent-inline-header">
            <h3>${title}</h3>
          </div>
          <div class="consent-inline-body">
            <p>${message}</p>
            ${linksHTML}
          </div>
          <div class="consent-inline-footer">
            <button class="consent-btn consent-decline">${declineText}</button>
            <button class="consent-btn consent-accept" style="background: ${primaryColor}">${acceptText}</button>
          </div>
        </div>
      `;
    } else {
      // Modal popup (default)
      element.className = 'voice-widget-consent-overlay';
      element.innerHTML = `
        <div class="voice-widget-consent-modal">
          <div class="consent-modal-header">
            <h3>${title}</h3>
          </div>
          <div class="consent-modal-body">
            <p>${message}</p>
            ${linksHTML}
          </div>
          <div class="consent-modal-footer">
            <button class="consent-btn consent-decline">${declineText}</button>
            <button class="consent-btn consent-accept" style="background: ${primaryColor}">${acceptText}</button>
          </div>
        </div>
      `;
    }

    // Handle button clicks
    const acceptBtn = element.querySelector('.consent-accept');
    const declineBtn = element.querySelector('.consent-decline');

    acceptBtn.addEventListener('click', () => {
      element.remove();
      onAccept();
    });

    declineBtn.addEventListener('click', () => {
      element.remove();
      onDecline(new Error('User declined consent'));
    });

    return element;
  }

  function createFloatingWidget(container, config) {
    const position = config.display?.position || 'bottom-right';
    const offsetX = config.display?.offsetX || 20;
    const offsetY = config.display?.offsetY || 20;

    container.style.position = 'fixed';
    container.style.zIndex = config.display?.zIndex || 9999;

    // Position mapping
    const positions = {
      'bottom-right': { bottom: offsetY + 'px', right: offsetX + 'px' },
      'bottom-left': { bottom: offsetY + 'px', left: offsetX + 'px' },
      'top-right': { top: offsetY + 'px', right: offsetX + 'px' },
      'top-left': { top: offsetY + 'px', left: offsetX + 'px' },
    };

    Object.assign(container.style, positions[position] || positions['bottom-right']);

    // Button icon - use custom icon if provided, otherwise default mic icon
    const buttonIcon = config.content?.buttonIcon || `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
      </svg>
    `;

    // Logo branding configuration
    const branding = config.branding || {};
    const logoSize = branding.logoSize || 32;
    const logoShape = branding.logoShape || 'rounded';
    const logoBorderWidth = branding.logoBorderWidth || 0;
    const logoBorderColor = branding.logoBorderColor || '#e5e7eb';
    const logoBorderStyle = branding.logoBorderStyle || 'solid';
    const logoBackgroundColor = branding.logoBackgroundColor || 'transparent';
    const logoAlignment = branding.logoAlignment || 'left';
    const companyNameAlignment = branding.companyNameAlignment || 'left';
    const logoPadding = branding.logoPadding ?? 4;
    const logoOffsetX = branding.logoOffsetX ?? 0;
    const logoOffsetY = branding.logoOffsetY ?? 0;
    const companyNameFontSize = branding.companyNameFontSize || 16;
    const companyNameFontFamily = branding.companyNameFontFamily || 'inherit';
    const companyNameColor = branding.companyNameColor || '#ffffff';

    // Calculate border radius based on shape
    const logoBorderRadius = logoShape === 'circle' ? '50%' : logoShape === 'square' ? '0' : '8px';

    // Logo alignment styling
    const logoAlignJustify = logoAlignment === 'left' ? 'flex-start' : logoAlignment === 'right' ? 'flex-end' : 'center';
    const logoFlexValue = logoAlignment === 'center' ? '1' : 'none';

    // Logo display in header with branding
    const logoHTML = config.content?.logoUrl
      ? `<div style="display: flex; justify-content: ${logoAlignJustify}; flex: ${logoFlexValue};">
           <div style="width: ${logoSize}px; height: ${logoSize}px; border-radius: ${logoBorderRadius}; background-color: ${logoBackgroundColor}; border: ${logoBorderWidth}px ${logoBorderStyle} ${logoBorderColor}; padding: ${logoPadding}px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
             <img src="${config.content.logoUrl}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain; transform: translate(${logoOffsetX}px, ${logoOffsetY}px);" />
           </div>
         </div>`
      : '';

    // Company name text alignment
    const companyNameTextAlign = companyNameAlignment;

    container.innerHTML = `
      <button class="voice-widget-button" aria-label="Open voice chat">
        ${buttonIcon}
      </button>
      <div class="voice-widget-panel hidden">
        <div class="voice-widget-header">
          <div class="voice-widget-header-content" style="display: flex; align-items: center; gap: 12px; flex: 1;">
            ${logoHTML}
            <div style="flex: 1; text-align: ${companyNameTextAlign};">
              <div class="voice-widget-title" style="font-size: ${companyNameFontSize}px; font-family: ${companyNameFontFamily}; color: ${companyNameColor};">${config.content?.companyName || 'Voice Assistant'}</div>
              <div class="voice-widget-status">Offline</div>
            </div>
          </div>
          <button class="voice-widget-close" aria-label="Close">×</button>
        </div>
        <div class="voice-widget-body">
          <div class="voice-widget-welcome">${config.content?.welcomeMessage || 'How can we help?'}</div>
          <div class="voice-widget-transcript"></div>
        </div>
        <div class="voice-widget-controls">
          <div class="voice-widget-controls-buttons">
            <button class="voice-widget-btn mute-btn" style="display: none;">Mute</button>
            <button class="voice-widget-btn start-btn">Start Call</button>
          </div>
        </div>
        ${config.footer?.enabled !== false ? `
        <div class="voice-widget-footer">
          ${config.footer?.text || 'Powered by'} <a href="${config.footer?.linkUrl || 'https://www.romea.ai/'}" target="_blank" rel="noopener noreferrer">${config.footer?.linkText || 'Romea AI'}</a>
        </div>
        ` : ''}
      </div>
    `;
  }

  function createInlineWidget(container, config) {
    container.style.width = 'fit-content';
    // Only center if no target container is specified
    if (!window.voiceWidgetConfig?.targetContainer) {
      container.style.margin = '0 auto';
    }

    const inlineConfig = config.inline || {};
    const enableSymbol = inlineConfig.enableSymbol || false;
    const symbolText = inlineConfig.symbolText || '📞';
    const symbolPosition = inlineConfig.symbolPosition || 'left';
    const buttonText = config.content?.buttonText || config.content?.welcomeMessage || 'Start Voice Call';
    const enableSlideEffect = inlineConfig.enableSlideEffect !== false;
    const hoverText = inlineConfig.hoverText || 'Click to Call';
    const slideDirection = inlineConfig.slideDirection || 'up';
    const hoverTransitionType = inlineConfig.hoverTransitionType || 'both';

    // Build symbol HTML if enabled
    const symbolBgColor = inlineConfig.symbolBackgroundColor || '#ffffff';
    const symbolTextColor = inlineConfig.symbolTextColor || config.colors?.primary || '#667eea';
    const symbolSize = inlineConfig.symbolSize || 32;
    const symbolBorderRadius = inlineConfig.symbolBorderRadius || 50;

    const symbolHTML = enableSymbol ? `
      <div class="voice-widget-symbol" style="
        width: ${symbolSize}px;
        height: ${symbolSize}px;
        background-color: ${symbolBgColor};
        color: ${symbolTextColor};
        border-radius: ${symbolBorderRadius}%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${symbolSize * 0.6}px;
        flex-shrink: 0;
      ">
        ${symbolText}
      </div>
    ` : '';

    // Build text HTML based on slide effect settings
    let textHTML;
    if (enableSlideEffect && (hoverTransitionType === 'text' || hoverTransitionType === 'both')) {
      textHTML = `
        <span class="button-text-container">
          <span class="button-text slide-${slideDirection}">${buttonText}</span>
          <span class="button-text-hover slide-${slideDirection}">${hoverText}</span>
        </span>
      `;
    } else {
      textHTML = `<span class="button-text">${buttonText}</span>`;
    }

    // Build final button HTML with proper symbol positioning
    const buttonContent = symbolPosition === 'left'
      ? `${symbolHTML}${textHTML}`
      : `${textHTML}${symbolHTML}`;

    // Build button classes based on enabled animations
    const enablePulse = inlineConfig.enablePulse !== false;
    const enableGlow = inlineConfig.enableGlow || false;
    const buttonClasses = ['voice-widget-inline-button'];
    if (enablePulse) buttonClasses.push('pulse');
    if (enableGlow) buttonClasses.push('glow');

    container.innerHTML = `
      <button class="${buttonClasses.join(' ')}" aria-label="Voice call">
        ${buttonContent}
      </button>
    `;

    // Fix text container width to accommodate both texts
    if (enableSlideEffect && (hoverTransitionType === 'text' || hoverTransitionType === 'both')) {
      setTimeout(() => {
        const button = container.querySelector('.voice-widget-inline-button');
        const textContainer = button?.querySelector('.button-text-container');
        const mainText = textContainer?.querySelector('.button-text');
        const hoverTextEl = textContainer?.querySelector('.button-text-hover');

        if (textContainer && mainText && hoverTextEl) {
          // Create hidden measurement elements
          const measureMain = document.createElement('span');
          const measureHover = document.createElement('span');

          measureMain.style.cssText = 'position: absolute; visibility: hidden; white-space: nowrap;';
          measureHover.style.cssText = 'position: absolute; visibility: hidden; white-space: nowrap;';

          // Copy computed styles
          const computedStyle = window.getComputedStyle(mainText);
          measureMain.style.font = computedStyle.font;
          measureMain.style.fontSize = computedStyle.fontSize;
          measureMain.style.fontWeight = computedStyle.fontWeight;
          measureMain.style.fontFamily = computedStyle.fontFamily;
          measureMain.style.letterSpacing = computedStyle.letterSpacing;

          measureHover.style.font = computedStyle.font;
          measureHover.style.fontSize = computedStyle.fontSize;
          measureHover.style.fontWeight = computedStyle.fontWeight;
          measureHover.style.fontFamily = computedStyle.fontFamily;
          measureHover.style.letterSpacing = computedStyle.letterSpacing;

          measureMain.textContent = buttonText;
          measureHover.textContent = hoverText;

          document.body.appendChild(measureMain);
          document.body.appendChild(measureHover);

          const mainWidth = measureMain.offsetWidth;
          const hoverWidth = measureHover.offsetWidth;
          const maxWidth = Math.max(mainWidth, hoverWidth);

          document.body.removeChild(measureMain);
          document.body.removeChild(measureHover);

          // Set the container width to accommodate the larger text
          textContainer.style.width = `${maxWidth}px`;
        }
      }, 0);
    }
  }

  function createPageWidget(container, config) {
    container.style.position = 'fixed';
    container.style.inset = '0';
    container.style.zIndex = config.display?.zIndex || 9999;
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';

    // Logo branding configuration
    const branding = config.branding || {};
    const logoSize = branding.logoSize || 32;
    const logoShape = branding.logoShape || 'rounded';
    const logoBorderWidth = branding.logoBorderWidth || 0;
    const logoBorderColor = branding.logoBorderColor || '#e5e7eb';
    const logoBorderStyle = branding.logoBorderStyle || 'solid';
    const logoBackgroundColor = branding.logoBackgroundColor || 'transparent';
    const logoAlignment = branding.logoAlignment || 'left';
    const companyNameAlignment = branding.companyNameAlignment || 'left';
    const logoPadding = branding.logoPadding ?? 4;
    const logoOffsetX = branding.logoOffsetX ?? 0;
    const logoOffsetY = branding.logoOffsetY ?? 0;
    const companyNameFontSize = branding.companyNameFontSize || 16;
    const companyNameFontFamily = branding.companyNameFontFamily || 'inherit';
    const companyNameColor = branding.companyNameColor || '#ffffff';

    // Calculate border radius based on shape
    const logoBorderRadius = logoShape === 'circle' ? '50%' : logoShape === 'square' ? '0' : '8px';

    // Logo alignment styling
    const logoAlignJustify = logoAlignment === 'left' ? 'flex-start' : logoAlignment === 'right' ? 'flex-end' : 'center';
    const logoFlexValue = logoAlignment === 'center' ? '1' : 'none';

    // Logo display in header with branding
    const logoHTML = config.content?.logoUrl
      ? `<div style="display: flex; justify-content: ${logoAlignJustify}; flex: ${logoFlexValue};">
           <div style="width: ${logoSize}px; height: ${logoSize}px; border-radius: ${logoBorderRadius}; background-color: ${logoBackgroundColor}; border: ${logoBorderWidth}px ${logoBorderStyle} ${logoBorderColor}; padding: ${logoPadding}px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
             <img src="${config.content.logoUrl}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain; transform: translate(${logoOffsetX}px, ${logoOffsetY}px);" />
           </div>
         </div>`
      : '';

    // Company name text alignment
    const companyNameTextAlign = companyNameAlignment;

    container.innerHTML = `
      <div class="voice-widget-page-content">
        <div class="voice-widget-header">
          <div class="voice-widget-header-content" style="display: flex; align-items: center; gap: 12px; flex: 1;">
            ${logoHTML}
            <div style="flex: 1; text-align: ${companyNameTextAlign};">
              <div class="voice-widget-title" style="font-size: ${companyNameFontSize}px; font-family: ${companyNameFontFamily}; color: ${companyNameColor};">${config.content?.companyName || 'Voice Assistant'}</div>
              <div class="voice-widget-status">Offline</div>
            </div>
          </div>
          <button class="voice-widget-close" aria-label="Close">×</button>
        </div>
        <div class="voice-widget-body">
          <div class="voice-widget-welcome">${config.content?.welcomeMessage || 'How can we help?'}</div>
          <div class="voice-widget-transcript"></div>
        </div>
        <div class="voice-widget-controls">
          <div class="voice-widget-controls-buttons">
            <button class="voice-widget-btn mute-btn" style="display: none;">Mute</button>
            <button class="voice-widget-btn start-btn">Start Call</button>
          </div>
        </div>
        ${config.footer?.enabled !== false ? `
        <div class="voice-widget-footer">
          ${config.footer?.text || 'Powered by'} <a href="${config.footer?.linkUrl || 'https://www.romea.ai/'}" target="_blank" rel="noopener noreferrer">${config.footer?.linkText || 'Romea AI'}</a>
        </div>
        ` : ''}
      </div>
    `;
  }

  function setupWidgetFunctionality(container, vapi, config) {
    // Check if this is an inline widget
    const inlineButton = container.querySelector('.voice-widget-inline-button');

    if (inlineButton) {
      setupInlineWidget(inlineButton, vapi, config);
      return;
    }

    // Setup for floating and page widgets
    const button = container.querySelector('.voice-widget-button');
    const panel = container.querySelector('.voice-widget-panel');
    const closeBtn = container.querySelector('.voice-widget-close');
    const startBtn = container.querySelector('.start-btn');
    const muteBtn = container.querySelector('.mute-btn');
    const statusEl = container.querySelector('.voice-widget-status');
    const transcriptEl = container.querySelector('.voice-widget-transcript');

    let isActive = false;
    let isMuted = false;
    let messages = [];

    // Mute button configuration
    const muteButtonConfig = config.muteButton || {};
    const muteButtonEnabled = muteButtonConfig.enabled !== false;
    const muteButtonText = muteButtonConfig.muteText || 'Mute';
    const unmuteButtonText = muteButtonConfig.unmuteText || 'Unmute';

    // Check if consent is required
    const consentConfig = config.consent || {};
    const consentRequired = consentConfig.enabled === true;
    const consentStorageKey = `voice-widget-consent-${config.widgetId || 'default'}`;

    // Check if user has already consented
    function hasUserConsented() {
      try {
        return localStorage.getItem(consentStorageKey) === 'true';
      } catch (e) {
        console.warn('localStorage not available, consent will be required each time');
        return false;
      }
    }

    // Show consent modal
    function showConsentModal() {
      return new Promise((resolve, reject) => {
        const consentElement = createConsentModal(config, resolve, reject);
        const displayType = config.consent?.displayType || 'modal';

        if (displayType === 'inline') {
          // For inline display, insert into the widget body
          // Check for both floating widget panel and page widget content
          const widgetBody = panel
            ? panel.querySelector('.voice-widget-body')
            : container.querySelector('.voice-widget-page-content .voice-widget-body');

          if (widgetBody) {
            widgetBody.insertBefore(consentElement, widgetBody.firstChild);
          } else {
            document.body.appendChild(consentElement);
          }
        } else {
          // For modal display, append to body
          document.body.appendChild(consentElement);
        }
      });
    }

    // Toggle panel
    button?.addEventListener('click', () => {
      panel?.classList.toggle('hidden');
      panel?.classList.toggle('visible');
    });

    closeBtn?.addEventListener('click', () => {
      panel?.classList.add('hidden');
      panel?.classList.remove('visible');
    });

    // Start/Stop call
    startBtn?.addEventListener('click', async () => {
      if (isActive) {
        vapi.stop();
      } else {
        // Check if consent is required and user hasn't consented yet
        if (consentRequired && !hasUserConsented()) {
          try {
            await showConsentModal();
            // User accepted, save consent
            try {
              localStorage.setItem(consentStorageKey, 'true');
            } catch (e) {
              console.warn('Could not save consent to localStorage');
            }
            // Continue with call
          } catch (error) {
            // User declined
            console.log('User declined consent');
            return;
          }
        }

        // Start the call
        try {
          await vapi.start(config.vapi.assistantId);
        } catch (error) {
          console.error('Failed to start call:', error);
          alert('Failed to start call. Please check your configuration.');
        }
      }
    });

    // Mute button click handler
    muteBtn?.addEventListener('click', () => {
      if (isMuted) {
        vapi.setMuted(false);
        isMuted = false;
        muteBtn.textContent = muteButtonText;
        muteBtn.classList.remove('muted');
      } else {
        vapi.setMuted(true);
        isMuted = true;
        muteBtn.textContent = unmuteButtonText;
        muteBtn.classList.add('muted');
      }
    });

    // Vapi event listeners
    vapi.on('call-start', () => {
      isActive = true;
      if (statusEl) statusEl.textContent = 'Connected';
      if (startBtn) {
        startBtn.textContent = 'End Call';
        startBtn.classList.add('danger');
      }
      // Show mute button if enabled
      if (muteBtn && muteButtonEnabled) {
        muteBtn.style.display = 'block';
        muteBtn.textContent = muteButtonText;
      }
    });

    vapi.on('call-end', () => {
      isActive = false;
      isMuted = false;
      if (statusEl) statusEl.textContent = 'Offline';
      if (startBtn) {
        startBtn.textContent = 'Start Call';
        startBtn.classList.remove('danger');
      }
      // Hide mute button
      if (muteBtn) {
        muteBtn.style.display = 'none';
        muteBtn.classList.remove('muted');
      }
    });

    vapi.on('message', (message) => {
      if (message.type === 'transcript' && message.transcript) {
        messages.push(message);
        updateTranscript();
      }
    });

    vapi.on('error', (error) => {
      console.error('Vapi error:', error);
      isActive = false;
      if (statusEl) statusEl.textContent = 'Error';
    });

    function updateTranscript() {
      if (!transcriptEl) return;
      transcriptEl.innerHTML = messages
        .map(msg => `
          <div class="voice-message ${msg.role}">
            <div>${msg.transcript}</div>
          </div>
        `)
        .join('');
      transcriptEl.scrollTop = transcriptEl.scrollHeight;
    }
  }

  function injectStyles(config) {
    const primaryColor = config.colors?.primary || '#667eea';
    const secondaryColor = config.colors?.secondary || primaryColor;
    const bgColor = config.colors?.background || '#ffffff';
    const textColor = config.colors?.text || '#333333';
    const buttonBgColor = config.colors?.buttonBackground || primaryColor;
    const buttonTextColor = config.colors?.buttonText || '#ffffff';

    console.log('💡 Button Text Color Configuration:', {
      buttonTextColor,
      configColorsButtonText: config.colors?.buttonText,
      fallback: '#ffffff'
    });

    const buttonSize = config.dimensions?.buttonSize || 60;
    const panelWidth = config.dimensions?.panelWidth || 380;
    const panelHeight = config.dimensions?.panelHeight || 600;
    const inlineButtonWidth = config.dimensions?.inlineButtonWidth || 'auto';
    const inlineButtonHeight = config.dimensions?.inlineButtonHeight || 50;

    // Typography
    const typography = config.typography || {};
    const fontFamily = typography.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    // Handle both simple and nested fontSize/fontWeight structures for backwards compatibility
    const baseFontSize = typeof typography.fontSize === 'number' ? typography.fontSize : 14;
    const baseFontWeight = typography.fontWeight || 600;

    const titleFontSize = typography.fontSize?.title || baseFontSize || 16;
    const bodyFontSize = typography.fontSize?.body || baseFontSize || 14;
    const smallFontSize = typography.fontSize?.small || 12;
    const titleFontWeight = typography.fontWeight?.title || baseFontWeight || 600;
    const bodyFontWeight = typography.fontWeight?.body || 400;

    // Spacing
    const spacing = config.spacing || {};
    const buttonPadding = spacing.buttonPadding || 14;

    // Shadows and effects
    const shadows = config.shadows || {};
    const effects = config.effects || {};
    const shadowIntensity = effects.shadowIntensity || 'medium';

    // Borders - check both config.borders (old) and config.effects (new) for backwards compatibility
    const borders = config.borders || {};
    const borderRadius = effects.borderRadius ?? borders.radius ?? 16;
    const borderWidth = effects.borderWidth ?? borders.width ?? 0;
    const borderColor = effects.borderColor || borders.color || '#e5e7eb';
    const borderStyle = borders.style || 'solid';

    // Compute shadow values based on intensity
    const buttonShadow = shadowIntensity === 'none'
      ? 'none'
      : shadowIntensity === 'light'
        ? '0 2px 8px rgba(0,0,0,0.1)'
        : shadowIntensity === 'medium'
          ? '0 4px 12px rgba(0,0,0,0.15)'
          : '0 8px 24px rgba(0,0,0,0.25)';
    const panelShadow = shadows.panel || '0 8px 32px rgba(0,0,0,0.12)';

    // Animations
    const animations = config.animations || {};
    const animationSpeed = animations.speed || 'medium';
    const transitionDuration = animationSpeed === 'fast' ? '0.15s' : animationSpeed === 'slow' ? '0.4s' : '0.25s';
    const entranceAnimation = animations.entrance || 'fadeIn';
    const exitAnimation = animations.exit || 'fadeOut';
    const hoverAnimation = animations.hover || 'scale';

    const inlineConfig = config.inline || {};
    const hoverColor = inlineConfig.hoverColor || primaryColor;
    const hoverScale = inlineConfig.hoverScale || 1.05;
    const activeColor = inlineConfig.activeColor || '#dc3545';
    const activeTextColor = inlineConfig.activeTextColor || buttonTextColor;

    // Inline button layout
    const textAlign = inlineConfig.textAlign || 'center';
    const hoverTextAlign = inlineConfig.hoverTextAlign || textAlign;
    const marginTop = inlineConfig.marginTop ?? 0;
    const marginRight = inlineConfig.marginRight ?? 0;
    const marginBottom = inlineConfig.marginBottom ?? 0;
    const marginLeft = inlineConfig.marginLeft ?? 0;

    console.log('💡 Active Call Colors Configuration:', {
      activeColor,
      configInlineActiveColor: inlineConfig.activeColor,
      activeTextColor,
      configInlineActiveTextColor: inlineConfig.activeTextColor,
      primaryColor,
      buttonTextColor
    });

    // Mute button colors
    const muteButtonConfig = config.muteButton || {};
    const muteButtonColor = muteButtonConfig.color || '#6b7280';
    const mutedButtonColor = muteButtonConfig.mutedColor || '#dc3545';

    const style = document.createElement('style');
    style.textContent = `
      .voice-chat-widget * {
        box-sizing: border-box;
        font-family: ${fontFamily};
      }

      .voice-widget-button {
        width: ${buttonSize}px;
        height: ${buttonSize}px;
        border-radius: 50%;
        background: ${buttonBgColor};
        border: ${borderWidth}px ${borderStyle} ${borderColor};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: ${buttonShadow};
        transition: all ${transitionDuration} ease;
        color: ${buttonTextColor};
      }

      .voice-widget-button:hover {
        ${hoverAnimation === 'scale' ? `transform: scale(1.05);` : ''}
        ${hoverAnimation === 'glow' ? `box-shadow: 0 0 20px ${primaryColor}80;` : ''}
        ${hoverAnimation === 'lift' ? `transform: translateY(-2px); box-shadow: ${buttonShadow}, 0 4px 8px rgba(0,0,0,0.1);` : ''}
      }
      .voice-widget-button svg { width: ${buttonSize * 0.5}px; height: ${buttonSize * 0.5}px; }

      .voice-widget-panel {
        position: absolute;
        bottom: ${buttonSize + 20}px;
        right: 0;
        width: ${panelWidth}px;
        max-width: calc(100vw - 40px);
        height: ${panelHeight}px;
        max-height: calc(100vh - ${buttonSize + 60}px);
        background: ${bgColor};
        border-radius: ${borderRadius}px;
        border: ${borderWidth}px ${borderStyle} ${borderColor};
        box-shadow: ${panelShadow};
        overflow: hidden;
        transition: all ${transitionDuration} ease;
        font-family: ${fontFamily};
        display: flex;
        flex-direction: column;
      }

      .voice-widget-panel.hidden {
        opacity: 0;
        ${entranceAnimation === 'fadeIn' || exitAnimation === 'fadeOut' ? '' : ''}
        ${entranceAnimation === 'slideUp' || exitAnimation === 'slideDown' ? 'transform: translateY(20px);' : ''}
        ${entranceAnimation === 'slideDown' || exitAnimation === 'slideUp' ? 'transform: translateY(-20px);' : ''}
        ${entranceAnimation === 'scale' || exitAnimation === 'scale' ? 'transform: scale(0.8);' : ''}
        ${entranceAnimation === 'slideLeft' || exitAnimation === 'slideRight' ? 'transform: translateX(20px);' : ''}
        ${entranceAnimation === 'slideRight' || exitAnimation === 'slideLeft' ? 'transform: translateX(-20px);' : ''}
        pointer-events: none;
      }

      .voice-widget-panel.visible {
        opacity: 1;
        transform: translate(0, 0) scale(1);
      }

      .voice-widget-header {
        background: ${primaryColor};
        color: white;
        padding: 16px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .voice-widget-title {
        font-size: ${titleFontSize}px;
        font-weight: ${titleFontWeight};
      }
      .voice-widget-status {
        font-size: ${smallFontSize}px;
        opacity: 0.9;
        font-weight: ${bodyFontWeight};
      }

      .voice-widget-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
      }

      .voice-widget-close:hover { background: rgba(255,255,255,0.1); }

      .voice-widget-body {
        padding: 20px;
        overflow-y: auto;
        color: ${textColor};
        font-size: ${bodyFontSize}px;
        font-weight: ${bodyFontWeight};
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .voice-widget-welcome {
        text-align: center;
        color: #666;
        font-size: ${bodyFontSize}px;
        font-weight: ${bodyFontWeight};
        margin-bottom: 20px;
      }

      .voice-widget-transcript {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .voice-message {
        padding: 10px 14px;
        border-radius: ${borderRadius * 0.75}px;
        font-size: ${bodyFontSize}px;
        font-weight: ${bodyFontWeight};
        max-width: 80%;
      }

      .voice-message.user {
        background: ${config.chat?.userMessageBgColor || '#f0f0f0'};
        color: ${config.chat?.userMessageTextColor || '#333333'};
        align-self: flex-end;
        margin-left: auto;
      }

      .voice-message.assistant {
        background: ${config.chat?.assistantMessageBgColor || `${primaryColor}15`};
        color: ${config.chat?.assistantMessageTextColor || '#333333'};
        align-self: flex-start;
      }

      .voice-widget-controls {
        padding: 16px 20px;
        border-top: 1px solid #eee;
      }

      .voice-widget-controls-buttons {
        display: flex;
        gap: 8px;
        width: 100%;
      }

      .voice-widget-btn {
        flex: 1;
        padding: 12px;
        border: ${borderWidth}px ${borderStyle} ${borderColor};
        border-radius: ${borderRadius * 0.5}px;
        font-size: ${bodyFontSize}px;
        font-weight: ${titleFontWeight};
        cursor: pointer;
        background: ${primaryColor};
        color: white;
        transition: all ${transitionDuration} ease;
        font-family: ${fontFamily};
      }

      .voice-widget-btn:hover {
        opacity: 0.9;
        ${hoverAnimation === 'lift' ? 'transform: translateY(-1px);' : ''}
      }
      .voice-widget-btn.danger { background: #dc3545; }
      .voice-widget-btn.mute-btn { background: ${muteButtonColor}; }
      .voice-widget-btn.mute-btn.muted { background: ${mutedButtonColor}; }

      /* Footer styles */
      .voice-widget-footer {
        padding: 12px 20px;
        text-align: center;
        font-size: 11px;
        color: ${config.footer?.textColor || '#9ca3af'};
        border-top: 1px solid #e5e7eb;
        background: ${bgColor};
      }

      .voice-widget-footer a {
        color: ${config.footer?.linkColor || primaryColor};
        text-decoration: none;
        font-weight: 500;
      }

      .voice-widget-footer a:hover {
        text-decoration: underline;
      }

      /* Page widget styles */
      .voice-widget-page-content {
        width: 90%;
        max-width: 500px;
        height: ${panelHeight}px;
        max-height: calc(100vh - 100px);
        background: ${bgColor};
        border-radius: ${borderRadius}px;
        border: ${borderWidth}px ${borderStyle} ${borderColor};
        box-shadow: ${panelShadow};
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      /* Inline widget styles */
      .voice-widget-inline-button {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: ${textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center'};
        gap: 12px;
        padding: ${buttonPadding}px ${buttonPadding * 2}px;
        background: ${buttonBgColor};
        color: ${buttonTextColor};
        border: ${borderWidth}px ${borderStyle} ${borderColor};
        border-radius: 50px;
        font-size: ${bodyFontSize}px;
        font-weight: ${titleFontWeight};
        cursor: pointer;
        box-shadow: ${buttonShadow};
        transition: all ${transitionDuration} ease;
        font-family: ${fontFamily};
        overflow: hidden;
        width: ${inlineButtonWidth === 'auto' ? 'auto' : inlineButtonWidth};
        height: ${inlineButtonHeight}px;
        margin-top: ${marginTop}px;
        margin-right: ${marginRight}px;
        margin-bottom: ${marginBottom}px;
        margin-left: ${marginLeft}px;
      }

      .voice-widget-inline-button:hover {
        transform: scale(${hoverScale});
        box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        background: ${hoverColor};
        justify-content: ${hoverTextAlign === 'left' ? 'flex-start' : hoverTextAlign === 'right' ? 'flex-end' : 'center'};
      }

      .voice-widget-inline-button:active {
        transform: translateY(0);
      }

      .voice-widget-inline-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
      }

      /* Button text container for slide effects */
      .button-text-container {
        position: relative;
        display: inline-block;
        overflow: hidden;
      }

      .button-text {
        display: block;
        transition: transform ${transitionDuration} ease;
        white-space: nowrap;
      }

      .button-text-hover {
        position: absolute;
        transition: transform ${transitionDuration} ease;
        white-space: nowrap;
      }

      /* Slide Up */
      .voice-widget-inline-button:hover .button-text.slide-up {
        transform: translateY(-100%);
      }
      .button-text-hover.slide-up {
        top: 100%;
        left: 0;
      }
      .voice-widget-inline-button:hover .button-text-hover.slide-up {
        transform: translateY(-100%);
      }

      /* Slide Down */
      .voice-widget-inline-button:hover .button-text.slide-down {
        transform: translateY(100%);
      }
      .button-text-hover.slide-down {
        top: -100%;
        left: 0;
      }
      .voice-widget-inline-button:hover .button-text-hover.slide-down {
        transform: translateY(100%);
      }

      /* Slide Left */
      .voice-widget-inline-button:hover .button-text.slide-left {
        transform: translateX(-100%);
      }
      .button-text-hover.slide-left {
        top: 0;
        left: 100%;
      }
      .voice-widget-inline-button:hover .button-text-hover.slide-left {
        transform: translateX(-100%);
      }

      /* Slide Right */
      .voice-widget-inline-button:hover .button-text.slide-right {
        transform: translateX(100%);
      }
      .button-text-hover.slide-right {
        top: 0;
        left: -100%;
      }
      .voice-widget-inline-button:hover .button-text-hover.slide-right {
        transform: translateX(100%);
      }

      /* Ripple effect */
      .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        width: 0;
        height: 0;
        transform: translate(-50%, -50%);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
      }

      @keyframes ripple-animation {
        to {
          width: 200px;
          height: 200px;
          opacity: 0;
        }
      }

      /* Pulse animation */
      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.05);
          opacity: 0.9;
        }
      }

      .voice-widget-inline-button.pulse {
        animation: pulse 2s infinite;
      }

      /* Glow animation */
      @keyframes glow {
        0%, 100% {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        50% {
          box-shadow: 0 4px 20px ${primaryColor}80, 0 0 30px ${primaryColor}60;
        }
      }

      .voice-widget-inline-button.glow {
        animation: glow 2s infinite;
      }

      /* Active state (during call) */
      .voice-widget-inline-button.active {
        background-color: ${activeColor} !important;
        background: ${activeColor} !important;
        color: ${activeTextColor} !important;
      }

      .voice-widget-inline-button.active:hover {
        background-color: ${activeColor} !important;
        background: ${activeColor} !important;
        color: ${activeTextColor} !important;
        opacity: 0.9;
        transform: none !important;
      }

      /* Override Elementor and WordPress button styles */
      .elementor-widget button.voice-widget-inline-button.active,
      .elementor-widget .voice-widget-inline-button.active,
      div[class*="elementor"] .voice-widget-inline-button.active,
      [class*="wp-"] .voice-widget-inline-button.active {
        background-color: ${activeColor} !important;
        background: ${activeColor} !important;
        background-image: none !important;
        color: ${activeTextColor} !important;
        animation: none !important;
        transition: opacity 0.2s ease !important;
      }

      .elementor-widget button.voice-widget-inline-button.active:hover,
      .elementor-widget .voice-widget-inline-button.active:hover,
      div[class*="elementor"] .voice-widget-inline-button.active:hover,
      [class*="wp-"] .voice-widget-inline-button.active:hover {
        background-color: ${activeColor} !important;
        background: ${activeColor} !important;
        background-image: none !important;
        color: ${activeTextColor} !important;
      }

      /* Ensure text is visible during active state - disable slide transforms */
      .voice-widget-inline-button.active .button-text,
      .voice-widget-inline-button.active:hover .button-text,
      .voice-widget-inline-button.active span,
      .voice-widget-inline-button.active:hover span {
        transform: none !important;
        position: relative !important;
        display: block !important;
        color: ${activeTextColor} !important;
      }

      .voice-widget-inline-button.active .button-text-hover,
      .voice-widget-inline-button.active:hover .button-text-hover {
        transform: none !important;
        position: absolute !important;
        opacity: 0 !important;
        pointer-events: none !important;
        display: none !important;
      }

      /* Ensure container also has proper text color */
      .voice-widget-inline-button.active .button-text-container,
      .voice-widget-inline-button.active:hover .button-text-container {
        color: ${activeTextColor} !important;
      }

      /* Override any inherited colors */
      .voice-widget-inline-button.active *:not(.voice-widget-symbol):not(.voice-widget-symbol *) {
        color: ${activeTextColor} !important;
      }

      /* Symbol styling */
      .voice-widget-symbol {
        flex-shrink: 0;
      }

      /* Consent Modal Styles */
      .voice-widget-consent-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        animation: fadeIn 0.2s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .voice-widget-consent-modal {
        background: white;
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease;
      }

      @keyframes slideUp {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .consent-modal-header {
        padding: 24px 24px 16px;
        border-bottom: 1px solid #e5e7eb;
      }

      .consent-modal-header h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #111827;
      }

      .consent-modal-body {
        padding: 24px;
      }

      .consent-modal-body p {
        margin: 0 0 16px 0;
        font-size: 14px;
        line-height: 1.6;
        color: #4b5563;
      }

      .consent-links {
        font-size: 14px;
        text-align: center;
      }

      .consent-links a {
        color: ${primaryColor};
        text-decoration: none;
        font-weight: 500;
      }

      .consent-links a:hover {
        text-decoration: underline;
      }

      .consent-modal-footer {
        padding: 16px 24px 24px;
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }

      .consent-btn {
        padding: 10px 24px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .consent-decline {
        background: #f3f4f6;
        color: #374151;
      }

      .consent-decline:hover {
        background: #e5e7eb;
      }

      .consent-accept {
        color: white;
      }

      .consent-accept:hover {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      /* Inline Consent Styles */
      .voice-widget-consent-inline {
        background: #f9fafb;
        border-radius: 8px;
        margin-bottom: 16px;
        border: 1px solid #e5e7eb;
      }

      .consent-inline-content {
        padding: 16px;
      }

      .consent-inline-header h3 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 600;
        color: #111827;
      }

      .consent-inline-body p {
        margin: 0 0 12px 0;
        font-size: 13px;
        line-height: 1.5;
        color: #4b5563;
      }

      .consent-inline-footer {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 12px;
      }

      .consent-inline-footer .consent-btn {
        padding: 8px 16px;
        font-size: 13px;
      }
    `;

    document.head.appendChild(style);

    // Inject custom CSS if provided
    if (config.customCSS) {
      const customStyle = document.createElement('style');
      customStyle.textContent = config.customCSS;
      customStyle.setAttribute('data-voice-widget-custom', 'true');
      document.head.appendChild(customStyle);
    }
  }
})();
