# UI System

**Based on Daggerfall Unity's UI architecture.**

---

## Architecture

### UIManager (DFU: DaggerfallUI.cs)
- Central coordinator for all UI screens and HUD
- Manages screen transitions
- Controls HUD visibility
- Context-based (React Context API)

### Screens (DFU: DaggerfallBaseWindow)
- **MenuScreen** - Main menu (DFU: DaggerfallStartWindow)
- **GameScreen** - 3D gameplay view
- **PauseScreen** - Pause menu (DFU: DaggerfallPauseOptionsWindow)
- **BaseScreen** - Base component for all screens

### HUD Components (DFU: DaggerfallHUD.cs)
- **HUD** - Main HUD container
- **HUDVitals** - Health/Fatigue/Magicka bars (DFU: HUDVitals.cs)
- **HUDCompass** - Compass display (DFU: HUDCompass.cs)
- **HUDCrosshair** - Crosshair (DFU: HUDCrosshair.cs)
- **HUDInfo** - Game info display

---

## Usage

```tsx
import { UIManagerProvider, ScreenType } from './ui/UIManager';
import { Game } from './Game';

function App() {
  return (
    <UIManagerProvider initialScreen={ScreenType.MENU}>
      <Game />
    </UIManagerProvider>
  );
}
```

---

## Screen Flow

```
MenuScreen
  ↓ (New Game)
GameScreen (with HUD)
  ↓ (ESC)
PauseScreen
  ↓ (Resume)
GameScreen
  ↓ (ESC)
PauseScreen
  ↓ (Main Menu)
MenuScreen
```

---

## DFU Patterns Implemented

✅ **Central UI Manager** - UIManager coordinates everything  
✅ **Modular HUD Components** - Each HUD element is separate  
✅ **Screen System** - Separate screens for different game states  
✅ **HUD Visibility Control** - HUD only visible during gameplay  
✅ **Base Screen** - Base component for all screens  

---

## Future Additions (DFU Patterns)

- **InventoryScreen** (DFU: DaggerfallInventoryWindow)
- **CharacterScreen** (DFU: DaggerfallCharacterSheetWindow)
- **SettingsScreen** (DFU: DaggerfallAdvancedSettingsWindow)
- **TalkScreen** (DFU: DaggerfallTalkWindow)
- **QuestJournalScreen** (DFU: DaggerfallQuestJournalWindow)




