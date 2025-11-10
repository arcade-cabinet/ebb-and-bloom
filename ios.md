# iOS Setup

To add iOS support:

```bash
# Add iOS platform
npx cap add ios

# Build and sync
npm run build:ios

# Or manually
npm run build
npx cap sync ios
npx cap open ios
```

Then open in Xcode and run on device/simulator.

## Requirements

- macOS
- Xcode 14+
- iOS 13+

## Configuration

Already configured in `capacitor.config.ts`:
- App ID: `com.ebbandbloom.app`
- App Name: `Ebb & Bloom`
- Web Dir: `game/dist`

