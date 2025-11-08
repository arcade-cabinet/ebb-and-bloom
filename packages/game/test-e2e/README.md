# E2E Testing Guide

This directory contains E2E tests for the Ebb & Bloom Gen0 flow using Playwright.

## Two Testing Modes

### 1. Local Testing (Standard Playwright)

**Use when**: Running full E2E test suite locally or in CI

**How to run**:
```bash
# Run all E2E tests
pnpm test:e2e

# Run with UI
pnpm test:e2e:ui

# Run in debug mode
pnpm test:e2e:debug
```

**What happens**:
- Playwright automatically starts the dev server (`pnpm dev`)
- Waits for server to be ready on `http://localhost:5173`
- Runs all tests in `test-e2e/*.spec.ts`
- Automatically shuts down the server when done

### 2. MCP Server Mode (Manual Control)

**Use when**: Using Playwright MCP server for manual testing, debugging, or screenshot capture

**How to run**:
```bash
# Step 1: Start dev server manually
pnpm dev

# Step 2: In another terminal, run tests without auto-starting server
pnpm test:e2e:mcp
```

**Or use MCP server tools directly**:
```typescript
// Navigate to the app
playwright-browser_navigate({ url: 'http://localhost:5173' })

// Take screenshot
playwright-browser_take_screenshot({ filename: 'screenshot.png' })

// Click elements
playwright-browser_click({ element: 'button', ref: 'ref-from-snapshot' })
```

**What happens**:
- Tests use existing dev server (must be started manually)
- No auto-start/stop of the web server
- Full control over server lifecycle
- Better for iterative testing and debugging

## Environment Variables

- `PLAYWRIGHT_NO_SERVER=1` - Disable auto-starting the web server (used by `test:e2e:mcp`)
- `CI=1` - Enable CI mode (more retries, no server reuse)

## Test Files

- `gen0-flow.spec.ts` - Complete Gen0 flow (11 steps)
- `manual-screenshots.spec.ts` - Screenshot capture script

## Screenshots

All screenshots are saved to `test-results/*.png` and copied to `docs/screenshots/`

## Troubleshooting

### Port Already in Use

If you see "port 5173 already in use":
- **Local mode**: Make sure no dev server is running, or set `reuseExistingServer: true`
- **MCP mode**: This is expected - you should have manually started the server

### Tests Timing Out

- Increase timeout in `playwright.config.ts`
- Check if dev server started successfully
- Verify `http://localhost:5173` is accessible

### Browser Not Installed

```bash
npx playwright install chromium
```

## Best Practices

1. **Use local mode** for CI/CD pipelines
2. **Use MCP mode** for manual testing and screenshot capture
3. Always verify dev server is running when using MCP mode
4. Keep test files focused and independent
5. Use descriptive screenshot filenames
