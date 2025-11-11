# Ebb & Bloom - Just Commands

default:
    @just --list

# =============================================================================
# DEVELOPMENT
# =============================================================================

# Kill all running dev servers (ports 5173, 3000, 8080, etc.)
kill-servers:
    @echo "🛑 Killing running servers..."
    @-lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    @-lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    @-lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    @-lsof -ti:5174 | xargs kill -9 2>/dev/null || true
    @echo "✅ Servers killed"

# Start dev server
dev:
    pnpm run dev

# Kill servers and start fresh dev instance
dev-fresh: kill-servers
    @echo "🚀 Starting fresh dev server..."
    pnpm run dev

# Build for production
build:
    pnpm run build

# =============================================================================
# QUALITY & TESTING
# =============================================================================

# Run all quality checks (type-check, lint, format, test)
quality:
    @echo "🔍 Running quality checks..."
    pnpm run type-check
    pnpm run lint
    pnpm run format:check
    pnpm test

# Fix quality issues automatically
quality-fix:
    @echo "🔧 Fixing quality issues..."
    pnpm run lint:fix
    pnpm run format

# Type check
check:
    pnpm run type-check

# Lint code
lint:
    pnpm run lint

# Fix linting issues
lint-fix:
    pnpm run lint:fix

# Format code
format:
    pnpm run format

# Check formatting
format-check:
    pnpm run format:check

# Run all tests
test:
    pnpm test

# Run unit tests
test-unit:
    pnpm run test:unit

# Run integration tests
test-integration:
    pnpm run test:integration

# Run tests in watch mode
test-watch:
    pnpm run test:watch

# Run tests with coverage
test-coverage:
    @echo "📊 Running tests with coverage..."
    pnpm run test:coverage

# Run browser tests (Playwright)
test-browser:
    pnpm run test:browser

# Run browser tests with UI
test-browser-ui:
    pnpm run test:browser:ui

# Generate Playwright tests using codegen
test-codegen:
    @echo "🎬 Starting Playwright Codegen..."
    @echo "📝 Interact with your app in the browser window"
    @echo "📋 Generated code will appear in Playwright Inspector"
    pnpm exec playwright codegen http://localhost:5173

# Show Playwright HTML report
test-report:
    pnpm exec playwright show-report

# Run all tests (unit + browser)
test-all:
    pnpm run test:all

# =============================================================================
# DEPENDENCIES & SECURITY
# =============================================================================

# Run security audit
audit:
    @echo "🔒 Running security audit..."
    pnpm audit

# Fix security vulnerabilities
audit-fix:
    @echo "🔒 Fixing security vulnerabilities..."
    pnpm audit --fix

# Upgrade all dependencies to latest
upgrade:
    @echo "⬆️  Upgrading dependencies..."
    pnpm update --latest

# Interactive dependency upgrade
upgrade-interactive:
    @echo "⬆️  Interactive dependency upgrade..."
    pnpm update --interactive --latest

# =============================================================================
# PACKAGE MANAGEMENT
# =============================================================================

# Migrate from npm to pnpm
migrate-pnpm:
    @echo "🔄 Migrating to pnpm..."
    @if [ -f "package-lock.json" ]; then rm package-lock.json; fi
    @if [ -d "node_modules" ]; then rm -rf node_modules; fi
    pnpm install
    @echo "✅ Migration complete! Use 'pnpm' instead of 'npm'"

# Install dependencies
install:
    pnpm install

# Clean install (remove node_modules and reinstall)
clean-install:
    @echo "🧹 Cleaning and reinstalling..."
    rm -rf node_modules
    pnpm install

# =============================================================================
# MOBILE
# =============================================================================

# Build Android
android:
    pnpm run build:android

# Build iOS
ios:
    pnpm run build:ios

# Sync Capacitor
sync:
    pnpm run sync

# =============================================================================
# CLEANUP
# =============================================================================

# Clean build artifacts
clean:
    rm -rf node_modules game/dist android/app/build
    rm -f package-lock.json

# =============================================================================
# QUICK WORKFLOWS
# =============================================================================

# Quick quality check (test + type-check)
quick: test check
    @echo "✅ Ready"

# Show all available commands
list:
    @just --list
