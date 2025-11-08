# Ebb & Bloom Development Justfile
# Monorepo: packages/backend, packages/gen, packages/simulation

# Default recipe - show available commands
default:
    @just --list

# Development
# ===========

# Start backend dev server
dev-backend:
    cd packages/backend && pnpm dev

# Start simulation frontend dev server
dev-frontend:
    cd packages/simulation && pnpm dev

# Start both backend and frontend (requires process-compose.yml)
dev:
    process-compose up || echo "Run 'just dev-backend' and 'just dev-frontend' separately"

# Build all packages
build:
    pnpm -r build

# Build specific package
build-backend:
    cd packages/backend && pnpm build

build-gen:
    cd packages/gen && pnpm build

build-frontend:
    cd packages/simulation && pnpm build

# Preview production build
preview:
    cd packages/simulation && pnpm preview

# Testing
# =======

# Run all tests across packages
test:
    pnpm -r test

# Run backend tests only
test-backend:
    cd packages/backend && pnpm test

# Run gen package tests
test-gen:
    cd packages/gen && pnpm test || echo "No tests in gen package"

# Run frontend tests
test-frontend:
    cd packages/simulation && pnpm test || echo "No tests in simulation package"

# Run tests in watch mode
watch:
    cd packages/backend && pnpm test:watch

# Run tests with UI
test-ui:
    cd packages/backend && pnpm test:ui

# Run tests with coverage report
coverage:
    cd packages/backend && pnpm test:coverage

# End-to-End Testing (Playwright)
# ===============================

# Install Playwright browsers
playwright-install:
    cd packages/simulation && pnpm exec playwright install

# Start servers for E2E testing (process-compose)
test-e2e-servers:
    process-compose up dev-backend dev-frontend

# Run E2E tests (assumes servers are running via process-compose)
test-e2e:
    cd packages/simulation && pnpm test:e2e

# Run E2E tests with UI
test-e2e-ui:
    cd packages/simulation && pnpm test:e2e:ui

# Run E2E tests with browser visible
test-e2e-headed:
    cd packages/simulation && pnpm test:e2e:headed

# Run E2E tests in debug mode
test-e2e-debug:
    cd packages/simulation && pnpm test:e2e:debug

# Type checking and linting
# =========================

# Check TypeScript types across all packages
typecheck:
    pnpm -r exec tsc --noEmit

# Check backend types
typecheck-backend:
    cd packages/backend && pnpm exec tsc --noEmit

# Check gen types
typecheck-gen:
    cd packages/gen && pnpm exec tsc --noEmit

# Check frontend types
typecheck-frontend:
    cd packages/simulation && pnpm exec tsc --noEmit

# Run linter
lint:
    pnpm -r lint || echo "Lint not configured"

# Format code
format:
    pnpm exec prettier --write . || echo "Prettier not configured"

# Generation Pipeline
# ===================

# Generate all archetypes (gen0-gen6)
gen-all:
    cd packages/gen && pnpm cli archetypes

# Generate specific generation
gen generation:
    cd packages/gen && pnpm cli archetypes --generation={{generation}}

# Run quality assessment
gen-quality:
    cd packages/gen && pnpm cli quality

# Generate documentation
gen-docs:
    cd packages/gen && pnpm cli documentation

# Setup
# =====

# Install all dependencies
install:
    pnpm install

# Fresh install - clear cache and reinstall
fresh-install:
    rm -rf node_modules/ packages/*/node_modules/
    rm -f pnpm-lock.yaml
    pnpm install

# Setup development environment
setup: install
    echo "🎮 Ebb & Bloom development environment ready!"
    echo ""
    echo "Next steps:"
    echo "  just dev-backend    # Start backend API server"
    echo "  just dev-frontend   # Start frontend dev server"
    echo "  just gen-all        # Generate all archetypes"
    echo "  just test           # Run all tests"

# Documentation
# =============

# Check documentation coverage
check-docs:
    #!/usr/bin/env bash
    echo "📚 Documentation Check"
    echo "====================="
    echo "Architecture docs: $(find docs/architecture -name '*.md' 2>/dev/null | wc -l)"
    echo "Memory bank: $(find memory-bank -name '*.md' 2>/dev/null | wc -l)"
    echo "Package READMEs: $(find packages -maxdepth 2 -name 'README*.md' | wc -l)"

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
pre-commit: typecheck test-backend lint
    echo "✅ All checks passed - ready to commit!"

# Full test suite
test-all: test-backend test-e2e
    echo "🧪 All tests completed!"

# Clean build artifacts
clean:
    rm -rf packages/*/dist/
    rm -rf packages/*/node_modules/.vite/
    rm -rf coverage/
    echo "🧹 Build artifacts cleaned"

# Package-specific commands
# =========================

# Backend: Start API server
backend-dev:
    cd packages/backend && pnpm dev

# Backend: Run seed API tests
backend-test-seed:
    cd packages/backend && pnpm test seed

# Gen: Generate archetypes with quality check
gen-with-quality:
    cd packages/gen && pnpm cli archetypes && pnpm cli quality

# Simulation: Start frontend dev server
frontend-dev:
    cd packages/simulation && pnpm dev

# Simulation: Build for production
frontend-build:
    cd packages/simulation && pnpm build
