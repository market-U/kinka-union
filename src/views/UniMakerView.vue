<template>
  <div>
    <uni-maker :cardType="type" />
  </div>
</template>

<script lang="ts">
import UniMaker from "../components/UniMaker.vue";
import { Component, Vue, Watch } from "vue-property-decorator";
import { MODEL } from "@/module";

@Component({
  components: {
    UniMaker,
  },
})
export default class UniMakerView extends Vue {
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
    if (path === "/uni") {
      this.type = MODEL.uni;
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
