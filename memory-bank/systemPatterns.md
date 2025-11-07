# System Patterns - Ebb & Bloom

**Purpose**: Document the recurring patterns, processes, and principles that govern how we build this game.

## Table of Contents
1. [PR Review & Merge Process](#pr-review--merge-process)
2. [Architecture Patterns](#architecture-patterns)
3. [Development Workflow](#development-workflow)
4. [Code Quality Standards](#code-quality-standards)
5. [Testing Patterns](#testing-patterns)

---

## PR Review & Merge Process

### Required Before Merge

**CRITICAL**: All PRs must have ALL review feedback addressed before merge. This is non-negotiable.

#### 1. Automated Reviewers
This repository has **3 automated code reviewers**:
- **GitHub Copilot** - Code analysis and suggestions
- **Gemini Code Assist** - Documentation and consistency checks
- **Manual reviews** (when requested)

#### 2. Review Response Process

When a PR receives review comments:

**DO THIS** ✅:
1. **Fix ALL issues immediately** - Never leave review feedback unaddressed
2. **Update the memory bank** - Document what was fixed in `activeContext.md`
3. **Reply to each comment** - Let reviewers know issues are resolved (via gh api)
4. **Push fixes to the same PR** - Keep all work in one branch
5. **Verify CI passes** - Ensure all automated checks still pass

**DON'T DO THIS** ❌:
- Create standalone "review response" documents (use memory bank)
- Leave review threads unresolved
- Say "will fix later" - fix it NOW
- Ignore minor issues (typos matter!)
- Create new PRs for fixes (amend existing PR)

#### 3. GitHub CLI Authentication

To interact with PRs programmatically:

```bash
# Use GH_TOKEN environment variable (not gh auth login)
export GH_TOKEN="$DEV_GH_TOKEN"

# Test access
gh pr view <number> --json number,title,state

# Post review comment
gh api /repos/OWNER/REPO/pulls/<number>/reviews -X POST \
  --field body="Review response text" \
  --field event="COMMENT"

# Resolve review threads (GraphQL API)
gh api graphql -f query='
  mutation {
    resolveReviewThread(input: {threadId: "THREAD_ID"}) {
      thread {
        isResolved
      }
    }
  }'

# Note: Token needs these scopes:
# - repo (required for PR access)
# - workflow (for CI/CD)
# Token may be missing 'read:org' - this is OK, just causes warnings
```

#### 4. Finding and Fixing Issues

**For Typos/Inconsistencies**:
```bash
# Find all occurrences
rg "BadTypo" --files-with-matches

# Check in specific file types
rg "BadTypo" --type-add 'doc:*.md' --type doc

# Fix in all files (code + docs + tests)
# Use StrReplace tool for each file

# Verify before committing
git diff
```

**For Documentation Issues**:
- Update memory bank files (activeContext.md, productContext.md, etc.)
- Do NOT create standalone docs
- Link related documentation
- Keep everything in context

**For Code Quality**:
- Follow `docs/CODE_QUALITY_STANDARDS.md`
- No TODOs/FIXMEs/placeholders
- Production-ready only
- Add tests if needed

#### 5. Example: PR #3 Review Response

**Issues Found** (Gemini Code Assist):
1. Typo: "Chainshaw" → "Chainsaw" in 6 files
2. Incomplete file list in ORGANIZATION_COMPLETE.md

**Actions Taken**:
1. Found all occurrences: `rg "Chainshaw" --files-with-matches`
2. Fixed code: `src/ecs/components/traits.ts`
   - Component export: `ChainshawHands` → `ChainsawHands`
   - TRAIT_COSTS key: `chainshawHands` → `chainsawHands`
   - Comment references
3. Fixed docs: 3 memory bank files + `.copilot-instructions.md`
   - `memory-bank/techContext.md`
   - `memory-bank/productContext.md`
   - `src/ecs/README.md`
4. Updated file list: ORGANIZATION_COMPLETE.md (12 → 17 files)
5. Committed: `git commit -m "fix: correct typo Chainshaw → Chainsaw..."`
6. Updated memory bank: `activeContext.md` with PR status
7. Posted review response: `gh api /repos/.../pulls/3/reviews -X POST`
8. **Result**: All feedback addressed, ready for merge

#### 6. Merge Checklist

Before merging ANY PR:

- [ ] All automated reviewer comments addressed
- [ ] All CI/CD checks passing (tests, lint, build)
- [ ] Memory bank updated with current state
- [ ] No review threads left unresolved
- [ ] Branch is up-to-date with main
- [ ] Commit messages follow convention
- [ ] No merge conflicts

### Why This Matters

- **Quality Gate**: Reviews catch issues before they reach production
- **Learning Loop**: Addressing feedback improves code quality over time
- **Documentation**: Review responses become part of project history
- **Consistency**: Ensures all code meets same standards

---

## Architecture Patterns

### 1. ECS as Single Source of Truth

**Pattern**: BitECS components hold ALL game state.

```typescript
// ✅ CORRECT: State in ECS components
const Position = defineComponent({ x: f32, y: f32 });
const Velocity = defineComponent({ x: f32, y: f32 });

// Systems modify components
const movementSystem = (world) => {
  const entities = query([Position, Velocity]);
  for (const eid of entities) {
    Position.x[eid] += Velocity.x[eid];
    Position.y[eid] += Velocity.y[eid];
  }
};
```

```typescript
// ❌ WRONG: State in Phaser or Zustand
// Never do this!
sprite.x += velocity.x;  // Phaser shouldn't own state
store.setPosition(x, y); // Zustand shouldn't modify game state
```

**Why**: Single source of truth prevents sync bugs, enables time travel/replay, makes testing deterministic.

### 2. One-Way Data Flow

**Pattern**: ECS → Zustand → Vue/Phaser (read-only)

```
┌─────────────────────────────────────────────┐
│              BitECS (Source of Truth)       │
│  Components: Position, Velocity, Inventory  │
│  Systems: Movement, Crafting, Snapping      │
└──────────────────┬──────────────────────────┘
                   │ (one-way, read-only)
                   ▼
         ┌─────────────────────┐
         │  Zustand UI Store   │
         │  Syncs from ECS     │
         │  Never writes back  │
         └──────┬──────┬───────┘
                │      │
    (read-only) │      │ (read-only)
                ▼      ▼
         ┌──────┐  ┌────────┐
         │ Vue  │  │ Phaser │
         │ UI   │  │ Render │
         └──────┘  └────────┘
```

**Implementation**:
```typescript
// Zustand store reads from ECS
export const useGameStore = create((set) => ({
  playerPos: { x: 0, y: 0 },
  // Called by game loop after systems run
  syncFromECS: (world, playerEid) => {
    set({
      playerPos: {
        x: Position.x[playerEid],
        y: Position.y[playerEid]
      }
    });
  }
}));
```

### 3. Component-Based Design

**Pattern**: Components are pure data, systems are pure logic.

```typescript
// ✅ CORRECT: Component is data only
export const FlipperFeet = defineComponent({
  level: Types.ui8  // 0-3
});

// ✅ CORRECT: System contains logic
export const createMovementSystem = () => (world) => {
  const entities = query([Position, Velocity, FlipperFeet]);
  for (const eid of entities) {
    const speed = 1.0 + (FlipperFeet.level[eid] * 0.2);
    Position.x[eid] += Velocity.x[eid] * speed;
    Position.y[eid] += Velocity.y[eid] * speed;
  }
};
```

```typescript
// ❌ WRONG: Methods in components
export const FlipperFeet = defineComponent({
  level: Types.ui8,
  calculateSpeed() { /* NO! */ }  // Logic doesn't belong here
});
```

### 4. Test-First Development

**Pattern**: Write tests before implementation.

```typescript
// 1. Write test first
describe('SnappingSystem', () => {
  it('should combine ore + water into alloy', () => {
    const world = createWorld();
    const eid = addEntity(world);
    addComponent(world, Inventory, eid);
    Inventory.ore[eid] = 1;
    Inventory.water[eid] = 1;
    
    const system = createSnappingSystem();
    system(world);
    
    expect(Inventory.alloy[eid]).toBe(1);
    expect(Inventory.ore[eid]).toBe(0);
    expect(Inventory.water[eid]).toBe(0);
  });
});

// 2. Implement to make test pass
// 3. Refactor
// 4. Repeat
```

### 5. Mobile-First Always

**Pattern**: Design for touch, portrait, 60 FPS.

```typescript
// ✅ CORRECT: Touch gesture handlers
const GestureSystem = {
  onSwipe: (direction) => { /* move player */ },
  onTap: (x, y) => { /* interact */ },
  onLongPress: (x, y) => { /* context menu */ },
  onPinch: (scale) => { /* zoom */ }
};

// ✅ CORRECT: Haptic feedback
Haptics.impact({ style: ImpactStyle.Light });

// ✅ CORRECT: Performance conscious
if (entities.length > 1000) {
  // Cull distant entities
}
```

---

## Development Workflow

### 1. Start with Memory Bank

**Before coding anything**, read:
1. `memory-bank/productContext.md` - What are we building?
2. `memory-bank/techContext.md` - How is it built?
3. `memory-bank/activeContext.md` - What's happening now?
4. `memory-bank/progress.md` - Where are we?

### 2. Find the Right Package

```
src/
├── ecs/          # Game state and logic (START HERE)
├── game/         # Phaser rendering (read-only from ECS)
├── systems/      # Cross-cutting concerns (Haiku, Haptics, Gestures)
├── stores/       # UI state sync (read-only from ECS)
├── views/        # Vue UI components
├── test/         # Test suites
```

### 3. Write Tests First

```bash
# Create test file
touch src/test/NewSystem.test.ts

# Write failing test
# Implement feature
# Make test pass

# Run tests
pnpm test

# Check coverage
pnpm test:coverage
```

### 4. Implement in ECS

1. Define components (data)
2. Create systems (logic)
3. Add entities if needed
4. Update Zustand sync if UI needs data
5. Update Phaser rendering if visual

### 5. Update Documentation

**Memory Bank**:
- Update `activeContext.md` with what you did
- Update `progress.md` if milestone reached
- Update `productContext.md` if features added

**Package READMEs**:
- Update relevant package README with new components/systems

### 6. Commit & Push

```bash
# Follow conventional commits
git commit -m "feat: add flipper feet trait system

Implements water speed bonus for FlipperFeet trait.
Tests: src/test/TraitSystem.test.ts

Closes #42"

# Push to branch
git push
```

### 7. Handle PR Reviews

Follow [PR Review & Merge Process](#pr-review--merge-process) above.

---

## Code Quality Standards

See `docs/CODE_QUALITY_STANDARDS.md` for full details.

**Core Principles**:
1. **Leave it better than you found it** - Fix TODOs immediately
2. **Production-ready only** - No placeholders, ever
3. **Type safety** - No `any` types
4. **Error handling** - Always handle errors gracefully
5. **Documentation** - Every function has purpose, every package has README

---

## Testing Patterns

### Unit Tests

```typescript
describe('ComponentName', () => {
  it('should do specific thing', () => {
    // Arrange
    const world = createWorld();
    const eid = addEntity(world);
    
    // Act
    const result = someFunction(world, eid);
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

### Integration Tests

```typescript
describe('System Integration', () => {
  it('should process full game loop', () => {
    const world = resetWorld();
    const playerEid = createPlayer(world, 0, 0);
    
    // Run multiple systems
    movementSystem(world, 16);
    craftingSystem(world);
    snappingSystem(world);
    
    // Verify state
    expect(Inventory.alloy[playerEid]).toBe(1);
  });
});
```

### Test Organization

```
src/test/
├── ecs/
│   ├── MovementSystem.test.ts
│   ├── CraftingSystem.test.ts
│   └── SnappingSystem.test.ts
├── systems/
│   ├── HaikuScorer.test.ts
│   └── HapticSystem.test.ts
└── setup.ts  # Test configuration
```

**Coverage Target**: 80%+ for all systems

---

**Last Updated**: 2025-11-06  
**Maintained By**: Memory Bank (source of truth)
