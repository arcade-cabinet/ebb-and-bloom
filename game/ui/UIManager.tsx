/**
 * UI MANAGER
 * 
 * Based on Daggerfall Unity's DaggerfallUI.cs pattern.
 * Central coordinator for all UI screens and HUD components.
 */

import { createContext, useContext, useState, ReactNode } from 'react';

export enum ScreenType {
  MENU = 'menu',
  GAME = 'game',
  PAUSE = 'pause',
  INVENTORY = 'inventory',
  CHARACTER = 'character',
  SETTINGS = 'settings',
}

interface UIManagerContextType {
  currentScreen: ScreenType;
  setScreen: (screen: ScreenType) => void;
  isHUDVisible: boolean;
  setHUDVisible: (visible: boolean) => void;
}

const UIManagerContext = createContext<UIManagerContextType | null>(null);

export function useUIManager() {
  const context = useContext(UIManagerContext);
  if (!context) {
    throw new Error('useUIManager must be used within UIManagerProvider');
  }
  return context;
}

interface UIManagerProviderProps {
  children: ReactNode;
  initialScreen?: ScreenType;
}

export function UIManagerProvider({ 
  children, 
  initialScreen = ScreenType.MENU 
}: UIManagerProviderProps) {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(initialScreen);
  const [isHUDVisible, setHUDVisible] = useState(initialScreen === ScreenType.GAME);

  const setScreen = (screen: ScreenType) => {
    setCurrentScreen(screen);
    // HUD visible only during gameplay
    setHUDVisible(screen === ScreenType.GAME);
  };

  return (
    <UIManagerContext.Provider
      value={{
        currentScreen,
        setScreen,
        isHUDVisible,
        setHUDVisible,
      }}
    >
      {children}
    </UIManagerContext.Provider>
  );
}

