// DEBUG: Figure out what's wrong with the Zod schema
import { z } from 'zod';

console.log('🔍 Testing Zod schemas step by step...');

// Test 1: Simple schema (we know this works)
const simpleSchema = z.object({
  test: z.string(),
});

console.log('✅ Simple schema works');

// Test 2: Visual blueprint components  
const colorPalette = z.array(z.string());
const materials = z.array(z.string());
const shaders = z.record(z.string(), z.number());

console.log('✅ Basic arrays and records work');

// Test 3: Visual blueprint object
try {
  const visualBlueprint = z.object({
    description: z.string(),
    canCreate: z.array(z.string()),
    representations: z.object({
      materials: z.array(z.string()),
      colorPalette: z.array(z.string()),
    }),
  });
  
  console.log('✅ Visual blueprint schema builds');
  
  // Test 4: Nested option schema
  const optionSchema = z.object({
    name: z.string(),
    visualBlueprint: visualBlueprint,
  });
  
  console.log('✅ Option schema builds');
  
  // Test 5: Data pool schema
  const dataPoolSchema = z.object({
    macro: z.object({
      options: z.array(optionSchema),
    }),
  });
  
  console.log('✅ Data pool schema builds');
  
  // Test 6: AI generation with working schema
  const { generateObject } = await import('ai');
  const { openai } = await import('@ai-sdk/openai');
  
  console.log('Testing AI generation with simple schema...');
  
  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: dataPoolSchema,
    prompt: 'Generate data with macro.options containing one item with name and visualBlueprint',
  });
  
  console.log('✅ AI GENERATION WORKS WITH SIMPLE SCHEMA!');
  console.log(JSON.stringify(result.object, null, 2));
  
} catch (error) {
  console.log('❌ ERROR AT STEP:', error.message);
  console.log('Stack:', error.stack);
}