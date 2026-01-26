import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseVoiceInterviewOptions {
  jobRole: string;
  resumeContext?: string;
}

export function useVoiceInterview({ jobRole, resumeContext }: UseVoiceInterviewOptions) {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const { toast } = useToast();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const interviewIdRef = useRef<string | null>(null);
  const questionCountRef = useRef(0);
  const conversationHistoryRef = useRef<Array<{ role: string; content: string }>>([]);

  const speakText = useCallback(async (text: string) => {
    setIsSpeaking(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interview-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        throw new Error('TTS request failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        // Start listening after interviewer finishes speaking
        startListening();
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
      toast({ title: 'Audio Error', description: 'Failed to play audio', variant: 'destructive' });
    }
  }, [toast]);

  const startListening = useCallback(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionClass) {
      toast({ title: 'Not Supported', description: 'Speech recognition is not supported in this browser', variant: 'destructive' });
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setCurrentTranscript('');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setCurrentTranscript(interimTranscript || finalTranscript);

      if (finalTranscript) {
        handleUserResponse(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setCurrentTranscript('');
  }, []);

  const handleUserResponse = useCallback(async (userText: string) => {
    stopListening();
    
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setCurrentTranscript('');
    setIsLoading(true);

    // Update conversation history
    conversationHistoryRef.current.push({ role: 'user', content: userText });

    try {
      const { data, error } = await supabase.functions.invoke('mock-interview', {
        body: {
          action: 'answer',
          interviewId: interviewIdRef.current,
          answer: userText,
          conversationHistory: conversationHistoryRef.current,
        }
      });

      if (error) throw error;

      questionCountRef.current++;
      
      // Add feedback as assistant message
      let responseText = '';
      if (data.feedback) {
        responseText = `${data.feedback.verdict}: ${data.feedback.feedback}`;
        if (data.feedback.tip) {
          responseText += ` Tip: ${data.feedback.tip}`;
        }
      }
      
      if (!data.isComplete && data.nextQuestion) {
        responseText = data.nextQuestion;
        conversationHistoryRef.current.push({ role: 'assistant', content: data.nextQuestion });
      } else if (data.isComplete) {
        responseText = "Great job! You've completed all 5 questions. Let me prepare your overall feedback...";
        
        // Get final feedback
        const { data: feedbackData } = await supabase.functions.invoke('mock-interview', {
          body: {
            action: 'feedback',
            interviewId: interviewIdRef.current,
          }
        });
        
        if (feedbackData?.overallFeedback) {
          const fb = feedbackData.overallFeedback;
          responseText = `Interview Complete! Your score: ${fb.overallScore}/100. ${fb.assessment}. Key strengths: ${fb.strengths?.join(', ')}. Areas to improve: ${fb.weaknesses?.join(', ')}.`;
        }
      }

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

      // Speak the response
      await speakText(responseText);
    } catch (error) {
      console.error('AI response error:', error);
      toast({ title: 'Error', description: 'Failed to get response', variant: 'destructive' });
      startListening();
    } finally {
      setIsLoading(false);
    }
  }, [speakText, stopListening, startListening, toast]);

  const start = useCallback(async () => {
    setIsActive(true);
    setMessages([]);
    questionCountRef.current = 0;
    conversationHistoryRef.current = [];
    setIsLoading(true);

    try {
      // Start interview with mock-interview edge function
      const { data, error } = await supabase.functions.invoke('mock-interview', {
        body: {
          action: 'start',
          jobRole,
          resumeText: resumeContext,
          difficulty: 'intermediate',
          interviewType: 'mixed',
        }
      });

      if (error) throw error;

      interviewIdRef.current = data.interview?.id;
      const greeting = data.currentQuestion;
      
      // Add to conversation history
      conversationHistoryRef.current.push({ role: 'assistant', content: greeting });
      
      const greetingMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: greeting,
        timestamp: new Date()
      };
      setMessages([greetingMessage]);
      
      // Speak the greeting
      await speakText(greeting);
    } catch (error) {
      console.error('Start error:', error);
      toast({ title: 'Error', description: 'Failed to start interview', variant: 'destructive' });
      setIsActive(false);
    } finally {
      setIsLoading(false);
    }
  }, [jobRole, resumeContext, speakText, toast]);

  const stop = useCallback(() => {
    stopListening();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsActive(false);
    setIsSpeaking(false);
    setCurrentTranscript('');
    interviewIdRef.current = null;
  }, [stopListening]);

  return {
    isActive,
    isLoading,
    isSpeaking,
    isListening,
    messages,
    currentTranscript,
    start,
    stop,
  };
}
