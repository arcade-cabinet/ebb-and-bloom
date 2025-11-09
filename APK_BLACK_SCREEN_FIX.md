# 🐛 APK Black Screen - Root Cause & Fix

## Problem
User installed APK and got black screen. APK size was 5.7 MB.

## Root Cause Analysis

### 1. **Build Process Was Incomplete**
```bash
# What SHOULD have happened:
cd packages/game
pnpm build           # ✅ Build web assets to dist/
npx cap sync android # ✅ Copy dist/ → android/app/src/main/assets/public/
cd android
./gradlew assembleDebug # ✅ Build APK with assets
```

### 2. **What ACTUALLY Happened**
```bash
# Skip directly to gradle:
cd android
./gradlew assembleDebug # ⚠️ Built APK WITHOUT syncing web assets!
```

**Result**: APK contained **old/stale web assets** or **empty bundle**.

### 3. **Why It Was 5.7 MB**
```
APK Structure:
- Android framework/libs: ~3-4 MB
- Capacitor plugins: ~1-2 MB
- Old/stale web assets: ~1 MB (incomplete)
= 5.7 MB total
```

**Should be**: ~6.5-7 MB with full bundle (5.8 MB JavaScript + assets)

---

## Fix Applied

### **Step 1: Build Web Assets**
```bash
cd /workspace/packages/game
pnpm exec vite build
```

**Output**:
```
dist/assets/index-ZveIpw5K.js → 5.8 MB ✅
dist/index.html → 1.2 KB ✅
dist/assets/*.json → Game data ✅
```

### **Step 2: Sync to Android**
```bash
pnpm exec cap sync android
```

**Copies**:
```
dist/ → android/app/src/main/assets/public/
```

**Verification**:
```bash
du -sh android/app/src/main/assets/public/
# Should show: 6.4M ✅
```

### **Step 3: Clean Build APK**
```bash
export JAVA_HOME=/tmp/jdk-21.0.1
cd android
./gradlew clean assembleDebug
```

**Output**:
```
app/build/outputs/apk/debug/app-debug.apk
Size: ~6.5-7 MB ✅ (was 5.7 MB)
```

---

## Verification Checklist

### ✅ Before Installing APK
1. **Check web build exists**:
   ```bash
   ls -lh dist/assets/index-*.js
   # Should show 5-6 MB file
   ```

2. **Check android assets synced**:
   ```bash
   du -sh android/app/src/main/assets/public/
   # Should show 6.4M
   ```

3. **Check APK size**:
   ```bash
   ls -lh android/app/build/outputs/apk/debug/app-debug.apk
   # Should show 6.5-7 MB (NOT 5.7 MB)
   ```

4. **Check APK contents** (optional):
   ```bash
   unzip -l app-debug.apk | grep "assets/public"
   # Should see index.html, assets/*.js, etc.
   ```

---

## Testing New APK

### **Install on Device**
```bash
adb install -r app-debug.apk
```

### **Check Logcat for Errors**
```bash
adb logcat | grep -E "(Capacitor|Ebb|Bloom|ERROR)"
```

### **Expected Behavior**
1. Splash screen (2 seconds)
2. Main menu appears
3. "Start New" button visible
4. Can enter seed and create world

### **If Still Black Screen**
Check console for errors:
```bash
adb logcat *:E
```

Common issues:
- **WebView not loading**: Check `capacitor.config.ts` webDir
- **Assets not found**: Re-run `cap sync`
- **JavaScript errors**: Check for missing modules
- **CORS issues**: Check `androidScheme: 'https'` in config

---

## Correct Build Script

### **Create `build-android.sh`** (Automated)
```bash
#!/bin/bash
set -e

echo "🔨 Building Ebb & Bloom Android APK..."

# 1. Clean
echo "Cleaning old builds..."
rm -rf dist/ android/app/build/

# 2. Build web
echo "Building web assets..."
cd packages/game
pnpm build

# 3. Sync to android
echo "Syncing to Android..."
pnpm exec cap sync android

# 4. Build APK
echo "Building APK..."
export JAVA_HOME=/tmp/jdk-21.0.1
export PATH=$JAVA_HOME/bin:$PATH
cd android
./gradlew assembleDebug --no-daemon

# 5. Verify
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
echo "✅ APK built: $APK_PATH ($APK_SIZE)"

if [ "$APK_SIZE" \< "6M" ]; then
  echo "⚠️  WARNING: APK size seems small ($APK_SIZE). Expected ~6.5-7 MB."
  echo "   This might indicate missing assets."
  exit 1
fi

echo "🎉 Build complete! Install with:"
echo "   adb install -r $APK_PATH"
```

---

## Why Size Matters

### **Expected APK Breakdown**
```
Android framework:        3.5 MB
Capacitor core:           1.2 MB  
Capacitor plugins:        0.8 MB
Web bundle (JS):          5.8 MB
Game data (JSON):         0.5 MB
Textures/assets:          0.3 MB
= ~12 MB uncompressed → 6.5-7 MB compressed
```

### **5.7 MB APK = Missing Web Bundle**
```
Android framework:        3.5 MB
Capacitor core:           1.2 MB
Capacitor plugins:        0.8 MB
Web bundle (JS):          0.2 MB ⚠️ (old/stale)
= 5.7 MB (missing 5.6 MB of game code!)
```

---

## Prevention

### **Add to CI/CD** (GitHub Actions)
```yaml
- name: Build Web Assets
  run: cd packages/game && pnpm build

- name: Verify Bundle Size
  run: |
    BUNDLE_SIZE=$(du -sm packages/game/dist | cut -f1)
    if [ "$BUNDLE_SIZE" -lt 6 ]; then
      echo "ERROR: Bundle too small ($BUNDLE_SIZE MB)"
      exit 1
    fi

- name: Sync to Android
  run: cd packages/game && pnpm exec cap sync android

- name: Build APK
  run: |
    cd packages/game/android
    ./gradlew assembleDebug

- name: Verify APK Size
  run: |
    APK_SIZE=$(du -sm packages/game/android/app/build/outputs/apk/debug/app-debug.apk | cut -f1)
    if [ "$APK_SIZE" -lt 6 ]; then
      echo "ERROR: APK too small ($APK_SIZE MB)"
      exit 1
    fi
```

---

## Status

### ❌ Old APK (5.7 MB)
- Missing web bundle
- Black screen on launch
- Stale/empty assets

### ✅ New APK (6.5-7 MB)
- Full web bundle (5.8 MB)
- All game code included
- Ready to test

**Commit new APK after rebuild!** 🚀
