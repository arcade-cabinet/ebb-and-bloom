// Test the complete STRUCTURED WARP+WEFT system
import { executeStructuredWarpWeft } from './src/workflows/structured-warp-weft.js';

console.log('🎯 Testing STRUCTURED WARP+WEFT system...');
console.log('This will execute agent-to-agent handoff with formal Zod schemas');

try {
  const result = await executeStructuredWarpWeft('test-structured-seed');
  
  console.log('🎉 STRUCTURED WARP+WEFT WORKS!');
  console.log(`✅ Generated ${result.generations.length} generations`);
  console.log(`✅ Total primitives: ${result.knowledgeAccumulation.totalPrimitives}`);
  console.log(`✅ Causal depth: ${result.knowledgeAccumulation.causalDepth}`);
  console.log(`✅ Emergent properties: ${result.emergentProperties.length}`);
  
  // Show Gen 3 as example (the critical tool emergence test)
  if (result.generations[3]) {
    const gen3 = result.generations[3];
    console.log(`\n🔧 Gen 3 (Tools) Results:`);
    console.log(`Macro options: ${gen3.macro.options.length}`);
    console.log(`Meso options: ${gen3.meso.options.length}`);
    console.log(`Micro options: ${gen3.micro.options.length}`);
    console.log(`Sample tool: ${gen3.macro.options[0]?.name}`);
  }
  
} catch (error) {
  console.log('❌ STRUCTURED WARP+WEFT FAILED:', error.message);
  console.log('Debug info helps us fix the schema or prompt engineering');
}