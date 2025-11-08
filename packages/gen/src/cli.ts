#!/usr/bin/env node
/**
 * GEN PACKAGE CLI - PROPERLY STRUCTURED
 */

import { Command } from 'commander';

const program = new Command();

program
  .name('@ebb/gen')
  .description('Universal archetype and asset generation')
  .version('0.2.0');

program
  .command('archetypes')
  .description('Generate universal archetype pools for all generations')
  .action(async () => {
    const { executeArchetypesCommand } = await import('./commands/archetypes');
    await executeArchetypesCommand();
  });

program
  .command('status')
  .description('Show generation package status')
  .action(async () => {
    const { executeStatusCommand } = await import('./commands/status');
    await executeStatusCommand();
  });

program
  .command('quality')
  .description('Assess quality of generated archetypes and identify anemic entries')
  .action(async () => {
    const { assessAllGenerations } = await import('./tools/quality-assessor');
    await assessAllGenerations();
  });

program
  .command('ui-assets')
  .description('Generate UI assets using AI workflows')
  .action(async () => {
    const { generateUIAssets } = await import('./workflows/ui-asset-generator');
    await generateUIAssets();
  });

program
  .command('fonts')
  .description('Download and set up Google Fonts for frontend')
  .action(async () => {
    const { generateFonts } = await import('./workflows/fonts');
    await generateFonts();
  });

program.parse();
