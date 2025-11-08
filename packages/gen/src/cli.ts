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
    const { executeArchetypesCommand } = await import('./commands/archetypes.js');
    await executeArchetypesCommand();
  });

program
  .command('status')
  .description('Show generation package status')
  .action(async () => {
    const { executeStatusCommand } = await import('./commands/status.js');
    await executeStatusCommand();
  });

program
  .command('quality')
  .description('Assess quality of generated archetypes and identify anemic entries')
  .action(async () => {
    const { assessAllGenerations } = await import('./tools/quality-assessor.js');
    await assessAllGenerations();
  });

program.parse();