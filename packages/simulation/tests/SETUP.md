# E2E Test Setup - Process Compose

## Quick Start

**Recommended workflow using process-compose:**

```bash
# Terminal 1: Start servers
process-compose up dev-backend dev-frontend

# Terminal 2: Run tests
cd packages/simulation && pnpm test:e2e
```

## Using Justfile Commands

```bash
# Start servers
just test-e2e-servers

# Run tests (in another terminal)
just test-e2e

# Run with UI
just test-e2e-ui

# Run with browser visible
just test-e2e-headed

# Debug mode
just test-e2e-debug
```

## Process Compose Benefits

1. **Better Logging**: See both server logs in one place
2. **Dependency Management**: Servers start in correct order
3. **Auto-restart**: Servers restart on failure
4. **Resource Management**: Single process manager for all dev services
5. **Easy Cleanup**: `Ctrl+C` stops everything

## Server URLs

- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:5173

## Verification

Check servers are running:
```bash
curl http://localhost:3001/health
curl http://localhost:5173
```

## Troubleshooting

**Port already in use:**
```bash
# Kill existing processes
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

**Servers not starting:**
```bash
# Check process-compose logs
process-compose logs dev-backend
process-compose logs dev-frontend
```

