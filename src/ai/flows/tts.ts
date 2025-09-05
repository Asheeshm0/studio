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
      writer.on('error', (err) => {
        console.error("WAV Writer Error:", err);
        reject(err)
      });
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
    outputSchema: z.string().nullable(),
  },
  async (query) => {
    if (!query) {
      console.log("TTS flow received an empty query.");
      return null;
    }
    
    let media;
    try {
      const response = await ai.generate({
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
      media = response.media;
    } catch(e) {
      console.error("Error generating TTS from AI model:", e);
      return null;
    }
    

    if (!media?.url) {
      console.error('No media returned from TTS model.');
      return null;
    }
    
    try {
      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );
      
      const wavBase64 = await toWav(audioBuffer);
      return 'data:audio/wav;base64,' + wavBase64;
    } catch (error) {
        console.error("Error converting PCM to WAV:", error);
        return null;
    }
  }
);
