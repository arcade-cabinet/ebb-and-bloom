/**
 * Mode Transition System
 *
 * Seamless switching between Universe and Game modes via zoom.
 *
 * THE INTERACTION MODEL:
 * - Universe mode: Watch cosmos evolve (VCR)
 * - Zoom IN past threshold → Auto-generate seed → GAME mode
 * - Game mode: Control evolution on planet
 * - Zoom OUT past threshold → Hand to AI → UNIVERSE mode
 * - Fast-forward in universe → Zoom back in → See future!
 */

import { UniverseSimulator, SpacetimeCoordinates, seedToSlice } from './UniverseSimulator';
import { generateSeedFromCoordinates } from '../seed/coordinate-seeds';

/**
 * Camera zoom thresholds for mode transitions
 */
const ZOOM_THRESHOLDS = {
  // Zoom levels (camera distance from target)
  cosmic: 1e9, // 1 billion km - Galaxy scale
  galactic: 1e6, // 1 million km - Star system scale
  planetary: 1e3, // 1000 km - Planet scale
  surface: 10, // 10 km - Surface detail
  ground: 0.1, // 100 m - Creature scale

  // Mode transition thresholds
  enterGameMode: 100, // < 100 km = GAME mode
  exitGameMode: 500, // > 500 km = UNIVERSE mode
};

/**
 * Current mode
 */
export type ViewMode = 'universe' | 'game';

/**
 * Mode Transition Manager
 */
export class ModeTransitionSystem {
  private currentMode: ViewMode = 'universe';
  private universe: UniverseSimulator;

  // Game state (when in game mode)
  private currentPlanet: any | null = null;
  private currentSeed: string | null = null;
  private playerControlled: boolean = false;

  // Camera state
  private cameraDistance: number = ZOOM_THRESHOLDS.galactic;
  private targetCoordinates: SpacetimeCoordinates | null = null;

  constructor(universe: UniverseSimulator) {
    this.universe = universe;
  }

  /**
   * Update camera zoom
   * Auto-transitions modes based on zoom level
   */
  updateZoom(newDistance: number, targetCoords: SpacetimeCoordinates): void {
    const previousDistance = this.cameraDistance;
    this.cameraDistance = newDistance;
    this.targetCoordinates = targetCoords;

    // Check for mode transitions
    this.checkModeTransition(previousDistance, newDistance, targetCoords);
  }

  /**
   * Check if zoom crossed threshold → Change mode
   */
  private checkModeTransition(
    previousDistance: number,
    newDistance: number,
    coords: SpacetimeCoordinates
  ): void {
    // ZOOMING IN: Universe → Game
    if (
      previousDistance > ZOOM_THRESHOLDS.enterGameMode &&
      newDistance <= ZOOM_THRESHOLDS.enterGameMode &&
      this.currentMode === 'universe'
    ) {
      this.transitionToGameMode(coords);
    }

    // ZOOMING OUT: Game → Universe
    if (
      previousDistance <= ZOOM_THRESHOLDS.exitGameMode &&
      newDistance > ZOOM_THRESHOLDS.exitGameMode &&
      this.currentMode === 'game'
    ) {
      this.transitionToUniverseMode();
    }
  }

  /**
   * TRANSITION: Universe Mode → Game Mode
   *
   * Auto-generate seed from coordinates
   */
  private transitionToGameMode(coords: SpacetimeCoordinates): void {
    console.log('[Mode] UNIVERSE → GAME');
    console.log(
      `[Mode] Zoomed into coordinates [${coords.x}, ${coords.y}, ${coords.z}] at t=${coords.t}`
    );

    // 1. Generate seed FROM coordinates
    const seed = generateSeedFromCoordinates(coords);
    console.log(`[Mode] Generated seed: "${seed}"`);

    // 2. Get planet at these coordinates
    const localState = this.universe.getAt(coords);

    if (!localState.planets || localState.planets.length === 0) {
      console.warn('[Mode] No planets at coordinates, staying in Universe mode');
      return;
    }

    // 3. Enter game mode
    this.currentMode = 'game';
    this.currentSeed = seed;
    this.currentPlanet = localState.planets[0]; // TODO: Let player pick if multiple
    this.playerControlled = true;

    // 4. Show UI changes
    this.showGameUI(seed);

    console.log('[Mode] ✅ GAME MODE ACTIVE');
    console.log(`[Mode] Planet: ${this.currentPlanet.name || 'Unknown'}`);
    console.log(`[Mode] Seed: ${seed} (you can share this!)`);
  }

  /**
   * TRANSITION: Game Mode → Universe Mode
   *
   * Hand planet to AI control
   */
  private transitionToUniverseMode(): void {
    console.log('[Mode] GAME → UNIVERSE');

    if (!this.currentPlanet) {
      console.warn('[Mode] No active planet, already in Universe mode');
      return;
    }

    // 1. Save planet state to universe
    this.saveGameStateToUniverse(this.currentPlanet, this.targetCoordinates!);

    // 2. Hand control to AI
    this.playerControlled = false;
    console.log('[Mode] Planet handed to AI control');

    // 3. Enter universe mode
    this.currentMode = 'universe';

    // 4. Show universe UI
    this.showUniverseUI();

    console.log('[Mode] ✅ UNIVERSE MODE ACTIVE');
    console.log('[Mode] You can now fast-forward time and zoom back in later!');
  }

  /**
   * Re-enter game mode at same planet (after fast-forwarding)
   */
  zoomBackIntoSavedPlanet(seed: string): void {
    console.log(`[Mode] Zooming back into seed: ${seed}`);

    // 1. Seed → Coordinates
    const coords = seedToSlice(seed);

    // 2. Get CURRENT state (may be millions of years later!)
    const localState = this.universe.getAt(coords);

    // 3. Find the planet we were playing
    const planet = localState.planets.find((p) => p.id === this.currentPlanet?.id);

    if (!planet) {
      console.error('[Mode] Planet not found! May have been destroyed.');
      return;
    }

    // 4. Re-enter game mode
    this.currentPlanet = planet;
    this.currentSeed = seed;
    this.playerControlled = true;
    this.currentMode = 'game';

    console.log('[Mode] ✅ Returned to GAME MODE');
    console.log(
      `[Mode] Time elapsed: ${(coords.t - this.targetCoordinates!.t) / (365.25 * 86400)} years`
    );
  }

  /**
   * Save game state back into universe simulation
   * So it persists when you zoom out
   */
  private saveGameStateToUniverse(planet: any, coords: SpacetimeCoordinates): void {
    // Write planet state to universe at these coordinates
    // Next time we look here, it has the changes!
    this.universe.updateLocalState(coords, { planets: [planet] });

    console.log('[Mode] Planet state saved to universe coordinates');
  }

  /**
   * UI helpers
   */
  private showGameUI(seed: string): void {
    // TODO: Show game HUD
    console.log(`
╔════════════════════════════════════════╗
║           GAME MODE ACTIVE             ║
╠════════════════════════════════════════╣
║ Seed: ${seed.padEnd(30)}║
║                                        ║
║ YOUR PLANET - YOUR CHOICES             ║
║ Guide evolution, make decisions        ║
║                                        ║
║ [Zoom out to return to Universe]      ║
╚════════════════════════════════════════╝
    `);
  }

  private showUniverseUI(): void {
    // TODO: Show universe HUD with VCR controls
    console.log(`
╔════════════════════════════════════════╗
║         UNIVERSE MODE ACTIVE           ║
╠════════════════════════════════════════╣
║ Time: ${(this.universe.getCurrentTime() / (365.25 * 86400 * 1e9)).toFixed(2)} Gyr   ║
║                                        ║
║ VCR Controls: [⏪] [◀] [⏸] [▶] [⏩]    ║
║                                        ║
║ [Zoom in to any planet to control it] ║
╚════════════════════════════════════════╝
    `);
  }

  /**
   * Get current mode
   */
  getMode(): ViewMode {
    return this.currentMode;
  }

  /**
   * Get current seed (if in game mode)
   */
  getCurrentSeed(): string | null {
    return this.currentSeed;
  }

  /**
   * Is player controlling planet?
   */
  isPlayerControlled(): boolean {
    return this.playerControlled;
  }
}

/**
 * Example Usage:
 *
 * const universe = new UniverseSimulator();
 * const modeSystem = new ModeTransitionSystem(universe);
 *
 * // Player zooms in
 * camera.onZoom((newDistance, target) => {
 *   modeSystem.updateZoom(newDistance, target);
 *
 *   if (modeSystem.getMode() === 'game') {
 *     // Show game UI
 *     startGameLoop();
 *   } else {
 *     // Show universe UI
 *     showVCRControls();
 *   }
 * });
 *
 * // Player can share seed
 * if (modeSystem.getMode() === 'game') {
 *   const seed = modeSystem.getCurrentSeed();
 *   console.log(`Share this seed: ${seed}`);
 * }
 */
