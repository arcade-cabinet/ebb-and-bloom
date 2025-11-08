# Playwright E2E Tests

## Server Management

Playwright can manage servers automatically, but for **best practice with multiple servers**, use **process-compose**:

### Option 1: Process Compose (Recommended)

```bash
# Terminal 1: Start both servers
process-compose up dev-backend dev-frontend

# Terminal 2: Run tests (will reuse existing servers)
cd packages/simulation && pnpm test:e2e
```

### Option 2: Playwright Auto-Management

Playwright will automatically start both servers if they're not running:

```bash
cd packages/simulation && pnpm test:e2e
```

This uses the `webServer` configuration in `playwright.config.ts` which starts:
- Backend on port 3001
- Frontend on port 5173

### Option 3: Manual Server Management

```bash
# Terminal 1: Backend
cd packages/backend && pnpm dev

# Terminal 2: Frontend  
cd packages/simulation && pnpm dev

# Terminal 3: Tests
cd packages/simulation && pnpm test:e2e
```

## Test Files

- **`gen0-integration.spec.ts`**: Full frontend-backend integration tests
- **`api-integration.spec.ts`**: Backend API endpoint tests (independent)
- **`gen0-rendering.spec.ts`**: Visual regression tests

## Test Commands

```bash
# Run all tests
pnpm test:e2e

# Run with Playwright UI (interactive)
pnpm test:e2e:ui

# Run with browser visible
pnpm test:e2e:headed

# Debug mode
pnpm test:e2e:debug

# Use process-compose to manage servers
pnpm test:e2e:with-servers
```

## Configuration

- **Videos**: Recorded for all tests, kept on failure
- **Screenshots**: Captured on failure
- **Viewport**: 1920x1080 for consistent rendering
- **Timeout**: 10s for actions, 120s for server startup

