'use server';

/**
 * @fileOverview A text-to-speech AI flow.
 *
 * - textToSpeech - A function that converts text to speech.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';
import wav from 'wav';

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const writer = new wav.Writer({
        channels,
        sampleRate: rate,
        bitDepth: sampleWidth * 8,
      });

      const bufs: any[] = [];
      writer.on('error', reject);
      writer.on('data', (chunk) => bufs.push(chunk));
      writer.on('end', () => {
        resolve(Buffer.concat(bufs).toString('base64'));
      });

      writer.write(pcmData);
      writer.end();
    } catch (error) {
        console.error("Error in toWav conversion:", error);
        reject(error);
    }
  });
}

export const textToSpeech = ai.defineFlow(
  {
    name: 'textToSpeech',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (query) => {
    try {
      const { media } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts-fast'),
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Algenib' },
            },
          },
        },
        prompt: query,
      });

      if (!media?.url) {
        throw new Error('No media returned from TTS model.');
      }
      
      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );
      
      const wavBase64 = await toWav(audioBuffer);
      return 'data:audio/wav;base64,' + wavBase64;
    } catch (error) {
        console.error("Error in textToSpeech flow:", error);
        throw new Error("Failed to generate audio.");
    }
  }
);
