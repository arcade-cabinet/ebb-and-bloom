<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
</script>

<style>
/* Global dark theme for pixel aesthetic */
body {
  --ion-background-color: #1a1a1a;
  --ion-text-color: #ffffff;
  --ion-color-step-50: #252525;
  --ion-color-step-100: #2f2f2f;
  --ion-color-step-150: #3a3a3a;
  --ion-color-step-200: #454545;
  --ion-color-step-250: #4f4f4f;
  --ion-color-step-300: #5a5a5a;
  --ion-color-step-350: #656565;
  --ion-color-step-400: #6f6f6f;
  --ion-color-step-450: #7a7a7a;
  --ion-color-step-500: #858585;
  --ion-color-step-550: #8f8f8f;
  --ion-color-step-600: #9a9a9a;
  --ion-color-step-650: #a5a5a5;
  --ion-color-step-700: #afafaf;
  --ion-color-step-750: #bababa;
  --ion-color-step-800: #c5c5c5;
  --ion-color-step-850: #cfcfcf;
  --ion-color-step-900: #dadada;
  --ion-color-step-950: #e5e5e5;
}

/* Pixel-perfect rendering */
canvas {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
</style>
