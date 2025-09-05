"use client";

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, Loader2, X } from 'lucide-react';
import { useSpeech } from '@/hooks/use-speech';
import { getAiResponse, getAudioResponse } from '@/app/actions';
import { useChat } from '@/hooks/use-chat';
import { cn } from '@/lib/utils';

type VoiceChatDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type VoiceStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

export function VoiceChatDialog({ open, onOpenChange }: VoiceChatDialogProps) {
  const { messages } = useChat();
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [audioController, setAudioController] = useState<HTMLAudioElement | null>(null);

  const handleTranscript = useCallback(async (text: string) => {
    if (!text) return;
    setStatus('thinking');
    try {
      const aiResponseContent = await getAiResponse(messages, text);
      setStatus('speaking');
      const audioSrc = await getAudioResponse(aiResponseContent);
      if (audioSrc) {
        const newAudio = new Audio(audioSrc);
        setAudioController(newAudio);
        newAudio.play();
        newAudio.onended = () => {
          setStatus('idle');
          setAudioController(null);
        };
      } else {
        setStatus('idle');
      }
    } catch (error) {
      console.error('Error in voice chat:', error);
      setStatus('idle');
    }
  }, [messages]);

  const { isListening, isSupported, toggleListening } = useSpeech(handleTranscript, true);

  useEffect(() => {
    if (open) {
      setStatus('idle');
    } else {
      audioController?.pause();
      if (isListening) {
        toggleListening();
      }
    }
  }, [open, audioController, isListening, toggleListening]);
  
  useEffect(() => {
    if (isListening) {
      setStatus('listening');
    } else if (status === 'listening') {
       setStatus('idle');
    }
  }, [isListening, status]);

  const handleMicClick = () => {
    if (audioController) {
      audioController.pause();
      setAudioController(null);
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
              className="absolute inset-4 w-32 h-32 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleMicClick}
              disabled={status === 'thinking' || status === 'speaking'}
            >
              {status === 'thinking' && <Loader2 className="w-12 h-12 animate-spin" />}
              {(status !== 'thinking') && <Mic className="w-12 h-12" />}
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
