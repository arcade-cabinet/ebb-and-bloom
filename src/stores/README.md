# Stores

**Zustand state management**

---

## Critical Rule

**Zustand NEVER writes to ECS. Only reads.**

Data flow: `ECS → Zustand → React Components`

---

## Current Store

**EvolutionDataStore.ts**:
- Platform state (screen size, input mode, device info)
- Evolution snapshots (generation logging)
- Gesture events (touch/mouse input)
- Platform events (resize, orientation)

---

## Pattern

```typescript
// ECS system updates component
entity.creature.energy = 0.8;

// System notifies store
useEvolutionDataStore.getState().updateCreatureEnergy(0.8);

// React component reads from store
const energy = useEvolutionDataStore(state => state.creatureEnergy);
```

**Store is read-only view of ECS state for UI.**

