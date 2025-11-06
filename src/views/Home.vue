<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Ebb & Bloom</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showStats">
            <ion-icon :icon="statsChartOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <!-- Phaser Game Container -->
      <div ref="gameContainer" class="game-container"></div>
      
      <!-- Floating Action Buttons for Quick Actions -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="terraform">
          <ion-icon :icon="hammerOutline"></ion-icon>
        </ion-fab-button>
        <ion-fab-list side="top">
          <ion-fab-button @click="collectResource" color="success">
            <ion-icon :icon="leafOutline"></ion-icon>
          </ion-fab-button>
          <ion-fab-button @click="snapResources" color="warning">
            <ion-icon :icon="flashOutline"></ion-icon>
          </ion-fab-button>
        </ion-fab-list>
      </ion-fab>
      
      <!-- Status Overlay -->
      <div class="status-overlay">
        <ion-chip color="danger" v-if="pollution > 50">
          <ion-icon :icon="warningOutline"></ion-icon>
          <ion-label>Pollution: {{ Math.round(pollution) }}%</ion-label>
        </ion-chip>
        
        <ion-chip :color="playstyleColor">
          <ion-label>{{ playstyle }}</ion-label>
        </ion-chip>
        
        <ion-chip color="primary">
          <ion-icon :icon="cubeOutline"></ion-icon>
          <ion-label>Resources: {{ totalResources }}</ion-label>
        </ion-chip>
      </div>
      
      <!-- Pollution Progress Bar -->
      <ion-progress-bar 
        :value="pollution / 100" 
        :color="pollutionColor"
        v-if="pollution > 30"
      ></ion-progress-bar>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonFab, IonFabButton, IonFabList, IonIcon, IonChip, IonLabel, IonProgressBar
} from '@ionic/vue';
import { 
  hammerOutline, leafOutline, flashOutline, statsChartOutline, 
  warningOutline, cubeOutline, gameControllerOutline 
} from 'ionicons/icons';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import Phaser from 'phaser';
import { gameConfig } from '@/game/config';
import { useGameStore } from '@/stores/gameStore';

const store = useGameStore();
const gameContainer = ref<HTMLElement>();
let game: Phaser.Game | null = null;

// Reactive state from store
const pollution = computed(() => store.pollution);
const playstyle = computed(() => store.dominantPlaystyle);
const totalResources = computed(() => {
  const inv = store.playerInventory;
  return Object.values(inv).reduce((sum: number, val) => sum + (val as number), 0);
});

const playstyleColor = computed(() => {
  switch (playstyle.value) {
    case 'Harmony': return 'success';
    case 'Conquest': return 'danger';
    case 'Frolick': return 'warning';
    default: return 'medium';
  }
});

const pollutionColor = computed(() => {
  if (pollution.value > 70) return 'danger';
  if (pollution.value > 40) return 'warning';
  return 'success';
});

onMounted(() => {
  // Initialize Phaser game
  if (gameContainer.value) {
    game = new Phaser.Game({
      ...gameConfig,
      parent: gameContainer.value
    });
    
    store.startGame();
  }
  
  // Watch for high pollution and trigger haptics
  watch(() => pollution.value, (newVal, oldVal) => {
    if (newVal > 70 && oldVal <= 70) {
      Haptics.impact({ style: ImpactStyle.Heavy });
    }
  });
});

onUnmounted(() => {
  if (game) {
    game.destroy(true);
  }
  store.stopGame();
});

const terraform = async () => {
  await Haptics.impact({ style: ImpactStyle.Light });
  store.addEvent({
    type: 'terraform',
    title: 'Terraform Mode',
    description: 'Long-press tiles to change biomes'
  });
};

const collectResource = async () => {
  await Haptics.impact({ style: ImpactStyle.Medium });
  store.addEvent({
    type: 'harvest',
    title: 'Harvest Mode',
    description: 'Tap tiles to collect resources'
  });
};

const snapResources = async () => {
  await Haptics.impact({ style: ImpactStyle.Heavy });
  
  const inv = store.playerInventory;
  // Check for snap combinations
  if (inv.ore >= 1 && inv.water >= 1) {
    store.updatePlayerInventory({
      ...inv,
      ore: inv.ore - 1,
      water: inv.water - 1,
      alloy: (inv.alloy || 0) + 1
    });
    
    store.addEvent({
      type: 'snap',
      title: 'Snap: Alloy Created!',
      description: 'Ore + Water → Alloy',
      haiku: 'Metal meets the flow\nForge whispers ancient secrets\nAlloy springs to life'
    });
  } else {
    store.addEvent({
      type: 'info',
      title: 'Cannot Snap',
      description: 'Need Ore + Water for Alloy'
    });
  }
};

const showStats = () => {
  // Show detailed stats modal
};
</script>

<style scoped>
.game-container {
  width: 100%;
  height: 100%;
  background: #1a1a1a;
}

.status-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  z-index: 100;
  pointer-events: none;
}

.status-overlay ion-chip {
  pointer-events: auto;
}

ion-progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99;
}
</style>
