# Controller Coprocessor Architecture

**Date:** November 11, 2025  
**Status:** Architecture Design  
**Insight:** TRUE parity requires governors to be controller-agnostic

---

## The Problem

**Current architecture (wrong):**
```typescript
class PlayerGovernor extends YukaGovernorBase {
  // Player-specific code
  showUI() { ... }
  waitForInput() { ... }
}

class YukaGovernor extends YukaGovernorBase {
  // YUKA-specific code  
  selectTarget() { ... }
  executeSteeringBehavior() { ... }
}
```

**Issues:**
- ❌ Governor logic duplicated between Player and YUKA
- ❌ Different code paths = different capabilities
- ❌ Not DRY
- ❌ Can't guarantee parity
- ❌ Hard to add new controller types (network, replay, etc)

---

## The Solution: Controller Coprocessor

**Proposed architecture (correct):**
```typescript
// 1. Governor doesn't know who's controlling it
abstract class Governor {
  protected controller: ControllerCoprocessor;
  
  async decideAction(context: ActionContext): Promise<GovernorIntent> {
    // Request action from controller (AI or Player or Network)
    return this.controller.requestAction('selectPrey', context);
  }
}

// 2. Coprocessor abstracts controller differences
class ControllerCoprocessor {
  private adapter: ControllerAdapter; // AI_API or Player_API
  private lawSystem: LawSystem;
  private energyLedger: GovernorEnergyLedger;
  
  async requestAction(
    actionId: string,
    context: ActionContext
  ): Promise<GovernorIntent> {
    // 1. Validate law constraints
    this.lawSystem.validateAction(actionId, context);
    
    // 2. Check energy budget
    const cost = this.getActionCost(actionId);
    if (!this.energyLedger.canAfford(cost)) {
      throw new Error('Insufficient energy');
    }
    
    // 3. Delegate to controller adapter (AI or Player)
    const intent = await this.adapter.provideInput(actionId, context);
    
    // 4. Deduct energy
    this.energyLedger.spend(cost);
    
    // 5. Return normalized intent
    return intent;
  }
}

// 3. AI Adapter - Uses YUKA
class AIControllerAdapter implements ControllerAdapter {
  async provideInput(
    actionId: string, 
    context: ActionContext
  ): Promise<GovernorIntent> {
    switch(actionId) {
      case 'selectPrey':
        // Use YUKA steering behaviors
        const target = this.yukaEntity.getClosestPrey();
        return { type: 'selectPrey', target };
      
      case 'smitePredator':
        // Use YUKA decision tree
        const threat = this.yukaEntity.evaluateThreat();
        return { type: 'smite', position: threat.position };
    }
  }
}

// 4. Player Adapter - Shows UI (Material-UI + DESIGN.md)
class PlayerControllerAdapter implements ControllerAdapter {
  private uiManager: GovernorUIManager; // Material-UI components
  
  async provideInput(
    actionId: string,
    context: ActionContext
  ): Promise<GovernorIntent> {
    switch(actionId) {
      case 'selectPrey':
        // Show UI: Species selector (DESIGN.md styling)
        // - Bloom Emerald button (#38A169)
        // - Ebb Indigo background (#4A5568)
        // - Trait Gold highlights (#D69E2E)
        const target = await this.uiManager.showSpeciesSelector({
          title: 'Select Prey Species',
          options: context.preyOptions,
          energyCost: 0, // Free but opportunity cost
        });
        return { type: 'selectPrey', target };
      
      case 'smitePredator':
        // Show UI: Position picker with energy cost
        // - Lightning icon (generated asset)
        // - Warning Orange for high cost (#ED8936)
        // - Haptic feedback on selection (mobile)
        const position = await this.uiManager.showPositionPicker({
          title: 'Lightning Strike',
          subtitle: 'Smite predators threatening your species',
          energyCost: 1000,
          icon: 'lightning-bolt', // Generated image asset
          color: '#ED8936', // Warning orange
        });
        return { type: 'smite', position };
      
      case 'nurtureFood':
        // Show UI: Intensity slider
        // - Success Green (#48BB78) for nurture action
        // - Slider for magnitude (law-constrained max)
        const magnitude = await this.uiManager.showMagnitudeSlider({
          title: 'Nurture Food Supply',
          subtitle: 'Increase carrying capacity for your species',
          energyCost: 500,
          icon: 'growing-plant', // Generated image asset
          color: '#48BB78', // Success green
          max: context.carryingCapacityLimit, // Law constraint
        });
        return { type: 'nurture', magnitude };
    }
  }
}
```

---

## Key Benefits

### 1. TRUE Parity
**Same action space for both:**
```typescript
// AI governor uses YUKA to decide
const aiGovernor = new Governor(
  new ControllerCoprocessor(new AIControllerAdapter())
);

// Player governor uses UI to decide
const playerGovernor = new Governor(
  new ControllerCoprocessor(new PlayerControllerAdapter())
);

// IDENTICAL INTERFACE - both return GovernorIntent
await aiGovernor.decideAction(context);    // Returns: { type: 'smite', position }
await playerGovernor.decideAction(context); // Returns: { type: 'smite', position }
```

### 2. DRY Principle
**Governor logic written ONCE:**
```typescript
class EcologyGovernor extends Governor {
  async managePredation(context: PreyContext) {
    // This code works for BOTH AI and Player
    const intent = await this.controller.requestAction('selectPrey', context);
    
    // Law-based validation (same for both)
    if (!LotkaVolterraLaw.canSustain(intent.target)) {
      throw new Error('Predation would collapse ecosystem');
    }
    
    // Execute (same for both)
    return this.executePredation(intent.target);
  }
}
```

### 3. Fair Competition
**Energy and laws enforced identically:**
```typescript
// AI tries to smite
await aiController.requestAction('smite', context);
// → Costs 1000 energy
// → LawSystem validates physics
// → EnergyLedger deducts

// Player tries to smite  
await playerController.requestAction('smite', context);
// → Costs 1000 energy (SAME)
// → LawSystem validates physics (SAME)
// → EnergyLedger deducts (SAME)
```

### 4. Extensible
**Easy to add new controller types:**
```typescript
// Multiplayer over network
class NetworkControllerAdapter implements ControllerAdapter {
  async provideInput(actionId, context) {
    return await this.socket.requestFromPlayer(actionId, context);
  }
}

// Replay system
class ReplayControllerAdapter implements ControllerAdapter {
  async provideInput(actionId, context) {
    return this.replayLog.getNextAction();
  }
}
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Governor (abstract)                     │
│  - Species assignment                                        │
│  - Territory                                                 │
│  - Energy budget reference                                   │
│  - decideAction(context) → Uses controller                   │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              ControllerCoprocessor (strategy)                │
│  - LawSystem integration                                     │
│  - GovernorEnergyLedger integration                          │
│  - requestAction(actionId, context) → GovernorIntent         │
│    1. Validate laws                                          │
│    2. Check energy                                           │
│    3. Delegate to adapter                                    │
│    4. Deduct energy                                          │
│    5. Return intent                                          │
└─────────────────────────────┬───────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│  AIControllerAdapter     │    │ PlayerControllerAdapter  │
│  - YUKA entity ref       │    │ - UI reference           │
│  - Steering behaviors    │    │ - Input handlers         │
│  - Decision trees        │    │ - Visual feedback        │
│  - Autonomous logic      │    │ - Async user input       │
│                          │    │                          │
│  provideInput() →        │    │ provideInput() →         │
│    Use YUKA to decide    │    │    Show UI, wait input   │
└──────────────────────────┘    └──────────────────────────┘
```

---

## Interface Contracts

### GovernorActionPort
```typescript
interface GovernorActionPort {
  requestAction(
    actionId: GovernorActionId,
    context: ActionContext
  ): Promise<GovernorIntent>;
}

type GovernorActionId = 
  | 'smitePredator'      // Lightning strike (costs 1000 energy)
  | 'nurtureFood'        // Increase food (costs 500 energy)
  | 'shapeTerrain'       // Alter landscape (costs 2000 energy)
  | 'applyPressure'      // Environmental stress (costs 750 energy)
  | 'selectPrey'         // Choose hunt target (free, but opportunity cost)
  | 'formAlliance'       // Mutualism with other species (costs 300 energy)
  | 'migrate'            // Move species (costs 1500 energy);
```

### ControllerAdapter
```typescript
interface ControllerAdapter {
  provideInput(
    actionId: GovernorActionId,
    context: ActionContext
  ): Promise<GovernorIntent>;
  
  // Optional telemetry
  onActionStart?(actionId: string): void;
  onActionComplete?(intent: GovernorIntent): void;
}
```

### GovernorIntent
```typescript
type GovernorIntent = {
  type: GovernorActionId;
  target?: Species | Position | Terrain;
  magnitude?: number;  // Law-constrained intensity
  duration?: number;   // How long effect lasts
  metadata?: {
    reasoning?: string; // AI: decision tree path, Player: user note
  };
};
```

---

## Implementation Priority

### Phase 1: Core Abstraction
1. **GovernorActionPort interface** - Define action contract
2. **ControllerCoprocessor class** - Implement strategy pattern
3. **GovernorIntent types** - Standardized action results

### Phase 2: Adapters
4. **AIControllerAdapter** - Wrap existing YUKA behaviors
5. **PlayerControllerAdapter** - UI prompt system
6. **Adapter tests** - Verify both return equivalent intents

### Phase 3: Integration
7. **Refactor YukaGovernorBase** - Use ControllerCoprocessor
8. **Create PlayerGovernor** - Use same base, different adapter
9. **Wire to HUD** - PlayerControllerAdapter → UI components

### Phase 4: Enforcement
10. **LawSystem integration** - Validate ALL actions at coprocessor
11. **GovernorEnergyLedger** - Track spend for both adapters
12. **Parity tests** - Prove AI and Player have identical capabilities

---

## Example Usage

### AI Governor (Autonomous)
```typescript
const yukaGovernor = new EcologyGovernor(
  species: speciesA,
  controller: new ControllerCoprocessor(
    adapter: new AIControllerAdapter(yukaEntity),
    lawSystem,
    energyLedger
  )
);

// YUKA makes decision autonomously
await yukaGovernor.managePredation();
// → AIAdapter uses steering behaviors
// → Returns: { type: 'selectPrey', target: speciesB }
```

### Player Governor (Human Input)
```typescript
const playerGovernor = new EcologyGovernor(
  species: playerSpecies,
  controller: new ControllerCoprocessor(
    adapter: new PlayerControllerAdapter(uiManager),
    lawSystem,
    energyLedger
  )
);

// Player makes decision via UI
await playerGovernor.managePredation();
// → PlayerAdapter shows UI: "Select prey species"
// → Returns: { type: 'selectPrey', target: speciesC }
```

### Identical Downstream Logic
```typescript
// SAME CODE for both AI and Player
class EcologyGovernor {
  async managePredation() {
    // Get intent (AI or Player, doesn't matter)
    const intent = await this.controller.requestAction('selectPrey', {
      availablePrey: this.getNearbyPrey()
    });
    
    // Validate law (SAME for both)
    if (!LotkaVolterraLaw.validatePredation(intent.target)) {
      throw new Error('Predation would violate ecological law');
    }
    
    // Execute (SAME for both)
    return this.executePredation(intent.target);
  }
}
```

---

## UI/UX Integration (PlayerControllerAdapter)

### Design System Connection

**PlayerControllerAdapter is WHERE we build the governor UI** according to DESIGN.md:

```typescript
class GovernorUIManager {
  // Material-UI components with DESIGN.md styling
  
  async showGovernorPowerPanel(): Promise<void> {
    return (
      <Card sx={{
        background: '#4A5568',  // Ebb Indigo
        borderRadius: '20px',
        padding: '24px',
      }}>
        <Typography variant="h4" sx={{ 
          fontFamily: 'Playfair Display',  // DESIGN.md: Titles
          color: '#F7FAFC' 
        }}>
          Governor Powers
        </Typography>
        
        <EnergyBudget current={800} max={1000} />
        
        <GovernorActionButton
          icon={<LightningIcon />}  // Generated asset
          label="Smite Predators"
          cost={1000}
          color="#ED8936"  // Warning Orange
          onClick={() => this.requestSmite()}
        />
        
        <GovernorActionButton
          icon={<PlantIcon />}  // Generated asset
          label="Nurture Food"
          cost={500}
          color="#48BB78"  // Success Green
          onClick={() => this.requestNurture()}
        />
      </Card>
    );
  }
}
```

### Visual Assets to Generate

**Using image generation tool for governor UI:**

1. **Governor Power Icons** (icon category)
   - Lightning bolt (smite) - Warning Orange theme
   - Growing plant (nurture) - Success Green theme
   - Terrain shaper (shape) - Haptic Blue theme
   - Pressure wave (pressure) - Pollution Red theme

2. **Splash Screen** (splash category)
   - Primordial soup → Civilization ascent
   - Ebb Indigo background with Bloom Emerald accents
   - Atmospheric, evolutionary theme

3. **UI Decorative Elements** (hud category)
   - Energy bar ornate frame (Trait Gold)
   - Governor panel parchment background
   - Species lineage tree decorative scroll

4. **Buttons & Banners** (banner category)
   - "Begin Evolution" CTA button
   - "Generation X Complete" banner
   - "Transcendence Achieved" victory banner

### Material-UI Component Mapping

**DESIGN.md → Material-UI:**
```typescript
// Color Palette (from DESIGN.md)
const theme = createTheme({
  palette: {
    primary: {
      main: '#38A169',  // Bloom Emerald
    },
    secondary: {
      main: '#4A5568',  // Ebb Indigo
    },
    warning: {
      main: '#ED8936',  // Warning Orange
    },
    success: {
      main: '#48BB78',  // Success Green
    },
  },
  typography: {
    h1: { fontFamily: 'Playfair Display' },  // Titles
    body1: { fontFamily: 'Inter' },          // UI text
    code: { fontFamily: 'JetBrains Mono' },  // Data
  },
});

// Governor Power Button Component
const GovernorActionButton = ({ icon, label, cost, color, onClick }) => (
  <Button
    startIcon={icon}  // Generated image asset
    sx={{
      background: color,
      color: '#F7FAFC',
      borderRadius: '10px',
      padding: '12px 24px',
      '&:hover': {
        background: adjustBrightness(color, 0.8),
      },
    }}
    onClick={onClick}
  >
    {label}
    <Chip label={`-${cost} Energy`} size="small" />
  </Button>
);
```

### Haptic Feedback (Mobile)

**From DESIGN.md haptic language:**
```typescript
class PlayerControllerAdapter {
  async showPositionPicker(config) {
    // Haptic feedback on action
    if (isMobile()) {
      switch(config.actionType) {
        case 'smite':
          Haptics.impact({ style: ImpactStyle.Heavy });  // Sharp impact
          break;
        case 'nurture':
          Haptics.notification({ type: NotificationType.Success });  // Gentle pulse
          break;
      }
    }
    
    // Visual feedback for all platforms
    return await this.uiManager.showPicker(config);
  }
}
```

---

## Why This is Critical

**Without ControllerCoprocessor:**
- Player and AI have different code paths
- Different bugs, different behaviors
- No guarantee of parity
- Violates DRY principle

**With ControllerCoprocessor:**
- ✅ Governor logic written ONCE
- ✅ AI and Player use SAME code paths
- ✅ Laws enforced IDENTICALLY
- ✅ Energy costs IDENTICAL
- ✅ TRUE competitive parity
- ✅ Easy to test (mock adapter)
- ✅ Easy to extend (new adapter types)

---

**This is the missing piece for fair governor competition.**

Player and YUKA must be truly equivalent - same capabilities, same constraints, same action space. The ControllerCoprocessor abstraction layer is how we achieve that.
