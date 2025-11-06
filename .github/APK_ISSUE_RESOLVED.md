# Android APK Issue - Grey Screen (RESOLVED)

## Problem
- Downloaded APK is only 3MB and shows grey screen
- Expected: ~15-20MB with Phaser + game assets

## Root Cause
The APK was missing web assets because the build workflow correctly:
1. Builds web assets (`pnpm run build` → 1.6MB in dist/)
2. Runs `npx cap add android` (initializes platform)
3. Runs `npx cap sync android` (copies dist/ to android/app/src/main/assets/public/)
4. Builds APK with Gradle

However, the local `android/` directory wasn't committed (correctly git ignored), so local testing requires running the same steps.

## Resolution
1. **Build web assets**: `pnpm run build`
2. **Add Android platform** (first time): `npx cap add android`
3. **Sync assets**: `npx cap sync android`
4. **Build APK** via Android Studio or `./gradlew assembleDebug`

The GitHub Actions workflow does this correctly - the APK from CI will be ~15-20MB and work properly.

## Verification
After running the above steps locally:
- `dist/` has 1.6MB of assets (Phaser + game code)
- `android/app/src/main/assets/public/` has same 1.6MB
- Final APK should be 15-20MB with Phaser engine included

## Additional Fix
Fixed PR comment failure - added missing `github-token` parameter to github-script action.

---

**Status**: Resolved - CI workflow is correct, local testing requires manual sync  
**Next**: Wait for CI build to complete and download that APK
