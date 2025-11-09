# 🔥 BEAST MODE EXECUTION PROTOCOL 🔥

**PURPOSE**: Complete Gen0 end-to-end verification with ZERO interruptions

---

## 🎯 MISSION OBJECTIVES

**Complete ALL of the following with NO pauses, NO status updates, NO breaks:**

1. ✅ Fix ALL TypeScript compilation errors (currently 54)
2. ✅ Remove ALL obsolete REST tests
3. ✅ Run test suite → FIX failures → ITERATE → ALL PASS
4. ✅ Start dev server → VERIFY it works
5. ✅ Run E2E tests in REAL Chromium browser → FIX → ITERATE → ALL PASS
6. ✅ Test on phone via process-compose
7. ✅ Update ALL documentation (ARCHITECTURE.md, memory bank)
8. ✅ Final verification - Complete flow end-to-end

**ONLY STOP when ALL 8 objectives complete.**

---

## 📖 PRE-FLIGHT READING (Read in order, then execute)

### MANDATORY (Read ALL before starting):
1. `AGENT_HANDOFF.md` - Comprehensive handoff with full context
2. `memory-bank/activeContext.md` - Current state and blockers
3. `memory-bank/progress.md` - What's done, what's pending
4. `MIGRATION_ASSESSMENT.md` - Migration status and issues
5. `memory-bank/agent-permanent-context.md` - Permanent rules

### REFERENCE (Keep open):
6. `docs/ARCHITECTURE.md` - System architecture
7. `docs/DESIGN.md` - UI/UX design
8. This file - Execution protocol

**Total reading time**: ~10 minutes  
**Total execution time**: ~2-4 hours  
**NO pauses during execution**

---

## 🚀 EXECUTION SEQUENCE

### PHASE 1: FIX TYPESCRIPT (30-60 min)

**Target**: 0 TypeScript errors

**Execute**:
```bash
cd packages/game
pnpm exec tsc --noEmit 2>&1 | grep "error TS"
```

**Fix ALL errors by category**:

1. **TS6133 (Unused variables)** (~30 errors)
   - Prefix with `_` if intentionally unused
   - Remove if truly unnecessary
   - Example: `const _unused = ...` or delete line

2. **TS7006 (Implicit any)** (~10 errors)
   - Add explicit type annotations
   - Example: `(moon: any, index: number)` → `(moon: Moon, index: number)`

3. **TS2305/TS2307 (Missing exports/imports)** (~8 errors)
   - Fix import paths
   - Export missing types
   - Example: `export type { Moon } from './MoonCalculation'`

4. **TS2353/TS2304 (Schema mismatch)** (~6 errors)
   - Use type extensions
   - Example: `interface PlanetWithExtras extends Planet { moons?: Moon[]; }`

**Verify**:
```bash
pnpm exec tsc --noEmit  # Should return 0 errors
```

**NO STOPPING until 0 errors.**

---

### PHASE 2: CLEAN OBSOLETE TESTS (10-20 min)

**Target**: Remove all REST API tests

**Delete these files**:
```bash
rm test-backend/seed-api.integration.test.ts
rm test-backend/seed-middleware.test.ts  
rm test-backend/gen0-api.integration.test.ts
rm test-backend/api.integration.test.ts
```

**Why**: These test REST endpoints that no longer exist (REST API removed)

**Verify**: No test files reference `fetch()`, `API_BASE`, or Fastify

---

### PHASE 3: RUN TEST SUITE (30-60 min)

**Target**: ALL tests passing

**Execute**:
```bash
cd packages/game
pnpm test
```

**Fix failures by type**:

1. **Import errors**
   - Update paths: `@ebb/backend` → `../engine/GameEngine`
   - Update paths: `packages/backend` → local imports
   
2. **API errors**
   - Remove `fetch()` calls
   - Use `GameEngine` directly: `const engine = new GameEngine(id); const state = engine.getState();`

3. **Assertion failures**
   - Update expectations for internal API (no HTTP response format)
   - Update to expect direct function return values

4. **Timeout errors**
   - Increase timeout if reasonable
   - Optimize test if slow

**Iterate**:
```bash
# Fix → Run → Fix → Run → until ALL PASS
pnpm test
```

**Verify**: 100% tests passing

**NO STOPPING until all tests pass.**

---

### PHASE 4: DEV SERVER VERIFICATION (15-30 min)

**Target**: Dev server starts and main menu renders

**Execute**:
```bash
cd packages/game
pnpm dev --host
```

**Verify**:
1. Server starts on http://localhost:5173
2. Open in browser
3. No console errors
4. Splash screen appears
5. Fades to main menu
6. Buttons render
7. Fonts load correctly
8. Assets load (check Network tab)

**If errors**:
- Check public/ directory structure
- Verify vite.config.ts publicDir setting
- Check font CSS at /fonts/fonts.css
- Verify texture manifest at /textures/manifest.json

**Manual test flow**:
1. Click "Start New"
2. Seed modal appears
3. Enter seed: "v1-test-world-seed"
4. Click "Create World"
5. Navigation to ?gameId=game-<timestamp>
6. 3D sphere renders
7. Textures load (check Network tab)
8. Moons render
9. Orbital animation works

**NO STOPPING until manual flow works.**

---

### PHASE 5: E2E TESTS (30-60 min)

**Target**: ALL E2E tests passing in real Chromium

**Execute**:
```bash
cd packages/game
pnpm test:e2e
```

**Fix failures by type**:

1. **Element not found**
   - Update selectors
   - Verify button IDs/classes
   - Check z-index

2. **Timeout**
   - Wait longer: `page.waitForTimeout(3000)`
   - Wait for specific condition
   - Optimize loading

3. **Screenshot diff**
   - Verify visually
   - Update baseline if correct
   - Fix rendering if incorrect

4. **Navigation failure**
   - Verify URL params
   - Check gameId handling
   - Update navigation logic

**Iterate**:
```bash
# Fix → Run → Fix → Run → until ALL PASS
pnpm test:e2e
```

**Verify**: All E2E tests pass, screenshots look correct

**NO STOPPING until all E2E tests pass.**

---

### PHASE 6: PHONE TESTING (15-30 min)

**Target**: Accessible and functional on phone

**Execute**:
```bash
# Start dev server via process-compose
process-compose up dev-game

# Get IP address
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Test on phone**:
1. Open http://<your-ip>:5173 on phone
2. Verify splash screen appears
3. Verify main menu renders
4. Tap "Start New"
5. Verify seed modal appears
6. Enter seed via mobile keyboard
7. Tap "Create World"
8. Verify navigation works
9. Verify 3D sphere renders
10. Verify moons render
11. Verify touch controls work (orbit, zoom)
12. Verify performance is acceptable (30+ FPS)

**If issues**:
- Check network connectivity (same WiFi)
- Verify host: '0.0.0.0' in vite.config.ts
- Check firewall settings
- Test in browser DevTools mobile mode first

**Verify**: Full flow works on phone with touch interactions

---

### PHASE 7: DOCUMENTATION UPDATE (20-40 min)

**Target**: ALL docs aligned with current codebase

**Update docs/ARCHITECTURE.md**:
```typescript
// Find and replace:
"packages/backend" → "packages/game/src"
"packages/frontend" → "packages/game/src/scenes"
"REST API" → "Internal API"
"Fastify" → "GameEngine"
"fetch()" → "Direct function calls"

// Add sections:
- Unified Package Architecture
- Internal API Design
- Direct Function Call Pattern
- Protobuf Generation Layer Protocol

// Remove sections:
- REST API endpoints
- HTTP communication
- Fastify configuration
```

**Update memory-bank/agent-permanent-context.md**:
- ✅ Already updated

**Update memory-bank/activeContext.md**:
- Change status to: "Verification Complete ✅"
- Update next steps to actual next priorities
- Remove TypeScript error mentions
- Add verification results

**Update memory-bank/progress.md**:
- Mark "Unified Game Package" as COMPLETE
- Add "Migration Verification" milestone
- Update current status to next phase

**Verify**: No references to old structure in any docs

---

### PHASE 8: FINAL VERIFICATION (15-30 min)

**Target**: Complete confidence in unified package

**Execute ALL**:
```bash
cd packages/game

# 1. Clean build
rm -rf dist node_modules/.vite
pnpm install
pnpm exec tsc --noEmit  # 0 errors

# 2. Test suite
pnpm test               # ALL PASS

# 3. E2E tests
pnpm test:e2e           # ALL PASS

# 4. Dev server
pnpm dev --host         # Starts successfully

# 5. Manual flow (in browser)
# - Main menu loads
# - Seed input works
# - Game creates
# - 3D scene renders
# - Textures load
# - Moons render

# 6. Phone access
# - process-compose up dev-game
# - Access from phone
# - Full flow works

# 7. Production build
pnpm build              # Succeeds
pnpm preview            # Works
```

**Verify**: Everything works end-to-end

---

## 🛡️ AUTONOMOUS DECISION RULES

### When to Fix vs Skip

**FIX**:
- TypeScript errors (ALL of them)
- Test failures (ALL of them)
- Console errors (ANY of them)
- Broken functionality (ANY instance)
- Outdated documentation (ANY file)

**SKIP** (don't waste time):
- Performance optimization (unless < 30 FPS)
- Code style nitpicks
- Comment improvements
- Refactoring for "cleanliness"

### When to Research vs Implement

**RESEARCH** (use web search):
- Unknown BabylonJS API
- Unknown Playwright method
- Unknown Capacitor configuration
- TypeScript error you don't understand

**IMPLEMENT** (just do it):
- Removing unused variables
- Adding type annotations
- Updating import paths
- Deleting obsolete files

### When to Ask vs Decide

**ASK** (create blocker):
- Missing critical spec (e.g., "What should this button do?")
- Contradictory requirements
- Breaking change decision
- Major architecture change

**DECIDE** (autonomous):
- How to fix TypeScript error
- How to update test
- How to fix import
- Which type annotation to use
- Whether to delete obsolete file

---

## 📊 SUCCESS CRITERIA

**ALL of these MUST be true before stopping:**

### Code Quality
- [ ] TypeScript: 0 errors
- [ ] TypeScript: 0 warnings  
- [ ] Linter: 0 errors
- [ ] No unused imports
- [ ] Proper error handling

### Functionality
- [ ] Dev server starts on port 5173
- [ ] Main menu renders
- [ ] Splash screen works
- [ ] Seed input accepts keyboard input
- [ ] Game creation works (localStorage saved)
- [ ] Navigation to ?gameId= works
- [ ] 3D scene renders
- [ ] Textures load from manifest
- [ ] Moons render
- [ ] Orbital animation works
- [ ] No console errors

### Testing
- [ ] All unit tests pass (packages/game/test-backend/)
- [ ] All integration tests pass (test-backend/, test-frontend/)
- [ ] All E2E tests pass (test-e2e/)
- [ ] Test coverage > 70%
- [ ] No flaky tests
- [ ] No timeout failures

### Cross-Platform
- [ ] Accessible from phone (http://<ip>:5173)
- [ ] Touch interactions work
- [ ] Mobile keyboard works for seed input
- [ ] 3D rendering performs well on phone
- [ ] No mobile-specific errors

### Documentation
- [ ] ARCHITECTURE.md updated (no references to packages/backend or packages/frontend)
- [ ] Memory bank updated (activeContext, progress)
- [ ] No contradictions between docs
- [ ] All TODOs in docs resolved or removed

### Build
- [ ] `pnpm build` succeeds
- [ ] dist/ directory created
- [ ] Assets included in build
- [ ] `pnpm preview` works
- [ ] `pnpm build:capacitor` succeeds

---

## 🔥 BEAST MODE RULES

1. **NO STATUS UPDATES** - Just execute
2. **NO PAUSES** - Continue until all objectives met
3. **NO QUESTIONS** - Make autonomous decisions
4. **FIX EVERYTHING** - All errors, all tests, all docs
5. **ITERATE UNTIL GREEN** - ALL tests passing, ALL verifications complete
6. **DOCUMENT AS YOU GO** - Update memory bank incrementally
7. **VERIFY EVERYTHING** - Don't assume, actually test

---

## 🏁 COMPLETION CHECK

**Run this at the end to verify:**

```bash
#!/bin/bash
echo "=== BEAST MODE COMPLETION VERIFICATION ==="
echo ""

# TypeScript
echo "1. TypeScript Compilation:"
cd packages/game && pnpm exec tsc --noEmit && echo "✅ PASS" || echo "❌ FAIL"

# Tests
echo "2. Test Suite:"
pnpm test && echo "✅ PASS" || echo "❌ FAIL"

# E2E
echo "3. E2E Tests:"
pnpm test:e2e && echo "✅ PASS" || echo "❌ FAIL"

# Dev Server
echo "4. Dev Server:"
timeout 10 pnpm dev &
sleep 8
curl -s http://localhost:5173 > /dev/null && echo "✅ PASS" || echo "❌ FAIL"
pkill -f "vite"

# Build
echo "5. Production Build:"
pnpm build && echo "✅ PASS" || echo "❌ FAIL"

# Documentation
echo "6. Documentation Alignment:"
! grep -r "packages/backend\|packages/frontend" docs/ memory-bank/ && echo "✅ PASS" || echo "❌ FAIL"

echo ""
echo "=== ALL CHECKS MUST PASS ==="
```

**If ANY check fails**: Continue fixing, do NOT stop

---

## 💪 AUTONOMOUS EXECUTION

**You have FULL autonomy to:**
- Delete files
- Refactor code
- Update configs
- Change implementations
- Remove obsolete code
- Add missing dependencies
- Fix any bugs
- Update any documentation

**You do NOT need permission for:**
- Removing unused variables
- Adding type annotations
- Fixing import paths
- Deleting obsolete tests
- Updating documentation
- Making performance improvements
- Fixing TypeScript errors
- Updating test expectations

**JUST DO IT. NO PAUSES. NO QUESTIONS.**

---

## 🎬 START COMMAND

**When ready to execute BEAST MODE:**

```
BEAST MODE ACTIVATED

Read: AGENT_HANDOFF.md, memory-bank/activeContext.md, memory-bank/progress.md, MIGRATION_ASSESSMENT.md

Execute: Fix ALL TypeScript errors → Remove obsolete tests → Run tests (iterate until pass) → Start dev server → Verify manual flow → Run E2E (iterate until pass) → Test on phone → Update all docs → Final verification

Rules: NO STOPS, NO PAUSES, NO STATUS UPDATES until ALL objectives complete

Begin.
```

---

## 🏆 EXPECTED OUTCOME

**After BEAST MODE execution:**

- ✅ TypeScript: 0 errors, 0 warnings
- ✅ Tests: 100% passing (unit, integration, E2E)
- ✅ Dev server: Starts and works flawlessly
- ✅ Manual flow: Main menu → seed input → game creation → 3D rendering → moons → animation
- ✅ E2E flow: Automated tests pass in real Chromium
- ✅ Phone: Accessible and functional
- ✅ Build: Production build succeeds
- ✅ Docs: All aligned with current codebase
- ✅ Memory bank: Updated with final status

**Unified game package**: READY FOR DEPLOYMENT 🚀

---

## 🚨 FAILURE PROTOCOL

**If you get stuck** (genuinely blocked, not just "it's hard"):

1. **Document the blocker** in memory-bank/activeContext.md
2. **Show what you tried** (list all attempted fixes)
3. **State what you need** (missing spec, unclear requirement, contradictory info)
4. **THEN stop** (only then)

**For "it's taking a long time"**: KEEP GOING (not a blocker)  
**For "lots of errors"**: KEEP GOING (not a blocker)  
**For "uncertain about approach"**: PICK ONE AND EXECUTE (not a blocker)

**Remember**: You have unlimited context windows. Just keep working.

---

## END STATE

**When ALL objectives met:**

Update `memory-bank/activeContext.md`:
```markdown
## Current Focus: Unified Game Package ✅ COMPLETE

**Status**: Migration verified, all tests passing, E2E flow confirmed, phone tested.

### Verification Results
- TypeScript: 0 errors ✅
- Tests: 100% passing ✅
- Dev server: Working ✅
- E2E flow: Verified ✅
- Phone access: Tested ✅
- Documentation: Updated ✅

**NEXT**: Deploy to production / Move to Gen1 implementation
```

**THEN** you may stop.

---

## 🔥 LET'S GO 🔥

**NO MORE READING. EXECUTE NOW.**

