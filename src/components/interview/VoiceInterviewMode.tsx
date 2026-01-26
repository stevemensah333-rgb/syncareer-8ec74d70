import { useState, useEffect } from 'react';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRealtimeInterview } from '@/hooks/useRealtimeInterview';

interface VoiceInterviewModeProps {
  jobRole: string;
  resumeText?: string;
  onEnd: () => void;
}

export function VoiceInterviewMode({ jobRole, resumeText, onEnd }: VoiceInterviewModeProps) {
  const {
    isConnected,
    isConnecting,
    isSpeaking,
    isListening,
    messages,
    currentTranscript,
    connect,
    disconnect
  } = useRealtimeInterview({
    jobRole,
    resumeContext: resumeText
  });

  const handleEnd = () => {
    disconnect();
    onEnd();
  };

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center transition-all",
                isSpeaking ? "bg-primary/20 animate-pulse" : 
                isListening ? "bg-green-500/20" : "bg-muted"
              )}>
                {isSpeaking ? (
                  <Volume2 className="h-6 w-6 text-primary" />
                ) : isListening ? (
                  <Mic className="h-6 w-6 text-green-500" />
                ) : (
                  <VolumeX className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">
                  {isSpeaking ? 'Interviewer is speaking...' : 
                   isListening ? 'Listening to you...' : 
                   isConnected ? 'Ready' : 'Disconnected'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Voice Interview for {jobRole}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? 'default' : 'secondary'}>
                {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Offline'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transcript Area */}
      <Card className="h-[400px]">
        <CardHeader className="py-3">
          <CardTitle className="text-base">Conversation</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[320px] px-4">
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2",
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span className="text-[10px] opacity-60 mt-1 block">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}

              {/* Current transcript (live) */}
              {currentTranscript && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted/50 border border-dashed">
                    <p className="text-sm text-muted-foreground italic">
                      {currentTranscript}
                    </p>
                  </div>
                </div>
              )}

              {messages.length === 0 && !currentTranscript && isConnected && (
                <div className="text-center text-muted-foreground py-8">
                  <p>The interviewer will start speaking shortly...</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-center gap-4">
            {!isConnected ? (
              <Button
                size="lg"
                onClick={connect}
                disabled={isConnecting}
                className="gap-2"
              >
                <Phone className="h-5 w-5" />
                {isConnecting ? 'Connecting...' : 'Start Voice Interview'}
              </Button>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-3 w-3 rounded-full",
                    isListening ? "bg-green-500 animate-pulse" : "bg-muted-foreground"
                  )} />
                  <span className="text-sm text-muted-foreground">
                    {isListening ? 'Mic Active' : 'Mic Standby'}
                  </span>
                </div>
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={handleEnd}
                  className="gap-2"
                >
                  <PhoneOff className="h-5 w-5" />
                  End Interview
                </Button>
              </>
            )}
          </div>

          {!isConnected && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              Microphone access is required for voice interviews
            </p>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      {!isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Voice Interview Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Mic className="h-4 w-4 mt-0.5 text-primary" />
                Speak naturally - the AI will wait for you to finish
              </li>
              <li className="flex items-start gap-2">
                <Volume2 className="h-4 w-4 mt-0.5 text-primary" />
                The interviewer will speak questions aloud
              </li>
              <li className="flex items-start gap-2">
                <PhoneOff className="h-4 w-4 mt-0.5 text-primary" />
                End the interview anytime to return to setup
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
