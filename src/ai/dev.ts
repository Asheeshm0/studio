import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-user-text.ts';
import '@/ai/flows/suggest-relevant-resources.ts';
import '@/ai/flows/analyze-uploaded-text.ts';
import '@/ai/flows/chat.ts';
