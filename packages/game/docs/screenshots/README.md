# 📸 Screenshots for Viability Proof

## Purpose
These screenshots prove the game builds and runs on real devices during development.

**TEMPORARY**: Once the architecture is proven stable, these will be moved to releases or removed.

## What to Include

### ✅ SHOULD COMMIT (During Development)
1. **Simulation Mode Screenshots**
   - Text reports showing universe generation
   - Population graphs
   - Event logs (extinctions, catastrophes)
   - Different seeds demonstrating determinism

2. **Android APK Screenshots**
   - App running on real device
   - UI rendering correctly
   - Touch interactions working
   - WebGL rendering functioning

3. **Web Build Screenshots**
   - Browser compatibility (Chrome, Firefox, Safari)
   - Desktop vs mobile layouts
   - Performance metrics

4. **Law-Based Generation Proof**
   - Same seed → same universe (determinism)
   - Statistical distributions (normal, Poisson, etc.)
   - Population dynamics graphs
   - Extinction events

### ❌ DON'T COMMIT
- Repeated test screenshots
- Debug views
- Personal device info
- Large video files (use external hosting)

---

## Screenshot Naming Convention

```
YYYY-MM-DD_feature_platform_detail.png

Examples:
2025-11-08_simulation_universe-gen_wild-ocean-glow.png
2025-11-08_android_main-menu_pixel6.png
2025-11-08_web_population-graph_chrome.png
2025-11-08_determinism_same-seed-proof.png
```

---

## Current Screenshots

### 2025-11-08: Initial Build Proof
- [ ] Simulation mode: Universe generation
- [ ] Simulation mode: Population graph
- [ ] Android: App installed and running
- [ ] Web: Localhost rendering

**TODO**: Add screenshots after testing!

---

## After Development Phase

Once the system is proven stable:
1. Move screenshots to GitHub Releases
2. Re-enable `.gitignore` blocking for `*.png`, `*.mp4`
3. Keep only essential architecture diagrams in docs/

**For now**: Commit screenshots to prove viability! 🚀
