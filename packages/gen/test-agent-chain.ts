// Test the agent-to-agent WARP chain
import { WarpChainExecutor } from './src/workflows/agent-chain.js';

console.log('🔗 Testing AGENT-TO-AGENT WARP CHAIN...');

try {
  const executor = new WarpChainExecutor();
  
  // This will run Gen 0 → Gen 1 → Gen 2 → Gen 3 → Gen 4 → Gen 5 → Gen 6
  // Each agent gets FULL knowledge tree from all previous agents
  const completeChain = await executor.executeCompleteChain('test-warp-seed');
  
  console.log('🎉 COMPLETE WARP CHAIN EXECUTED!');
  console.log(`Final knowledge tree spans ${completeChain.length} generations`);
  console.log(`Gen 6 knows about: ${Object.keys(completeChain[6].primitives)}`);
  
} catch (error) {
  console.log('❌ WARP CHAIN FAILED:', error.message);
  console.log('This helps us debug exactly where the handoff breaks');
}