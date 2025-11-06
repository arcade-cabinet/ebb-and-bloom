<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Evolve Your Catalyst</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="randomize">
            <ion-icon :icon="shuffleOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Your Creature</ion-card-title>
          <ion-card-subtitle>{{ evoPoints }} Evolution Points Remaining</ion-card-subtitle>
        </ion-card-header>
        
        <ion-card-content>
          <!-- Creature Preview Canvas -->
          <canvas 
            ref="creatureCanvas" 
            width="256" 
            height="256"
            class="creature-preview"
          ></canvas>
        </ion-card-content>
      </ion-card>
      
      <!-- Trait Selection -->
      <ion-list>
        <ion-list-header>
          <ion-label>Available Traits</ion-label>
        </ion-list-header>
        
        <ion-item v-for="trait in traits" :key="trait.id" :disabled="!canAfford(trait)">
          <ion-label>
            <h2>{{ trait.name }}</h2>
            <p>{{ trait.description }}</p>
            <ion-badge :color="trait.color">{{ trait.cost }} points</ion-badge>
          </ion-label>
          <ion-button 
            slot="end" 
            @click="addTrait(trait)"
            :disabled="!canAfford(trait) || hasTrait(trait)"
          >
            <ion-icon :icon="hasTrait(trait) ? checkmarkOutline : addOutline"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-list>
      
      <!-- Active Traits -->
      <ion-list v-if="activeTraits.length > 0">
        <ion-list-header>
          <ion-label>Active Traits</ion-label>
        </ion-list-header>
        
        <ion-item v-for="trait in activeTraits" :key="trait.id">
          <ion-label>
            <h3>{{ trait.name }}</h3>
            <p>Level {{ trait.level }}</p>
          </ion-label>
          <ion-button fill="clear" slot="end" @click="removeTrait(trait)" color="danger">
            <ion-icon :icon="removeOutline"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-list>
      
      <!-- Synergies -->
      <ion-card v-if="synergies.length > 0" color="success">
        <ion-card-header>
          <ion-card-title>✨ Synergies Discovered</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-chip v-for="synergy in synergies" :key="synergy" color="success">
            <ion-label>{{ synergy }}</ion-label>
          </ion-chip>
        </ion-card-content>
      </ion-card>
      
      <!-- Action Buttons -->
      <div class="action-buttons">
        <ion-button expand="block" @click="reset" fill="outline" color="medium">
          Reset Traits
        </ion-button>
        <ion-button 
          expand="block" 
          @click="evolveAndStart" 
          color="primary"
          :disabled="evoPoints === STARTING_EVO_POINTS"
        >
          Evolve & Enter World
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonList, IonListHeader, IonItem, IonLabel, IonBadge, IonIcon, IonChip
} from '@ionic/vue';
import {
  addOutline, removeOutline, checkmarkOutline, shuffleOutline
} from 'ionicons/icons';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { TRAIT_COSTS, STARTING_EVO_POINTS } from '@/ecs/components/traits';
import { useGameStore } from '@/stores/gameStore';

const router = useRouter();
const gameStore = useGameStore();

const creatureCanvas = ref<HTMLCanvasElement>();
const evoPoints = ref(STARTING_EVO_POINTS);
const activeTraits = ref<any[]>([]);

// Trait definitions (from Grok docs)
const traits = ref([
  { 
    id: 'flipper', 
    name: 'Flipper Feet', 
    description: 'Enhanced water movement and flow affinity',
    cost: 1,
    color: 'primary'
  },
  { 
    id: 'chainsaw', 
    name: 'Chainsaw Hands', 
    description: 'Rapid wood harvesting and heat affinity',
    cost: 2,
    color: 'danger'
  },
  { 
    id: 'drill', 
    name: 'Drill Arms', 
    description: 'Mine deep ore veins efficiently',
    cost: 2,
    color: 'warning'
  },
  { 
    id: 'wings', 
    name: 'Wing Gliders', 
    description: 'Glide over terrain obstacles',
    cost: 2,
    color: 'tertiary'
  },
  { 
    id: 'sonar', 
    name: 'Echo Sonar', 
    description: 'Detect hidden resources',
    cost: 1,
    color: 'secondary'
  },
  { 
    id: 'glow', 
    name: 'Bio-Luminescent Glow', 
    description: 'Light up dark areas, attract critters',
    cost: 1,
    color: 'success'
  },
  { 
    id: 'storage', 
    name: 'Storage Sacs', 
    description: 'Increased inventory capacity',
    cost: 1,
    color: 'medium'
  },
  { 
    id: 'filter', 
    name: 'Filtration Gills', 
    description: 'Reduce pollution effects',
    cost: 2,
    color: 'success'
  },
  { 
    id: 'shield', 
    name: 'Shield Carapace', 
    description: 'Resist shock damage',
    cost: 2,
    color: 'dark'
  },
  { 
    id: 'toxin', 
    name: 'Toxin Spines', 
    description: 'Offensive capability, increases conquest',
    cost: 2,
    color: 'danger'
  }
]);

const synergies = computed(() => {
  const result: string[] = [];
  const traitIds = activeTraits.value.map(t => t.id);
  
  if (traitIds.includes('flipper') && traitIds.includes('chainsaw')) {
    result.push('Burr-tide: Chainsaw works underwater');
  }
  if (traitIds.includes('drill') && traitIds.includes('sonar')) {
    result.push('Vein Hunter: Detect deep ore automatically');
  }
  if (traitIds.includes('filter') && traitIds.includes('glow')) {
    result.push('Purity Beacon: Cleanse pollution in radius');
  }
  
  return result;
});

const canAfford = (trait: any) => {
  return evoPoints.value >= trait.cost;
};

const hasTrait = (trait: any) => {
  return activeTraits.value.some(t => t.id === trait.id);
};

const addTrait = async (trait: any) => {
  if (!canAfford(trait) || hasTrait(trait)) return;
  
  evoPoints.value -= trait.cost;
  activeTraits.value.push({ ...trait, level: 1 });
  
  await Haptics.impact({ style: ImpactStyle.Medium });
  drawCreature();
};

const removeTrait = async (trait: any) => {
  const index = activeTraits.value.findIndex(t => t.id === trait.id);
  if (index !== -1) {
    evoPoints.value += trait.cost;
    activeTraits.value.splice(index, 1);
    
    await Haptics.impact({ style: ImpactStyle.Light });
    drawCreature();
  }
};

const randomize = async () => {
  reset();
  
  // Randomly allocate points
  const shuffled = [...traits.value].sort(() => Math.random() - 0.5);
  for (const trait of shuffled) {
    if (evoPoints.value >= trait.cost) {
      await addTrait(trait);
    }
  }
};

const reset = () => {
  evoPoints.value = STARTING_EVO_POINTS;
  activeTraits.value = [];
  drawCreature();
};

const evolveAndStart = async () => {
  // Save traits to game store
  gameStore.setPlayerTraits(activeTraits.value);
  
  await Haptics.impact({ style: ImpactStyle.Heavy });
  
  // Navigate to world
  router.push('/tabs/home');
};

const drawCreature = () => {
  if (!creatureCanvas.value) return;
  
  const ctx = creatureCanvas.value.getContext('2d');
  if (!ctx) return;
  
  // Clear canvas
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, 256, 256);
  
  // Draw base creature (simple pixel art)
  ctx.fillStyle = '#4a9eff';
  
  // Body
  ctx.fillRect(112, 120, 32, 48);
  
  // Head
  ctx.fillRect(116, 100, 24, 24);
  
  // Add trait visuals
  for (const trait of activeTraits.value) {
    switch (trait.id) {
      case 'flipper':
        ctx.fillStyle = '#00d4ff';
        ctx.fillRect(108, 164, 12, 8); // Left flipper
        ctx.fillRect(136, 164, 12, 8); // Right flipper
        break;
      case 'chainsaw':
        ctx.fillStyle = '#ff4500';
        ctx.fillRect(96, 128, 16, 8); // Left hand
        ctx.fillRect(144, 128, 16, 8); // Right hand
        break;
      case 'wings':
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(96, 120, 16, 24); // Left wing
        ctx.fillRect(144, 120, 16, 24); // Right wing
        break;
      case 'glow':
        ctx.fillStyle = 'rgba(0, 255, 100, 0.3)';
        ctx.beginPath();
        ctx.arc(128, 112, 40, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  }
};

onMounted(() => {
  drawCreature();
});
</script>

<style scoped>
.creature-preview {
  display: block;
  margin: 0 auto;
  background: #1a1a1a;
  border-radius: 8px;
  image-rendering: pixelated;
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

ion-badge {
  margin-left: 8px;
}
</style>
