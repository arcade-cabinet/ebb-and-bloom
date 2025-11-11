# Capacitor React Hooks Integration

## Overview

We're using [@capacitor-community/react-hooks](https://github.com/capacitor-community/react-hooks) to provide React hooks for Capacitor plugins, making native device features more React-idiomatic.

## Installed Hooks

### ✅ Currently Installed

- `@capacitor-community/app-react` - App lifecycle hooks (`useAppState`, `useAppUrlOpen`, `useLaunchUrl`)
- `@capacitor-community/filesystem-react` - Filesystem operations (`useFilesystem`)
- `@capacitor-community/device-react` - Device information (`useGetInfo`, `useGetLanguageCode`)

### 📦 Available But Not Yet Installed

Based on our Capacitor plugins, we should also consider:

- `@capacitor-community/storage-react` - **Note**: Uses `@capacitor/storage`, but we use `@capacitor/preferences` (different plugin)
- `@capacitor-community/keyboard-react` - Keyboard state (`useKeyboard`)
- `@capacitor-community/network-react` - Network status (`useStatus`)

### ❌ Not Available

- **Haptics**: No React hooks available yet for `@capacitor/haptics` - use direct API calls
- **Preferences**: We use `@capacitor/preferences`, but hooks are for `@capacitor/storage` - use direct API calls or consider migrating to `@capacitor/storage`

## Usage Examples

### App Lifecycle

```typescript
import { useAppState, useAppUrlOpen } from '@capacitor-community/app-react';

function Game() {
  const { state } = useAppState(); // 'active' | 'inactive'
  const { appUrlOpen } = useAppUrlOpen(); // URL that opened the app
  
  useEffect(() => {
    if (state === 'inactive') {
      // Pause game when app goes to background
      pauseGame();
    }
  }, [state]);
  
  return <div>Game</div>;
}
```

### Filesystem

```typescript
import { useFilesystem } from '@capacitor-community/filesystem-react';
import { FilesystemDirectory } from '@capacitor/filesystem';

function SaveManager() {
  const { readFile, writeFile } = useFilesystem();
  
  const saveGame = async () => {
    await writeFile({
      path: 'savegame.json',
      data: JSON.stringify(gameState),
      directory: FilesystemDirectory.Data
    });
  };
  
  return <button onClick={saveGame}>Save</button>;
}
```

### Device Info

```typescript
import { useGetInfo } from '@capacitor-community/device-react';

function Settings() {
  const { info } = useGetInfo();
  
  return (
    <div>
      <p>Platform: {info.platform}</p>
      <p>Model: {info.model}</p>
      <p>OS Version: {info.osVersion}</p>
    </div>
  );
}
```

## Direct API Usage (No Hooks Available)

### Preferences

```typescript
import { Preferences } from '@capacitor/preferences';

// No hooks available - use direct API
const savePreference = async (key: string, value: string) => {
  await Preferences.set({ key, value });
};

const getPreference = async (key: string) => {
  const { value } = await Preferences.get({ key });
  return value;
};
```

### Haptics

```typescript
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// No hooks available - use direct API
const triggerHaptic = async () => {
  await Haptics.impact({ style: ImpactStyle.Medium });
};
```

## Migration Plan

1. ✅ **Installed hooks** for App, Filesystem, Device
2. ⏳ **Use hooks** in game code where applicable
3. ⏳ **Consider migrating** from `@capacitor/preferences` to `@capacitor/storage` if we want hook support
4. ⏳ **Create custom hooks** for Haptics if needed (wrapper around direct API)

## References

- [Capacitor Community React Hooks](https://github.com/capacitor-community/react-hooks)
- [Capacitor Documentation](https://capacitorjs.com/docs)


