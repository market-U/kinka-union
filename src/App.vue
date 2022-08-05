<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-card-title class="welcome">キンカ組合へようこそ</v-card-title>
      <v-spacer></v-spacer>
      <v-btn href="https://twitter.com/okigirl25" target="_blank" text>
        <span class="mr-2" v-show="!mobile">contact</span>
        <v-icon>mdi-twitter</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Murecho:wght@300;500&display=swap");
.welcome {
  font-family: "Murecho", sans-serif;
}
</style>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class App extends Vue {
  get mobile(): boolean {
    return this.$vuetify.breakpoint.mobile;
  }
}
</script>
