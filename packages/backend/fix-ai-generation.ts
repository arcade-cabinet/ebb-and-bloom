// REMOVE ALL FALLBACKS AND FORCE AI TO WORK
import { generateGen0DataPools } from './src/gen-systems/VisualBlueprintGenerator.js';

console.log('🔥 FORCING AI GENERATION TO WORK - NO FALLBACKS!');

try {
  console.log('Testing with minimal schema...');
  
  // Test if basic AI generation works
  const { generateObject } = await import('ai');
  const { openai } = await import('@ai-sdk/openai');
  const { z } = await import('zod');
  
  const simpleSchema = z.object({
    test: z.string(),
    number: z.number()
  });
  
  console.log('Simple schema created, testing OpenAI...');
  
  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: simpleSchema,
    prompt: 'Generate a test object with any string and any number.',
  });
  
  console.log('✅ BASIC AI WORKS:', result.object);
  
  console.log('Now testing Gen 0 data pools...');
  const gen0 = await generateGen0DataPools('test');
  console.log('✅ GEN 0 AI WORKS!');
  
} catch (error) {
  console.log('❌ AI BROKEN:', error.message);
  console.log('Stack:', error.stack);
}