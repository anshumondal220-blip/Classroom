import { GoogleGenAI } from '@google/genai';

// Initialize the shared server-side Google GenAI client
// User-Agent header 'aistudio-build' is required per guidelines
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});
