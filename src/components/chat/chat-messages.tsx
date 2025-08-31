"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/use-chat";
import { ChatMessage } from "./chat-message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function ChatMessages() {
  const { messages, isLoading } = useChat();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  return (
    <ScrollArea className="h-full" viewportRef={scrollAreaRef}>
      <div className="p-4 md:p-6 space-y-6">
        {messages.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-[calc(100dvh-200px)] text-center text-muted-foreground">
             <h2 className="text-2xl font-semibold">Welcome to Athena AI</h2>
             <p className="mt-2">Start a conversation by typing a message below.</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        {isLoading && <ChatMessage isLoading />}
      </div>
    </ScrollArea>
  );
}
