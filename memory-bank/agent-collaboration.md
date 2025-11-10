# Agent Collaboration Rules

**For**: All AI agents working on this project  
**Purpose**: Shared rules for multi-agent collaboration  
**Last Updated**: 2025-11-10 (Engine refactor complete)

---

## Project Structure

**Ebb & Bloom Engine** - Law-based simulation engine with R3F demos

```
engine/    # Pure TypeScript simulation logic
demo/      # React Three Fiber presentation
tools/     # CLI utilities
```

---

## Available Agents

### Cursor (Primary)
**Best for**: Interactive development, engine implementation, R3F components  
**Context**: Uses `.clinerules` and this file

### GitHub Copilot
**Best for**: Code completion, React components, R3F patterns  
**Context**: Uses `.cursor/rules/`

### Claude (CLI)
**Best for**: Design decisions, architecture planning  
**Usage**: Research and planning

### Cline (CLI)
**Best for**: Autonomous task execution  
**Usage**: Batch operations, testing

---

## Task Delegation

### Engine Development
**Agent**: Cursor  
**Tasks**: Laws, spawners, agents, simulation systems  
**Tech**: TypeScript, Yuka, SimplexNoise

### R3F Components
**Agent**: Cursor + Copilot  
**Tasks**: Demo scenes, 3D components, visual systems  
**Tech**: React, R3F, Drei, Zustand

### Documentation
**Agent**: Cursor  
**Tasks**: API docs, architecture guides, README  
**Location**: docs/ and memory-bank/

### Testing
**Agent**: Cursor  
**Tasks**: E2E tests, unit tests, validation  
**Tools**: Playwright, Vitest

---

## Memory Bank Synchronization

**All agents MUST:**
1. Read `agent-permanent-context.md` first (project facts)
2. Read `activeContext.md` second (current focus)
3. Read `progress.md` third (what's done)
4. Update `activeContext.md` after significant changes
5. Update `progress.md` when milestones complete

**NEVER create** in repository root:
- Status documents (e.g., "TESTS_COMPLETE.md")
- Planning documents (e.g., "NEXT_AGENT_NEEDS.md")  
- Completion reports (e.g., "BEAST_MODE_*.md")
- Handoff documents (e.g., "README_FOR_NEXT_AGENT.md")

**All status/progress/planning** goes in `memory-bank/` ONLY.

---

## Communication Protocol

### Agent → Agent
- Write findings to `memory-bank/activeContext.md`
- Reference specific files/lines
- State what's broken, what's priority
- Keep it factual, not flowery

### Agent → Human
- Show code changes, not just explanations
- Reference memory bank for context
- Ask only for true blockers
- Provide working code

### Human → Agent
- Check memory bank first
- Provide context if needed
- Reference docs for architectural decisions

---

## Documentation Rules

### docs/ = Permanent Architecture
**Purpose:** Long-term technical documentation  
**Audience:** Developers, contributors  
**Content:** 
- Engine architecture
- Law system design
- API references
- Technical patterns

**Examples:**
- `docs/ARCHITECTURE.md` - Engine architecture
- `docs/LAW_SYSTEM.md` - Law system guide
- `docs/architecture/` - Specific architecture docs

### memory-bank/ = Ephemeral State
**Purpose:** Agent context and session state  
**Audience:** AI agents  
**Content:**
- Current focus (activeContext.md)
- Progress tracking (progress.md)
- Project facts (agent-permanent-context.md)
- Session logs (sessions/)

**Examples:**
- `memory-bank/activeContext.md`
- `memory-bank/progress.md`
- `memory-bank/sessions/` - Historical sessions

### NEVER Mix
- ❌ Don't put status docs in docs/
- ❌ Don't put architecture in memory-bank/ (except architecture/ subfolder for deep dives)
- ❌ Don't create docs in root (only README.md allowed)

---

## Current Tech Stack

### Engine (TypeScript)
```typescript
import {
  EnhancedRNG,
  ChunkManager,
  BiomeSystem,
  calculateGravity
} from 'ebb-and-bloom-engine';
```

### Demo (React Three Fiber)
```typescript
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { useGameStore } from '@demo/store/gameStore';
```

### State (Zustand)
```typescript
const { player, world } = useGameStore();
```

---

## Shared Standards

### Code
- TypeScript strict mode
- Engine = pure logic (no rendering)
- Demo = R3F components only
- Zustand for state
- Tests must pass

### Documentation
- Only README.md in root
- Architecture docs in docs/
- Status in memory-bank/
- Clear separation

### Git Commits
- Semantic commits
- Clear descriptions
- Reference issues when relevant
- Clean history

---

## Package Structure

### Engine (`engine/`)
**Purpose**: Simulation logic, laws, spawners  
**No dependencies on**: React, R3F, rendering libraries  
**Exports**: Clean TypeScript API

### Demo (`demo/`)
**Purpose**: Visual demos, R3F components, UI  
**Dependencies**: React, R3F, Drei, Zustand  
**Imports**: Engine via package

### Tools (`tools/`)
**Purpose**: CLI utilities, testing, validation  
**Usage**: Development helpers

---

## Testing

### Engine Tests
```bash
npm test                 # Unit tests
tools/testing/test-determinism.ts
tools/testing/test-rng-quality.ts
```

### Demo Tests
```bash
cd demo
npm run test:e2e        # Playwright E2E tests
```

---

## Tool Access

All agents have access to:
- File system
- Git
- npm
- Test runners
- TypeScript compiler
- Vite dev server

---

**CRITICAL**: 
- Engine in `engine/` (not `packages/game/src/`)
- Use R3F for rendering (not BabylonJS)
- Status docs in `memory-bank/` ONLY
- Only README.md in root directory
