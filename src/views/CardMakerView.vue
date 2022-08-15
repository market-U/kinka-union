<template>
  <div>
    <card-maker :cardType="type" />
  </div>
</template>

<script lang="ts">
import CardMaker from "../components/CardMaker.vue";
import { Component, Prop, Vue } from "vue-property-decorator";
import { MODEL } from "@/module";

@Component({
  components: {
    CardMaker,
  },
})
export default class CardMakerView extends Vue {
  private type = MODEL.kinka;
  private setTheme() {
    this.$vuetify.theme.themes.light.primary = this.type.theme.primary;
    this.$vuetify.theme.themes.light.secondary = this.type.theme.secondary;
    this.$vuetify.theme.themes.light.accent = this.type.theme.accent;
  }
  created() {
    const path = this.$route.path;
    if (path === "/kinka") {
      this.type = MODEL.kinka;
    } else if (path === "/buncho") {
      this.type = MODEL.buncho;
    } else if (path === "/hatchan") {
      console.log("はっちゃん！");
    }
    // this.$store.commit("setTitle", this.getWelcomeMessage(this.type.bird_type));
    this.$store.commit("setCardType", this.type);
    this.setTheme();
  }
}
</script>
