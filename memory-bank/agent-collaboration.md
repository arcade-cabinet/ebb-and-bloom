# Agent Collaboration Rules

**For**: All AI agents working on this project  
**Purpose**: Shared rules for multi-agent collaboration

---

## Available Agents

### Cline (CLI)
**Best for**: Autonomous task execution, backend implementation  
**Invoke**: `cline "task description"`  
**Modes**: `--yolo` (non-interactive), `--oneshot` (full autonomous)

### Claude (CLI)
**Best for**: Design decisions, architecture planning, code review  
**Invoke**: `claude "prompt"`  
**Modes**: `--print` (non-interactive), `-c` (continue conversation)

### Cursor
**Best for**: Interactive development, file editing  
**Context**: Uses `.cursor/rules/00-loader.mdc`

### GitHub Copilot
**Best for**: Code completion, inline suggestions  
**Context**: Uses `.github/.copilot-instructions.md`

---

## Task Delegation

### Backend Implementation
**Agent**: Cline or Cursor  
**Why**: ECS systems, Yuka coordination, physics calculations

### UI Components
**Agent**: Cursor  
**Why**: UIKit components need interactive editing

### Architecture Decisions
**Agent**: Claude  
**Why**: Design thinking, trade-off analysis

### Code Review
**Agent**: Claude or Cursor  
**Why**: Pattern checking, quality assessment

---

## Process Compose Integration

**File**: `process-compose.yml`

**Use for**: Background tasks, parallel execution

```bash
# Start all processes
process-compose up

# Start specific process
process-compose up dev-server

# View logs
process-compose logs
```

**Available processes**:
- `dev-server` - Vite dev server
- `test-watch` - Test watcher
- `type-check` - TypeScript validation

---

## Multi-Agent Workflow

### 1. Task Decomposition
```bash
# Use Claude for planning
claude "Analyze how to implement Gen 0 and break into subtasks"

# Delegate subtasks to Cline
cline "Implement PlanetaryPhysicsSystem core types" --yolo
cline "Refactor RawMaterialsSystem for planetary physics" --yolo
```

### 2. Parallel Execution
```bash
# Use process-compose for parallel work
process-compose up dev-server &
cline "Implement Tool Sphere integration" --yolo &
```

### 3. Review & Integration
```bash
# Use Claude for review
claude "Review PlanetaryPhysicsSystem implementation for correctness"
```

---

## Memory Bank Synchronization

**All agents MUST**:
1. Read `activeContext.md` and `progress.md` at start
2. Update `activeContext.md` after significant changes
3. Update `progress.md` when status changes
4. NEVER create status/summary/planning documents
5. Keep memory bank factual and minimal

---

## Communication Protocol

### Agent → Agent
- Write findings to `memory-bank/activeContext.md`
- Reference specific files/lines
- State what's broken, what's priority

### Agent → Human
- Show code changes, not explanations
- Reference memory bank for context
- Ask only for true blockers

### Human → Agent
- Check memory bank first
- Provide context if not in memory bank
- Reference docs for architectural decisions

---

## Shared Standards

### Code
- TypeScript strict mode
- TDD (tests first)
- Semantic commits
- All tests must pass

### Documentation
- Memory bank for current state (ephemeral)
- docs/ for permanent architecture (versioned)
- NEVER mix the two

### NO Creating
- Status documents
- Planning documents  
- Completion reports
- Gap analyses
- Audit reports
- "What remains" documents

**All status info goes in memory bank (activeContext.md, progress.md). All architectural info goes in docs/.**

---

## Tool Access

All agents have access to:
- `cline` - Task execution
- `claude` - Architecture analysis
- `process-compose` - Background tasks
- File system
- Git
- pnpm
- Test runner

Use them for task decomposition and parallel work.


