# 🏗️ Android Build Assets (Temporary)

## ⚠️ DEVELOPMENT ONLY

This directory (`packages/game/android/`) is **TEMPORARILY UNIGNORED** to prove build viability.

### What's Here
- Capacitor Android project structure
- Gradle build files
- APK output: `app/build/outputs/apk/debug/app-debug.apk` (5.7 MB)
- Build intermediates (splash screens, icons, etc.)

### Why Commit This?
During active development, we need to:
1. **Prove the Android build works** across different machines
2. **Share the APK** with testers without external hosting
3. **Track Capacitor config changes** that affect builds
4. **Document Java 21 requirement** in gradle files

### After Stabilization
Once the build is proven stable:
1. ✅ Re-enable `.gitignore` blocking for `android/`
2. ✅ Host APK on GitHub Releases instead
3. ✅ Keep only `capacitor.config.ts` tracked
4. ✅ Use CI/CD (GitHub Actions) to build APKs

### Current Status
- ✅ APK builds successfully with Java 21
- ✅ 5.7 MB debug build
- ✅ All Capacitor plugins included
- ⏳ Pending device testing

### Build Instructions
```bash
# Prerequisites: Java 21
cd packages/game

# Build web assets
pnpm build

# Sync to Android
npx cap sync android

# Build APK
cd android
./gradlew assembleDebug

# Output: app/build/outputs/apk/debug/app-debug.apk
```

### Clean Up Later
```bash
# When ready to gitignore again:
echo "android/" >> .gitignore
echo "build/" >> .gitignore
git rm -r --cached packages/game/android/
```

**For now: This proves we can build! 🎉**
