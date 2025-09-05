"use client";

import { createContext, useState, useCallback, useEffect, ReactNode } from "react";
import type { Message, Chat } from "@/lib/types";
import useLocalStorage from "@/hooks/use-local-storage";
import { getAiResponse, getAudioResponse } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { nanoid } from "nanoid";

export interface ChatContextType {
  chats: Chat[];
  activeChatId: string | null;
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  exportChat: () => void;
  setActiveChatId: (id: string | null) => void;
  createNewChat: () => void;
  isVoiceChatMode: boolean;
  setIsVoiceChatMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useLocalStorage<Chat[]>("athena-ai-chats", []);
  const [activeChatId, setActiveChatId] = useLocalStorage<string | null>("athena-ai-active-chat-id", null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceChatMode, setIsVoiceChatMode] = useState(false);
  const { toast } = useToast();

  const messages = chats.find(chat => chat.id === activeChatId)?.messages ?? [];

  const createNewChat = useCallback(() => {
    const newChatId = nanoid();
    const newChat: Chat = {
      id: newChatId,
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChatId);
  }, [setChats, setActiveChatId]);
  
  // Create a default chat if none exists
  useEffect(() => {
    if (chats.length === 0) {
      createNewChat();
    } else if (!activeChatId || !chats.find(c => c.id === activeChatId)) {
      setActiveChatId(chats[0]?.id || null);
    }
  }, [chats, activeChatId, createNewChat, setActiveChatId]);


  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !activeChatId) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    
    setChats(prev => prev.map(chat => 
      chat.id === activeChatId ? { ...chat, messages: updatedMessages } : chat
    ));

    setIsLoading(true);

    try {
      const aiResponseContent = await getAiResponse(updatedMessages, content);
      
      const aiMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: aiResponseContent,
        timestamp: Date.now(),
      };
      
      setChats(prev => prev.map(chat => 
        chat.id === activeChatId ? { ...chat, messages: [...updatedMessages, aiMessage] } : chat
      ));

      if (isVoiceChatMode) {
        const audioSrc = await getAudioResponse(aiResponseContent);
        if (audioSrc) {
          const audio = new Audio(audioSrc);
          audio.play();
        } else {
            toast({
            title: "Audio Error",
            description: "Could not generate audio for the response.",
            variant: "destructive",
          });
        }
      }

    } catch (error) {
      console.error("Failed to get AI response:", error);
      toast({
        title: "Error",
        description: "Failed to get a response from the assistant. Please check your connection and try again.",
        variant: "destructive",
      });
      setChats(prev => prev.map(chat => 
        chat.id === activeChatId ? { ...chat, messages } : chat
      ));
    } finally {
      setIsLoading(false);
    }
  }, [activeChatId, messages, setChats, toast, isVoiceChatMode]);

  const clearChat = useCallback(() => {
    if (!activeChatId) return;
    setChats(prev => prev.map(chat =>
      chat.id === activeChatId ? { ...chat, messages: [] } : chat
    ));
    toast({
      title: "Chat Cleared",
      description: "This conversation's history has been cleared.",
    });
  }, [activeChatId, setChats, toast]);

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
    chats,
    activeChatId,
    messages,
    isLoading,
    sendMessage,
    clearChat,
    exportChat,
    setActiveChatId,
    createNewChat,
    isVoiceChatMode,
    setIsVoiceChatMode,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
