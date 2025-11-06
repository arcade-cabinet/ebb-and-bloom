<template>
  <ion-app>
    <ion-content :fullscreen="true">
      <div id="game-container" ref="gameContainer"></div>
    </ion-content>
  </ion-app>
</template>

<script>
import { IonApp, IonContent } from '@ionic/vue';
import { onMounted, onUnmounted, ref } from 'vue';
import Phaser from 'phaser';
import { gameConfig } from './game/config.js';
import { useGameStore } from './store/gameStore.js';

export default {
  name: 'App',
  components: {
    IonApp,
    IonContent
  },
  setup() {
    const gameContainer = ref(null);
    let game = null;
    const gameStore = useGameStore();

    onMounted(() => {
      // Initialize Phaser game
      game = new Phaser.Game({
        ...gameConfig,
        parent: gameContainer.value
      });

      // Start game
      gameStore.startGame();
    });

    onUnmounted(() => {
      // Cleanup
      if (game) {
        game.destroy(true);
      }
      gameStore.stopGame();
    });

    return {
      gameContainer
    };
  }
};
</script>

<style>
#game-container {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #1a1a1a;
}

ion-content {
  --background: #1a1a1a;
}
</style>
