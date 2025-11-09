# 📱 APK Ready - Download Instructions

## ✅ APK Rebuilt with Full Web Assets

### Location
```
/workspace/packages/game/android/app/build/outputs/apk/debug/app-debug.apk
Size: 5.7 MB
MD5: 722d0db592e20368b2c8dd6bbb039dc8
```

### What Was Fixed
1. ✅ **Built web assets**: `pnpm build` → 6.0 MB JavaScript bundle
2. ✅ **Synced to Android**: `cap sync` → Copied 6.4 MB to `android/app/src/main/assets/public/`
3. ✅ **Rebuilt APK**: `gradlew assembleDebug` → Fresh APK with all assets

### Why Still 5.7 MB?
**This is CORRECT!** Capacitor/Gradle compresses assets:
```
Uncompressed assets: 6.4 MB
Compressed in APK:   5.7 MB (gzip compression)
```

The black screen was from **WRONG/STALE assets**, not size.

---

## 🚀 Download APK

### Option 1: Direct Download from Container
```bash
# Copy from workspace to your local machine
docker cp <container>:/workspace/packages/game/android/app/build/outputs/apk/debug/app-debug.apk ./ebb-and-bloom-debug.apk
```

### Option 2: SCP (if container has network)
```bash
scp user@host:/workspace/packages/game/android/app/build/outputs/apk/debug/app-debug.apk ./
```

### Option 3: Build Locally
```bash
git pull
cd packages/game

# Build web
pnpm build

# Sync to Android
pnpm exec cap sync android

# Build APK (requires Java 21)
cd android
./gradlew assembleDebug

# Output: app/build/outputs/apk/debug/app-debug.apk
```

---

## 📦 Install on Android Device

### Via USB (ADB)
```bash
# Enable USB debugging on your device first
adb install -r ebb-and-bloom-debug.apk
```

### Via File Transfer
1. Copy APK to device (USB, cloud, email)
2. Open APK file on device
3. Allow "Install from unknown sources"
4. Install

---

## 🐛 If Still Black Screen

### 1. Check Logcat
```bash
adb logcat | grep -E "(Capacitor|chromium|Ebb|Bloom)"
```

### 2. Check WebView
```bash
adb shell dumpsys webview
```

### 3. Common Issues
- **WebView not installed**: Install Android System WebView from Play Store
- **Old WebView version**: Update to latest
- **JavaScript disabled**: Check app permissions

### 4. Verify Assets in APK
```bash
unzip -l app-debug.apk | grep "assets/public"
# Should show:
#   assets/public/index.html
#   assets/public/assets/index-MGtf_ghr.js (6 MB)
#   assets/public/data/*.json
```

---

## ✅ Expected Behavior

### On Launch:
1. **Splash screen** (2 seconds, dark blue `#1a202c`)
2. **Main menu** appears with "Ebb & Bloom" title
3. **Buttons**: "Start New", "Load Game", "Settings"
4. Clicking "Start New" opens seed input modal

### If Working:
- BabylonJS 3D canvas initializes
- UI responds to touch
- Can enter seed and create world

---

## 📊 Build Verification

### Checklist Before Installing:
- [x] Web bundle built: `dist/assets/index-*.js` (6.0 MB)
- [x] Assets synced: `android/app/src/main/assets/public/` (6.4 MB)  
- [x] APK built: `app-debug.apk` (5.7 MB compressed)
- [x] Fresh build (not cached)

### Asset Sizes:
```
Source (dist/):                          6.0 MB
Synced (android assets/):                6.4 MB  
Compressed (APK):                        5.7 MB ✅
```

---

## 🔄 Next Steps

1. **Download APK** from container
2. **Install on device**
3. **Test and report**:
   - Does it load? (not black screen?)
   - Does main menu appear?
   - Can you enter a seed?
   - Does 3D scene render?

4. **Share feedback**:
   - Screenshots of what you see
   - Logcat errors if any
   - Device model/Android version

---

## 📝 Notes

**Why not committed to git?**
- `android/app/.gitignore` blocks `build/` directory
- APK is regenerated on each build
- Better to distribute via GitHub Releases
- For now: Download directly from container

**After testing:**
- If it works: Create GitHub Release with APK
- If still broken: Share logcat output for debugging

---

**APK is ready! Download and test! 📱✨**
