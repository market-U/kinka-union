<template>
  <div>
    <kinka-union-card />
  </div>
</template>

<script lang="ts">
import HelloWorld from "../components/HelloWorld.vue";
import KinkaUnionCard from "../components/KinkaUnionCard.vue";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({
  components: {
    HelloWorld,
    KinkaUnionCard,
  },
})
export default class HomeView extends Vue {}
</script>
