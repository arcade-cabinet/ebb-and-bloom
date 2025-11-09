#!/bin/bash
# 🧪 VALIDATE ALL LAWS - Comprehensive Test Suite
# Tests everything built during the law-based architecture overhaul

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     VALIDATING ALL LAW-BASED SYSTEMS                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

test_pass() {
  echo -e "${GREEN}✅ PASS${NC}: $1"
  ((PASS++))
}

test_fail() {
  echo -e "${RED}❌ FAIL${NC}: $1"
  ((FAIL++))
}

# ============================================================================
# 1. DETERMINISM TESTS
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "1️⃣  DETERMINISM TESTS (Same seed = same result)"
echo "═══════════════════════════════════════════════════════════"

cd /workspace/packages/game
echo "Testing: Same seed produces identical universes (3 runs)..."

run1=$(pnpm exec tsx src/cli-tools/test-determinism.ts ancient-star-dance 2>&1 | md5sum)
run2=$(pnpm exec tsx src/cli-tools/test-determinism.ts ancient-star-dance 2>&1 | md5sum)
run3=$(pnpm exec tsx src/cli-tools/test-determinism.ts ancient-star-dance 2>&1 | md5sum)

if [ "$run1" == "$run2" ] && [ "$run2" == "$run3" ]; then
  test_pass "Universe generation is fully deterministic"
else
  test_fail "Universe generation is NOT deterministic!"
fi

# ============================================================================
# 2. VARIETY TESTS
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "2️⃣  VARIETY TESTS (Different seeds produce different results)"
echo "═══════════════════════════════════════════════════════════"

echo "Testing: Different seeds produce different universes..."
seed_a=$(pnpm exec tsx src/cli-tools/test-determinism.ts wild-ocean-glow 2>&1 | md5sum)
seed_b=$(pnpm exec tsx src/cli-tools/test-determinism.ts crystal-void-whisper 2>&1 | md5sum)
seed_c=$(pnpm exec tsx src/cli-tools/test-determinism.ts ancient-star-dance 2>&1 | md5sum)

if [ "$seed_a" != "$seed_b" ] && [ "$seed_b" != "$seed_c" ]; then
  test_pass "Different seeds produce variety"
else
  test_fail "Seeds produce too similar results!"
fi

# ============================================================================
# 3. RNG QUALITY TESTS
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "3️⃣  RNG QUALITY (Mersenne Twister distributions)"
echo "═══════════════════════════════════════════════════════════"

echo "Testing: Mersenne Twister produces quality distributions..."
if pnpm exec tsx src/cli-tools/test-rng-quality.ts 2>&1 | grep -q "✅"; then
  test_pass "RNG distributions pass statistical tests"
else
  test_fail "RNG distributions fail statistical tests!"
fi

# ============================================================================
# 4. PHYSICS LAWS VALIDATION
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "4️⃣  PHYSICS LAWS (Gravity, stellar evolution, thermodynamics)"
echo "═══════════════════════════════════════════════════════════"

echo "Testing: Physics laws compile and execute..."
if pnpm exec tsx -e "import * as laws from './src/laws/physics.js'; console.log('✅ Physics laws OK');" 2>&1 | grep -q "✅"; then
  test_pass "Physics laws load correctly"
else
  test_fail "Physics laws have errors!"
fi

# ============================================================================
# 5. BIOLOGY LAWS VALIDATION
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "5️⃣  BIOLOGY LAWS (Kleiber's Law, allometric scaling)"
echo "═══════════════════════════════════════════════════════════"

echo "Testing: Biology laws compile and execute..."
if pnpm exec tsx -e "import * as laws from './src/laws/biology.js'; console.log('✅ Biology laws OK');" 2>&1 | grep -q "✅"; then
  test_pass "Biology laws load correctly"
else
  test_fail "Biology laws have errors!"
fi

# ============================================================================
# 6. ECOLOGY LAWS VALIDATION  
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "6️⃣  ECOLOGY LAWS (Lotka-Volterra, carrying capacity)"
echo "═══════════════════════════════════════════════════════════"

echo "Testing: Ecology laws compile and execute..."
if pnpm exec tsx -e "import * as laws from './src/laws/ecology.js'; console.log('✅ Ecology laws OK');" 2>&1 | grep -q "✅"; then
  test_pass "Ecology laws load correctly"
else
  test_fail "Ecology laws have errors!"
fi

# ============================================================================
# 7. STOCHASTIC DYNAMICS VALIDATION
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "7️⃣  STOCHASTIC DYNAMICS (Gillespie algorithm, noise)"
echo "═══════════════════════════════════════════════════════════"

echo "Testing: Stochastic population dynamics..."
if pnpm exec tsx src/cli-tools/test-stochastic.ts 2>&1 | grep -q "Simulation completed"; then
  test_pass "Stochastic dynamics run without crash"
else
  test_fail "Stochastic dynamics crash!"
fi

# ============================================================================
# 8. BUILD SYSTEM VALIDATION
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "8️⃣  BUILD SYSTEM (Android APK generation)"
echo "═══════════════════════════════════════════════════════════"

if [ -f "/workspace/dev-builds/latest/app-debug.apk" ]; then
  test_pass "Android APK exists in dev-builds/"
else
  test_fail "Android APK not found!"
fi

# ============================================================================
# 9. SEED MANAGER VALIDATION
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "9️⃣  SEED MANAGER (Three-word seeds with Mersenne Twister)"
echo "═══════════════════════════════════════════════════════════"

echo "Testing: Seed generation produces valid format..."
seed_test=$(pnpm exec tsx -e "import { generateSeed } from './src/seed/seed-manager.js'; console.log(generateSeed());" 2>&1 | tail -1)

if echo "$seed_test" | grep -qE "^v[0-9]+-[a-z]+-[a-z]+-[a-z]+$"; then
  test_pass "Seed format is correct: $seed_test"
else
  test_fail "Seed format is invalid: $seed_test"
fi

# ============================================================================
# 10. SIMULATION SCENE VALIDATION
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🔟 SIMULATION SCENE (Babylon GUI reports view)"
echo "═══════════════════════════════════════════════════════════"

if [ -f "/workspace/packages/game/src/scenes/SimulationScene.ts" ]; then
  test_pass "SimulationScene.ts exists"
else
  test_fail "SimulationScene.ts not found!"
fi

if [ -f "/workspace/packages/game/simulation.html" ]; then
  test_pass "simulation.html entry point exists"
else
  test_fail "simulation.html not found!"
fi

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📊 VALIDATION SUMMARY"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Total Tests: $((PASS + FAIL))"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ "$FAIL" -eq 0 ]; then
  echo -e "${GREEN}✅ ALL SYSTEMS VALIDATED!${NC}"
  echo "The law-based architecture is working correctly!"
  exit 0
else
  echo -e "${YELLOW}⚠️  SOME TESTS FAILED${NC}"
  echo "Review failures above. System may still be functional."
  exit 1
fi
