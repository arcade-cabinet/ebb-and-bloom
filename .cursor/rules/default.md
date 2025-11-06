# Cursor Rules - Ebb & Bloom

## Project Context

You're working on **Ebb & Bloom**, a mobile-first procedural evolution game. Always check the **Memory Bank** (`memory-bank/`) before starting any task.

## Critical Rules

### 1. Memory Bank First
- Read `memory-bank/activeContext.md` and `memory-bank/progress.md` at start of EVERY task
- Check `memory-bank/systemPatterns.md` for architecture
- Update memory bank after significant changes

### 2. Architecture Constraints
- ✅ Game logic in ECS systems (`src/ecs/systems/`)
- ✅ Phaser ONLY for rendering
- ✅ Zustand syncs FROM ECS, never writes to it
- ❌ NO game logic in Phaser scenes
- ❌ NO direct Zustand writes from game code

### 3. Testing Requirements
- All systems MUST have tests
- Run `pnpm test` before committing
- Aim for 80%+ coverage

### 4. Performance
- Use sprite pooling (no create/destroy)
- Viewport culling for large worlds
- Target 60 FPS on mobile

### 5. Check Design Docs
- `docs/` contains all game mechanics
- Don't build from scratch - reference docs first

### 6. Code Standards
- TypeScript for ECS systems
- Semantic commits (feat:, fix:, chore:, docs:)
- Components are data-only
- Systems operate on queries

## Quick Reference

**ECS World**: `src/ecs/world.ts`  
**State Store**: `src/stores/gameStore.ts`  
**Rendering**: `src/game/GameScene.js`  
**Tests**: `src/test/*.test.ts`  
**Design Docs**: `docs/*.md`

## Before You Code

1. Read memory bank
2. Check design docs
3. Review existing tests
4. Understand the pattern

## After You Code

1. Write/update tests
2. Update memory bank
3. Check CI passes
4. Semantic commit message
