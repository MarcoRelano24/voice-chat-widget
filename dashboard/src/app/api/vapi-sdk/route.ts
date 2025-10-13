import { NextResponse } from 'next/server'

export async function GET() {
  // Simple Vapi SDK implementation that works in the browser
  const sdkCode = `
(function() {
  'use strict';

  // Simple Vapi implementation using the official SDK via import
  window.loadVapi = async function() {
    if (window.Vapi) return;

    try {
      // Dynamically import Vapi SDK
      const module = await import('https://cdn.jsdelivr.net/npm/@vapi-ai/web@2.4.0/+esm');
      window.Vapi = module.default;
      console.log('Vapi SDK loaded successfully');
    } catch (error) {
      console.error('Failed to load Vapi SDK:', error);
    }
  };

  // Auto-load on script execution
  window.loadVapi();
})();
`;

  return new NextResponse(sdkCode, {
    headers: {
      'Content-Type': 'application/javascript',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
