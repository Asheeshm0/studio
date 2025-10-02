"use client";

import { useState, useRef, useEffect, useCallback, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, CornerDownLeft, Loader2, Voicemail, Paperclip, X, FileText, ImageIcon } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { useSpeech } from "@/hooks/use-speech";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { VoiceChatDialog } from "./voice-chat-dialog";
import type { Attachment } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export function ChatInput() {
  const [inputValue, setInputValue] = useState("");
  const { sendMessage, isLoading } = useChat();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const { toast } = useToast();

  const handleTranscript = useCallback((text: string) => {
    setInputValue(text);
  }, []);

  const { isListening, isSupported, toggleListening } = useSpeech(handleTranscript);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() || attachments.length > 0) {
      sendMessage(inputValue, attachments);
      setInputValue("");
      setAttachments([]);
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
      sendMessage(inputValue, attachments);
      setInputValue("");
      setAttachments([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  const handleMicClick = () => {
    toggleListening();
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (attachments.length + files.length > 5) {
      toast({ title: "Too many files", description: "You can upload a maximum of 5 files.", variant: "destructive" });
      return;
    }

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const type = file.type.startsWith('image/') ? 'image' : 'document';
        setAttachments(prev => [...prev, { name: file.name, type, content }]);
      };
      
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else if (file.type === 'text/plain') {
        reader.readAsText(file);
      } else {
        toast({ title: "Unsupported file type", description: `File type for ${file.name} is not supported.`, variant: "destructive" });
      }
    });

    // Reset file input
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 border-t bg-card">
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div key={index} className="relative p-2 border rounded-lg flex items-center gap-2 bg-muted/50 text-sm">
              {file.type === 'image' ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              <span className="max-w-xs truncate">{file.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="w-5 h-5 absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground"
                onClick={() => removeAttachment(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <VoiceChatDialog open={isVoiceChatOpen} onOpenChange={setIsVoiceChatOpen} />
      <form onSubmit={handleSubmit} className="relative">
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening..." : "Ask KATTAPA anything..."}
          className="pr-40 min-h-[48px] resize-none"
          rows={1}
          disabled={isLoading}
        />
        <div className="absolute top-1/2 right-3 -translate-y-1/2 flex gap-1">
          <TooltipProvider>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/png, image/jpeg, .txt" className="hidden" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                  <Paperclip className={cn("w-5 h-5", "text-muted-foreground")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Attach Files</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" size="icon" variant="ghost" onClick={() => setIsVoiceChatOpen(true)} disabled={isLoading}>
                  <Voicemail className={cn("w-5 h-5", "text-muted-foreground")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Voice Chat</p>
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
                <Button type="submit" size="icon" variant="ghost" disabled={isLoading || (!inputValue.trim() && attachments.length === 0)}>
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
