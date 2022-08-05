<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-card-title>キンカ組合へようこそ</v-card-title>
      <v-spacer></v-spacer>
      <v-btn href="https://twitter.com/okigirl25" target="_blank" text>
        <span class="mr-2">contact marketU</span>
        <v-icon>mdi-twitter</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "App",

  data: () => ({
    //
  }),
});
</script>
