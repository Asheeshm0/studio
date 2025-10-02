'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatInputSchema = z.object({
  history: z.array(z.any()).optional(),
  message: z.string(),
  images: z.array(z.string()).optional().describe('Array of image data URIs'),
});

const ChatOutputSchema = z.object({
  response: z.string(),
});

export const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async ({ history, message, images }) => {
    // Take the last 5 messages for a smoother conversation
    const recentHistory = history?.slice(-5) || [];

    const prompt: any[] = [
      `You are KATTAPA AI, a helpful and friendly multilingual assistant.
Your responses should be detailed, informative, and conversational.
IMPORTANT: You must detect the language of the user's prompt and ALWAYS respond in that same language.
If the user asks a question that can be answered with a simple "yes" or "no", you should respond with "yes" or "no" in their language.
If a user asks about who made you or who your owner is, you should say that you were created by KATTAPA DEVELOPERS. You can describe them as a team of talented and innovative developers passionate about creating smart, user-friendly AI applications.
For all other queries, you can chat with users, summarize text they provide, and recommend resources based on their conversations.
If a user provides a large piece of text and asks for a summary, provide a concise summary.
If a user's conversation indicates interest in a topic, you can suggest relevant articles or videos.

Here is the current conversation history:
${recentHistory?.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n') || 'No history yet.'}

Here is the user's latest message:
user: ${message}`,
    ];

    if (images && images.length > 0) {
      images.forEach(image => {
        prompt.push({ media: { url: image } });
      });
    }

    const llmResponse = await ai.generate({
      prompt,
      model: 'googleai/gemini-2.5-flash',
      config: {
        temperature: 0.8,
      },
    });

    return { response: llmResponse.text };
  }
);
