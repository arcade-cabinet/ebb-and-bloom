/**
 * Main entry point for Ebb & Bloom
 * Initializes Vue, Ionic, Vue Router, Pinia, and Capacitor
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { IonicVue } from '@ionic/vue';
import App from './App.vue';
import router from './router';

// Ionic CSS
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

// Optional Ionic theme
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

// Create Vue app
const app = createApp(App);

// Create Pinia store (correct for Ionic Vue)
const pinia = createPinia();

// Use Pinia
app.use(pinia);

// Use Ionic with Material Design for Android
app.use(IonicVue, {
  mode: 'md', // Material Design for Android
  animated: true
});

// Use Vue Router
app.use(router);

// Mount when router is ready
router.isReady().then(() => {
  app.mount('#app');
});
