<template>
  <div>
    <card-copy v-if="$route.params.id" :cardType="type" :cardId="$route.params.id" />
    <card-maker v-else :cardType="type" />
  </div>
</template>

<script lang="ts">
import CardMaker from "../components/CardMaker.vue";
import CardCopy from "../components/CardCopy.vue";
import { Component, Vue, Watch } from "vue-property-decorator";
import { MODEL } from "@/module";

@Component({
  components: {
    CardMaker,
    CardCopy,
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
    const cardId = this.$route.params.id;
    console.log("card id:", cardId);
    this.setCardType(this.getCardType());
  }

  private getCardType(): string {
    return this.$route.params.type;
  }

  private setCardType(type: string) {
    if (type === "kinka") {
      this.type = MODEL.kinka;
    } else if (type === "buncho") {
      this.type = MODEL.buncho;
    } else if (type === "hatchan") {
      this.type = MODEL.hatchan;
    } else {
      this.type = MODEL.kinka;
    }
    this.$store.commit("setCardType", this.type);
    this.setTheme();
  }

  @Watch("$route.path")
  onChangePath(path: string) {
    this.setCardType(this.getCardType());
  }
}
</script>
