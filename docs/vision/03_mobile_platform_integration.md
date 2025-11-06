# Stage 03: Mobile Platform Integration

**Context from Chat Replay**: Lines 1200-1800 (GitHub Pages evaluation → Capacitor/Ionic commitment)  
**Key Evolution**: Web prototype → Native mobile experience

---

## Intent & Player Fantasy

Critical architectural decision to NOT limit the game to GitHub Pages, but instead embrace a **hybrid mobile-first** architecture. The game's "sexiness" is built for mobile—touch gestures, haptics, and intimate world connection demand native capabilities.

---

## Mechanics & Systems

### Decision: Hybrid Mobile Architecture

**GitHub Pages (MVP Foundation)**:
- ✅ Lightning prototyping - push code, instant playable
- ✅ Zero-cost deploys, instant URL shares
- ✅ Cross-platform freebie (desktop, mobile, PWA)
- ✅ Perfect for AI handoff chain
- ✅ Procedural gen (Perlin + BitECS) works great

**Pain Points**:
- ❌ No native haptics (vibrate on snap)
- ❌ Offline caching quirks (service worker finicky)
- ❌ No battery optimizations
- ❌ Discovery drought (no app store presence)
- ❌ Hard to monetize

**Capacitor Solution**:
- ✅ Web app becomes native shell (APK/IPA in minutes)
- ✅ Plugins unlock native features:
  - File I/O for bigger saves
  - Geolocation for real-world seed gen
  - AR previews potential
  - Native haptic feedback
- ✅ **NO REWRITE** - same HTML/JS/CSS
- ✅ Better IndexedDB wrappers for offline
- ✅ Google Play/App Store distribution
- ✅ PWA mode as web fallback

**Performance Wins**:
- 120FPS bursts vs browser 60FPS cap
- Better ECS query performance on mobile
- Native memory management

---

## Worldgen & Ecology

**Ionic Framework Integration**:
- **Mobile-first UI polish**: Touch-optimized modals, swipeable toolbars
- **Gesture system**: Swipe to terraform, pinch to zoom
- **Theming magic**: Dark/light modes that tint with pollution
- **Component library**: Bottom sheets, fab buttons, progress bars
- **~50KB minified** - lightweight, CDN-friendly
- **Phaser embeds seamlessly** in `<ion-content>`
- **PWA-to-App bridge** - enhances Pages MVP

**Three Framework Options Explored**:
1. **Stencil** (Ionic vanilla) - Pure web components, no framework lock-in
2. **Ionic Vue** (CHOSEN) - Perfect pairing with Vue 3 composition API
3. **Ionic Angular/React** - Heavier frameworks, not chosen

---

## Progression & Economy

**State Management Decision**:
- **Pinia** (First Introduced): Official Vue state library, DevTools integration
- **Zustand** (Alternative Discussed): Minimalist (1KB), no boilerplate
- **CRITICAL NOTE**: Conversation discussed BOTH options, but actual implementation chose **Pinia** (later switched to Zustand in current codebase)

---

## UX/Camera/Controls

**Touch Interactions**:
- **Swipe to terraform**: Directional gestures change biomes
- **Long-press to inspect**: Tile affinity tooltips
- **Pinch-zoom**: World navigation
- **Tap to harvest**: Proximity-based resource gathering

**Haptic Feedback**:
- **Light tap**: Resource snap success
- **Medium impact**: Trait evolution
- **Heavy rumble**: Shock event (70% pollution)
- **Pattern vibrations**: Pack quest completion

**Ionic Components Integration**:
- Creator Modal: `<ion-modal>` with reactive editor
- Status Toolbar: Bottom `<ion-toolbar>` with pollution/style
- World Canvas Embed: `<ion-content fullscreen>` wrapper

---

## Technical Direction

**Stack Evolution**:
```
Before (Web-only):
GitHub Pages
  ↓
Canvas2D / Phaser
  ↓
BitECS + YukaJS
  ↓
IndexedDB

After (Hybrid):
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

**Project Structure**:
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

---

## Scope/Constraints

**Mobile Perf**:
- Target 60FPS on mid-range Android
- <16.67ms frame time
- <150MB RAM
- <3s load time

**Build & Deploy**:
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

**Monetization Strategy**:
- Free Web Tier: Full game on GitHub Pages, PWA installable
- Premium Mobile ($1.99): Native app, exclusive traits, offline sync, premium haptics, ad-free
- Optional Ads: Capacitor ad plugins for conquest modes

---

## Decision Log

- ✅ **Hybrid over native**: Keep JS ecosystem (BitECS/Yuka)
- ✅ **Ionic Vue over vanilla**: Component library + reactivity
- ✅ **Pinia over Zustand**: Official Vue integration (though both discussed)
- ✅ **Capacitor plugins**: Native features without rewrite
- ✅ **Phaser Canvas mode**: Works in both web and native
- ✅ **Touch-first design**: Gestures as primary input
- ✅ **Haptic feedback**: Core to mobile experience
- ✅ **Dual deployment**: Web (Pages) + Mobile (stores)

---

## Open Questions

- iOS specific UI/UX polish
- Android back button handling
- Push notifications for shock events
- Cloud save sync (Firebase?)
- Multiplayer seed sharing
- AR creature preview

---

**Next Stage**: State management deep dive and pack quest mechanics refinement
