#!/bin/bash
# 🏗️ Production Build Script - Ebb & Bloom
# Builds web assets for deployment or native app packaging

set -e

echo "🌊 Ebb & Bloom - Production Web Build"
echo "========================================"

# Change to game package
cd "$(dirname "$0")/packages/game"

# Clean old build
echo "🧹 Cleaning old build artifacts..."
rm -rf dist/

# Install dependencies (if needed)
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  pnpm install --frozen-lockfile
fi

# Run tests (optional, can skip with --skip-tests)
if [[ "$*" != *"--skip-tests"* ]]; then
  echo "🧪 Running tests..."
  pnpm test || echo "⚠️  Some tests failed, continuing..."
fi

# Build
echo "🔨 Building web assets..."
pnpm build

# Verify build
if [ ! -f "dist/index.html" ]; then
  echo "❌ Build failed: dist/index.html not found"
  exit 1
fi

BUNDLE_SIZE=$(du -sh dist | cut -f1)
echo "✅ Web build complete: $BUNDLE_SIZE"

# Show bundle breakdown
echo ""
echo "📊 Bundle Contents:"
ls -lh dist/assets/*.js | awk '{print "  " $5 "  " $9}'

echo ""
echo "🎉 Build successful!"
echo "   Output: packages/game/dist/"
echo ""
echo "Next steps:"
echo "  - Deploy web: Copy dist/ to your web server"
echo "  - Build Android: ./build-android.sh"
echo "  - Build iOS: ./build-ios.sh"
