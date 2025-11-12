# Ebb & Bloom - UI/UX Architecture

**Version**: 1.0  
**Status**: Blueprint for Game Experience Design  
**Purpose**: Define the playable game experience from player perspective

---

## Overview

This document bridges the technical IDEAL_ARCHITECTURE.md to the **actual game experience**. It defines screen flows, Material-UI integration, responsive layouts, and interaction patterns that make "competitive evolution governor" a real, playable mobile game.

**Key Principle**: Every screen, gesture, and UI element must support the core gameplay loop: **strategic overhead control of a species competing against YUKA rivals for transcendence.**

---

## 1. User Journey & Screen Flow

### Complete Player Journey

```
[SPLASH SCREEN]
  ↓
[MAIN MENU]
  - New World
  - Continue
  - Settings
  ↓
[WORLD CREATION]
  - Three-word seed input/generation
  - Preview genesis haiku
  ↓
[COSMIC GENESIS FMV]
  - Big Bang → Galaxy → Star → Planet
  - Gyroscope teaches camera control
  ↓
[GOVERNOR VIEW: MICROSCOPIC STAGE]
  - 4-layer diorama (quantum → molecular)
  - Energy budget HUD
  - Rival progress indicators
  - Environmental influence actions
  ↓
[STAGE PROGRESSION]
  MICROSCOPIC → LIFE → BIOME → COSMIC
  (Player species must transcend first)
  ↓
[VICTORY/DEFEAT]
  - Species transcendence OR rival wins
  - Final haiku generation
  - World stats
```

### Screen Hierarchy

```
App Shell (MUI AppBar + Drawer)
  ├─ Splash Screen (brand animation)
  ├─ Main Menu (navigation hub)
  ├─ World Creation (seed wizard)
  ├─ Genesis FMV (intro cinematic)
  └─ Governor View (main gameplay)
      ├─ Stage Diorama (3D canvas - R3F)
      ├─ Energy Budget HUD (top overlay)
      ├─ Rival Dashboard (side drawer)
      ├─ Action Panel (bottom sheet)
      ├─ Haiku Display (center modal)
      └─ Settings Menu (drawer overlay)
```

---

## 2. Material-UI Integration Strategy

### UI Shell Architecture

```typescript
// App.tsx - Root layout
<ThemeProvider theme={ebbBloomTheme}>
  <CssBaseline />
  <AppLayout>
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/menu" element={<MainMenu />} />
      <Route path="/create" element={<WorldCreation />} />
      <Route path="/genesis" element={<GenesisFMV />} />
      <Route path="/governor" element={<GovernorView />} />
    </Routes>
  </AppLayout>
</ThemeProvider>

// AppLayout.tsx - Persistent shell
<Box sx={{ display: 'flex', height: '100vh' }}>
  <AppBar position="fixed">
    {/* Energy budget, world seed display */}
  </AppBar>
  
  <Drawer variant="temporary">
    {/* Rival dashboard, settings */}
  </Drawer>
  
  <Box component="main" sx={{ flexGrow: 1 }}>
    {children}
  </Box>
</Box>
```

### MUI Component Library

**Core Components:**
- `Card` - Rival species cards, stat panels
- `Drawer` - Side navigation, rival dashboard
- `AppBar` - Top HUD with energy budget
- `BottomSheet` (custom) - Action panel for governor intents
- `DataGrid` - Dense information display (DFU-inspired)
- `Chip` - Material tags, biome indicators
- `LinearProgress` - Energy budget bar, rival progress
- `Dialog` - Haiku display, confirmations
- `IconButton` - Quick actions, settings
- `Typography` - Haiku text, stat labels

**Custom Components:**
- `StageDiorama` - R3F canvas with MUI overlays
- `GyroscopeCamera` - Device orientation controller
- `EnergyBudgetHUD` - Top bar with available actions
- `RivalCard` - Individual YUKA species display
- `HaikuModal` - Center-stage narrative events
- `ActionPalette` - Bottom sheet of governor intents

### Theme & Design Tokens

```typescript
// theme/ebbBloomTheme.ts
const ebbBloomTheme = createTheme({
  palette: {
    mode: 'dark',  // Mobile-optimized dark theme
    primary: {
      main: '#4A90E2',      // Cosmic blue
      light: '#7BB3F0',
      dark: '#2C6BB0'
    },
    secondary: {
      main: '#E94F37',      // Primordial red
      light: '#F17563',
      dark: '#C13A27'
    },
    background: {
      default: '#0A0E17',   // Deep space
      paper: '#1A1F2E'      // UI surfaces
    },
    success: {
      main: '#4CAF50'       // Life/growth
    },
    warning: {
      main: '#FF9800'       // Energy warnings
    }
  },
  
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h1: {  // Stage titles
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em'
    },
    h2: {  // Section headers
      fontSize: '1.75rem',
      fontWeight: 600
    },
    body1: {  // Stat labels
      fontSize: '0.875rem',
      lineHeight: 1.5
    },
    caption: {  // Dense data (DFU-inspired)
      fontSize: '0.75rem',
      color: 'rgba(255,255,255,0.7)'
    }
  },
  
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(26, 31, 46, 0.8)',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(10, 14, 23, 0.95)',
          backdropFilter: 'blur(20px)'
        }
      }
    }
  },
  
  breakpoints: {
    values: {
      xs: 0,      // Small phones
      sm: 600,    // Large phones
      md: 900,    // Tablets
      lg: 1200,   // Small laptops
      xl: 1536    // Desktop (dev only)
    }
  }
});
```

### Responsive Layout System

```typescript
// Layouts use MUI Grid2 and sx prop
<Grid container spacing={2}>
  {/* Mobile: Stack vertically */}
  <Grid xs={12} md={8}>
    <StageDiorama />
  </Grid>
  
  {/* Desktop: Side panel */}
  <Grid xs={12} md={4}>
    <RivalDashboard />
  </Grid>
</Grid>

// Breakpoint-specific styles
<Box sx={{
  padding: { xs: 1, sm: 2, md: 3 },
  fontSize: { xs: '0.875rem', md: '1rem' },
  flexDirection: { xs: 'column', md: 'row' }
}}>
```

---

## 3. Governor View - Main Gameplay Screen

### Layout Structure (Mobile-First)

```
┌─────────────────────────────────────┐
│ [AppBar] Energy: 85/100  ⚙️        │ ← Top HUD
├─────────────────────────────────────┤
│                                     │
│         STAGE DIORAMA               │
│     (3D R3F Canvas - 60fps)         │
│                                     │
│  [Gyroscope Tilt-to-Pan Camera]    │ ← Main viewport
│                                     │
│  Foreground: Molecular structures   │
│  Nearground: Early life forms       │
│  Background: Primordial ocean       │
│  Sky: Cosmic radiation              │
│                                     │
├─────────────────────────────────────┤
│ [Action Panel - Bottom Sheet]       │ ← Swipe up
│  • Smite (15 energy)                │
│  • Nurture (10 energy)              │
│  • Catalyze (25 energy)             │
└─────────────────────────────────────┘

[Side Drawer - Swipe from right]
│ RIVAL SPECIES                      │
│ ┌────────────────────────┐         │
│ │ 🦠 Cyanobacteria        │         │
│ │ Progress: ████░░░░ 45% │         │
│ │ Strategy: Phototropic   │         │
│ └────────────────────────┘         │
│ ┌────────────────────────┐         │
│ │ 🔬 Archaebacteria       │         │
│ │ Progress: ██████░░ 65% │         │
│ │ Strategy: Thermophilic  │         │
│ └────────────────────────┘         │
```

### Component Breakdown

```typescript
// game/screens/GovernorView.tsx
export const GovernorView: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const energyBudget = useEnergyBudget();
  const rivals = useRivalSpecies();
  const currentStage = useCurrentStage();
  
  return (
    <>
      {/* Top HUD */}
      <EnergyBudgetHUD 
        current={energyBudget.current}
        max={energyBudget.max}
        regenRate={energyBudget.regenRate}
      />
      
      {/* Main 3D Viewport */}
      <StageDiorama
        stage={currentStage}
        onTap={(point) => setActionSheetOpen(true)}
      >
        <GyroscopeCamera />
        <StageRenderer layers={currentStage.layers} />
      </StageDiorama>
      
      {/* Rival Dashboard (Right Drawer) */}
      <RivalDashboard
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        rivals={rivals}
      />
      
      {/* Action Panel (Bottom Sheet) */}
      <ActionPanel
        open={actionSheetOpen}
        onClose={() => setActionSheetOpen(false)}
        availableActions={energyBudget.getAffordableActions()}
        onActionSelect={handleGovernorIntent}
      />
      
      {/* Haiku Modal (Narrative Events) */}
      <HaikuModal />
    </>
  );
};
```

---

## 4. Stage-Specific Layouts

### Microscopic Stage (0-2m scale)

**Focus**: Quantum mechanics → molecular assembly  
**Camera**: Close macro view, gyroscope pan ±30°  
**Visual Layers**:
- Foreground: Quantum probability clouds
- Nearground: Amino acids, proteins forming
- Background: Primordial soup chemistry
- Sky: Cosmic radiation penetrating atmosphere

**HUD Elements**:
- Energy budget: 100 starting
- Temperature gauge
- Chemical composition chart (DFU-inspired dense data)
- Rival molecular strategies

**Actions**:
- Catalyze reaction (15 energy)
- Heat/Cool environment (10 energy)
- Introduce element (25 energy)

### Life Stage (2-10m scale)

**Focus**: Single cells → multicellular organisms  
**Camera**: Mid-range view, gyroscope pan ±45°  
**Visual Layers**:
- Foreground: Your species individuals (close-up)
- Nearground: Ecosystem interactions
- Background: Terrain, vegetation
- Sky: Day/night cycle, weather

**HUD Elements**:
- Population count
- Food web visualization
- Trait evolution tree
- Rival species territories (map overlay)

**Actions**:
- Smite predator (20 energy)
- Nurture population (15 energy)
- Mutate trait (30 energy)

### Biome Stage (10-50m scale)

**Focus**: Ecosystem → civilization emergence  
**Camera**: Strategic overhead, gyroscope pan ±60°  
**Visual Layers**:
- Foreground: Settlements, structures
- Nearground: Species herds/colonies
- Background: Biome landscape
- Sky: Weather patterns, seasonal changes

**HUD Elements**:
- Civilization tier
- Technology tree
- Resource production
- Rival civilization borders

**Actions**:
- Climate shift (40 energy)
- Deliver resources (25 energy)
- Inspire innovation (50 energy)

### Cosmic Stage (50m+ scale)

**Focus**: Planetary → stellar transcendence  
**Camera**: God view, gyroscope pan ±90°  
**Visual Layers**:
- Foreground: Orbital structures
- Nearground: Planetary surface
- Background: Solar system
- Sky: Galaxy, cosmos

**HUD Elements**:
- Kardashev scale progress
- Energy harnessing capacity
- Rival transcendence countdowns
- Win/loss conditions

**Actions**:
- Terraform planet (100 energy)
- Harvest star (150 energy)
- Trigger transcendence (500 energy - game-ending)

---

## 5. Gyroscope Camera Integration

### Gesture Vocabulary

```typescript
// Mobile-first interaction model
interface GyroscopeGestures {
  // Primary: Device orientation
  tilt: {
    pitch: number;    // Forward/back tilt → Camera pitch
    roll: number;     // Left/right tilt → Camera pan
    sensitivity: number;  // Adjust per stage
  };
  
  // Secondary: Touch gestures
  pinch: {
    scale: number;    // Pinch zoom → Camera distance
    min: number;      // Prevent clipping
    max: number;      // Prevent far plane
  };
  
  tap: {
    point: Vector3;   // Tap screen → Select target
    action: 'inspect' | 'target' | 'menu';
  };
  
  swipe: {
    direction: 'up' | 'down' | 'left' | 'right';
    action: 'action_panel' | 'rival_drawer' | 'settings';
  };
}

// Stage-specific camera bounds
const cameraBounds: Record<Stage, CameraBounds> = {
  microscopic: {
    distance: [0.5, 2],
    pitch: [-15, 45],
    pan: [-30, 30]
  },
  life: {
    distance: [2, 10],
    pitch: [-30, 60],
    pan: [-45, 45]
  },
  biome: {
    distance: [10, 50],
    pitch: [-45, 75],
    pan: [-60, 60]
  },
  cosmic: {
    distance: [50, 500],
    pitch: [-60, 90],
    pan: [-90, 90]
  }
};
```

### Haptic Feedback

```typescript
// Capacitor Haptics integration
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Energy budget warnings
if (energyBudget < 20) {
  Haptics.impact({ style: ImpactStyle.Light });
}

// Action success
onActionComplete(() => {
  Haptics.impact({ style: ImpactStyle.Medium });
});

// Rival milestone reached
onRivalProgress(() => {
  Haptics.impact({ style: ImpactStyle.Heavy });
});

// Transcendence trigger
onTranscendence(() => {
  Haptics.vibrate({ duration: 1000 });
});
```

---

## 6. Information Architecture (DFU-Inspired)

### Dense Data Principles

Daggerfall Unity shows **maximum information in minimum space**. Apply this to:

1. **Stat Panels** - Compact grids showing species stats
2. **Chemical Composition** - Periodic table visualization
3. **Rival Dashboard** - Multiple species data at glance
4. **Technology Tree** - Branching visualization
5. **Resource Economy** - Production/consumption rates

### Panel Hierarchy

```typescript
<Card variant="outlined">
  <CardHeader
    title="Species Stats"
    action={<IconButton>⋮</IconButton>}
  />
  <CardContent>
    <DataGrid
      rows={speciesStats}
      columns={[
        { field: 'population', headerName: 'Pop', width: 60 },
        { field: 'energy', headerName: 'E', width: 50 },
        { field: 'progress', headerName: '%', width: 50 }
      ]}
      density="compact"
      hideFooter
    />
  </CardContent>
</Card>
```

### Progressive Disclosure

```
Level 1: HUD - Always visible
  ├─ Energy budget
  ├─ Current stage
  └─ Rival count

Level 2: Quick Glance - Swipe to reveal
  ├─ Rival dashboard
  ├─ Action panel
  └─ Stat summary

Level 3: Deep Dive - Tap for details
  ├─ Full species tree
  ├─ Technology history
  ├─ Chemical analysis
  └─ World statistics
```

---

## 7. Haiku System Integration

### Haiku Types & Triggers

```typescript
enum HaikuType {
  GENESIS = 'genesis',           // World creation
  STAGE_TRANSITION = 'transition', // Stage progression
  MILESTONE = 'milestone',       // Major achievement
  RIVAL_EVENT = 'rival',         // Rival milestone
  VICTORY = 'victory',           // Transcendence
  DEFEAT = 'defeat'              // Rival wins
}

interface HaikuEvent {
  type: HaikuType;
  trigger: {
    condition: string;
    data: Record<string, any>;
  };
  generation: {
    seed: string;              // Deterministic from world seed
    template: string;          // Law-based structure
    variables: string[];       // Cosmic provenance data
  };
}

// Example: Genesis haiku at world creation
generateGenesisHaiku(seed: string): Haiku {
  const genesis = computeCosmicGenesis(seed);
  return {
    lines: [
      `From ${genesis.galaxyName} born`,
      `${genesis.starType} forges elements`,
      `Life waits in darkness`
    ],
    metadata: {
      galaxyAge: genesis.age,
      metallicity: genesis.metallicity,
      distance: genesis.distanceFromCenter
    }
  };
}
```

### Haiku Display Component

```typescript
// game/components/HaikuModal.tsx
export const HaikuModal: React.FC<HaikuEvent> = ({ haiku, onClose }) => {
  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #0A0E17 0%, #1A1F2E 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(74, 144, 226, 0.3)'
        }
      }}
    >
      <DialogContent sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h4" color="primary" gutterBottom>
          {haiku.title}
        </Typography>
        
        <Box sx={{ my: 4 }}>
          {haiku.lines.map((line, i) => (
            <Typography
              key={i}
              variant="h6"
              sx={{
                fontFamily: '"Crimson Text", serif',
                fontStyle: 'italic',
                color: 'rgba(255,255,255,0.9)',
                my: 1
              }}
            >
              {line}
            </Typography>
          ))}
        </Box>
        
        {haiku.metadata && (
          <Typography variant="caption" color="text.secondary">
            Galaxy: {haiku.metadata.galaxyName} | 
            Age: {haiku.metadata.age} Gyr |
            Metallicity: {haiku.metadata.metallicity.toFixed(3)}
          </Typography>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

---

## 8. Branding & Visual Language

### Typography Scale

```typescript
// Hierarchical type system
const typography = {
  display: {
    // Large titles (splash, stage transitions)
    fontFamily: '"Orbitron", sans-serif',  // Sci-fi geometric
    fontSize: '3rem',
    fontWeight: 800,
    letterSpacing: '0.05em',
    textTransform: 'uppercase'
  },
  
  headline: {
    // Section headers (rival names, stats)
    fontFamily: '"Inter", sans-serif',
    fontSize: '1.5rem',
    fontWeight: 600
  },
  
  body: {
    // General UI text
    fontFamily: '"Inter", sans-serif',
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.6
  },
  
  haiku: {
    // Poetic narrative
    fontFamily: '"Crimson Text", serif',
    fontSize: '1.25rem',
    fontWeight: 400,
    fontStyle: 'italic',
    lineHeight: 1.8
  },
  
  data: {
    // Dense information (DFU-style)
    fontFamily: '"Roboto Mono", monospace',
    fontSize: '0.75rem',
    fontWeight: 400,
    letterSpacing: '0.02em'
  }
};
```

### Iconography

```typescript
// Material Icons + Custom SVGs
import {
  FlashOn,        // Energy actions
  Visibility,     // Inspect
  Terrain,        // Biome
  Science,        // Chemistry
  Groups,         // Rival species
  TrendingUp,     // Progress
  Settings,       // Config
  EmojiObjects    // Innovation
} from '@mui/icons-material';

// Custom icons for game-specific elements
import { 
  QuarkIcon,      // Quantum stage
  DNAIcon,        // Life stage
  PlanetIcon,     // Biome stage
  GalaxyIcon      // Cosmic stage
} from '../assets/icons';
```

### Animation Tokens

```typescript
// Consistent motion language
const animations = {
  duration: {
    instant: 100,
    quick: 200,
    normal: 300,
    slow: 500,
    epic: 1000
  },
  
  easing: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
  },
  
  transitions: {
    fadeIn: { opacity: [0, 1], duration: 300 },
    slideUp: { y: [20, 0], opacity: [0, 1], duration: 400 },
    scale: { scale: [0.95, 1], duration: 200 }
  }
};
```

---

## 9. Testable Acceptance Criteria

### UI Flow Tests (IDEAL Integration)

```typescript
// tests/ideal/ui/screenFlow.spec.ts
describe('Screen Flow', () => {
  it('should navigate from splash → menu → world creation → governor view', async () => {
    // Start at splash
    const app = renderApp();
    expect(screen.getByTestId('splash-screen')).toBeInTheDocument();
    
    // Auto-navigate to menu after 2s
    await waitFor(() => {
      expect(screen.getByTestId('main-menu')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Click "New World"
    fireEvent.click(screen.getByText('New World'));
    expect(screen.getByTestId('world-creation')).toBeInTheDocument();
    
    // Enter seed
    const seedInput = screen.getByLabelText('World Seed');
    fireEvent.change(seedInput, { target: { value: 'v1-cosmic-dawn-hope' } });
    fireEvent.click(screen.getByText('Create World'));
    
    // Verify genesis FMV starts
    expect(screen.getByTestId('genesis-fmv')).toBeInTheDocument();
  });
  
  it('should display energy budget HUD in governor view', () => {
    renderGovernorView({ energyBudget: { current: 75, max: 100 } });
    
    expect(screen.getByText('Energy: 75/100')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
  });
  
  it('should open rival dashboard on swipe gesture', async () => {
    const { container } = renderGovernorView();
    
    // Simulate swipe from right
    fireEvent.touchStart(container, { touches: [{ clientX: 350, clientY: 200 }] });
    fireEvent.touchMove(container, { touches: [{ clientX: 100, clientY: 200 }] });
    fireEvent.touchEnd(container);
    
    await waitFor(() => {
      expect(screen.getByTestId('rival-dashboard')).toBeVisible();
    });
  });
});

// tests/ideal/ui/gyroscopeCamera.spec.ts
describe('Gyroscope Camera', () => {
  it('should pan camera based on device orientation', () => {
    const camera = renderGyroscopeCamera({ stage: 'microscopic' });
    
    // Simulate device tilt
    fireEvent(window, new DeviceOrientationEvent('deviceorientation', {
      beta: 15,  // Tilt forward
      gamma: -10  // Tilt left
    }));
    
    expect(camera.rotation.x).toBeCloseTo(0.26, 2);  // 15° in radians
    expect(camera.rotation.y).toBeCloseTo(-0.17, 2); // -10° in radians
  });
  
  it('should respect stage-specific camera bounds', () => {
    const camera = renderGyroscopeCamera({ stage: 'cosmic' });
    
    // Attempt to exceed bounds
    fireEvent(window, new DeviceOrientationEvent('deviceorientation', {
      beta: 120,  // Extreme tilt
      gamma: 100
    }));
    
    // Should clamp to cosmic stage limits
    expect(camera.rotation.x).toBeLessThanOrEqual(Math.PI / 2);  // 90° max
    expect(camera.rotation.y).toBeLessThanOrEqual(Math.PI / 2);
  });
});

// tests/ideal/ui/haikuSystem.spec.ts
describe('Haiku System', () => {
  it('should generate deterministic haiku from seed', () => {
    const seed = 'v1-cosmic-dawn-hope';
    const haiku1 = generateGenesisHaiku(seed);
    const haiku2 = generateGenesisHaiku(seed);
    
    expect(haiku1.lines).toEqual(haiku2.lines);
    expect(haiku1.metadata).toEqual(haiku2.metadata);
  });
  
  it('should display haiku modal on stage transition', async () => {
    const { triggerStageTransition } = renderGovernorView();
    
    triggerStageTransition('microscopic', 'life');
    
    await waitFor(() => {
      expect(screen.getByTestId('haiku-modal')).toBeInTheDocument();
      expect(screen.getByText(/Life emerges/i)).toBeInTheDocument();
    });
  });
});
```

---

## 10. Implementation Backlog

### Dependency Graph

```
Backend Foundation (IDEAL_ARCHITECTURE)
  ├─ ThreeWordSeedStore
  ├─ RNGRegistry (seed flow)
  └─ GameState integration
      ↓
UI Shell (Phase 1) ← BLOCKER for all other phases
  ├─ MUI theme + design tokens
  ├─ AppLayout + routing
  └─ Responsive breakpoints
      ↓
  ┌───────────────┴───────────────┐
  │                               │
World Creation (Phase 2)     Governor View Core (Phase 3)
  │                               │
  ├─ Seed wizard                  ├─ StageDiorama
  ├─ Haiku preview                ├─ GyroscopeCamera
  └─ FMV intro                    └─ EnergyHUD
      ↓                               ↓
      └───────────┬───────────────────┘
                  ↓
          ┌───────┴────────┐
          │                │
    Rival System       Action System
    (Phase 4)          (Phase 5)
          │                │
          └───────┬────────┘
                  ↓
          Haiku Integration
             (Phase 7)
                  ↓
          Stage Progression
             (Phase 8)
                  ↓
          Polish & Testing
             (Phase 9)
                  ↓
         Mobile Optimization
            (Phase 10)
```

### Phase 1: UI Shell (Week 1) - FOUNDATION

**Dependencies**: None (starts immediately)  
**Blocks**: All other UI phases  
**Acceptance Criteria**:
- ✅ `tests/ideal/ui/theme.spec.ts` passes (MUI theme tokens match design)
- ✅ `tests/ideal/ui/appLayout.spec.ts` passes (routing works)
- ✅ Responsive at all breakpoints (xs, sm, md, lg, xl)
- ✅ Dark theme applied globally
- ✅ Navigation between splash/menu/create/governor

**Tasks**:
```typescript
// 1.1: Create MUI theme
// File: game/theme/ebbBloomTheme.ts
// Implement: palette, typography, components, breakpoints
// Test: tests/ideal/ui/theme.spec.ts

// 1.2: Create AppLayout shell
// File: game/components/AppLayout.tsx
// Implement: AppBar, Drawer, main content area, routing
// Test: tests/ideal/ui/appLayout.spec.ts

// 1.3: Implement routing
// File: game/App.tsx
// Implement: React Router with routes for all screens
// Test: tests/ideal/ui/routing.spec.ts

// 1.4: Splash screen
// File: game/screens/SplashScreen.tsx
// Implement: Brand animation, auto-navigate to menu
// Test: tests/ideal/ui/splashScreen.spec.ts

// 1.5: Main menu
// File: game/screens/MainMenu.tsx
// Implement: Navigation buttons (New World, Continue, Settings)
// Test: tests/ideal/ui/mainMenu.spec.ts
```

### Phase 2: World Creation (Week 2)

**Dependencies**: Phase 1, ThreeWordSeedStore (backend)  
**Blocks**: Genesis FMV, Governor View  
**Acceptance Criteria**:
- ✅ `tests/ideal/ui/worldCreation.spec.ts` passes
- ✅ `tests/ideal/backend/seedStore.spec.ts` passes
- ✅ Seed validation works (version check)
- ✅ Genesis haiku generates deterministically
- ✅ FMV intro plays and transitions to governor view

**Tasks**:
```typescript
// 2.1: ThreeWordSeedStore (backend)
// File: engine/stores/worldSeed.ts
// Implement: save(), load(), generate(), isVersionCompatible()
// Test: tests/ideal/backend/seedStore.spec.ts

// 2.2: Seed wizard UI
// File: game/screens/WorldCreation.tsx
// Implement: MUI Stepper with seed input, validation, preview
// Test: tests/ideal/ui/worldCreation.spec.ts

// 2.3: Genesis haiku generator
// File: engine/narrative/HaikuGenerator.ts
// Implement: generateGenesisHaiku(seed) using cosmic provenance
// Test: tests/ideal/narrative/haikuGenerator.spec.ts

// 2.4: FMV intro integration
// File: game/screens/GenesisFMV.tsx
// Implement: Existing FMV with gyroscope teaching
// Test: tests/ideal/ui/genesisFMV.spec.ts
```

### Phase 3: Governor View Core (Week 3)

**Dependencies**: Phase 1, StageSystem (backend)  
**Blocks**: Rival System, Action System  
**Acceptance Criteria**:
- ✅ `tests/ideal/ui/governorView.spec.ts` passes
- ✅ `tests/ideal/ui/gyroscopeCamera.spec.ts` passes
- ✅ 60fps on target device
- ✅ Gyroscope tilt-to-pan working
- ✅ 4-layer diorama rendering
- ✅ Energy HUD displays correctly

**Tasks**:
```typescript
// 3.1: StageSystem (backend)
// File: engine/rendering/stage/StageSystem.ts
// Implement: Layer management, placement resolution
// Test: tests/ideal/backend/stageSystem.spec.ts

// 3.2: StageDiorama component
// File: game/components/StageDiorama.tsx
// Implement: R3F canvas with MUI overlay, tap handling
// Test: tests/ideal/ui/stageDiorama.spec.ts

// 3.3: GyroscopeCamera
// File: engine/input/gyroscope/GyroGovernorCamera.ts
// Implement: Capacitor Motion API, stage-specific bounds
// Test: tests/ideal/ui/gyroscopeCamera.spec.ts

// 3.4: EnergyBudgetHUD
// File: game/components/EnergyBudgetHUD.tsx
// Implement: Top bar with energy display, regen rate
// Test: tests/ideal/ui/energyHUD.spec.ts

// 3.5: Touch gestures
// File: game/hooks/useGestures.ts
// Implement: Tap, swipe, pinch handlers
// Test: tests/ideal/ui/gestures.spec.ts

// 3.6: Haptic feedback
// File: game/hooks/useHaptics.ts
// Implement: Capacitor Haptics integration
// Test: tests/ideal/ui/haptics.spec.ts
```

### Phase 4: Rival System (Week 4)

**Dependencies**: Phase 3, YUKA governors (backend)  
**Blocks**: None (parallel with Phase 5)  
**Acceptance Criteria**:
- ✅ `tests/ideal/ui/rivalDashboard.spec.ts` passes
- ✅ Real-time rival progress updates
- ✅ Swipe gesture opens/closes drawer
- ✅ Multiple rival species displayed
- ✅ Progress bars accurate

**Tasks**:
```typescript
// 4.1: RivalDashboard drawer
// File: game/components/RivalDashboard.tsx
// Implement: MUI Drawer with rival cards
// Test: tests/ideal/ui/rivalDashboard.spec.ts

// 4.2: RivalCard component
// File: game/components/RivalCard.tsx
// Implement: Species display with progress, strategy
// Test: tests/ideal/ui/rivalCard.spec.ts

// 4.3: YUKA species integration
// File: engine/ecs/services/RivalSpeciesProvider.ts
// Implement: Query rival species from ECS
// Test: tests/ideal/backend/rivalProvider.spec.ts

// 4.4: Real-time updates
// File: game/hooks/useRivalSpecies.ts
// Implement: Subscribe to rival progress changes
// Test: tests/ideal/ui/rivalUpdates.spec.ts
```

### Phase 5: Action System (Week 5)

**Dependencies**: Phase 3, GovernorController (backend)  
**Blocks**: None (parallel with Phase 4)  
**Acceptance Criteria**:
- ✅ `tests/ideal/ui/actionPanel.spec.ts` passes
- ✅ Only affordable actions shown
- ✅ Energy deducted on action
- ✅ Haptic feedback on success
- ✅ Error handling for invalid actions

**Tasks**:
```typescript
// 5.1: ActionPanel bottom sheet
// File: game/components/ActionPanel.tsx
// Implement: MUI bottom sheet with action buttons
// Test: tests/ideal/ui/actionPanel.spec.ts

// 5.2: Governor intent submission
// File: game/hooks/useGovernorActions.ts
// Implement: submitIntent(), getAvailableActions()
// Test: tests/ideal/ui/governorActions.spec.ts

// 5.3: Action feedback
// File: game/components/ActionFeedback.tsx
// Implement: Success/error animations, haptics
// Test: tests/ideal/ui/actionFeedback.spec.ts

// 5.4: Cost validation
// File: engine/ecs/controllers/PlayerGovernorController.ts
// Implement: Energy budget validation
// Test: tests/ideal/backend/governorController.spec.ts
```

### Phase 6: Information Architecture (Week 6)

**Dependencies**: Phase 3, BiomeSystem, MaterialRegistry (backend)  
**Blocks**: None (parallel)  
**Acceptance Criteria**:
- ✅ `tests/ideal/ui/denseDataPanels.spec.ts` passes
- ✅ DFU-style information density
- ✅ Progressive disclosure working
- ✅ DataGrid performance acceptable
- ✅ Chemistry viz accurate

**Tasks**:
```typescript
// 6.1: Dense data panels
// File: game/components/StatPanel.tsx
// Implement: MUI Card + DataGrid for compact stats
// Test: tests/ideal/ui/statPanel.spec.ts

// 6.2: Chemistry visualization
// File: game/components/ChemistryPanel.tsx
// Implement: Periodic table, molecule diagrams
// Test: tests/ideal/ui/chemistryPanel.spec.ts

// 6.3: Technology tree
// File: game/components/TechnologyTree.tsx
// Implement: Branching visualization of species tech
// Test: tests/ideal/ui/technologyTree.spec.ts

// 6.4: Progressive disclosure
// File: game/hooks/useDisclosure.ts
// Implement: Level 1/2/3 visibility management
// Test: tests/ideal/ui/disclosure.spec.ts
```

### Phase 7: Haiku Integration (Week 7)

**Dependencies**: Phase 2 (HaikuGenerator), Phase 3  
**Blocks**: None  
**Acceptance Criteria**:
- ✅ `tests/ideal/ui/haikuModal.spec.ts` passes
- ✅ Deterministic haikus from seed
- ✅ Event triggers working (genesis, transition, milestone)
- ✅ Typography and animation polished
- ✅ Metadata display accurate

**Tasks**:
```typescript
// 7.1: HaikuModal component
// File: game/components/HaikuModal.tsx
// Implement: MUI Dialog with haiku display
// Test: tests/ideal/ui/haikuModal.spec.ts

// 7.2: Event trigger system
// File: engine/narrative/HaikuEventSystem.ts
// Implement: Event detection, haiku generation
// Test: tests/ideal/narrative/haikuEvents.spec.ts

// 7.3: Haiku types
// File: engine/narrative/HaikuGenerator.ts
// Implement: Genesis, transition, milestone, victory, defeat
// Test: tests/ideal/narrative/haikuTypes.spec.ts
```

### Phase 8: Stage Progression (Week 8)

**Dependencies**: Phases 3-7 complete  
**Blocks**: None  
**Acceptance Criteria**:
- ✅ `tests/ideal/ui/stageProgression.spec.ts` passes
- ✅ All 4 stages have unique layouts
- ✅ Camera bounds adapt per stage
- ✅ HUD updates per stage
- ✅ Win/loss conditions trigger correctly

**Tasks**:
```typescript
// 8.1: Microscopic stage layout
// File: game/screens/stages/MicroscopicStage.tsx
// Implement: Quantum → molecular layout
// Test: tests/ideal/ui/microscopicStage.spec.ts

// 8.2: Life stage layout
// File: game/screens/stages/LifeStage.tsx
// Implement: Single cell → multicellular layout
// Test: tests/ideal/ui/lifeStage.spec.ts

// 8.3: Biome stage layout
// File: game/screens/stages/BiomeStage.tsx
// Implement: Ecosystem → civilization layout
// Test: tests/ideal/ui/biomeStage.spec.ts

// 8.4: Cosmic stage layout
// File: game/screens/stages/CosmicStage.tsx
// Implement: Planetary → stellar layout
// Test: tests/ideal/ui/cosmicStage.spec.ts

// 8.5: Stage transition system
// File: engine/progression/StageTransitionSystem.ts
// Implement: Progress tracking, transition triggers
// Test: tests/ideal/backend/stageTransition.spec.ts

// 8.6: Win/loss conditions
// File: game/screens/VictoryScreen.tsx, DefeatScreen.tsx
// Implement: Final haiku, stats display
// Test: tests/ideal/ui/endGameScreens.spec.ts
```

### Phase 9: Polish & Testing (Week 9)

**Dependencies**: All previous phases  
**Blocks**: Phase 10  
**Acceptance Criteria**:
- ✅ All IDEAL tests passing (GREEN phase)
- ✅ Animations 60fps
- ✅ Loading states on all async operations
- ✅ Error handling comprehensive
- ✅ Accessibility score >90

**Tasks**:
```typescript
// 9.1: Animation polish
// File: game/animations/*.ts
// Implement: Spring animations, easing curves
// Test: Visual QA

// 9.2: Loading states
// File: game/components/Loading*.tsx
// Implement: Skeletons, spinners, progress indicators
// Test: tests/ideal/ui/loadingStates.spec.ts

// 9.3: Error handling
// File: game/components/ErrorBoundary.tsx
// Implement: Global error boundary, retry logic
// Test: tests/ideal/ui/errorHandling.spec.ts

// 9.4: Accessibility
// File: All components
// Implement: ARIA labels, keyboard nav, focus management
// Test: Lighthouse audit, axe-core

// 9.5: E2E tests
// File: tests/e2e/*.spec.ts
// Implement: Playwright tests for all flows
// Test: CI/CD pipeline
```

### Phase 10: Mobile Optimization (Week 10)

**Dependencies**: Phase 9  
**Blocks**: Production release  
**Acceptance Criteria**:
- ✅ 60fps sustained on OnePlus foldable
- ✅ Battery drain <10%/hour
- ✅ Touch gestures refined
- ✅ Offline mode working
- ✅ App store ready

**Tasks**:
```typescript
// 10.1: Performance profiling
// Tools: React DevTools Profiler, Chrome DevTools
// Optimize: Memo, useMemo, lazy loading, code splitting
// Test: Lighthouse performance score >90

// 10.2: Battery optimization
// Optimize: Reduce physics ticks, throttle animations
// Test: Android Battery Historian

// 10.3: Touch refinement
// File: game/hooks/useGestures.ts
// Refine: Dead zones, velocity, multi-touch
// Test: User testing on device

// 10.4: Offline support
// File: service-worker.ts, game/state/OfflineState.ts
// Implement: Cache assets, queue actions
// Test: tests/ideal/offline.spec.ts

// 10.5: App store assets
// Create: Screenshots, videos, descriptions
// Submit: Google Play Store
```

### Task Dependencies (Critical Path)

```
CRITICAL PATH (longest sequence):
Phase 1 (1 week) → Phase 2 (1 week) → Phase 3 (1 week) → 
Phase 7 (1 week) → Phase 8 (1 week) → Phase 9 (1 week) → 
Phase 10 (1 week) = 7 weeks minimum

PARALLEL WORK (can overlap):
- Phase 4 + Phase 5 (during/after Phase 3)
- Phase 6 (during Phase 4/5)

TOTAL DURATION: ~7-8 weeks with proper parallelization
```

---

## Success Criteria

### User Experience
- ✅ Player can navigate entire game flow without confusion
- ✅ Gyroscope camera feels natural and intuitive
- ✅ Energy budget constraints create strategic decisions
- ✅ Rival progress feels competitive and urgent
- ✅ Haikus provide narrative context and emotional beats
- ✅ Stage transitions feel epic and earned

### Technical
- ✅ 60fps on target device (OnePlus foldable)
- ✅ All UI flows covered by IDEAL tests
- ✅ Material-UI theme consistent across all screens
- ✅ Responsive layouts work at all breakpoints
- ✅ Haptic feedback enhances all key interactions
- ✅ No UI-induced state bugs (deterministic rendering)

### Design
- ✅ Visual language reflects cosmic evolution theme
- ✅ Typography hierarchy supports information density
- ✅ DFU-inspired data panels maximize information
- ✅ Spore-style governor view feels strategic
- ✅ Branding consistent (colors, fonts, icons)
- ✅ Animations feel polished and purposeful

---

**This UI/UX architecture bridges technical systems to playable experience.**
