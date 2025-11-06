#!/bin/bash

# Ebb & Bloom - Android APK Build Script
# Builds optimized 60FPS Android APK

set -e

echo "🌸 Building Ebb & Bloom for Android..."

# Step 1: Build web app
echo "📦 Building web app with Vite..."
npm run build

# Step 2: Initialize Capacitor (if not already done)
if [ ! -d "android" ]; then
  echo "🔧 Initializing Capacitor..."
  npx cap init "Ebb and Bloom" "com.jbcom.ebbandbloom" --web-dir=dist
fi

# Step 3: Add Android platform (if not already added)
if [ ! -d "android" ]; then
  echo "📱 Adding Android platform..."
  npx cap add android
fi

# Step 4: Sync web assets to Android
echo "🔄 Syncing assets to Android..."
npx cap sync android

# Step 5: Build Android APK
echo "🏗️  Building Android APK..."
cd android
./gradlew assembleDebug
cd ..

# Step 6: Output location
echo "✅ Android APK built successfully!"
echo "📍 Location: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "To install on device:"
echo "  adb install android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "To open in Android Studio:"
echo "  npm run cap:open:android"
