/**
 * Main entry point for Ebb & Bloom
 * Initializes Vue, Ionic, and Capacitor
 */

import { createApp } from 'vue';
import { IonicVue } from '@ionic/vue';
import App from './App.vue';

// Ionic CSS
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

// Create Vue app
const app = createApp(App);

// Use Ionic
app.use(IonicVue, {
  mode: 'md', // Material Design for Android
  animated: true
});

// Mount when ready
app.mount('#app');
