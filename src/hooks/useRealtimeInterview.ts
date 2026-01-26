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
  const currentMessageRef = useRef('');

  const encodeAudio = useCallback((float32: Float32Array): string => {
    const int16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      const s = Math.max(-1, Math.min(1, float32[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + 0x8000, bytes.length)));
    }
    return btoa(binary);
  }, []);

  const createWav = useCallback((pcm: Uint8Array): ArrayBuffer => {
    const samples = new Int16Array(pcm.length / 2);
    for (let i = 0; i < pcm.length; i += 2) {
      samples[i / 2] = (pcm[i + 1] << 8) | pcm[i];
    }
    
    const buffer = new ArrayBuffer(44 + samples.byteLength);
    const view = new DataView(buffer);
    const write = (off: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i));
    };
    
    write(0, 'RIFF');
    view.setUint32(4, 36 + samples.byteLength, true);
    write(8, 'WAVE');
    write(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, 24000, true);
    view.setUint32(28, 48000, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    write(36, 'data');
    view.setUint32(40, samples.byteLength, true);
    new Uint8Array(buffer, 44).set(new Uint8Array(samples.buffer));
    
    return buffer;
  }, []);

  const playNext = useCallback(async () => {
    if (!audioQueueRef.current.length) {
      isPlayingRef.current = false;
      setIsSpeaking(false);
      return;
    }

    isPlayingRef.current = true;
    setIsSpeaking(true);
    const data = audioQueueRef.current.shift()!;

    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const wavBuffer = createWav(data);
      const audioBuffer = await audioContextRef.current.decodeAudioData(wavBuffer.slice(0));
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = playNext;
      source.start(0);
    } catch (e) {
      console.error('Audio play error:', e);
      playNext();
    }
  }, [createWav]);

  const queueAudio = useCallback((data: Uint8Array) => {
    audioQueueRef.current.push(data);
    if (!isPlayingRef.current) playNext();
  }, [playNext]);

  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 24000, channelCount: 1, echoCancellation: true, noiseSuppression: true }
      });

      mediaStreamRef.current = stream;
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }
      
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      processorRef.current.onaudioprocess = (e) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: encodeAudio(e.inputBuffer.getChannelData(0))
          }));
        }
      };

      sourceRef.current.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);
      setIsListening(true);
    } catch (e) {
      console.error('Mic error:', e);
      toast({ title: 'Microphone Error', variant: 'destructive' });
    }
  }, [encodeAudio, toast]);

  const stopMic = useCallback(() => {
    sourceRef.current?.disconnect();
    processorRef.current?.disconnect();
    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    sourceRef.current = null;
    processorRef.current = null;
    mediaStreamRef.current = null;
    setIsListening(false);
  }, []);

  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    setIsConnecting(true);

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Pre-init AudioContext for autoplay
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }
      await audioContextRef.current.resume();

      const params = new URLSearchParams({ jobRole });
      if (resumeContext) params.set('resume', resumeContext);

      wsRef.current = new WebSocket(
        `wss://fsorkxlcasekndigezlx.functions.supabase.co/functions/v1/realtime-interview?${params}`
      );

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        startMic();
      };

      wsRef.current.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          
          if (msg.type === 'response.audio.delta' && msg.delta) {
            const bytes = Uint8Array.from(atob(msg.delta), c => c.charCodeAt(0));
            queueAudio(bytes);
          } else if (msg.type === 'response.audio_transcript.delta') {
            currentMessageRef.current += msg.delta || '';
            setCurrentTranscript(currentMessageRef.current);
          } else if (msg.type === 'response.audio_transcript.done') {
            if (currentMessageRef.current) {
              setMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: currentMessageRef.current,
                timestamp: new Date()
              }]);
              currentMessageRef.current = '';
              setCurrentTranscript('');
            }
          } else if (msg.type === 'conversation.item.input_audio_transcription.completed' && msg.transcript) {
            setMessages(prev => [...prev, {
              id: crypto.randomUUID(),
              role: 'user',
              content: msg.transcript,
              timestamp: new Date()
            }]);
          } else if (msg.type === 'input_audio_buffer.speech_started') {
            setIsListening(true);
          } else if (msg.type === 'input_audio_buffer.speech_stopped') {
            setIsListening(false);
          } else if (msg.type === 'error') {
            console.error('API error:', msg.error);
            toast({ title: 'Error', description: msg.error?.message, variant: 'destructive' });
          }
        } catch (err) {
          console.error('Parse error:', err);
        }
      };

      wsRef.current.onerror = () => {
        setIsConnecting(false);
        toast({ title: 'Connection Failed', variant: 'destructive' });
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        stopMic();
      };
    } catch (e) {
      console.error('Connect error:', e);
      setIsConnecting(false);
      toast({ title: 'Connection Failed', variant: 'destructive' });
    }
  }, [jobRole, resumeContext, startMic, stopMic, queueAudio, toast]);

  const disconnect = useCallback(() => {
    stopMic();
    wsRef.current?.close();
    wsRef.current = null;
    audioQueueRef.current = [];
    setIsConnected(false);
    setIsSpeaking(false);
    setCurrentTranscript('');
  }, [stopMic]);

  useEffect(() => {
    return () => {
      disconnect();
      audioContextRef.current?.close();
    };
  }, [disconnect]);

  return { isConnected, isConnecting, isSpeaking, isListening, messages, currentTranscript, connect, disconnect };
}
