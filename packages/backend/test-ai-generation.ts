// Quick test to validate AI generation works
import { generateGen0DataPools } from './src/gen-systems/VisualBlueprintGenerator.js';

console.log('🧪 Testing AI Generation...');

try {
  const result = await generateGen0DataPools('test-seed');
  console.log('✅ AI Generation WORKS!');
  console.log('Generated data:', JSON.stringify(result, null, 2));
} catch (error) {
  console.log('❌ AI Generation FAILED:');
  console.log(error);
}