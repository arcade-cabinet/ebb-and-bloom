/**
 * Cross-platform routing wrapper
 * Uses hash-based routing for Capacitor compatibility (web/iOS/Android)
 */

import { Capacitor } from '@capacitor/core';

/**
 * Navigate to a route (hash-based for Capacitor compatibility)
 */
export function navigateTo(params: Record<string, string>): void {
  const queryString = new URLSearchParams(params).toString();
  
  // Use hash-based routing for better Capacitor compatibility
  window.location.hash = queryString;
}

/**
 * Get route parameters from URL
 */
export function getRouteParams(): URLSearchParams {
  // Remove leading # if present
  const hash = window.location.hash.substring(1);
  return new URLSearchParams(hash || window.location.search.substring(1));
}

/**
 * Get specific parameter
 */
export function getParam(key: string): string | null {
  return getRouteParams().get(key);
}

/**
 * Check if we're on native platform
 */
export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Get platform (web, ios, android)
 */
export function getPlatform(): string {
  return Capacitor.getPlatform();
}
