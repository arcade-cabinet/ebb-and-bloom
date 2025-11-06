# Asset Placement Instructions

## Where to Place Your Splash Screen Assets

### Play-Once Animation Variants (2 files)

**Location**: `/public/intro/`

**Recommended naming**:
```
/public/intro/
  ├── animation-v1.mp4        (or .webm)
  └── animation-v2.mp4        (or .webm)
```

**Specifications**:
- Format: MP4 (H.264) preferred, WebM as alternative
- Resolution: 1080x1920 (portrait) or 1920x1080 (landscape)
- Duration: 5-10 seconds max
- File size: < 5MB each (to keep APK lean)
- Fallback: Include a static thumbnail image

### Still Render Variants (4 files)

**Location**: `/public/splash/`

**Recommended naming**:
```
/public/splash/
  ├── splash-1.webp          (or .png/.jpg)
  ├── splash-2.webp
  ├── splash-3.webp
  └── splash-4.webp
```

**Specifications**:
- Format: WebP (preferred), PNG or JPG as fallback
- Resolution: 1080x1920 (portrait)
- File size: < 500KB each
- Optimization: Use image compression tools

## Quick Start

1. **Create directories** (already done):
   ```bash
   mkdir -p public/splash public/intro
   ```

2. **Copy your files**:
   ```bash
   # Copy animations
   cp /path/to/your/animation1.mp4 public/intro/animation-v1.mp4
   cp /path/to/your/animation2.mp4 public/intro/animation-v2.mp4
   
   # Copy still renders
   cp /path/to/your/splash1.png public/splash/splash-1.webp
   cp /path/to/your/splash2.png public/splash/splash-2.webp
   cp /path/to/your/splash3.png public/splash/splash-3.webp
   cp /path/to/your/splash4.png public/splash/splash-4.webp
   ```

3. **Optimize images** (recommended):
   ```bash
   # If you have imagemagick/cwebp installed
   for img in public/splash/*.png; do
     cwebp -q 80 "$img" -o "${img%.png}.webp"
   done
   ```

## Integration (Stage 2)

Once assets are in place, implementation will follow `/docs/SPLASH_SCREENS.md`:

1. Create `src/views/Intro.vue` component
2. Add Capacitor SplashScreen config
3. Implement router logic for first launch
4. Add skip button and transitions
5. Optimize loading and performance

## Design Guidelines

Your splash screens should reflect the game's design pillars:

**Ebb (Decay/Pollution)**:
- Colors: Indigo depths, void blacks
- Mood: Tension, transformation

**Bloom (Growth/Harmony)**:
- Colors: Emerald growth, life yellows  
- Mood: Serenity, hope

**Tidal Rhythm**:
- Suggest the back-and-forth of ebb and bloom
- Hint at evolutionary transformation
- Show single world, not multiple

**Touch-First**:
- Portrait orientation
- Minimal text
- Visual language of gestures

## Questions to Consider

1. **Which variants represent which playstyles?**
   - Harmony (serene, flowing)
   - Conquest (intense, dynamic)
   - Frolick (playful, whimsical)
   - Neutral/Universal

2. **Which animation for first launch?**
   - v1: More cinematic/story-driven?
   - v2: More gameplay-focused?

3. **Still renders cycling strategy?**
   - Random each launch?
   - Based on playstyle?
   - Sequential rotation?

---

**Next**: Place assets, then begin Intro.vue implementation in Stage 2 UX Polish sprint.

See [SPLASH_SCREENS.md](./SPLASH_SCREENS.md) for complete technical integration details.
