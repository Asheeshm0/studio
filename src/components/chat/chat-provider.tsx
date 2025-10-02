"use client";

import { createContext, useState, useCallback, useEffect, ReactNode } from "react";
import type { Message, Chat, Attachment } from "@/lib/types";
import useLocalStorage from "@/hooks/use-local-storage";
import { getAiResponse } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { nanoid } from "nanoid";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";

export type VoiceOption = "female" | "male";

export interface ChatContextType {
  chats: Chat[];
  activeChatId: string | null;
  messages: Message[];
  isLoading: boolean;
  voice: VoiceOption;
  setVoice: (voice: VoiceOption) => void;
  sendMessage: (content: string, attachments?: Attachment[]) => Promise<void>;
  regenerateResponse: () => Promise<void>;
  clearChat: () => void;
  exportChat: () => void;
  setActiveChatId: (id: string | null) => void;
  createNewChat: () => void;
  isVoiceChatMode: boolean;
  setIsVoiceChatMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useLocalStorage<Chat[]>("kattapa-ai-chats", []);
  const [activeChatId, setActiveChatId] = useLocalStorage<string | null>("kattapa-ai-active-chat-id", null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceChatMode, setIsVoiceChatMode] = useState(false);
  const [voice, setVoice] = useLocalStorage<VoiceOption>("kattapa-ai-voice", "female");
  const { toast } = useToast();
  const { speak, cancel, isSupported } = useSpeechSynthesis();

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
  
  useEffect(() => {
    return () => {
      // Clean up speech synthesis when provider unmounts
      if (isSupported) {
        cancel();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported]);
  
  const getAiResponseAndUpdateState = useCallback(async (history: Message[], messageContent: string, attachments: Attachment[] = []) => {
    setIsLoading(true);
    try {
      const aiResponseContent = await getAiResponse(history, messageContent, attachments);
      
      const aiMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: aiResponseContent,
        timestamp: Date.now(),
        attachments: [],
      };
      
      setChats(prev => prev.map(chat => 
        chat.id === activeChatId ? { ...chat, messages: [...history, aiMessage] } : chat
      ));

      if (isVoiceChatMode) {
        if(isSupported) {
          speak(aiResponseContent, { voiceGender: voice });
        } else {
          toast({
            title: "Speech Error",
            description: "Voice chat is not supported in your browser.",
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
      // Revert to the state before sending the message
       setChats(prev => prev.map(chat => 
        chat.id === activeChatId ? { ...chat, messages: history.slice(0, -1) } : chat
      ));
    } finally {
      setIsLoading(false);
    }
  }, [activeChatId, setChats, toast, isVoiceChatMode, isSupported, voice, speak]);


  const sendMessage = useCallback(async (content: string, attachments: Attachment[] = []) => {
    if (!content.trim() && attachments.length === 0 || !activeChatId) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
      attachments,
    };

    const updatedMessages = [...messages, userMessage];
    
    setChats(prev => prev.map(chat => 
      chat.id === activeChatId ? { ...chat, messages: updatedMessages } : chat
    ));

    await getAiResponseAndUpdateState(updatedMessages, content, attachments);
  }, [activeChatId, messages, setChats, getAiResponseAndUpdateState]);
  
  const regenerateResponse = useCallback(async () => {
    if (!activeChatId) return;

    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) return;

    // Find the index of the last user message
    const lastUserMessageIndex = messages.lastIndexOf(lastUserMessage);
    
    // History includes everything up to and including the last user message
    const historyForRegeneration = messages.slice(0, lastUserMessageIndex + 1);

    setChats(prev => prev.map(chat => 
      chat.id === activeChatId ? { ...chat, messages: historyForRegeneration } : chat
    ));

    await getAiResponseAndUpdateState(historyForRegeneration, lastUserMessage.content, lastUserMessage.attachments);
  }, [activeChatId, messages, setChats, getAiResponseAndUpdateState]);

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
        let content = `[${time}] ${msg.role.toUpperCase()}:\n${msg.content}`;
        if (msg.attachments && msg.attachments.length > 0) {
          content += `\nAttachments: ${msg.attachments.map(a => a.name).join(', ')}`;
        }
        return content;
      })
      .join("\n\n---------------------------------\n\n");
    
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kattapa-ai-chat-${new Date().toISOString().split('T')[0]}.txt`;
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
    voice,
    setVoice,
    sendMessage,
    regenerateResponse,
    clearChat,
    exportChat,
    setActiveChatId,
    createNewChat,
    isVoiceChatMode,
    setIsVoiceChatMode,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
