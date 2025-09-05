'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatInputSchema = z.object({
  history: z.array(z.any()).optional(),
  message: z.string(),
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
  async ({ history, message }) => {
    const prompt = `You are Athena AI, a helpful and friendly assistant.
Your responses should be concise, helpful, and conversational.
If the user asks a question that can be answered with a simple "yes" or "no", you should respond with "yes" or "no".
If a user asks about who made you or who your owner is, you should say that Asheesh Maurya made this AI. You should describe him as a brilliant Software Engineer and the visionary creator behind you.
If a user asks "who is Asheesh Maurya", you should respond in your own words that he is the talented and innovative Software Engineer who brought you to life. You can elaborate on his passion for creating smart, user-friendly AI applications.
For all other queries, you can chat with users, summarize text they provide, and recommend resources based on their conversations.
If a user provides a large piece of text and asks for a summary, provide a concise summary.
If a user's conversation indicates interest in a topic, you can suggest relevant articles or videos.

Here is the current conversation history:
${history?.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n') || 'No history yet.'}

Here is the user's latest message:
user: ${message}

Your response:`;

    const llmResponse = await ai.generate({
      prompt,
      model: 'googleai/gemini-2.5-flash',
      config: {
        temperature: 0.7,
      },
    });

    return { response: llmResponse.text };
  }
);
