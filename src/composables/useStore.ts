/**
 * Vue composable for Zustand vanilla stores
 * Provides reactive integration with Vue's composition API
 */

import { ref, onUnmounted, Ref } from 'vue';
import type { StoreApi } from 'zustand/vanilla';

export function useStore<T>(store: StoreApi<T>): Ref<T> {
  const state = ref(store.getState()) as Ref<T>;
  
  const unsubscribe = store.subscribe((newState) => {
    state.value = newState;
  });
  
  onUnmounted(() => {
    unsubscribe();
  });
  
  return state;
}

export function useStoreActions<T>(store: StoreApi<T>): T {
  return store.getState();
}
