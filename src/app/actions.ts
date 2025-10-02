"use server";

import { chatFlow } from "@/ai/flows/chat";
import type { Attachment, Message } from "@/lib/types";

export async function getAiResponse(
  history: Message[],
  message: string,
  attachments: Attachment[] = []
) {
  try {
    const imageAttachments = attachments.filter(
      (a) => a.type === "image"
    );
    
    // Pass document content directly to the main chat flow
    const documentAttachments = attachments.filter(
      (a) => a.type === "document"
    );

    let docContents = "";
    if (documentAttachments.length > 0) {
      const docText = documentAttachments.map(doc => `--- Document: ${doc.name} ---\n${doc.content}`).join("\n\n");
      docContents = `\n\nThe user has provided the following documents for context:\n${docText}`;
    }

    const flowResponse = await chatFlow({
      history: history.map((m) => ({ role: m.role, content: m.content })),
      message: `${message}${docContents}`,
      images: imageAttachments.map((img) => img.content),
    });
    
    return flowResponse.response;
  } catch (error) {
    console.error("AI response error:", error);
    return "Sorry, I encountered an error. Please try again.";
  }
}
