import { Mic, Phone, PhoneOff, Volume2, VolumeX, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useVoiceInterview } from '@/hooks/useVoiceInterview';
import { useEffect, useRef } from 'react';

interface VoiceInterviewModeProps {
  jobRole: string;
  industry?: string;
  difficulty?: string;
  interviewType?: string;
  resumeText?: string;
  jobDescription?: string;
  onEnd: () => void;
}

export function VoiceInterviewMode({
  jobRole,
  industry,
  difficulty,
  interviewType,
  resumeText,
  jobDescription,
  onEnd,
}: VoiceInterviewModeProps) {
  const {
    phase,
    isActive,
    isLoading,
    isSpeaking,
    isListening,
    isCompleted,
    messages,
    currentTranscript,
    error,
    start,
    stop,
    retry,
  } = useVoiceInterview({
    jobRole,
    industry,
    difficulty,
    interviewType,
    resumeContext: resumeText,
    jobDescription,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentTranscript]);

  const handleEnd = () => {
    stop();
    onEnd();
  };

  const getStatusInfo = () => {
    switch (phase) {
      case 'connecting':
        return { label: 'Connecting...', icon: Loader2, color: 'bg-yellow-500/20', iconColor: 'text-yellow-500', animate: 'animate-spin' };
      case 'processing':
        return { label: 'Thinking...', icon: Loader2, color: 'bg-yellow-500/20', iconColor: 'text-yellow-500', animate: 'animate-spin' };
      case 'ai_speaking':
        return { label: 'Interviewer speaking...', icon: Volume2, color: 'bg-primary/20', iconColor: 'text-primary', animate: 'animate-pulse' };
      case 'user_speaking':
        return { label: 'Listening to you...', icon: Mic, color: 'bg-green-500/20', iconColor: 'text-green-500', animate: '' };
      case 'completed':
        return { label: 'Interview Complete', icon: Volume2, color: 'bg-primary/20', iconColor: 'text-primary', animate: '' };
      case 'error':
        return { label: 'Error occurred', icon: AlertTriangle, color: 'bg-destructive/20', iconColor: 'text-destructive', animate: '' };
      default:
        return { label: 'Ready', icon: VolumeX, color: 'bg-muted', iconColor: 'text-muted-foreground', animate: '' };
    }
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6" role="region" aria-label="Voice Interview Session">
      {/* Status Bar */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn("h-12 w-12 rounded-full flex items-center justify-center transition-all", status.color)}
                role="status"
                aria-live="polite"
                aria-label={status.label}
              >
                <StatusIcon className={cn("h-6 w-6", status.iconColor, status.animate)} aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold">{status.label}</h3>
                <p className="text-sm text-muted-foreground">{jobRole}</p>
              </div>
            </div>
            <Badge variant={isActive ? 'default' : 'secondary'} aria-label={`Status: ${isActive ? 'Live' : isCompleted ? 'Completed' : 'Offline'}`}>
              {isCompleted ? 'Done' : isActive ? 'Live' : 'Offline'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {phase === 'error' && error && (
        <Card className="border-destructive/50 bg-destructive/5" role="alert">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Error</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button size="sm" variant="outline" onClick={retry} className="gap-2 shrink-0">
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transcript */}
      <Card className="h-[400px]">
        <CardHeader className="py-3">
          <CardTitle className="text-base">Conversation</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[320px] px-4" ref={scrollRef}>
            <div className="space-y-4 pb-4" role="log" aria-label="Interview conversation" aria-live="polite">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2",
                      msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}
                    role="article"
                    aria-label={`${msg.role === 'user' ? 'You' : 'Interviewer'}: ${msg.content.slice(0, 50)}...`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <span className="text-[10px] opacity-60 mt-1 block" aria-hidden="true">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}

              {currentTranscript && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-lg px-4 py-2 bg-primary/50 border border-dashed">
                    <p className="text-sm text-primary-foreground/80 italic" aria-label="Your speech in progress">
                      {currentTranscript}
                    </p>
                  </div>
                </div>
              )}

              {messages.length === 0 && phase === 'idle' && (
                <p className="text-center text-muted-foreground py-8">
                  Click "Start Voice Interview" to begin
                </p>
              )}

              {messages.length === 0 && (phase === 'connecting') && (
                <p className="text-center text-muted-foreground py-8">
                  Preparing your interview...
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-center gap-4" role="toolbar" aria-label="Interview controls">
            {phase === 'idle' || phase === 'error' ? (
              <Button
                size="lg"
                onClick={start}
                disabled={isLoading}
                className="gap-2"
                aria-label="Start voice interview"
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
                Start Voice Interview
              </Button>
            ) : (
              <>
                <div className="flex items-center gap-2" aria-hidden="true">
                  <div className={cn(
                    "h-3 w-3 rounded-full",
                    isListening ? "bg-green-500 animate-pulse" :
                    isSpeaking ? "bg-primary animate-pulse" :
                    "bg-muted-foreground"
                  )} />
                  <span className="text-sm text-muted-foreground">
                    {isListening ? 'Mic Active' : isSpeaking ? 'Speaking' : isLoading ? 'Processing' : 'Standby'}
                  </span>
                </div>
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={handleEnd}
                  className="gap-2"
                  aria-label="End interview"
                >
                  <PhoneOff className="h-5 w-5" aria-hidden="true" />
                  End Interview
                </Button>
              </>
            )}
          </div>
          {(phase === 'idle' || phase === 'error') && (
            <p className="text-center text-xs text-muted-foreground mt-4" role="note">
              Microphone access required · Best in Chrome or Edge
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
