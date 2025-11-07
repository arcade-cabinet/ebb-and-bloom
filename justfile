# Ebb & Bloom Game Development Justfile
# Mobile-first procedural evolution game built with Phaser 3, BitECS, Vue 3

# Default recipe - show available commands
default:
    @just --list

# Development
# ===========

# Start development server (process-compose managed)
dev:
    process-compose up vite-dev

# Start full development environment (dev server + tests + typecheck)
dev-full:
    process-compose up vite-dev test-watch typecheck-watch

# Start development server (direct pnpm - for simple cases)
dev-simple:
    pnpm dev

# Build for production
build:
    pnpm build

# Preview production build
preview:
    pnpm preview

# Testing
# =======

# Run unit tests (Vitest)
test:
    pnpm test

# Run tests in watch mode
watch:
    pnpm test:watch

# Run tests with UI
test-ui:
    pnpm test:ui

# Run tests with coverage report
coverage:
    pnpm test:coverage

# End-to-End Testing (Playwright)
# ===============================

# Install Playwright browsers
playwright-install:
    pnpm exec playwright install

# Run all E2E tests (with managed dev server)
test-e2e:
    process-compose up test-e2e

# Run E2E tests (direct - requires dev server running)
test-e2e-direct:
    pnpm test:e2e

# Run E2E tests with UI (for debugging)
test-e2e-ui:
    pnpm test:e2e:ui

# Run E2E tests in headed mode (see browser)
test-e2e-headed:
    pnpm test:e2e:headed

# Debug E2E tests (step through)
test-e2e-debug:
    pnpm test:e2e:debug

# Run E2E tests for specific project (mobile, desktop, etc.)
test-e2e-project project:
    pnpm exec playwright test --project={{project}}

# Generate Playwright test report
test-e2e-report:
    pnpm exec playwright show-report

# Update Playwright snapshots
test-e2e-update:
    pnpm exec playwright test --update-snapshots

# Type checking and linting
# =========================

# Check TypeScript types
typecheck:
    pnpm exec tsc --noEmit

# Run linter (placeholder - add when configured)
lint:
    pnpm lint || echo "Lint not configured yet"

# Format code (if prettier configured)
format:
    pnpm exec prettier --write . || echo "Prettier not configured"

# Mobile Development
# ==================

# Initialize Capacitor Android (run once)
android-init:
    #!/usr/bin/env bash
    if [ ! -d "android" ]; then
        pnpm exec cap add android
        echo "✅ Android platform initialized"
    else
        echo "⚠️  Android platform already exists"
    fi

# Build web assets and sync to Android
android-sync:
    pnpm build
    pnpm exec cap sync android

# Open project in Android Studio
android-studio:
    pnpm exec cap open android

# Run on Android with live reload (managed)
# Build APK (debug)
android-build-debug: android-sync
    #!/usr/bin/env bash
    cd android
    ./gradlew assembleDebug
    echo "📱 Debug APK built: android/app/build/outputs/apk/debug/app-debug.apk"

# Build APK (release) - requires signing setup
android-build-release: android-sync
    #!/usr/bin/env bash
    cd android
    ./gradlew assembleRelease
    echo "📱 Release APK built: android/app/build/outputs/apk/release/app-release.apk"

# Run on Android device/emulator
android-run: android-sync
    pnpm exec cap run android

# iOS Development
# ===============

# Initialize Capacitor iOS (run once) 
ios-init:
    #!/usr/bin/env bash
    if [ ! -d "ios" ]; then
        pnpm exec cap add ios
        echo "✅ iOS platform initialized"
    else
        echo "⚠️  iOS platform already exists"  
    fi

# Build web assets and sync to iOS
ios-sync:
    pnpm build
    pnpm exec cap sync ios

# Open project in Xcode
ios-xcode:
    pnpm exec cap open ios

# Run on iOS simulator
ios-run: ios-sync
    pnpm exec cap run ios

# ECS Development
# ===============

# Run ECS system tests only
test-ecs:
    pnpm test src/ecs/systems/

# Check ECS architecture (components, systems, entities)
check-ecs:
    #!/usr/bin/env bash
    echo "🧩 ECS Architecture Check"
    echo "========================"
    echo "Components: $(find src/ecs/components -name '*.ts' | wc -l)"
    echo "Systems: $(find src/ecs/systems -name '*.ts' | wc -l)"
    echo "Entities: $(find src/ecs/entities -name '*.ts' | wc -l)"
    echo "Tests: $(find src/test -name '*.test.ts' | wc -l)"

# Game Development Tools
# ======================

# Analyze bundle size
analyze-bundle:
    pnpm build
    pnpm exec vite-bundle-analyzer dist

# Check mobile performance metrics
perf-check:
    #!/usr/bin/env bash
    echo "📊 Performance Analysis"
    echo "======================="
    echo "Bundle size:"
    du -sh dist/ 2>/dev/null || echo "Run 'just build' first"
    echo ""
    echo "Large files (>100KB):"
    find dist -size +100k -type f 2>/dev/null | head -10 || echo "No large files found"

# Clean build artifacts
clean:
    rm -rf dist/
    rm -rf android/app/build/
    rm -rf ios/App/build/
    rm -rf coverage/
    echo "🧹 Build artifacts cleaned"

# Setup
# =====

# Install all dependencies
install:
    pnpm install

# Fresh install - clear cache and reinstall
fresh-install:
    rm -rf node_modules/
    rm -f pnpm-lock.yaml
    pnpm install

# Setup development environment
setup: install android-init
    echo "🎮 Ebb & Bloom development environment ready!"
    echo ""
    echo "Next steps:"
    echo "  just dev          # Start development server"
    echo "  just test         # Run tests"
    echo "  just android-run  # Run on Android device"

# Documentation
# =============

# Update memory bank with current progress
update-memory:
    echo "🧠 Memory bank update not automated - do manually"
    echo "Update these files based on recent changes:"
    echo "  memory-bank/activeContext.md"
    echo "  memory-bank/progress.md"

# Check documentation coverage
check-docs:
    #!/usr/bin/env bash
    echo "📚 Documentation Check"
    echo "====================="
    echo "Design docs: $(find docs -name '*.md' 2>/dev/null | wc -l)"
    echo "Memory bank: $(find memory-bank -name '*.md' 2>/dev/null | wc -l)"
    echo "READMEs: $(find . -maxdepth 2 -name 'README*.md' | wc -l)"
    [ -f "CLAUDE.md" ] && echo "✅ CLAUDE.md exists" || echo "❌ CLAUDE.md missing"

# Git workflow
# ============

# Quick commit with semantic message
commit message:
    git add .
    git commit -m "{{message}}"

# Create feature branch
feature name:
    git checkout -b "feat/{{name}}"
    echo "🌟 Created feature branch: feat/{{name}}"

# Create fix branch  
fix name:
    git checkout -b "fix/{{name}}"
    echo "🔧 Created fix branch: fix/{{name}}"

# Push current branch and set upstream
push:
    git push -u origin HEAD

# Full development cycle
# ======================

# Complete development check - run before committing
# Note: E2E tests are excluded from pre-commit for speed and reliability.
# Run `just test-all` before pushing or merging for full coverage.
pre-commit: typecheck test lint
    echo "✅ All checks passed - ready to commit!"

# Quick development cycle - test and run
quick: test dev

# Full test suite - unit and E2E
test-all: test test-e2e
    echo "🧪 All tests completed!"

# Setup Playwright after fresh install
setup-e2e: playwright-install
    echo "🎭 Playwright setup complete!"

# Full mobile build cycle
mobile-build: build android-build-debug ios-sync
    echo "📱 Mobile builds complete!"