import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ChatMessages } from "./chat-messages";

export default function ChatLayout() {
  return (
    <div className="flex flex-col h-full w-full max-w-4xl border-x">
      <ChatHeader />
      <div className="flex-1 overflow-hidden">
        <ChatMessages />
      </div>
      <ChatInput />
    </div>
  );
}
