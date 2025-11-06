# Splash Screen & Intro Assets - Ebb & Bloom

## Available Assets

### Play-Once Variants (2)
**Type**: Video/Animation sequences
**Purpose**: Dynamic intro experience on first launch
**Location**: `/public/splash/` or `/public/intro/`

**Recommended Names**:
- `intro-animation-v1.[mp4|webm|gif]`
- `intro-animation-v2.[mp4|webm|gif]`

**Usage**:
- Play on first app launch
- Skip button after 2-3 seconds
- Transition to catalyst creator
- Store "seen" flag in localStorage

### Still Renders (4)
**Type**: Static images
**Purpose**: Splash screens during loading, app restart
**Location**: `/public/splash/`

**Recommended Names**:
- `splash-variant-1.[png|jpg|webp]`
- `splash-variant-2.[png|jpg|webp]`
- `splash-variant-3.[png|jpg|webp]`
- `splash-variant-4.[png|jpg|webp]`

**Usage**:
- Loading screen
- Quick splash on subsequent launches
- Randomly cycle through variants
- Potential for playstyle-based selection (Harmony/Conquest/Frolick)

## Integration Plan (Stage 2 UX Polish)

### 1. Capacitor Splash Screen
```typescript
// capacitor.config.ts
export default {
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#000000",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false,
    }
  }
}
```

### 2. Vue Intro Component
```vue
<!-- src/views/Intro.vue -->
<template>
  <div class="intro-screen">
    <video v-if="shouldShowAnimation" autoplay @ended="onAnimationEnd">
      <source :src="animationSrc" type="video/mp4">
    </video>
    <img v-else :src="splashSrc" alt="Ebb & Bloom">
    <button v-if="canSkip" @click="skip">Skip</button>
  </div>
</template>
```

### 3. Router Integration
```typescript
// src/router/index.ts
const routes = [
  {
    path: '/',
    redirect: () => {
      const hasSeenIntro = localStorage.getItem('hasSeenIntro');
      return hasSeenIntro ? '/home' : '/intro';
    }
  },
  {
    path: '/intro',
    component: () => import('@/views/Intro.vue')
  },
  // ... existing routes
];
```

## Asset Specifications

### Play-Once Animations
- **Duration**: 5-10 seconds max
- **Format**: MP4 (H.264) or WebM
- **Resolution**: 1080x1920 (portrait) or 1920x1080 (landscape)
- **File Size**: < 5MB each (keep APK lean!)
- **Fallback**: Static image if video fails to load

### Still Renders
- **Format**: WebP (preferred) or PNG/JPG
- **Resolution**: 1080x1920 (portrait)
- **File Size**: < 500KB each
- **Optimization**: Use responsive images, optimize for mobile

## Playstyle Integration (Future Enhancement)

Once behavior system tracks playstyle, we can select splash variant:
- **Harmony**: Serene, flowing, blues/greens
- **Conquest**: Dynamic, intense, reds/oranges
- **Frolick**: Playful, whimsical, rainbow/pastels
- **Neutral**: Cycle through all 4 variants

## Implementation Checklist

### Phase 1: Basic Integration
- [ ] Place assets in `/public/splash/` and `/public/intro/`
- [ ] Create `Intro.vue` component
- [ ] Add Capacitor SplashScreen config
- [ ] Implement first-launch detection
- [ ] Add skip button functionality

### Phase 2: Polish
- [ ] Optimize video/image sizes
- [ ] Add loading states
- [ ] Implement smooth transitions
- [ ] Add haptic feedback on splash tap
- [ ] Test on various screen sizes

### Phase 3: Playstyle Integration
- [ ] Track playstyle in localStorage
- [ ] Select splash based on behavior
- [ ] Implement variant cycling logic
- [ ] A/B test animation vs static preference

## Technical Notes

### Video Format Considerations
- **MP4 (H.264)**: Best compatibility, widely supported
- **WebM (VP9)**: Better compression, not all Android devices
- **Recommendation**: Provide both formats with MP4 fallback

### Loading Strategy
```typescript
// Preload splash assets
const preloadSplash = () => {
  const img = new Image();
  img.src = '/splash/splash-variant-1.webp';
  
  const video = document.createElement('video');
  video.src = '/intro/intro-animation-v1.mp4';
  video.load();
};
```

### Performance Impact
- **Static Splash**: ~0ms additional load time
- **Video Intro**: ~500-1000ms (acceptable for first launch)
- **Total APK Impact**: ~6-10MB (still under 15MB target)

## Design Guidelines

From [VISION.md](../docs/VISION.md):

**Design Pillars to Reflect**:
1. **Intimate Scale**: Show single world, not universe
2. **Tidal Rhythm**: Ebb & Bloom motion/colors
3. **Touch as Poetry**: Hint at gesture controls
4. **Evolutionary Memory**: Suggest trait inheritance
5. **Mobile-First**: Portrait orientation, touch-friendly

**Color Palette**:
- **Ebb**: Indigo depths (#4a90e2), void blacks
- **Bloom**: Emerald growth (#7ed321), life yellows
- **Harmony**: Soft blues, greens
- **Conquest**: Rust reds, ember oranges
- **Frolick**: Rainbow pastels, whimsy pinks

## Links

- [VISION.md](../docs/VISION.md) - Design philosophy
- [DEVELOPMENT.md](../docs/DEVELOPMENT.md) - Implementation guide
- [Stage 2 UX Polish](../memory-bank/PROGRESS_ASSESSMENT.md) - Implementation priority

---

**Status**: Assets available, integration planned for Stage 2  
**Priority**: HIGH (part of UX polish to fix "clunky" flow)  
**Estimated Work**: 1-2 days  
**Dependencies**: None (can start immediately)

---

*Last Updated: 2025-11-06*  
*Next: Place assets in project, begin Intro.vue implementation*
