"use client";

import { useChat } from "@/hooks/use-chat";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PlusCircle, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type ChatSidebarProps = {
  className?: string;
};

export function ChatSidebar({ className }: ChatSidebarProps) {
  const { chats, activeChatId, createNewChat, setActiveChatId } = useChat();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  return (
    <Sidebar className={cn("border-r", className)}>
      <SidebarHeader>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={createNewChat}
        >
          <PlusCircle className="mr-2" />
          New Chat
        </Button>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <ScrollArea className="h-full">
          <SidebarMenu>
            {isClient && chats.map((chat) => (
              <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton
                  isActive={activeChatId === chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className="h-auto py-2"
                >
                  <div className="flex flex-col items-start text-left w-full">
                    <span className="font-semibold truncate w-full">
                      {chat.messages.length > 0 ? chat.messages[0].content : "New Chat"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(chat.createdAt, {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
