# 📦 Development Builds

This directory contains versioned APK builds for testing and distribution during development.

## Structure

```
dev-builds/
├── ebb-and-bloom-20251109-033045.apk  (timestamped build)
├── ebb-and-bloom-20251109-035122.apk  (timestamped build)
├── ebb-and-bloom-20251109-041503.apk  (timestamped build)
└── ebb-and-bloom-latest.apk           (symlink, gitignored)
```

## Why Track APKs in Git?

### ✅ Benefits
1. **Version History** - See how the app evolved over time
2. **Bisect Bugs** - Find when a bug was introduced by testing old APKs
3. **Regression Testing** - Compare behavior across builds
4. **Artifact Preservation** - APKs survive even if CI fails
5. **Easy Distribution** - Team members can download any build from git
6. **Build Proof** - Demonstrates the app actually builds and works

### ⚠️ Considerations
- APKs are ~6-7 MB each (compressed)
- Git LFS not needed for this size
- Clean old builds periodically: `just clean-old-builds`

## Build Process

### Automatic (via justfile)
```bash
just build-android
# Creates: dev-builds/ebb-and-bloom-YYYYMMDD-HHMMSS.apk
#      and dev-builds/ebb-and-bloom-latest.apk (gitignored)
```

### Manual
```bash
cd packages/game
pnpm build
pnpm exec cap sync android
cd ../../android
./gradlew assembleDebug
mkdir -p ../dev-builds
cp app/build/outputs/apk/debug/app-debug.apk ../dev-builds/ebb-and-bloom-$(date +%Y%m%d-%H%M%S).apk
```

## Installing

### Latest Build
```bash
just install-apk
# Installs: dev-builds/ebb-and-bloom-latest.apk
```

### Specific Build
```bash
adb install -r dev-builds/ebb-and-bloom-20251109-033045.apk
```

## Naming Convention

```
ebb-and-bloom-YYYYMMDD-HHMMSS.apk

Examples:
ebb-and-bloom-20251109-033045.apk  → Nov 9, 2025 @ 3:30:45 AM
ebb-and-bloom-20251215-143022.apk  → Dec 15, 2025 @ 2:30:22 PM
```

**Timestamp = UTC**

## Build History

Each APK represents a working build at that point in time. Use `git log` to see what changed:

```bash
git log --oneline dev-builds/
# Shows commits that added new APKs
```

## Cleanup

### Remove Old Builds (keep last 10)
```bash
just clean-old-builds
```

### Manual Cleanup
```bash
cd dev-builds
ls -t ebb-and-bloom-*.apk | tail -n +11 | xargs rm
# Keeps 10 most recent builds
```

## Distribution

### Via Git
```bash
# Team member checks out repo
git clone <repo>
cd dev-builds
adb install -r ebb-and-bloom-latest.apk
```

### Via GitHub Releases
```bash
# For major milestones, create releases
gh release create v0.1.0 dev-builds/ebb-and-bloom-20251109-033045.apk
```

## Testing Workflow

1. **Build**: `just build-android`
2. **Test**: Install on device, verify functionality
3. **Commit**: `git add dev-builds/ebb-and-bloom-*.apk`
4. **Document**: Note what changed in commit message
5. **Repeat**: Next build creates new timestamped APK

## Git LFS (Future)

If APKs grow large (>10 MB):
```bash
git lfs track "dev-builds/*.apk"
```

For now, ~6 MB APKs are fine in standard git.

---

**Last Updated**: 2025-11-09  
**Current Size**: ~6-7 MB per APK  
**Tracking**: Enabled (timestamped builds committed)
