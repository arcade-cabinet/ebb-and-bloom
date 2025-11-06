#!/bin/bash

# Ebb & Bloom - Android APK Build Script
# Builds optimized 60FPS Android APK with error handling
# Usage: ./build-android.sh [--clean] [--release]

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse arguments
CLEAN_BUILD=false
RELEASE_BUILD=false

for arg in "$@"; do
  case $arg in
    --clean)
      CLEAN_BUILD=true
      shift
      ;;
    --release)
      RELEASE_BUILD=true
      shift
      ;;
  esac
done

# Error handling function
handle_error() {
  echo -e "${RED}❌ Error: $1${NC}"
  exit 1
}

# Check dependencies
check_dependencies() {
  echo "🔍 Checking dependencies..."
  
  # Check Node.js
  if ! command -v node &> /dev/null; then
    handle_error "Node.js not found. Please install Node.js 18+"
  fi
  
  # Check npm
  if ! command -v npm &> /dev/null; then
    handle_error "npm not found. Please install npm"
  fi
  
  # Check if node_modules exists
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found, running npm install...${NC}"
    npm install || handle_error "npm install failed"
  fi
  
  echo -e "${GREEN}✓ Dependencies OK${NC}"
}

echo "🌸 Building Ebb & Bloom for Android..."
echo ""

# Check dependencies first
check_dependencies

# Clean build if requested
if [ "$CLEAN_BUILD" = true ]; then
  echo "🧹 Cleaning previous build..."
  rm -rf dist
  rm -rf android/app/build
  echo -e "${GREEN}✓ Clean complete${NC}"
fi

# Step 1: Build web app
echo "📦 Building web app with Vite..."
npm run build || handle_error "Vite build failed"

# Verify build output
if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
  handle_error "Build output (dist/) is empty or missing"
fi
echo -e "${GREEN}✓ Web app built${NC}"

# Step 2: Initialize Capacitor (if not already done)
if [ ! -f "capacitor.config.json" ]; then
  echo "🔧 Initializing Capacitor..."
  npx cap init "Ebb and Bloom" "com.jbcom.ebbandbloom" --web-dir=dist || handle_error "Capacitor init failed"
  echo -e "${GREEN}✓ Capacitor initialized${NC}"
fi

# Step 3: Add Android platform (if not already added)
if [ ! -d "android" ]; then
  echo "📱 Adding Android platform..."
  npx cap add android || handle_error "Adding Android platform failed"
  echo -e "${GREEN}✓ Android platform added${NC}"
fi

# Step 4: Sync web assets to Android
echo "🔄 Syncing assets to Android..."
npx cap sync android || handle_error "Capacitor sync failed"
echo -e "${GREEN}✓ Assets synced${NC}"

# Step 5: Build Android APK
echo "🏗️  Building Android APK..."

if [ ! -f "android/gradlew" ]; then
  handle_error "Gradle wrapper not found. Android project may be corrupted."
fi

cd android

# Make gradlew executable
chmod +x gradlew

# Build based on mode
if [ "$RELEASE_BUILD" = true ]; then
  echo "Building RELEASE APK..."
  ./gradlew assembleRelease || {
    cd ..
    handle_error "Gradle release build failed"
  }
  APK_PATH="app/build/outputs/apk/release/app-release.apk"
else
  echo "Building DEBUG APK..."
  ./gradlew assembleDebug || {
    cd ..
    handle_error "Gradle debug build failed"
  }
  APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
fi

cd ..

# Step 6: Verify and output location
if [ ! -f "android/$APK_PATH" ]; then
  handle_error "APK file not found at expected location: android/$APK_PATH"
fi

APK_SIZE=$(du -h "android/$APK_PATH" | cut -f1)

echo ""
echo -e "${GREEN}✅ Android APK built successfully!${NC}"
echo "📍 Location: android/$APK_PATH"
echo "📏 Size: $APK_SIZE"
echo ""
echo "📱 To install on device:"
echo "  adb install android/$APK_PATH"
echo ""
echo "🔧 To open in Android Studio:"
echo "  npm run cap:open:android"
echo ""
echo "🚀 To test on device:"
echo "  adb shell am start -n com.jbcom.ebbandbloom/.MainActivity"
