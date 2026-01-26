import { Mic, Phone, PhoneOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useVoiceInterview } from '@/hooks/useVoiceInterview';

interface VoiceInterviewModeProps {
  jobRole: string;
  resumeText?: string;
  onEnd: () => void;
}

export function VoiceInterviewMode({ jobRole, resumeText, onEnd }: VoiceInterviewModeProps) {
  const {
    isActive,
    isLoading,
    isSpeaking,
    isListening,
    messages,
    currentTranscript,
    start,
    stop
  } = useVoiceInterview({ jobRole, resumeContext: resumeText });

  const handleEnd = () => {
    stop();
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
                isLoading ? "bg-yellow-500/20" :
                isSpeaking ? "bg-primary/20 animate-pulse" : 
                isListening ? "bg-green-500/20" : "bg-muted"
              )}>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />
                ) : isSpeaking ? (
                  <Volume2 className="h-6 w-6 text-primary" />
                ) : isListening ? (
                  <Mic className="h-6 w-6 text-green-500" />
                ) : (
                  <VolumeX className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">
                  {isLoading ? 'Thinking...' :
                   isSpeaking ? 'Interviewer speaking...' : 
                   isListening ? 'Listening to you...' : 
                   isActive ? 'Ready' : 'Disconnected'}
                </h3>
                <p className="text-sm text-muted-foreground">{jobRole}</p>
              </div>
            </div>
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? 'Live' : 'Offline'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Transcript */}
      <Card className="h-[400px]">
        <CardHeader className="py-3">
          <CardTitle className="text-base">Conversation</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[320px] px-4">
            <div className="space-y-4 pb-4">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2",
                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <span className="text-[10px] opacity-60 mt-1 block">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}

              {currentTranscript && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-lg px-4 py-2 bg-primary/50 border border-dashed">
                    <p className="text-sm text-primary-foreground/80 italic">{currentTranscript}</p>
                  </div>
                </div>
              )}

              {messages.length === 0 && !isActive && (
                <p className="text-center text-muted-foreground py-8">
                  Click "Start Voice Interview" to begin
                </p>
              )}

              {messages.length === 0 && isActive && isLoading && (
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
          <div className="flex items-center justify-center gap-4">
            {!isActive ? (
              <Button size="lg" onClick={start} disabled={isLoading} className="gap-2">
                <Phone className="h-5 w-5" />
                Start Voice Interview
              </Button>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-3 w-3 rounded-full",
                    isListening ? "bg-green-500 animate-pulse" :
                    isSpeaking ? "bg-primary animate-pulse" :
                    "bg-muted-foreground"
                  )} />
                  <span className="text-sm text-muted-foreground">
                    {isListening ? 'Mic Active' : isSpeaking ? 'Speaking' : 'Standby'}
                  </span>
                </div>
                <Button size="lg" variant="destructive" onClick={handleEnd} className="gap-2">
                  <PhoneOff className="h-5 w-5" />
                  End Interview
                </Button>
              </>
            )}
          </div>
          {!isActive && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              Microphone access required for speech-to-text
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
