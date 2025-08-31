"use client";

import { createContext, useState, useCallback, useEffect, ReactNode } from "react";
import type { Message } from "@/lib/types";
import useLocalStorage from "@/hooks/use-local-storage";
import { getAiResponse } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

export interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  exportChat: () => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useLocalStorage<Message[]>("athena-ai-chat", []);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const aiResponseContent = await getAiResponse(newMessages, content);
      
      const aiMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: aiResponseContent,
        timestamp: Date.now(),
      };
      setMessages([...newMessages, aiMessage]);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      toast({
        title: "Error",
        description: "Failed to get a response from the assistant. Please check your connection and try again.",
        variant: "destructive",
      });
      // Optionally remove the user message if the call fails
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  }, [messages, setMessages, toast]);

  const clearChat = useCallback(() => {
    setMessages([]);
    toast({
      title: "Chat Cleared",
      description: "Your conversation history has been cleared.",
    });
  }, [setMessages, toast]);

  const exportChat = useCallback(() => {
    if (messages.length === 0) {
      toast({
        title: "Export Failed",
        description: "There are no messages to export.",
        variant: "destructive",
      });
      return;
    }
    const fileContent = messages
      .map(msg => {
        const time = new Date(msg.timestamp).toLocaleString();
        return `[${time}] ${msg.role.toUpperCase()}:\n${msg.content}`;
      })
      .join("\n\n---------------------------------\n\n");
    
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `athena-ai-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: "Chat Exported",
      description: "Your conversation has been saved as a text file.",
    });
  }, [messages, toast]);

  const value = {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    exportChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
