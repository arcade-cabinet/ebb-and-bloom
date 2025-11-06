<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Evolution Journal</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="clearLog">
            <ion-icon :icon="trashOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <!-- Summary Stats -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Journey Summary</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-grid>
            <ion-row>
              <ion-col>
                <div class="stat">
                  <div class="stat-value">{{ totalSnaps }}</div>
                  <div class="stat-label">Snaps</div>
                </div>
              </ion-col>
              <ion-col>
                <div class="stat">
                  <div class="stat-value">{{ totalShocks }}</div>
                  <div class="stat-label">Shocks</div>
                </div>
              </ion-col>
              <ion-col>
                <div class="stat">
                  <div class="stat-value">{{ playTime }}</div>
                  <div class="stat-label">Minutes</div>
                </div>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>
      
      <!-- Playstyle Evolution -->
      <ion-card v-if="playstyleHistory.length > 0">
        <ion-card-header>
          <ion-card-title>Playstyle Evolution</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="playstyle-chart">
            <div 
              v-for="(entry, index) in playstyleHistory" 
              :key="index"
              class="playstyle-bar"
              :style="{ 
                width: `${entry.percentage}%`, 
                backgroundColor: getPlaystyleColor(entry.style) 
              }"
            >
              <span>{{ entry.style }}</span>
            </div>
          </div>
        </ion-card-content>
      </ion-card>
      
      <!-- Event Log -->
      <ion-list>
        <ion-list-header>
          <ion-label>Recent Events</ion-label>
        </ion-list-header>
        
        <ion-item 
          v-for="(event, index) in events" 
          :key="index"
          :class="`event-${event.type}`"
        >
          <ion-icon 
            :icon="getEventIcon(event.type)" 
            :color="getEventColor(event.type)"
            slot="start"
          ></ion-icon>
          <ion-label>
            <h3>{{ event.title }}</h3>
            <p>{{ event.description }}</p>
            <ion-note>{{ formatTime(event.timestamp) }}</ion-note>
          </ion-label>
          <ion-badge 
            v-if="event.haiku" 
            slot="end"
            color="secondary"
            @click="showHaiku(event.haiku)"
          >
            <ion-icon :icon="bookOutline"></ion-icon>
          </ion-badge>
        </ion-item>
        
        <ion-item v-if="events.length === 0">
          <ion-label class="ion-text-center">
            <p>No events yet. Start exploring to build your journal!</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol,
  IonList, IonListHeader, IonItem, IonLabel, IonIcon, IonBadge, IonNote,
  alertController
} from '@ionic/vue';
import {
  trashOutline, flashOutline, warningOutline, leafOutline, hammerOutline,
  bookOutline, heartOutline, skullOutline
} from 'ionicons/icons';
import { useGameStore } from '@/stores/gameStore';

const gameStore = useGameStore();

// Computed from store
const events = computed(() => gameStore.eventLog);
const totalSnaps = computed(() => events.value.filter(e => e.type === 'snap').length);
const totalShocks = computed(() => events.value.filter(e => e.type === 'shock').length);
const playTime = computed(() => Math.floor(gameStore.playTime / 60));

const playstyleHistory = computed(() => {
  // Calculate playstyle distribution
  const actions = gameStore.actionHistory || [];
  const counts = {
    Harmony: actions.filter((a: string) => ['plant', 'restore'].includes(a)).length,
    Conquest: actions.filter((a: string) => ['chop', 'mine'].includes(a)).length,
    Frolick: actions.filter((a: string) => ['wander', 'craft'].includes(a)).length
  };
  
  const total = Object.values(counts).reduce((sum, val) => sum + val, 0) || 1;
  
  return Object.entries(counts)
    .map(([style, count]) => ({
      style,
      count,
      percentage: (count / total) * 100
    }))
    .sort((a, b) => b.count - a.count);
});

const getEventIcon = (type: string) => {
  switch (type) {
    case 'snap': return flashOutline;
    case 'shock': return warningOutline;
    case 'harvest': return leafOutline;
    case 'terraform': return hammerOutline;
    case 'harmony': return heartOutline;
    case 'conquest': return skullOutline;
    default: return bookOutline;
  }
};

const getEventColor = (type: string) => {
  switch (type) {
    case 'snap': return 'warning';
    case 'shock': return 'danger';
    case 'harvest': return 'success';
    case 'terraform': return 'primary';
    case 'harmony': return 'success';
    case 'conquest': return 'danger';
    default: return 'medium';
  }
};

const getPlaystyleColor = (style: string) => {
  switch (style) {
    case 'Harmony': return '#2dd36f';
    case 'Conquest': return '#eb445a';
    case 'Frolick': return '#ffc409';
    default: return '#92949c';
  }
};

const formatTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const showHaiku = async (haiku: string) => {
  const alert = await alertController.create({
    header: 'Snap Haiku',
    message: haiku,
    buttons: ['Close']
  });
  
  await alert.present();
};

const clearLog = async () => {
  const alert = await alertController.create({
    header: 'Clear Journal?',
    message: 'This will erase your evolution history. This cannot be undone.',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Clear',
        role: 'destructive',
        handler: () => {
          gameStore.clearEventLog();
        }
      }
    ]
  });
  
  await alert.present();
};
</script>

<style scoped>
.stat {
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--ion-color-primary);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--ion-color-medium);
  text-transform: uppercase;
}

.playstyle-chart {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.playstyle-bar {
  padding: 8px 12px;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  transition: all 0.3s;
}

.event-snap {
  --background: rgba(255, 196, 9, 0.1);
}

.event-shock {
  --background: rgba(235, 68, 90, 0.1);
}

.event-harmony {
  --background: rgba(45, 211, 111, 0.1);
}
</style>
