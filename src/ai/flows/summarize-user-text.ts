'use server';
/**
 * @fileOverview Summarizes user-provided text.
 *
 * - summarizeUserText - A function that summarizes user-provided text.
 * - SummarizeUserTextInput - The input type for the summarizeUserText function.
 * - SummarizeUserTextOutput - The return type for the summarizeUserText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeUserTextInputSchema = z.object({
  text: z.string().describe('The text to summarize.'),
});
export type SummarizeUserTextInput = z.infer<typeof SummarizeUserTextInputSchema>;

const SummarizeUserTextOutputSchema = z.object({
  summary: z.string().describe('The summary of the text.'),
});
export type SummarizeUserTextOutput = z.infer<typeof SummarizeUserTextOutputSchema>;

export async function summarizeUserText(input: SummarizeUserTextInput): Promise<SummarizeUserTextOutput> {
  return summarizeUserTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeUserTextPrompt',
  input: {schema: SummarizeUserTextInputSchema},
  output: {schema: SummarizeUserTextOutputSchema},
  prompt: `Summarize the following text:\n\n{{{text}}}`,
});

const summarizeUserTextFlow = ai.defineFlow(
  {
    name: 'summarizeUserTextFlow',
    inputSchema: SummarizeUserTextInputSchema,
    outputSchema: SummarizeUserTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
