import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseRealtimeInterviewOptions {
  jobRole: string;
  resumeContext?: string;
}

export function useRealtimeInterview({ jobRole, resumeContext }: UseRealtimeInterviewOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const { toast } = useToast();

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioQueueRef = useRef<Uint8Array[]>([]);
  const isPlayingRef = useRef(false);
  const currentAssistantMessageRef = useRef<string>('');

  // Convert Float32 audio to base64 PCM16
  const encodeAudioForAPI = useCallback((float32Array: Float32Array): string => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    const uint8Array = new Uint8Array(int16Array.buffer);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    return btoa(binary);
  }, []);

  // Create WAV from PCM data
  const createWavFromPCM = useCallback((pcmData: Uint8Array): Uint8Array => {
    const int16Data = new Int16Array(pcmData.length / 2);
    for (let i = 0; i < pcmData.length; i += 2) {
      int16Data[i / 2] = (pcmData[i + 1] << 8) | pcmData[i];
    }

    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + int16Data.byteLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
    view.setUint16(32, numChannels * (bitsPerSample / 8), true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, int16Data.byteLength, true);

    const wavArray = new Uint8Array(wavHeader.byteLength + int16Data.byteLength);
    wavArray.set(new Uint8Array(wavHeader), 0);
    wavArray.set(new Uint8Array(int16Data.buffer), wavHeader.byteLength);

    return wavArray;
  }, []);

  // Play audio from queue
  const playNextAudio = useCallback(async () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setIsSpeaking(false);
      return;
    }

    isPlayingRef.current = true;
    setIsSpeaking(true);
    const audioData = audioQueueRef.current.shift()!;

    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }
      
      // Resume AudioContext if suspended (browser autoplay policy)
      if (audioContextRef.current.state === 'suspended') {
        console.log('Resuming AudioContext...');
        await audioContextRef.current.resume();
      }

      const wavData = createWavFromPCM(audioData);
      const arrayBuffer = wavData.buffer.slice(wavData.byteOffset, wavData.byteOffset + wavData.byteLength) as ArrayBuffer;
      
      // Clone the buffer to avoid detached ArrayBuffer issues
      const clonedBuffer = arrayBuffer.slice(0);
      const audioBuffer = await audioContextRef.current.decodeAudioData(clonedBuffer);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => playNextAudio();
      source.start(0);
      console.log('Playing audio chunk, queue size:', audioQueueRef.current.length);
    } catch (error) {
      console.error('Error playing audio:', error);
      playNextAudio();
    }
  }, [createWavFromPCM]);

  // Add audio to queue
  const queueAudio = useCallback((audioData: Uint8Array) => {
    audioQueueRef.current.push(audioData);
    if (!isPlayingRef.current) {
      playNextAudio();
    }
  }, [playNextAudio]);

  // Start microphone recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      mediaStreamRef.current = stream;
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      processorRef.current.onaudioprocess = (e) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const encodedAudio = encodeAudioForAPI(new Float32Array(inputData));
          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: encodedAudio
          }));
        }
      };

      sourceRef.current.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);
      setIsListening(true);
      console.log('Microphone started');
    } catch (error) {
      console.error('Error starting microphone:', error);
      toast({
        title: 'Microphone Error',
        description: 'Could not access microphone. Please check permissions.',
        variant: 'destructive'
      });
    }
  }, [encodeAudioForAPI, toast]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsListening(false);
    console.log('Microphone stopped');
  }, []);

  // Connect to interview session
  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setIsConnecting(true);

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Pre-initialize AudioContext with user gesture to avoid autoplay issues
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
        console.log('AudioContext resumed during connect');
      }

      const params = new URLSearchParams({
        jobRole,
        ...(resumeContext && { resume: resumeContext })
      });

      const wsUrl = `wss://fsorkxlcasekndigezlx.functions.supabase.co/functions/v1/realtime-interview?${params}`;
      console.log('Connecting to:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        startRecording();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received:', data.type);

          switch (data.type) {
            case 'response.audio.delta':
              // Decode and queue audio
              if (data.delta) {
                console.log('Received audio delta, length:', data.delta.length);
                try {
                  const binaryString = atob(data.delta);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  queueAudio(bytes);
                } catch (e) {
                  console.error('Error decoding audio delta:', e);
                }
              }
              break;

            case 'response.audio_transcript.delta':
              // Update current transcript
              currentAssistantMessageRef.current += data.delta;
              setCurrentTranscript(currentAssistantMessageRef.current);
              break;

            case 'response.audio_transcript.done':
              // Finalize assistant message
              if (currentAssistantMessageRef.current) {
                setMessages(prev => [...prev, {
                  id: crypto.randomUUID(),
                  role: 'assistant',
                  content: currentAssistantMessageRef.current,
                  timestamp: new Date()
                }]);
                currentAssistantMessageRef.current = '';
                setCurrentTranscript('');
              }
              break;

            case 'conversation.item.input_audio_transcription.completed':
              // User's transcribed speech
              if (data.transcript) {
                setMessages(prev => [...prev, {
                  id: crypto.randomUUID(),
                  role: 'user',
                  content: data.transcript,
                  timestamp: new Date()
                }]);
              }
              break;

            case 'input_audio_buffer.speech_started':
              setIsListening(true);
              break;

            case 'input_audio_buffer.speech_stopped':
              setIsListening(false);
              break;

            case 'error':
              console.error('OpenAI error:', data);
              toast({
                title: 'Interview Error',
                description: data.error?.message || 'An error occurred',
                variant: 'destructive'
              });
              break;
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnecting(false);
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to interview session',
          variant: 'destructive'
        });
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        setIsConnecting(false);
        stopRecording();
      };

    } catch (error) {
      console.error('Connection error:', error);
      setIsConnecting(false);
      toast({
        title: 'Connection Failed',
        description: 'Could not start interview session. Please try again.',
        variant: 'destructive'
      });
    }
  }, [jobRole, resumeContext, startRecording, stopRecording, queueAudio, toast]);

  // Disconnect
  const disconnect = useCallback(() => {
    stopRecording();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    audioQueueRef.current = [];
    setIsConnected(false);
    setIsSpeaking(false);
    setCurrentTranscript('');
  }, [stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    isSpeaking,
    isListening,
    messages,
    currentTranscript,
    connect,
    disconnect
  };
}
