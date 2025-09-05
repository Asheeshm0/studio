"use client";

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, Loader2, X } from 'lucide-react';
import { useSpeech } from '@/hooks/use-speech';
import { getAiResponse } from '@/app/actions';
import { useChat } from '@/hooks/use-chat';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';


type VoiceChatDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type VoiceStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

export function VoiceChatDialog({ open, onOpenChange }: VoiceChatDialogProps) {
  const { messages, voice } = useChat();
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const { toast } = useToast();

  const { isSupported: isSynthesisSupported, speak, cancel: cancelSpeaking, isSpeaking } = useSpeechSynthesis();

  const handleTranscript = useCallback(async (text: string) => {
    if (!text) return;
    setStatus('thinking');
    try {
      const aiResponseContent = await getAiResponse(messages, text);
      if (isSynthesisSupported) {
        speak(aiResponseContent, {
          voiceGender: voice,
          onStart: () => setStatus('speaking'),
          onEnd: () => setStatus('idle'),
          onError: () => {
            setStatus('idle');
            toast({ title: "Speech Error", description: "Could not play the audio response.", variant: "destructive" });
          }
        });
      } else {
        setStatus('idle');
        toast({ title: "Speech Error", description: "Speech synthesis is not supported in your browser.", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error in voice chat:', error);
      setStatus('idle');
      toast({ title: "Error", description: "An unexpected error occurred during voice chat.", variant: "destructive" });
    }
  }, [messages, toast, isSynthesisSupported, voice, speak]);

  const { isListening, isSupported: isRecognitionSupported, toggleListening } = useSpeech(handleTranscript, true);
  
  useEffect(() => {
    if (!open) {
      cancelSpeaking();
      if (isListening) {
        toggleListening();
      }
      setStatus('idle');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if(isListening) {
      setStatus('listening');
    } else if (status === 'listening') {
      // This handles the case where speech recognition stops on its own
      setStatus('idle');
    }
  }, [isListening, status]);
  
  useEffect(() => {
    if (!isSpeaking && status === 'speaking') {
      setStatus('idle');
    }
  }, [isSpeaking, status]);


  const handleMicClick = () => {
    if (!isRecognitionSupported) {
        toast({ title: "Unsupported", description: "Speech recognition is not supported in your browser.", variant: "destructive" });
        return;
    }
    if (status === 'speaking') {
      cancelSpeaking();
    }
    toggleListening();
  };
  
  const getStatusText = () => {
    switch (status) {
        case 'listening': return "I'm listening...";
        case 'thinking': return "Thinking...";
        case 'speaking': return "Speaking...";
        default: return "Click the mic to start talking.";
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] h-full flex flex-col bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="text-center">Voice Chat</DialogTitle>
          <DialogDescription className="text-center">
            {getStatusText()}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-40 h-40">
            <div className={cn("absolute inset-0 rounded-full bg-primary/20", (status === 'listening' || status === 'speaking') && "animate-pulse")}></div>
            <div className="absolute inset-2 rounded-full bg-primary/40"></div>
            <Button
              size="icon"
              className={cn("absolute inset-4 w-32 h-32 rounded-full text-primary-foreground", status === 'listening' ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90")}
              onClick={handleMicClick}
              disabled={status === 'thinking'}
            >
              {status === 'thinking' && <Loader2 className="w-12 h-12 animate-spin" />}
              {status !== 'thinking' && <Mic className="w-12 h-12" />}
            </Button>
          </div>
        </div>
        <DialogFooter>
           <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
            <X className="w-4 h-4 mr-2" />
            End Voice Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
