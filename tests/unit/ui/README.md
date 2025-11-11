# UI Tests

**Comprehensive test suite for UI system based on Daggerfall Unity patterns.**

---

## Test Coverage

### ✅ UIManager Tests (6 tests)
- Default screen initialization
- Initial screen prop
- Screen transitions
- HUD visibility control
- Manual HUD visibility
- Error handling (outside provider)

### ✅ Screen Tests (12 tests)

**MenuScreen (4 tests):**
- Renders title
- Renders buttons (New Game, Settings)
- Proper styling

**PauseScreen (5 tests):**
- Renders pause title
- Renders buttons (Resume, Settings, Main Menu)
- Proper styling

**GameScreen (3 tests):**
- Renders children
- Full viewport dimensions
- Absolute positioning

### ✅ HUD Component Tests (23 tests)

**HUD (2 tests):**
- Hides when not visible
- Renders when visible

**HUDVitals (6 tests):**
- Renders all three bars (Health, Fatigue, Magicka)
- Updates bar heights based on props
- Proper positioning (bottom-left)

**HUDCompass (5 tests):**
- Renders compass container
- Renders compass needle
- Renders N/S/E/W labels
- Rotates based on heading
- Proper positioning (bottom-right)

**HUDCrosshair (4 tests):**
- Renders crosshair container
- Centered on screen
- Pointer events disabled
- Renders horizontal and vertical lines

**HUDInfo (6 tests):**
- Renders game title
- Renders seed when provided
- Renders position when provided
- Renders controls help text
- Proper positioning (top-left)
- Formats coordinates correctly

---

## Test Setup

**Dependencies:**
- `@testing-library/react` - React component testing
- `@testing-library/jest-dom` - DOM matchers
- `vitest` - Test runner
- `jsdom` - DOM environment

**Setup File:** `tests/setup.ts`
- Imports `@testing-library/jest-dom` for matchers

---

## Running Tests

```bash
# Run all UI tests
npm test -- tests/unit/ui

# Run specific test file
npm test -- tests/unit/ui/UIManager.test.tsx

# Watch mode
npm run test:watch -- tests/unit/ui
```

---

## Test Results

**Current Status:** ✅ **41/41 tests passing**

- UIManager: 6/6 ✅
- Screens: 12/12 ✅
- HUD Components: 23/23 ✅

---

## Test Patterns

### Component Testing
- Uses `@testing-library/react` for rendering
- Tests user interactions with `fireEvent`
- Verifies DOM structure and styling
- Tests props and state changes

### Context Testing
- Tests React Context providers
- Verifies context values
- Tests error handling

### Integration Testing
- Tests components within providers
- Verifies component interactions
- Tests screen transitions

---

## Future Tests

- **SettingsScreen** - When implemented
- **InventoryScreen** - When implemented
- **CharacterScreen** - When implemented
- **Screen transitions** - Integration tests
- **Keyboard shortcuts** - E2E tests


