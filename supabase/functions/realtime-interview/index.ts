import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, upgrade, connection, sec-websocket-key, sec-websocket-version, sec-websocket-extensions, sec-websocket-protocol',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const upgradeHeader = req.headers.get('upgrade');
  if (upgradeHeader?.toLowerCase() !== 'websocket') {
    return new Response('Expected WebSocket upgrade', { status: 426, headers: corsHeaders });
  }

  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not configured');
    return new Response('Server configuration error', { status: 500, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const jobRole = url.searchParams.get('jobRole') || 'Software Developer';
  const resumeContext = url.searchParams.get('resume') || '';

  console.log('Starting realtime interview for role:', jobRole);

  const { socket: clientSocket, response } = Deno.upgradeWebSocket(req);

  let openAISocket: WebSocket | null = null;
  let sessionConfigured = false;

  clientSocket.onopen = () => {
    console.log('Client connected');
    
    openAISocket = new WebSocket(
      'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01',
      ['realtime', `openai-insecure-api-key.${OPENAI_API_KEY}`, 'openai-beta.realtime-v1']
    );

    openAISocket.onopen = () => {
      console.log('Connected to OpenAI');
    };

    openAISocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Log audio deltas specially
        if (data.type === 'response.audio.delta') {
          console.log('Audio delta received, length:', data.delta?.length || 0);
        } else if (data.type === 'error') {
          console.error('OpenAI error:', JSON.stringify(data.error));
        } else if (data.type.includes('audio') || data.type.includes('response') || data.type.includes('session')) {
          console.log('Event:', data.type);
        }

        // Configure session on session.created
        if (data.type === 'session.created' && !sessionConfigured) {
          sessionConfigured = true;
          
          const systemPrompt = `You are a professional interviewer for a ${jobRole} position. 
Be warm and professional. Ask ONE question at a time. Keep responses to 30-60 seconds.
${resumeContext ? `Candidate context: ${resumeContext}` : ''}
Start with a greeting and ask them to introduce themselves.`;

          const sessionConfig = {
            type: 'session.update',
            session: {
              modalities: ['text', 'audio'],
              instructions: systemPrompt,
              voice: 'alloy',
              input_audio_format: 'pcm16',
              output_audio_format: 'pcm16',
              input_audio_transcription: { model: 'whisper-1' },
              turn_detection: {
                type: 'server_vad',
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 800
              },
              temperature: 0.8,
              max_response_output_tokens: 500
            }
          };

          console.log('Configuring session');
          openAISocket?.send(JSON.stringify(sessionConfig));

          // Trigger initial greeting
          setTimeout(() => {
            openAISocket?.send(JSON.stringify({
              type: 'response.create',
              response: {
                modalities: ['text', 'audio'],
                instructions: 'Greet the candidate warmly and ask them to introduce themselves.'
              }
            }));
            console.log('Greeting requested');
          }, 300);
        }

        // Forward to client
        if (clientSocket.readyState === WebSocket.OPEN) {
          clientSocket.send(event.data);
        }
      } catch (error) {
        console.error('Parse error:', error);
      }
    };

    openAISocket.onerror = (error) => {
      console.error('OpenAI error:', error);
    };

    openAISocket.onclose = (event) => {
      console.log('OpenAI closed:', event.code);
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.close();
      }
    };
  };

  clientSocket.onmessage = (event) => {
    if (openAISocket?.readyState === WebSocket.OPEN) {
      openAISocket.send(event.data);
    }
  };

  clientSocket.onclose = () => {
    console.log('Client disconnected');
    openAISocket?.close();
  };

  return response;
});
