import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  // Only warn — we only fail when actually invoking.
  console.warn('[openai] OPENAI_API_KEY não está definida');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
