"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, CornerDownLeft, Loader2, Voicemail } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { useSpeech } from "@/hooks/use-speech";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


export function ChatInput() {
  const [inputValue, setInputValue] = useState("");
  const { sendMessage, isLoading, isVoiceChatMode, setIsVoiceChatMode } = useChat();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleTranscript = useCallback((text: string) => {
    setInputValue(text);
  }, []);

  const { isListening, isSupported, toggleListening } = useSpeech(handleTranscript);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);
  
  useEffect(() => {
    if (!isListening && inputValue.trim()) {
        sendMessage(inputValue);
        setInputValue("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);
  
  const handleMicClick = () => {
    if (isListening) {
      toggleListening();
    } else {
      setIsVoiceChatMode(true);
      toggleListening();
    }
  }

  return (
    <div className="p-4 border-t bg-card">
      <form onSubmit={handleSubmit} className="relative">
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening..." : "Ask Athena anything..."}
          className="pr-32 min-h-[48px] resize-none"
          rows={1}
          disabled={isLoading}
        />
        <div className="absolute top-1/2 right-3 -translate-y-1/2 flex gap-1">
          <TooltipProvider>
             <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" size="icon" variant="ghost" onClick={() => setIsVoiceChatMode(prev => !prev)} disabled={isLoading}>
                    <Voicemail className={cn("w-5 h-5", isVoiceChatMode ? "text-red-500" : "text-muted-foreground")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Voice Chat Mode</p>
                </TooltipContent>
              </Tooltip>
            {isSupported && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" size="icon" variant="ghost" onClick={handleMicClick} disabled={isLoading}>
                    <Mic className={cn("w-5 h-5", isListening ? "text-red-500" : "text-muted-foreground")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Voice Input</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="submit" size="icon" variant="ghost" disabled={isLoading || !inputValue.trim()}>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 text-primary" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send Message</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </form>
       <p className="text-xs text-muted-foreground mt-2 text-center">
        Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"><span className="text-sm">Shift</span>+<CornerDownLeft size={12} /></kbd> for a new line.
      </p>
    </div>
  );
}
