#!/usr/bin/env node
/**
 * Ebb & Bloom - CLI Client
 * 
 * This is the OFFICIAL CLI for Ebb & Bloom.
 * It connects to the backend API server and provides a text-based interface.
 * 
 * Modes:
 * - Interactive: Human player with live feedback (default)
 * - Blocking: Automated/programmatic control (--blocking flag)
 * 
 * Connection:
 * - Connects to backend at http://localhost:3001 by default
 * - Can override with EBB_API_URL environment variable
 * - WebSocket for real-time updates
 * 
 * Commands:
 * - init <seed>     - Create new game
 * - cycle           - Advance day/night cycle
 * - gen             - Advance generation
 * - status          - Show game state
 * - quit            - Exit
 */

import { Command } from 'commander';
import * as readline from 'readline';
import axios from 'axios';
import chalk from 'chalk';

const API_URL = process.env.EBB_API_URL || 'http://localhost:3001';

interface GameState {
  gameId: string;
  initialized: boolean;
  currentGeneration: number;
  currentCycle: number;
  currentPhase: string;
  seedPhrase: string;
}

class EbbCLI {
  private gameId: string | null = null;
  private rl: readline.Interface | null = null;
  
  async start() {
    console.log(chalk.cyan('\n╔═══════════════════════════════════════╗'));
    console.log(chalk.cyan('║     EBB & BLOOM - CLI Client         ║'));
    console.log(chalk.cyan('╚═══════════════════════════════════════╝\n'));
    
    // Check server health
    try {
      await axios.get(`${API_URL}/health`);
      console.log(chalk.green(`✓ Connected to backend at ${API_URL}\n`));
    } catch (error) {
      console.log(chalk.red(`✗ Cannot connect to backend at ${API_URL}`));
      console.log(chalk.yellow(`  Make sure the server is running: cd packages/backend && pnpm dev\n`));
      process.exit(1);
    }
    
    console.log(chalk.gray('Type "help" for commands\n'));
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.blue('ebb> '),
    });
    
    this.rl.prompt();
    
    this.rl.on('line', async (input) => {
      await this.processCommand(input.trim());
      if (this.rl) this.rl.prompt();
    });
    
    this.rl.on('close', () => {
      console.log(chalk.cyan('\n👋 Goodbye!\n'));
      process.exit(0);
    });
  }
  
  private async processCommand(input: string) {
    const [cmd, ...args] = input.split(' ');
    
    try {
      switch (cmd.toLowerCase()) {
        case 'init':
        case 'create':
          await this.cmdInit(args[0] || 'default-world');
          break;
        
        case 'cycle':
          await this.cmdCycle();
          break;
        
        case 'gen':
        case 'generation':
          await this.cmdGeneration();
          break;
        
        case 'status':
          await this.cmdStatus();
          break;
        
        case 'help':
          this.cmdHelp();
          break;
        
        case 'quit':
        case 'exit':
          if (this.rl) this.rl.close();
          break;
        
        case '':
          break;
        
        default:
          console.log(chalk.yellow(`Unknown command: ${cmd}. Type "help" for commands.`));
      }
    } catch (error: any) {
      console.log(chalk.red(`Error: ${error.message}`));
    }
  }
  
  private async cmdInit(seedPhrase: string) {
    console.log(chalk.cyan(`\n🌍 Creating world: "${seedPhrase}"...\n`));
    
    try {
      const response = await axios.post(`${API_URL}/api/game/create`, {
        seedPhrase,
        playerName: 'CLI Player',
      });
      
      this.gameId = response.data.gameId;
      const state: GameState = response.data.state;
      
      console.log(chalk.green(`✓ Game created!`));
      console.log(chalk.gray(`  Game ID: ${this.gameId}`));
      console.log(chalk.gray(`  Seed: ${state.seedPhrase}`));
      console.log(chalk.gray(`  Generation: ${state.currentGeneration}`));
      console.log(chalk.cyan(`\n🌅 Dawn of Generation 0, Cycle 0\n`));
    } catch (error: any) {
      throw new Error(`Failed to create game: ${error.response?.data?.error || error.message}`);
    }
  }
  
  private async cmdCycle() {
    if (!this.gameId) {
      console.log(chalk.yellow('No game initialized. Use "init <seed>" first.'));
      return;
    }
    
    try {
      const response = await axios.post(`${API_URL}/api/game/${this.gameId}/cycle`);
      const state: GameState = response.data.state;
      const events = response.data.events || [];
      
      const phaseEmoji = {
        'dawn': '🌅',
        'day': '☀️',
        'dusk': '🌇',
        'night': '🌙',
      }[state.currentPhase] || '⏰';
      
      console.log(chalk.cyan(`\n${phaseEmoji} ${state.currentPhase.toUpperCase()} - Generation ${state.currentGeneration}, Cycle ${state.currentCycle}\n`));
      
      if (events.length > 0) {
        events.forEach((event: any) => {
          console.log(chalk.gray(`  • ${event.description}`));
        });
        console.log();
      }
    } catch (error: any) {
      throw new Error(`Failed to advance cycle: ${error.response?.data?.error || error.message}`);
    }
  }
  
  private async cmdGeneration() {
    if (!this.gameId) {
      console.log(chalk.yellow('No game initialized. Use "init <seed>" first.'));
      return;
    }
    
    try {
      const response = await axios.post(`${API_URL}/api/game/${this.gameId}/generation`);
      const state: GameState = response.data.state;
      const events = response.data.events || [];
      
      console.log(chalk.cyan(`\n⏭️  GENERATION ${state.currentGeneration}\n`));
      
      if (events.length > 0) {
        events.forEach((event: any) => {
          console.log(chalk.gray(`  • ${event.description}`));
        });
        console.log();
      }
      
      console.log(chalk.cyan(`🌅 Dawn of Generation ${state.currentGeneration}, Cycle 0\n`));
    } catch (error: any) {
      throw new Error(`Failed to advance generation: ${error.response?.data?.error || error.message}`);
    }
  }
  
  private async cmdStatus() {
    if (!this.gameId) {
      console.log(chalk.yellow('No game initialized. Use "init <seed>" first.'));
      return;
    }
    
    try {
      const response = await axios.get(`${API_URL}/api/game/${this.gameId}`);
      const state: GameState = response.data.state;
      
      console.log(chalk.cyan('\n📊 GAME STATUS\n'));
      console.log(chalk.gray(`Game ID:    ${state.gameId}`));
      console.log(chalk.gray(`Seed:       ${state.seedPhrase}`));
      console.log(chalk.gray(`Generation: ${state.currentGeneration}`));
      console.log(chalk.gray(`Cycle:      ${state.currentCycle} (${state.currentPhase})`));
      console.log();
    } catch (error: any) {
      throw new Error(`Failed to get status: ${error.response?.data?.error || error.message}`);
    }
  }
  
  private cmdHelp() {
    console.log(chalk.cyan(`
╔═══════════════════════════════════════╗
║             COMMANDS                  ║
╚═══════════════════════════════════════╝

${chalk.bold('GAME MANAGEMENT')}
  init <seed>       Create new game from seed phrase
  status            Show current game state

${chalk.bold('TIME ADVANCEMENT')}
  cycle             Advance one day/night cycle
  gen               Advance one generation

${chalk.bold('OTHER')}
  help              Show this help
  quit              Exit CLI

${chalk.bold('EXAMPLE SESSION')}
  ${chalk.gray('init volcanic-world')}
  ${chalk.gray('cycle              # advance time')}
  ${chalk.gray('gen                # advance generation')}
  ${chalk.gray('status             # check progress')}

${chalk.bold('NOTE')}: Backend must be running at ${API_URL}
Start it with: ${chalk.gray('cd packages/backend && pnpm dev')}
`));
  }
}

// Start CLI
const cli = new EbbCLI();
cli.start();
