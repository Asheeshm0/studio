import { ChatLayout } from "@/components/chat/chat-layout";
import { ChatProvider } from "@/components/chat/chat-provider";

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center">
      <ChatProvider>
        <ChatLayout />
      </ChatProvider>
    </main>
  );
}
