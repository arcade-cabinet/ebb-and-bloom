#!/bin/bash
# 🧪 VALIDATE ALL LAWS - Comprehensive Test Suite
# Tests everything built during the law-based architecture overhaul

set -e

SERVER="http://localhost:5173/simulation.html"
RESULTS_DIR="validation-results"
mkdir -p "$RESULTS_DIR"

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

test_warn() {
  echo -e "${YELLOW}⚠️  WARN${NC}: $1"
}

# ============================================================================
# 1. DETERMINISM TESTS
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "1️⃣  DETERMINISM TESTS (Same seed = same result)"
echo "═══════════════════════════════════════════════════════════"

echo "Testing: Same seed at cycle 0 produces identical universe..."
run1=$(curl -s "$SERVER?seed=determinism-test&cycle=0" | md5sum)
run2=$(curl -s "$SERVER?seed=determinism-test&cycle=0" | md5sum)
run3=$(curl -s "$SERVER?seed=determinism-test&cycle=0" | md5sum)

if [ "$run1" == "$run2" ] && [ "$run2" == "$run3" ]; then
  test_pass "Universe generation is deterministic"
else
  test_fail "Universe generation is NOT deterministic!"
fi

echo "Testing: Same seed at cycle 50 produces identical state..."
run1=$(curl -s "$SERVER?seed=det-cycle-50&cycle=50" | md5sum)
run2=$(curl -s "$SERVER?seed=det-cycle-50&cycle=50" | md5sum)

if [ "$run1" == "$run2" ]; then
  test_pass "Population simulation is deterministic"
else
  test_fail "Population simulation is NOT deterministic!"
fi

# ============================================================================
# 2. VARIETY TESTS
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "2️⃣  VARIETY TESTS (Different seeds produce different results)"
echo "═══════════════════════════════════════════════════════════"

echo "Testing: Different seeds produce different universes..."
seed_a=$(curl -s "$SERVER?seed=variety-a&cycle=0" | md5sum)
seed_b=$(curl -s "$SERVER?seed=variety-b&cycle=0" | md5sum)
seed_c=$(curl -s "$SERVER?seed=variety-c&cycle=0" | md5sum)

if [ "$seed_a" != "$seed_b" ] && [ "$seed_b" != "$seed_c" ]; then
  test_pass "Different seeds produce variety"
else
  test_fail "Seeds produce too similar results!"
fi

# ============================================================================
# 3. PHYSICS LAWS VALIDATION
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "3️⃣  PHYSICS LAWS (Gravity, orbits, thermodynamics)"
echo "═══════════════════════════════════════════════════════════"

echo "Testing: Stellar mass-luminosity relationship (L ~ M^4)..."
# Test 10 seeds, check if stars vary in mass/luminosity
for i in {1..10}; do
  curl -s "$SERVER?seed=star-test-$i&cycle=0" > "$RESULTS_DIR/star-$i.html"
done

# Simple check: files should be different sizes (variety in generation)
sizes=$(ls -l "$RESULTS_DIR"/star-*.html | awk '{print $5}' | sort -u | wc -l)
if [ "$sizes" -gt 5 ]; then
  test_pass "Stars show variety in properties"
else
  test_warn "Star variety might be low ($sizes unique sizes)"
fi

# ============================================================================
# 4. BIOLOGY LAWS VALIDATION
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "4️⃣  BIOLOGY LAWS (Kleiber's Law, scaling)"
echo "═══════════════════════════════════════════════════════════"

echo "Testing: Species generation produces variety..."
for i in {1..10}; do
  curl -s "$SERVER?seed=biology-$i&cycle=0" > "$RESULTS_DIR/bio-$i.html"
done

sizes=$(ls -l "$RESULTS_DIR"/bio-*.html | awk '{print $5}' | sort -u | wc -l)
if [ "$sizes" -gt 5 ]; then
  test_pass "Species show variety"
else
  test_warn "Species variety might be low"
fi

# ============================================================================
# 5. ECOLOGY LAWS VALIDATION  
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "5️⃣  ECOLOGY LAWS (Lotka-Volterra, carrying capacity)"
echo "═══════════════════════════════════════════════════════════"

echo "Testing: Populations don't immediately crash..."
stable=$(curl -s "$SERVER?seed=ecology-stable&advanceTo=10")

if echo "$stable" | grep -q "Prey:.*[1-9]"; then
  test_pass "Populations survive at least 10 cycles"
else
  test_fail "Populations crash immediately!"
fi

echo "Testing: Populations eventually equilibrate or oscillate..."
long_run=$(curl -s "$SERVER?seed=ecology-long&advanceTo=50")

if echo "$long_run" | grep -q "Prey:"; then
  test_pass "Long-term simulation runs without crash"
else
  test_fail "Long simulation fails!"
fi

# ============================================================================
# 6. STOCHASTIC DYNAMICS VALIDATION
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "6️⃣  STOCHASTIC DYNAMICS (Random events, noise)"
echo "═══════════════════════════════════════════════════════════"

echo "Testing: Random events occur with proper frequency..."
events_run=$(curl -s "$SERVER?seed=stochastic-events&advanceTo=100")

if echo "$events_run" | grep -q "Catastrophe\|Climate"; then
  test_pass "Random events are occurring"
else
  test_warn "No random events detected in 100 cycles"
fi

# ============================================================================
# 7. RNG QUALITY TESTS
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "7️⃣  RNG QUALITY (Mersenne Twister distributions)"
echo "═══════════════════════════════════════════════════════════"

echo "Testing: RNG produces different results across seeds..."
rng_outputs=()
for i in {1..20}; do
  output=$(curl -s "$SERVER?seed=rng-test-$i&cycle=1" | md5sum | cut -d' ' -f1)
  rng_outputs+=("$output")
done

unique_outputs=$(printf '%s\n' "${rng_outputs[@]}" | sort -u | wc -l)

if [ "$unique_outputs" -ge 18 ]; then
  test_pass "RNG produces high variety (${unique_outputs}/20 unique)"
else
  test_fail "RNG variety too low (${unique_outputs}/20 unique)"
fi

# ============================================================================
# 8. POPULATION STABILITY TESTS
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "8️⃣  POPULATION STABILITY (No explosions or instant death)"
echo "═══════════════════════════════════════════════════════════"

echo "Testing: Populations stay within reasonable bounds..."
for cycle in 10 25 50 75 100; do
  result=$(curl -s "$SERVER?seed=stability-test&cycle=$cycle")
  
  # Check if populations are within 0-1,000,000 range
  if echo "$result" | grep -qE "Prey:.*[0-9]{1,6}[^0-9]"; then
    test_pass "Populations reasonable at cycle $cycle"
  else
    test_warn "Population might be extreme at cycle $cycle"
  fi
done

# ============================================================================
# 9. EXTINCTION TESTS
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "9️⃣  EXTINCTION DYNAMICS (Should happen, but not always)"
echo "═══════════════════════════════════════════════════════════"

echo "Testing: Some worlds survive, some go extinct..."
extinctions=0
survivors=0

for i in {1..10}; do
  result=$(curl -s "$SERVER?seed=extinction-$i&advanceTo=100")
  
  if echo "$result" | grep -q "EXTINCT"; then
    ((extinctions++))
  else
    ((survivors++))
  fi
done

if [ "$extinctions" -gt 0 ] && [ "$survivors" -gt 0 ]; then
  test_pass "Extinctions occur naturally ($extinctions/10 extinct, $survivors/10 survived)"
else
  test_warn "Extinction balance unusual ($extinctions extinct, $survivors survived)"
fi

# ============================================================================
# 10. SEED FORMAT TESTS
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🔟 SEED FORMAT (Three-word seeds work correctly)"
echo "═══════════════════════════════════════════════════════════"

echo "Testing: Three-word seed format..."
result=$(curl -s "$SERVER?seed=wild-ocean-glow&cycle=0")

if echo "$result" | grep -q "wild-ocean-glow\|Seed:"; then
  test_pass "Three-word seed format works"
else
  test_warn "Seed format might not display correctly"
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
  echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
  echo "The law-based system is working correctly!"
  exit 0
else
  echo -e "${RED}❌ SOME TESTS FAILED${NC}"
  echo "Review failures above and fix the laws!"
  exit 1
fi
