# Ebb & Bloom - Just Commands

default:
    @just --list

# Development
dev:
    npm run dev

# Build
build:
    npm run build

# Tests
test:
    npm test

test-unit:
    npm run test:unit

test-integration:
    npm run test:integration

test-watch:
    npm run test:watch

# Type check
check:
    npm run type-check

# Mobile
android:
    npm run build:android

ios:
    npm run build:ios

sync:
    npm run sync

# Clean
clean:
    rm -rf node_modules game/dist android/app/build
    rm -f package-lock.json

install:
    npm install

# Quick workflow
quick: test check
    @echo "✅ Ready"
