import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup for Playwright tests
 * Handles different environments: local, CI, Copilot MCP server, background agents
 */
async function globalSetup(config: FullConfig) {
  // Environment detection
  const isCI = !!process.env.CI;
  const isCopilotMCP = !!process.env.COPILOT_MCP_SERVER;
  const isBackgroundAgent = !!process.env.CURSOR_BACKGROUND_AGENT;
  
  console.log('🎮 Setting up Playwright for Ebb & Bloom');
  console.log(`Environment: ${isCI ? 'CI' : isCopilotMCP ? 'Copilot MCP' : isBackgroundAgent ? 'Background Agent' : 'Local'}`);
  
  // For Copilot MCP server and background agents, ensure headless mode
  if (isCopilotMCP || isBackgroundAgent) {
    console.log('🤖 Running in headless mode for agent environment');
    
    // Verify Chromium is available
    const browser = await chromium.launch({ headless: true });
    await browser.close();
    console.log('✅ Chromium available for headless testing');
  }
  
  // For local development, we can be more flexible
  if (!isCI && !isCopilotMCP && !isBackgroundAgent) {
    console.log('🖥️  Local development environment detected');
  }
  
  return Promise.resolve();
}

export default globalSetup;