# Ebb & Bloom - Production Build System
# Usage: just <recipe>

# Default: Show available recipes
default:
  @just --list

# ============================================================================
# DEVELOPMENT
# ============================================================================

# Install dependencies
install:
  pnpm install

# Development server (web)
dev:
  cd packages/game && pnpm dev

# ============================================================================
# BUILD PIPELINE (Outputs to dev-builds/)
# ============================================================================

# Build Android APK (full pipeline: web → sync → apk → dev-builds/)
build-android:
  @echo "📱 Ebb & Bloom - Android Build Pipeline"
  @echo "=========================================="
  @echo ""
  @echo "🔨 Step 1/4: Building web assets..."
  cd packages/game && pnpm build
  @echo ""
  @echo "🔄 Step 2/4: Syncing to Android..."
  cd packages/game && pnpm exec cap sync android
  @du -sh android/app/src/main/assets/public/ | awk '{print "✅ Assets synced: " $$1}'
  @echo ""
  @echo "🏗️  Step 3/4: Building APK with Gradle..."
  @export JAVA_HOME=/tmp/jdk-21.0.1 && \
   export PATH=$$JAVA_HOME/bin:$$PATH && \
   cd android && \
   ./gradlew assembleDebug --no-daemon
  @echo ""
  @echo "📦 Step 4/4: Copying to dev-builds/..."
  @mkdir -p dev-builds
  @cp android/app/build/outputs/apk/debug/app-debug.apk dev-builds/ebb-and-bloom-$(shell date +%Y%m%d-%H%M%S).apk
  @cp android/app/build/outputs/apk/debug/app-debug.apk dev-builds/ebb-and-bloom-latest.apk
  @echo ""
  @ls -lh dev-builds/ebb-and-bloom-latest.apk | awk '{print "✅ APK ready: dev-builds/ebb-and-bloom-latest.apk (" $$5 ")"}'
  @echo ""
  @echo "📲 Install: adb install -r dev-builds/ebb-and-bloom-latest.apk"

# Build web assets only
build-web:
  @echo "🔨 Building web assets..."
  cd packages/game && pnpm build
  @du -sh packages/game/dist/ | awk '{print "✅ Web build: " $$1}'

# Sync to Android (requires web build)
sync-android:
  @echo "🔄 Syncing to Android..."
  cd packages/game && pnpm exec cap sync android
  @du -sh android/app/src/main/assets/public/ | awk '{print "✅ Synced: " $$1}'

# Build iOS (placeholder for future)
build-ios:
  @echo "🍎 iOS builds coming soon..."
  @echo "   Run: cd packages/game && npx cap add ios"
  @echo "   Then open in Xcode for signing/building"

# Quick build (skip cleaning)
quick: build-android

# Full rebuild (clean first)
rebuild: clean build-android

# ============================================================================
# CLEANING
# ============================================================================

# Clean all build artifacts
clean:
  @echo "🧹 Cleaning build artifacts..."
  rm -rf packages/game/dist/
  rm -rf android/app/build/
  rm -rf android/build/
  rm -rf android/.gradle/
  @echo "✅ Clean complete"

# Clean everything including dev-builds
clean-all: clean
  rm -rf dev-builds/
  @echo "✅ All artifacts removed"

# ============================================================================
# TESTING
# ============================================================================

# Run unit tests
test:
  cd packages/game && pnpm test

# Run E2E tests
test-e2e:
  cd packages/game && pnpm test:e2e

# Type check
typecheck:
  cd packages/game && pnpm exec tsc --noEmit

# Run universe generation tests
test-universe:
  cd packages/game && pnpm test:universe

# Run universe stats tests
test-universe-stats:
  cd packages/game && pnpm test:universe:stats

# Run population dynamics tests
test-universe-pop:
  cd packages/game && pnpm test:universe:pop

# Full CI check (typecheck + test)
ci: typecheck test
  @echo "✅ CI checks passed"

# ============================================================================
# DEVICE MANAGEMENT
# ============================================================================

# Install APK on connected device
install-apk:
  @echo "📱 Installing APK on device..."
  @if [ ! -f "dev-builds/ebb-and-bloom-latest.apk" ]; then \
    echo "❌ No APK found. Run: just build-android"; \
    exit 1; \
  fi
  adb install -r dev-builds/ebb-and-bloom-latest.apk
  @echo "✅ Installed! Check your device."

# Show device logs
logs:
  @echo "📱 Streaming device logs (Ctrl-C to stop)..."
  adb logcat | grep -E "(Capacitor|Ebb|Bloom|chromium)"

# List connected devices
devices:
  @echo "📱 Connected devices:"
  @adb devices -l

# Clear app data
clear-app:
  adb shell pm clear com.ebbandbloom.app
  @echo "✅ App data cleared"

# ============================================================================
# BUILD INFO
# ============================================================================

# Show build system info
info:
  @echo "📊 Ebb & Bloom - Build System Info"
  @echo "===================================="
  @echo ""
  @echo "Environment:"
  @echo "  Node: $(shell node --version)"
  @echo "  pnpm: $(shell pnpm --version)"
  @echo "  Java: $(shell java -version 2>&1 | head -1 | cut -d'"' -f2)"
  @echo ""
  @echo "Web Build:"
  @if [ -d "packages/game/dist" ]; then \
    du -sh packages/game/dist/ | awk '{print "  " $$1 "  (built)"}'; \
  else \
    echo "  Not built"; \
  fi
  @echo ""
  @echo "Android Assets:"
  @if [ -d "android/app/src/main/assets/public" ]; then \
    du -sh android/app/src/main/assets/public/ | awk '{print "  " $$1 "  (synced)"}'; \
  else \
    echo "  Not synced"; \
  fi
  @echo ""
  @echo "Latest APK:"
  @if [ -f "dev-builds/ebb-and-bloom-latest.apk" ]; then \
    ls -lh dev-builds/ebb-and-bloom-latest.apk | awk '{print "  " $$5 "  dev-builds/ebb-and-bloom-latest.apk"}'; \
  else \
    echo "  Not built"; \
  fi
  @echo ""
  @echo "Build History:"
  @ls -lh dev-builds/*.apk 2>/dev/null | wc -l | awk '{print "  " $$1 " APKs in dev-builds/"}'

# Show what's in dev-builds/
list-builds:
  @echo "📦 Available builds:"
  @ls -lht dev-builds/*.apk 2>/dev/null | awk '{print "  " $$6 " " $$7 " " $$8 "  " $$5 "  " $$9}' || echo "  No builds yet"

# ============================================================================
# SIMULATION MODE
# ============================================================================

# Run simulation world test
sim-world:
  cd packages/game && pnpm sim:world

# Run quick simulation
sim-quick:
  cd packages/game && pnpm sim:quick

# Run long simulation
sim-long:
  cd packages/game && pnpm sim:long
