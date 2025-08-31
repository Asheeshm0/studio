'use server';

/**
 * @fileOverview An AI agent to suggest relevant resources based on the conversation.
 *
 * - suggestRelevantResources - A function that suggests relevant articles, videos, or study material based on the conversation.
 * - SuggestRelevantResourcesInput - The input type for the suggestRelevantResources function.
 * - SuggestRelevantResourcesOutput - The return type for the suggestRelevantResources function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelevantResourcesInputSchema = z.object({
  conversationHistory: z
    .string()
    .describe('The history of the conversation with the user.'),
});
export type SuggestRelevantResourcesInput = z.infer<typeof SuggestRelevantResourcesInputSchema>;

const SuggestRelevantResourcesOutputSchema = z.object({
  resources: z
    .array(z.string())
    .describe(
      'A list of relevant articles, videos, or study material URLs based on the conversation.'
    ),
});
export type SuggestRelevantResourcesOutput = z.infer<typeof SuggestRelevantResourcesOutputSchema>;

export async function suggestRelevantResources(
  input: SuggestRelevantResourcesInput
): Promise<SuggestRelevantResourcesOutput> {
  return suggestRelevantResourcesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelevantResourcesPrompt',
  input: {schema: SuggestRelevantResourcesInputSchema},
  output: {schema: SuggestRelevantResourcesOutputSchema},
  prompt: `You are an AI assistant that suggests relevant resources based on the conversation history.

  Based on the following conversation history, suggest a list of relevant articles, videos, or study material URLs that the user might find helpful.

  Conversation History: {{{conversationHistory}}}

  Provide the resources as a JSON array of strings.
  `,
});

const suggestRelevantResourcesFlow = ai.defineFlow(
  {
    name: 'suggestRelevantResourcesFlow',
    inputSchema: SuggestRelevantResourcesInputSchema,
    outputSchema: SuggestRelevantResourcesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
