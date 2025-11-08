// Test Gen 1 workflow with real OpenAI
import { generateGen1DataPools } from './src/workflows/generations/gen1.js';

console.log('🧪 Testing Gen 1 AI workflow...');

const mockPlanetData = {
  radius: 6371000,
  materials: ['iron', 'silicon', 'carbon', 'water'],
  surfaceComposition: 'iron-rich with water content',
};

try {
  const result = await generateGen1DataPools(mockPlanetData, 'test-gen1-seed');
  console.log('✅ Gen 1 AI WORKS!');
  console.log('Generated archetypes:', result.macro.ecologicalNiches.length);
  console.log('Sample archetype:', result.macro.ecologicalNiches[0]);
  
} catch (error) {
  console.log('❌ Gen 1 AI FAILED:', error.message);
}