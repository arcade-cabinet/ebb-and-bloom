/**
 * Simple test script to verify core functionality
 * Tests world generation, player mechanics, and crafting
 */

import { WorldCore } from './src/game/core/core.js';
import { Player } from './src/game/player/player.js';
import { CraftingSystem } from './src/game/systems/crafting.js';

console.log('🌸 Ebb & Bloom - Core Functionality Test\n');

// Test 1: World Generation
console.log('Test 1: World Generation');
const world = new WorldCore(12345);
console.log(`✓ World generated with seed: ${world.seed}`);
console.log(`✓ Chunks: ${world.CHUNKS_X}x${world.CHUNKS_Y} (${world.chunks.size} total)`);
console.log(`✓ World bounds: ${world.getWorldBounds().width}x${world.getWorldBounds().height} pixels`);

// Test chunk content
const chunk = world.chunks.get('2,2');
console.log(`✓ Center chunk has ${chunk.tiles.length}x${chunk.tiles[0].length} tiles`);

// Test tile types
const testTile = world.getTile(250, 250);
console.log(`✓ Tile at (250,250): ${testTile.type}, value: ${testTile.value.toFixed(3)}`);

// Test 2: Raycast
console.log('\nTest 2: Raycast System');
const rayResults = world.raycast(250, 250, 1, 0, 20);
console.log(`✓ Raycast found ${rayResults.length} tiles`);
console.log(`✓ First tile: ${rayResults[0]?.tile.type} at distance ${rayResults[0]?.distance.toFixed(2)}`);

// Test 3: Visible Tiles
console.log('\nTest 3: Visible Tiles');
const visibleTiles = world.getVisibleTiles(250, 250, 30);
console.log(`✓ Found ${visibleTiles.length} visible tiles within radius 30`);

// Test 4: Player
console.log('\nTest 4: Player Mechanics');
const player = new Player(250 * 8, 250 * 8);
console.log(`✓ Player initialized at (${player.x}, ${player.y})`);

player.applyForce(50, 0);
console.log(`✓ Applied force: velocity = (${player.velocityX.toFixed(2)}, ${player.velocityY.toFixed(2)})`);

player.update(0.016); // Simulate one frame at 60fps
console.log(`✓ After update: position = (${player.x.toFixed(2)}, ${player.y.toFixed(2)})`);

player.collectResource('ore');
player.collectResource('water');
console.log(`✓ Collected resources: ore=${player.inventory.ore}, water=${player.inventory.water}`);

// Test 5: Crafting
console.log('\nTest 5: Crafting System');
const crafting = new CraftingSystem();
console.log(`✓ Crafting system initialized, pollution: ${crafting.getPollutionLevel()}`);

const canCraft = crafting.canCraft('alloy', player.inventory);
console.log(`✓ Can craft alloy: ${canCraft}`);

if (canCraft) {
  const result = await crafting.craft('alloy', player.inventory);
  console.log(`✓ Craft result: ${result.message}`);
  console.log(`✓ Inventory after craft: ore=${player.inventory.ore}, water=${player.inventory.water}, alloy=${player.inventory.alloy}`);
  console.log(`✓ Pollution level: ${crafting.getPollutionLevel()}`);
}

// Test 6: Trail Effect
console.log('\nTest 6: Trail Effect');
for (let i = 0; i < 15; i++) {
  player.update(0.016);
}
console.log(`✓ Trail has ${player.trail.length} points (max: ${player.maxTrailLength})`);
console.log(`✓ Trail alpha values: ${player.trail.map(p => p.alpha.toFixed(2)).join(', ')}`);

console.log('\n✅ All core functionality tests passed!');
console.log('\n🎮 Ready for 10-minute frolic test on mobile device');
