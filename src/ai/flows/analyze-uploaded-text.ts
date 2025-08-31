'use server';

/**
 * @fileOverview AI flow for analyzing uploaded text documents.
 *
 * - analyzeUploadedText - A function that handles the analysis of uploaded text.
 * - AnalyzeUploadedTextInput - The input type for the analyzeUploadedText function.
 * - AnalyzeUploadedTextOutput - The return type for the analyzeUploadedText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeUploadedTextInputSchema = z.object({
  text: z.string().describe('The text content of the uploaded document.'),
  query: z.string().optional().describe('Specific questions or analysis requests about the text content.'),
});
export type AnalyzeUploadedTextInput = z.infer<typeof AnalyzeUploadedTextInputSchema>;

const AnalyzeUploadedTextOutputSchema = z.object({
  summary: z.string().describe('A summary of the key information in the text.'),
  patterns: z.string().optional().describe('Identified patterns or themes in the text.'),
  answers: z.string().optional().describe('Answers to specific questions about the text, if provided.'),
});
export type AnalyzeUploadedTextOutput = z.infer<typeof AnalyzeUploadedTextOutputSchema>;

export async function analyzeUploadedText(input: AnalyzeUploadedTextInput): Promise<AnalyzeUploadedTextOutput> {
  return analyzeUploadedTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeUploadedTextPrompt',
  input: {schema: AnalyzeUploadedTextInputSchema},
  output: {schema: AnalyzeUploadedTextOutputSchema},
  prompt: `You are an expert AI assistant specializing in analyzing text documents.

  Your goal is to extract key information, identify patterns, and answer specific questions about the content.

  Document Text: {{{text}}}

  Analysis Request: {{{query}}}

  Instructions: Provide a concise summary of the text. If a specific query is provided, answer it based on the text. Identify any recurring patterns, themes, or notable insights within the text.
  `,
});

const analyzeUploadedTextFlow = ai.defineFlow(
  {
    name: 'analyzeUploadedTextFlow',
    inputSchema: AnalyzeUploadedTextInputSchema,
    outputSchema: AnalyzeUploadedTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
