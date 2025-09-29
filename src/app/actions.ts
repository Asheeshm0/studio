"use server";

import { chatFlow } from "@/ai/flows/chat";
import { analyzeUploadedText } from "@/ai/flows/analyze-uploaded-text";
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
    
    // Handle document analysis separately
    const documentAttachments = attachments.filter(
      (a) => a.type === "document"
    );

    let docAnalysisResults = "";
    if (documentAttachments.length > 0) {
      const analyses = await Promise.all(
        documentAttachments.map(async (doc) => {
          const result = await analyzeUploadedText({
            text: doc.content,
            query: message || "Provide a summary of the document.",
          });
          return `Analysis for ${doc.name}:\nSummary: ${result.summary}\n${result.patterns ? `Patterns: ${result.patterns}` : ""}`;
        })
      );
      docAnalysisResults = analyses.join("\n\n");
    }

    const flowResponse = await chatFlow({
      history: history.map((m) => ({ role: m.role, content: m.content })),
      message: `${message}${docAnalysisResults ? `\n\nHere is the analysis of the document(s) you provided:\n${docAnalysisResults}` : ""}`,
      images: imageAttachments.map((img) => img.content),
    });
    
    return flowResponse.response;
  } catch (error) {
    console.error("AI response error:", error);
    return "Sorry, I encountered an error. Please try again.";
  }
}
