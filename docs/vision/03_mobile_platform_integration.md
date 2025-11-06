# Stage 03: Mobile Platform Integration

**Lines**: 1200-1800 (GitHub Pages evaluation → Capacitor/Ionic commitment)  
**Key Evolution**: Web prototype → Native mobile experience

---

## The Pivot Question

USER asks: **"Valid question BUT are we crippling the game needlessly with GitHub Pages? Is this kind of sexiness BUILT for capacitor and android / web?"**

This stage represents the critical architectural decision to NOT limit the game to GitHub Pages, but instead embrace a **hybrid mobile-first** architecture.

---

## Decision: Hybrid Mobile Architecture

### GitHub Pages (MVP Foundation)
**Strengths**:
- Lightning prototyping - push code, instant playable
- Zero-cost deploys, instant URL shares
- Cross-platform freebie (desktop, mobile, PWA)
- Perfect for AI handoff chain
- Procedural gen (Perlin + BitECS) works great

**Pain Points**:
- No native haptics (vibrate on snap)
- Offline caching quirks (service worker finicky)
- No battery optimizations
- Discovery drought (no app store presence)
- Hard to monetize

### Capacitor Solution
**Hybrid Heaven**:
- Web app becomes native shell (APK/IPA in minutes)
- Plugins unlock native features:
  - File I/O for bigger saves
  - Geolocation for real-world seed gen
  - AR previews potential
  - Native haptic feedback
- **NO REWRITE** - same HTML/JS/CSS
- Better IndexedDB wrappers for offline
- Google Play/App Store distribution
- PWA mode as web fallback

**Performance Wins**:
- 120FPS bursts vs browser 60FPS cap
- Better ECS query performance on mobile
- Native memory management

---

## Ionic Framework Integration

### Why Ionic Over Raw Capacitor
- **Mobile-first UI polish**: Touch-optimized modals, swipeable toolbars
- **Gesture system**: Swipe to terraform, pinch to zoom
- **Theming magic**: Dark/light modes that tint with pollution
- **Component library**: Bottom sheets, fab buttons, progress bars
- **~50KB minified** - lightweight, CDN-friendly
- **Phaser embeds seamlessly** in `<ion-content>`
- **PWA-to-App bridge** - enhances Pages MVP

### Three Framework Options Explored

#### Option 1: Stencil (Ionic vanilla)
- Pure web components
- No framework lock-in
- Import via CDN

#### Option 2: **Ionic Vue** (CHOSEN)
- Perfect pairing with Vue 3 composition API
- Reactive state management
- Component library integration
- TypeScript support

#### Option 3: Ionic Angular/React
- Heavier frameworks
- More boilerplate
- Not chosen for this project

---

## State Management Decision

### Two Candidates

#### Pinia (First Introduced)
**Pros**:
- Official Vue state library
- DevTools integration
- Plugin ecosystem
- TypeScript-first

**Implementation**:
```ts
// stores/game.ts
export const useGameStore = defineStore('game', () => {
  const pollution = ref(0);
  const behavior = ref({ harmony: 0.3, conquest: 0.3, frolick: 0.4 });
  
  const performSnap = async (aff1, aff2) => {
    // ... snap logic
    await Haptics.impact({ style: 'light' });
  };
  
  return { pollution, behavior, performSnap };
});
```

#### Zustand (Alternative Discussed)
**Pros**:
- Minimalist (1KB)
- No boilerplate
- Provider-free
- Framework agnostic

**Implementation**:
```ts
export const useGame = create<GameStore>((set, get) => ({
  pollution: 0,
  performSnap: async (aff1, aff2) => {
    // ... snap logic
    await Haptics.impact({ style: 'light' });
  }
}));
```

**CRITICAL NOTE**: Conversation discussed BOTH options, but actual implementation chose **Pinia**

---

## Mobile UX Enhancements

### Touch Interactions
- **Swipe to terraform**: Directional gestures change biomes
- **Long-press to inspect**: Tile affinity tooltips
- **Pinch-zoom**: World navigation
- **Tap to harvest**: Proximity-based resource gathering

### Ionic Components Integration

#### Creator Modal
```vue
<ion-modal>
  <ion-content>
    <ion-title>Design Your Catalyst</ion-title>
    <canvas id="editor"></canvas>
    <ion-button>Chainsaw Arms</ion-button>
    <ion-button>Flipper Feet</ion-button>
  </ion-content>
</ion-modal>
```

#### Status Toolbar (Bottom)
```vue
<ion-toolbar slot="bottom" color="dark">
  <ion-title>Pollution: {{ pollution }}</ion-title>
  <ion-label>Style: {{ maxStyle }}</ion-label>
</ion-toolbar>
```

#### World Canvas Embed
```vue
<ion-content fullscreen>
  <div id="game-container">
    <canvas id="world"></canvas>
  </div>
</ion-content>
```

### Haptic Feedback
- **Light tap**: Resource snap success
- **Medium impact**: Trait evolution
- **Heavy rumble**: Shock event (70% pollution)
- **Pattern vibrations**: Pack quest completion

---

## Technical Architecture

### Stack Evolution
**Before (Web-only)**:
```
GitHub Pages
  ↓
Canvas2D / Phaser
  ↓
BitECS + YukaJS
  ↓
IndexedDB
```

**After (Hybrid)**:
```
Capacitor Native Shell
  ↓
Ionic Vue Components
  ↓
Phaser 3 (Canvas renderer)
  ↓
BitECS + YukaJS
  ↓
Pinia State Management
  ↓
Native Plugins (Haptics, Filesystem, etc.)
```

### Project Structure
```
evo-forge/
├── capacitor.config.ts
├── src/
│   ├── views/
│   │   ├── Home.vue        # Phaser game embed
│   │   ├── Creator.vue     # Trait allocation
│   │   └── Log.vue         # Snap history
│   ├── stores/
│   │   └── game.ts         # Pinia state
│   ├── game/
│   │   ├── core.js         # BitECS init
│   │   ├── world.js        # Procedural gen
│   │   ├── ecosystem.js    # Yuka critters
│   │   └── permutations.js # Snap logic
│   └── main.ts
├── android/
└── ios/
```

### Build & Deploy
```bash
# Web development
npm run dev

# Build for Capacitor
npm run build
npx cap sync

# Run on Android
npx cap run android

# Deploy to GitHub Pages (web fallback)
npm run build
gh-pages -d dist
```

---

## Monetization Strategy

### Free Web Tier
- Full game on GitHub Pages
- PWA installable
- Community seed sharing

### Premium Mobile ($1.99)
- Native app (Google Play / App Store)
- Exclusive "apex traits" pack
- Offline save sync
- Premium haptic patterns
- Ad-free

### Optional Ads
- Capacitor ad plugins for conquest modes
- Rewarded video for Evo Point boost

---

## Key Design Decisions

1. **Hybrid over native**: Keep JS ecosystem (BitECS/Yuka)
2. **Ionic Vue over vanilla**: Component library + reactivity
3. **Pinia over Zustand**: Official Vue integration (though both discussed)
4. **Capacitor plugins**: Native features without rewrite
5. **Phaser Canvas mode**: Works in both web and native
6. **Touch-first design**: Gestures as primary input
7. **Haptic feedback**: Core to mobile experience
8. **Dual deployment**: Web (Pages) + Mobile (stores)

---

## Advanced Mobile Features (Future)

### Geolocation Integration
- Real-world GPS coordinates seed world generation
- "Evolve where you walk"
- AR preview potential

### Pack Quest System
**Introduced as mobile-native feature**:
- Maturity + loyalty mechanics
- Dispatch packs on missions
- Success/failure with consequences
- Redemption arcs for failed quests

---

## What's Still Open

- iOS specific UI/UX polish
- Android back button handling
- Push notifications for shock events
- Cloud save sync (Firebase?)
- Multiplayer seed sharing
- AR creature preview

---

**Next Stage**: State management deep dive and pack quest mechanics refinement
