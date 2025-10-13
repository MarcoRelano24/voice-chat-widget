'use client'

export default function TestVapiPage() {
  return (
    <div style={{ padding: '50px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Vapi Voice Widget Test</h1>

      <div style={{ marginBottom: '20px' }}>
        <button id="start" style={{
          padding: '15px 30px',
          fontSize: '16px',
          backgroundColor: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginRight: '10px'
        }}>
          Start Call
        </button>

        <button id="stop" style={{
          padding: '15px 30px',
          fontSize: '16px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          Stop Call
        </button>
      </div>

      <div id="status" style={{
        padding: '15px',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        Loading Vapi SDK...
      </div>

      <div style={{
        padding: '15px',
        backgroundColor: '#e3f2fd',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <strong>Instructions:</strong>
        <ol>
          <li>Click &ldquo;Start Call&rdquo; to initiate a voice call</li>
          <li>Allow microphone access when prompted</li>
          <li>Speak with the AI assistant</li>
          <li>Click &ldquo;Stop Call&rdquo; to end the session</li>
        </ol>
      </div>

      {/* Load Daily.co SDK */}
      <script src="https://unpkg.com/@daily-co/daily-js" async />

      {/* Load Vapi SDK */}
      <script src="/api/vapi-sdk" async />

      <script dangerouslySetInnerHTML={{__html: `
        async function waitForVapi() {
          let attempts = 0;
          while (typeof window.Vapi === 'undefined' && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }

          if (typeof window.Vapi === 'undefined') {
            throw new Error('Vapi SDK not loaded');
          }

          return window.Vapi.default || window.Vapi;
        }

        waitForVapi().then(Vapi => {
          console.log('Vapi loaded:', Vapi);
          document.getElementById('status').textContent = 'Ready to start call';

          const vapi = new Vapi('e7b41f39-b5f8-4088-a586-66947e58b824');

          vapi.on('call-start', () => {
            console.log('✅ Call started!');
            document.getElementById('status').textContent = '🟢 Call Active - Speak now!';
            document.getElementById('status').style.backgroundColor = '#d4edda';
            document.getElementById('start').disabled = true;
            document.getElementById('stop').disabled = false;
          });

          vapi.on('call-end', () => {
            console.log('❌ Call ended');
            document.getElementById('status').textContent = 'Call Ended';
            document.getElementById('status').style.backgroundColor = '#f0f0f0';
            document.getElementById('start').disabled = false;
            document.getElementById('stop').disabled = true;
          });

          vapi.on('error', (e) => {
            console.error('❌ Vapi Error:', e);
            document.getElementById('status').textContent = 'Error: ' + (e.errorMsg || e.message || 'Unknown error');
            document.getElementById('status').style.backgroundColor = '#f8d7da';
          });

          vapi.on('speech-start', () => {
            console.log('🗣️ Assistant is speaking');
            document.getElementById('status').textContent = '🗣️ Assistant is speaking...';
          });

          vapi.on('speech-end', () => {
            console.log('🤐 Assistant stopped speaking');
            document.getElementById('status').textContent = '🟢 Call Active - Your turn to speak';
          });

          vapi.on('message', (msg) => {
            console.log('📨 Message:', msg);
            if (msg.type === 'transcript' && msg.transcript) {
              console.log('Transcript:', msg.role + ':', msg.transcript);
            }
          });

          document.getElementById('start').onclick = () => {
            console.log('Starting call...');
            document.getElementById('status').textContent = 'Connecting...';
            document.getElementById('status').style.backgroundColor = '#fff3cd';
            vapi.start('d17ad83c-7fa1-4fbc-99d6-6bb560feed9e');
          };

          document.getElementById('stop').onclick = () => {
            console.log('Stopping call...');
            vapi.stop();
          };

          document.getElementById('stop').disabled = true;
        }).catch(error => {
          console.error('Failed to load Vapi:', error);
          document.getElementById('status').textContent = 'Failed to load Vapi SDK: ' + error.message;
          document.getElementById('status').style.backgroundColor = '#f8d7da';
        });
      `}} />
    </div>
  )
}
