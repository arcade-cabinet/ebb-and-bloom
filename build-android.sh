#!/bin/bash
# Build Android APK for Ebb & Bloom
# Requires: Android SDK, Java 17+, Capacitor

set -e

echo "🔨 Building Ebb & Bloom Android APK..."

# Check for Android SDK
if [ -z "$ANDROID_HOME" ]; then
  # Try common locations
  if [ -d "$HOME/Library/Android/sdk" ]; then
    export ANDROID_HOME="$HOME/Library/Android/sdk"
  elif [ -d "$HOME/Android/Sdk" ]; then
    export ANDROID_HOME="$HOME/Android/Sdk"
  else
    echo "❌ ERROR: ANDROID_HOME not set and SDK not found in standard locations"
    echo "Please set ANDROID_HOME or install Android Studio"
    exit 1
  fi
fi

echo "✓ Android SDK: $ANDROID_HOME"

# Build web assets
echo "📦 Building web assets..."
pnpm build

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android

# Create local.properties if needed
if [ ! -f "android/local.properties" ]; then
  echo "📝 Creating local.properties..."
  echo "sdk.dir=$ANDROID_HOME" > android/local.properties
fi

# Build APK
echo "🔨 Building debug APK..."
cd android
chmod +x ./gradlew
./gradlew assembleDebug --no-daemon

# Check if APK was created
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
  APK_SIZE=$(du -h app/build/outputs/apk/debug/app-debug.apk | cut -f1)
  echo ""
  echo "✅ APK built successfully!"
  echo "📱 Location: android/app/build/outputs/apk/debug/app-debug.apk"
  echo "📊 Size: $APK_SIZE"
  echo ""
  echo "To install on device:"
  echo "  adb install android/app/build/outputs/apk/debug/app-debug.apk"
else
  echo "❌ APK build failed - check errors above"
  exit 1
fi
