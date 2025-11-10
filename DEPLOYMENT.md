# Deployment Guide

## Platforms

Ebb & Bloom supports:
- ✅ Web (primary)
- ✅ Android (via Capacitor)
- ✅ iOS (via Capacitor, macOS only)
- ✅ Desktop (Electron - future)

---

## Web Deployment

```bash
cd game
npm run build
```

Output: `game/dist/`

Deploy to:
- Vercel
- Netlify
- GitHub Pages
- Any static host

---

## Android Deployment

### Prerequisites
- Android Studio
- Android SDK
- JDK 17+

### Build

```bash
# From root
npm run build:android
```

This will:
1. Build game (`game/dist/`)
2. Sync to Android (`npx cap sync android`)
3. Open Android Studio

### Manual Steps

```bash
# Build game
cd game
npm run build

# Sync to Android
cd ..
npx cap sync android

# Open in Android Studio
npx cap open android
```

Then in Android Studio:
- Build → Build Bundle(s)/APK(s) → Build APK
- Or run on device/emulator

---

## iOS Deployment

### Prerequisites
- macOS
- Xcode 14+
- iOS Developer account (for App Store)

### Build

```bash
# From root
npm run build:ios
```

This will:
1. Build game
2. Sync to iOS
3. Open Xcode

### Manual Steps

```bash
npm run build
npx cap sync ios
npx cap open ios
```

Then in Xcode:
- Select target device
- Product → Archive (for App Store)
- Or run directly on device

---

## Configuration

### capacitor.config.ts

```typescript
{
  appId: 'com.ebbandbloom.app',
  appName: 'Ebb & Bloom',
  webDir: 'game/dist',
  server: {
    androidScheme: 'https'
  }
}
```

### Build Outputs

- **Web**: `game/dist/`
- **Android**: `android/app/build/outputs/apk/`
- **iOS**: Xcode archive

---

## Environment Variables

Create `.env` in game/:

```env
VITE_APP_NAME=Ebb & Bloom
VITE_DEFAULT_SEED=v1-green-valley-breeze
```

---

## Performance Tips

### Web
- Enable gzip/brotli compression
- Use CDN for static assets
- Enable caching headers

### Mobile
- Reduce chunk distance (2 instead of 3)
- Lower texture quality on mobile
- Reduce draw distance

### All Platforms
- Lazy load chunks
- Instance vegetation
- LOD for distant creatures

---

## Troubleshooting

### "Cannot sync" errors
```bash
rm -rf android/app/src/main/assets/public
npm run build
npx cap sync
```

### Android build fails
- Check JDK version (`java -version`)
- Clean build: `cd android && ./gradlew clean`
- Update Gradle wrapper

### iOS build fails
- Clean build folder in Xcode
- Update CocoaPods: `cd ios && pod update`

---

**Ready for deployment to all platforms!**

