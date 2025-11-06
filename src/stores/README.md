# Stores Package - Zustand State Management

**Purpose**: UI state management. **READ-ONLY from ECS**. Syncs game state from ECS to Vue components for display.

## Critical Rule

**Zustand NEVER writes to ECS. Only reads.**

Data flow: `ECS Components → Zustand Store → Vue Components`

## Current Implementation

### gameStore.ts ✅

```typescript
interface GameState {
  // ECS World reference
  world: IWorld | null
  
  // Synced FROM ECS (read-only)
  pollution: number
  playerInventory: Record<string, number>
  
  // UI-only state  
  playTime: number
  intimacyLevel: number
  evolutionStage: number
  
  // Actions (update store, NEVER write to ECS)
  updatePollution(value: number): void
  updateInventory(inventory: Record<string, number>): void
}
```

## How It Works

1. **ECS systems modify components** (game logic)
2. **Systems notify store** of changes
3. **Store updates its state** (for UI display)
4. **Vue components react** to store changes

## Links

- [ARCHITECTURE.md](../docs/ARCHITECTURE.md) - Data flow
- [techContext.md](../memory-bank/techContext.md) - Zustand patterns

---

*Status: Stage 1 Complete ✅*  
*Last Updated: 2025-11-06*
