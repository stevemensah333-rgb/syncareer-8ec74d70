import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, upgrade, connection, sec-websocket-key, sec-websocket-version, sec-websocket-extensions, sec-websocket-protocol',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check for WebSocket upgrade
  const upgradeHeader = req.headers.get('upgrade');
  if (upgradeHeader?.toLowerCase() !== 'websocket') {
    return new Response('Expected WebSocket upgrade', { status: 426, headers: corsHeaders });
  }

  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not configured');
    return new Response('Server configuration error', { status: 500, headers: corsHeaders });
  }

  // Get job role and resume from query params
  const url = new URL(req.url);
  const jobRole = url.searchParams.get('jobRole') || 'Software Developer';
  const resumeContext = url.searchParams.get('resume') || '';

  console.log('Starting realtime interview session for role:', jobRole);

  // Upgrade to WebSocket
  const { socket: clientSocket, response } = Deno.upgradeWebSocket(req);

  let openAISocket: WebSocket | null = null;
  let sessionConfigured = false;

  clientSocket.onopen = () => {
    console.log('Client connected, connecting to OpenAI...');
    
    // Connect to OpenAI Realtime API
    openAISocket = new WebSocket(
      'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01',
      ['realtime', `openai-insecure-api-key.${OPENAI_API_KEY}`, 'openai-beta.realtime-v1']
    );

    openAISocket.onopen = () => {
      console.log('Connected to OpenAI Realtime API');
    };

    openAISocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Log more details for audio events
        if (data.type === 'response.audio.delta') {
          console.log('OpenAI event: response.audio.delta, delta length:', data.delta?.length);
        } else if (data.type === 'error') {
          console.error('OpenAI error:', JSON.stringify(data.error));
        } else {
          console.log('OpenAI event:', data.type);
        }

        // Configure session after receiving session.created
        if (data.type === 'session.created' && !sessionConfigured) {
          sessionConfigured = true;
          
          const systemPrompt = `You are a professional job interviewer conducting a realistic mock interview for a ${jobRole} position. 

Your behavior:
- Act as a real human interviewer with a warm but professional demeanor
- Ask ONE question at a time and wait for the candidate's response
- Listen carefully to answers and ask relevant follow-up questions
- Provide brief, constructive feedback after each answer
- Keep track of which areas you've covered

Interview structure:
1. Start with a brief greeting and ask the candidate to introduce themselves
2. Ask about their experience and background
3. Ask technical or role-specific questions
4. Ask behavioral/situational questions
5. After 5 questions, provide a brief overall assessment

${resumeContext ? `The candidate's resume context: ${resumeContext}` : ''}

Important:
- Speak naturally as if in a real interview
- Keep responses concise (30-60 seconds of speech)
- Be encouraging but honest in feedback
- If the candidate seems nervous, help them relax`;

          const sessionConfig = {
            type: 'session.update',
            session: {
              modalities: ['text', 'audio'],
              instructions: systemPrompt,
              voice: 'alloy',
              input_audio_format: 'pcm16',
              output_audio_format: 'pcm16',
              input_audio_transcription: {
                model: 'whisper-1'
              },
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

          console.log('Sending session config to OpenAI');
          openAISocket?.send(JSON.stringify(sessionConfig));

          // Start the interview with a greeting after session is configured
          setTimeout(() => {
            const startInterview = {
              type: 'response.create',
              response: {
                modalities: ['text', 'audio'],
                instructions: 'Greet the candidate warmly and ask them to briefly introduce themselves. Keep it natural and conversational.'
              }
            };
            console.log('Sending initial greeting request with modalities:', JSON.stringify(startInterview));
            openAISocket?.send(JSON.stringify(startInterview));
          }, 500);
        }

        // Forward relevant events to client
        if (clientSocket.readyState === WebSocket.OPEN) {
          clientSocket.send(event.data);
        }
      } catch (error) {
        console.error('Error processing OpenAI message:', error);
      }
    };

    openAISocket.onerror = (error) => {
      console.error('OpenAI WebSocket error:', error);
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(JSON.stringify({ type: 'error', message: 'OpenAI connection error' }));
      }
    };

    openAISocket.onclose = (event) => {
      console.log('OpenAI connection closed:', event.code, event.reason);
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.close();
      }
    };
  };

  clientSocket.onmessage = (event) => {
    // Forward messages from client to OpenAI
    if (openAISocket?.readyState === WebSocket.OPEN) {
      openAISocket.send(event.data);
    }
  };

  clientSocket.onerror = (error) => {
    console.error('Client WebSocket error:', error);
  };

  clientSocket.onclose = () => {
    console.log('Client disconnected');
    if (openAISocket?.readyState === WebSocket.OPEN) {
      openAISocket.close();
    }
  };

  return response;
});
