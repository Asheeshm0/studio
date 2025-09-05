"use server";

import { chatFlow } from "@/ai/flows/chat";
import type { Message } from "@/lib/types";

export async function getAiResponse(history: Message[], message: string) {
  try {
    const flowResponse = await chatFlow({
      history: history.map(m => ({ role: m.role, content: m.content })),
      message,
    });
    return flowResponse.response;
  } catch (error) {
    console.error("AI response error:", error);
    return "Sorry, I encountered an error. Please try again.";
  }
}
