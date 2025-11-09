#!/bin/bash
# 📱 Android APK Build Script - Ebb & Bloom
# Builds production-ready Android APK

set -e

echo "📱 Ebb & Bloom - Android Build"
echo "================================"

# Check Java 21
if ! command -v java &> /dev/null; then
  echo "❌ Java not found. Install Java 21 (OpenJDK)."
  exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 21 ]; then
  echo "❌ Java $JAVA_VERSION found, but Java 21+ required for Capacitor 7.x"
  echo "   Install: https://openjdk.org/install/"
  exit 1
fi

echo "✅ Java $JAVA_VERSION detected"

# Step 1: Build web assets
echo ""
echo "🔨 Step 1/3: Building web assets..."
./build.sh --skip-tests

# Step 2: Sync to Android
echo ""
echo "🔄 Step 2/3: Syncing to Android..."
cd packages/game
pnpm exec cap sync android

# Verify sync
ASSETS_SIZE=$(du -sh ../../android/app/src/main/assets/public | cut -f1)
echo "✅ Assets synced: $ASSETS_SIZE"

# Step 3: Build APK
echo ""
echo "🏗️  Step 3/3: Building APK with Gradle..."
cd ../../android

# Clean build for production
if [[ "$*" == *"--clean"* ]]; then
  echo "🧹 Clean build requested..."
  ./gradlew clean
fi

# Build debug APK (for now)
./gradlew assembleDebug --no-daemon

# Check output
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ ! -f "$APK_PATH" ]; then
  echo "❌ Build failed: APK not found at $APK_PATH"
  exit 1
fi

APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
echo ""
echo "✅ APK built successfully!"
echo "   Location: android/$APK_PATH"
echo "   Size: $APK_SIZE"

# Verify size
APK_SIZE_MB=$(du -m "$APK_PATH" | cut -f1)
if [ "$APK_SIZE_MB" -lt 6 ]; then
  echo ""
  echo "⚠️  WARNING: APK size ($APK_SIZE) seems small!"
  echo "   Expected: ~6-7 MB with full web bundle"
  echo "   This might indicate missing assets."
  echo ""
  echo "   Check sync:"
  echo "   du -sh android/app/src/main/assets/public/"
fi

echo ""
echo "📲 Install on device:"
echo "   adb install -r android/$APK_PATH"
echo ""
echo "🔍 Debug if needed:"
echo "   adb logcat | grep -E '(Capacitor|Ebb|Bloom)'"
