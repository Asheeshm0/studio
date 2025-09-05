"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Copy, Volume2, BrainCircuit, User, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { useChat } from "@/hooks/use-chat";

interface ChatMessageProps {
  message?: Message;
  isLoading?: boolean;
}

export function ChatMessage({ message, isLoading = false }: ChatMessageProps) {
  const { toast } = useToast();
  const { voice } = useChat();
  const { isSpeaking, isSupported, speak, cancel } = useSpeechSynthesis();
  const [isThisMessageSpeaking, setIsThisMessageSpeaking] = useState(false);

  const isAssistant = message?.role === "assistant" || isLoading;

  const handleCopy = () => {
    if (message?.content) {
      navigator.clipboard.writeText(message.content);
      toast({
        title: "Copied to clipboard",
      });
    }
  };

  const handleSpeak = () => {
    if (!message?.content || !isSupported) {
      toast({
        title: "Speech Error",
        description: "Speech synthesis is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }
    
    if (isThisMessageSpeaking) {
      cancel();
    } else {
      speak(message.content, {
        voiceGender: voice,
        onStart: () => setIsThisMessageSpeaking(true),
        onEnd: () => setIsThisMessageSpeaking(false),
        onError: (e) => {
          setIsThisMessageSpeaking(false);
          toast({
            title: "Speech Error",
            description: `An error occurred: ${e.error}`,
            variant: "destructive",
          });
        }
      });
    }
  };

  useEffect(() => {
    // If another message starts speaking, this one should stop.
    if (!isSpeaking) {
      setIsThisMessageSpeaking(false);
    }
  }, [isSpeaking]);
  
  useEffect(() => {
    return () => {
      if (isThisMessageSpeaking) {
        cancel();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const timeAgo = useMemo(() => {
    if (!message) return null;
    try {
      return formatDistanceToNow(new Date(message.timestamp), { addSuffix: true });
    } catch (e) {
      return "just now";
    }
  }, [message]);

  return (
    <div className={cn("flex items-start gap-3", !isAssistant && "justify-end")}>
      {isAssistant && (
        <Avatar className="w-8 h-8 border">
          <AvatarFallback>
            <BrainCircuit className="w-5 h-5 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col gap-1 max-w-[85%]", !isAssistant && "items-end")}>
        <div
          className={cn(
            "p-3 rounded-lg relative text-foreground",
            isAssistant ? "bg-card" : "bg-primary text-primary-foreground"
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-current animate-pulse delay-0"></span>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse delay-150"></span>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse delay-300"></span>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm">{message?.content}</p>
          )}
        </div>
        {message && !isLoading && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            {isAssistant && (
              <>
                <Button variant="ghost" size="icon" className="w-6 h-6" onClick={handleCopy}>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="sr-only">Copy message</span>
                </Button>
                {isSupported && (
                    <Button variant="ghost" size="icon" className="w-6 h-6" onClick={handleSpeak}>
                        {isThisMessageSpeaking ? (
                            <X className="w-4 h-4 text-accent" />
                        ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                        )}
                        <span className="sr-only">{isThisMessageSpeaking ? 'Stop speaking' : 'Read message aloud'}</span>
                    </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {!isAssistant && (
        <Avatar className="w-8 h-8 border">
          <AvatarFallback>
            <User className="w-5 h-5 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
