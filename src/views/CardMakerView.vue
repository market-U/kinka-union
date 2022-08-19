<template>
  <div>
    <card-maker :cardType="type" />
  </div>
</template>

<script lang="ts">
import CardMaker from "../components/CardMaker.vue";
import { Component, Vue, Watch } from "vue-property-decorator";
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
    this.setCardType(this.$route.path);
  }

  private setCardType(path: string) {
    if (path === "/card/kinka") {
      this.type = MODEL.kinka;
    } else if (path === "/card/buncho") {
      this.type = MODEL.buncho;
    } else if (path === "/card/hatchan") {
      this.type = MODEL.hatchan;
    } else {
      this.type = MODEL.kinka;
    }
    this.$store.commit("setCardType", this.type);
    this.setTheme();
  }

  @Watch("$route.path")
  onChangePath(path: string) {
    this.setCardType(path);
  }
}
</script>
