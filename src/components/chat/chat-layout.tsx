"use client";

import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ChatMessages } from "./chat-messages";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { ChatSidebar } from "./chat-sidebar";
import { useChat } from "@/hooks/use-chat";

export function ChatLayout() {
  const { messages, isLoading } = useChat();
  const defaultLayout = [320, 1000];

  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen w-full">
        <ChatSidebar className="h-full w-full max-w-sm" />
        <SidebarInset className="max-h-screen">
          <div className="flex flex-col h-full w-full">
            <ChatHeader />
            <div className="flex-1 overflow-hidden">
              <ChatMessages />
            </div>
            <ChatInput />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
