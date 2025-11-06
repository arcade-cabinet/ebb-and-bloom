<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon :icon="gameControllerOutline"></ion-icon>
          <ion-label>World</ion-label>
        </ion-tab-button>
        
        <ion-tab-button tab="creator" href="/tabs/creator">
          <ion-icon :icon="constructOutline"></ion-icon>
          <ion-label>Evolve</ion-label>
        </ion-tab-button>
        
        <ion-tab-button tab="log" href="/tabs/log">
          <ion-icon :icon="bookOutline"></ion-icon>
          <ion-label>Journal</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { gameControllerOutline, constructOutline, bookOutline } from 'ionicons/icons';
</script>
