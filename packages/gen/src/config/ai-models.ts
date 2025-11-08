/**
 * Central AI Model Constants - Vercel AI SDK
 * Used by ALL workflows: gen, UI, image generation
 */

import { openai } from '@ai-sdk/openai';

// Text generation model - GPT-5
export const TEXT_MODEL = openai('gpt-5');

// Image generation model - GPT-image-1  
export const IMAGE_MODEL = openai.image('gpt-image-1');

