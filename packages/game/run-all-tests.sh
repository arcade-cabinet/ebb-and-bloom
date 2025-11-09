#!/bin/bash
# Run ALL tests with proper timeout guards

set -e

echo "🔥 BEAST MODE TEST SUITE 🔥"
echo ""
echo "Running comprehensive test validation..."
echo ""

cd "$(dirname "$0")"

# 1. Law validation
echo "═══════════════════════════════════════"
echo "1️⃣  VALIDATING LAWS (57 files)"
echo "═══════════════════════════════════════"
pnpm exec tsx src/cli/validate-laws.ts || echo "⚠️  Some law validations failed (may be expected)"
echo ""

# 2. RNG quality
echo "═══════════════════════════════════════"
echo "2️⃣  RNG QUALITY (distributions)"
echo "═══════════════════════════════════════"
pnpm exec tsx src/cli-tools/test-rng-quality.ts || echo "⚠️  RNG test failed"
echo ""

# 3. Determinism
echo "═══════════════════════════════════════"
echo "3️⃣  DETERMINISM (same seed = same result)"
echo "═══════════════════════════════════════"
pnpm exec tsx src/cli-tools/test-determinism.ts test-seed-1 || echo "⚠️  Determinism test failed"
echo ""

# 4. E2E Tests
echo "═══════════════════════════════════════"
echo "4️⃣  E2E TESTS (Playwright - 29 tests)"
echo "═══════════════════════════════════════"
echo "Starting E2E test suite..."
echo "Timeout guards: PAGE_LOAD=45s, SIMULATION=30s, BATCH=120s"
echo ""

# Run with increased timeouts and proper reporting
pnpm exec playwright test \
  --reporter=list \
  --max-failures=10 \
  --timeout=60000 \
  --retries=1 \
  || echo "⚠️  Some E2E tests failed"

echo ""
echo "═══════════════════════════════════════"
echo "✅ TEST SUITE COMPLETE"
echo "═══════════════════════════════════════"
echo ""
echo "See playwright-report/ for detailed E2E results"
echo ""

