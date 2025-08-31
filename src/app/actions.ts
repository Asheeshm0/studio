"use server";

import { chatFlow } from "@/ai/flows/chat";
import { textToSpeech } from "@/ai/flows/tts";
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

export async function getAudioResponse(text: string) {
  try {
    const media = await textToSpeech(text);
    return media;
  } catch (error) {
    console.error("Audio response error:", error);
    return null;
  }
}
