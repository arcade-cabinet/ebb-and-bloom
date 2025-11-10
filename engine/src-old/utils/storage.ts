/**
 * Cross-platform storage wrapper
 * Uses @capacitor/preferences for web/iOS/Android compatibility
 */

import { Preferences } from '@capacitor/preferences';

/**
 * Get item from storage
 */
export async function getItem(key: string): Promise<string | null> {
  try {
    const result = await Preferences.get({ key });
    return result.value;
  } catch (error) {
    console.error(`Failed to get item ${key}:`, error);
    return null;
  }
}

/**
 * Set item in storage
 */
export async function setItem(key: string, value: string): Promise<void> {
  try {
    await Preferences.set({ key, value });
  } catch (error) {
    console.error(`Failed to set item ${key}:`, error);
  }
}

/**
 * Remove item from storage
 */
export async function removeItem(key: string): Promise<void> {
  try {
    await Preferences.remove({ key });
  } catch (error) {
    console.error(`Failed to remove item ${key}:`, error);
  }
}

/**
 * Clear all storage
 */
export async function clear(): Promise<void> {
  try {
    await Preferences.clear();
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}
