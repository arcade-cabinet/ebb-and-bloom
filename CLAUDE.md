# Claude Agent Instructions

## Project Context
**Ebb & Bloom** - Law-based multi-agent universe simulator

## Read First (In Order)
1. `memory-bank/agent-permanent-context.md` - Project facts
2. `memory-bank/activeContext.md` - Current state
3. `memory-bank/NEXT_AGENT_HANDOFF.md` - Your mission
4. `.clinerules` - Agent rules

## Current Mission
**Complete full Yuka integration with bottom-up emergence**

### What's Ready
- ✅ Agent infrastructure (Spawner, LOD, EntropyAgent, StellarAgent, PlanetaryAgent, CreatureAgent)
- ✅ Legal Broker system (6 regulators, extended with spawn/goals/analytical)
- ✅ Genesis timeline (Big Bang → Present)
- ✅ Tests passing (no call stack errors)

### What to Build
1. **DensityAgent** - Molecular collapse → star formation
2. **GravityBehavior** - Agent clustering (not forced positions!)
3. **Wire UniverseTimelineScene** - Genesis + Yuka + Legal Brokers
4. **Rebuild universe.html** - Timeline from t=0, not static grid

### Key Principles
- **Bottom-up:** Start at Planck scale (t=0), grow to cosmic
- **Yuka decides:** No forcing - agents decide WHERE/WHEN/HOW MANY
- **EntropyAgent governs:** Top-level thermodynamics (lightweight)
- **Timeline not snapshot:** Show FORMATION not result

## Testing
```bash
# After each change
pnpm test:e2e simple-error-check --reporter=json

# Must show
"status": "passed"

# If call stack error
Add async/await + yielding every 50 iterations
```

## Success Criteria
```bash
pnpm dev → http://localhost:5173/universe.html

Shows:
- t=0: Black (Big Bang)
- PLAY: Time advances
- t=100Myr: Stars appear WHERE Yuka decided
- Camera zooms out as structures grow
- t=1Gyr: Stars cluster (gravity!)
- t=9.2Gyr: Planets form
- NO forcing, pure emergence
```

## Architecture Docs
Read if needed:
- `docs/architecture/BOTTOM_UP_EMERGENCE_THE_KEY.md`
- `docs/architecture/YUKA_DECIDES_EVERYTHING.md`
- `docs/architecture/ENTROPY_AGENT_ARCHITECTURE.md`

## BEAST MODE
When user says "BEAST MODE" or "do it":
1. Read handoff
2. Execute plan
3. Test continuously
4. Fix issues immediately
5. Keep going until success criteria met
6. Update memory-bank/ only (no new docs!)

---

**Full implementation plan:** `memory-bank/NEXT_AGENT_HANDOFF.md`

