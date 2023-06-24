<template>
  <div>
    <v-row>
      <v-col align="center">
        <v-card-subtitle>{{ cardId }}</v-card-subtitle>
        <div
          class="cardFrame"
          :class="trimClass"
          ref="cardFrame"
          :style="`zoom: ${zoom}; ${canvas ? 'position:absolute; left: -1920px;' : ''}`"
        >
          <div class="cardPreview" ref="cardPreview">
            <img :src="cardImgUrl" @load="cardBGLoaded()" />
          </div>
        </div>
        <v-row>
          <v-spacer />
          <v-checkbox v-model="trim" :label="$t('labels.hide_bleed')" row style="display: inline"></v-checkbox>
          <v-spacer />
        </v-row>
        <v-row>
          <v-spacer />
          <v-btn @click="downloadCardImg()" color="primary"
            ><v-icon>mdi-download</v-icon>{{ $t("common.download_copy") }}</v-btn
          >
          <v-spacer />
        </v-row>
      </v-col>
    </v-row>
    <v-overlay v-model="canvas">
      <v-progress-circular color="primary" indeterminate />
    </v-overlay>
  </div>
</template>
<style scoped>
.overflowHidden {
  overflow: hidden;
}
.cardFrame {
  position: relative;
  width: 1720px;
  height: 1080px;
  border-radius: 40px;
  box-shadow: 10px 10px 20px rgba(0, 0, 0, 0.4);
  margin-bottom: 100px;
  margin-top: 100px;
}
.cardPreview {
  position: absolute;
  width: 1920px;
  top: -100px;
  left: -100px;
}
.cardOverlay {
  position: absolute;
  width: 1920px;
  top: 0px;
  left: 0px;
}
</style>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { MODEL } from "@/module";

@Component({
  components: {},
})
export default class CardMaker extends Vue {
  @Prop({ required: true }) cardType?: MODEL.CardType;
  @Prop({ required: true }) cardId?: string;
  private trim = false;
  private canvas = false;
  private cardImgUrl = "";
  private href = "";
  private snackbar = false;
  private timeout = 2000;

  created() {
    // const staff = this.$route.query.staff;
    // if (staff != null) {
    //   this.forStaff = true;
    // }
  }

  async mounted() {
    this.href = window.location.href;
    fetch("/api/credentials")
      .then((res) => res.json())
      .then((json) => {
        this.cardImgUrl = `${json.url}/${this.cardType?.bird_type}/${this.cardId}.png?${json.sasToken}`;
      });
  }

  get trimClass(): string {
    return this.trim ? "overflowHidden" : "";
  }

  get mobile(): boolean {
    return this.$vuetify.breakpoint.mobile;
  }

  get cardOverlay(): string | undefined {
    return this.cardType?.assets.overlay;
  }

  get zoom(): number {
    if (this.canvas) {
      return 1;
    } else {
      const dispWidth = this.$vuetify.breakpoint.width; // - this.$vuetify.breakpoint.scrollBarWidth;
      const root = this.$refs.root as HTMLElement;
      const [marginTortalm, previewOriginalWidth, maxZoom] = [48, 1920, 0.25];
      return Math.min((dispWidth - marginTortalm) / previewOriginalWidth, maxZoom);
    }
  }

  private cardBGLoaded() {
    this.$nextTick(() => {
      this.trim = true;
    });
  }

  private copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("copied!");
        this.snackbar = true;
      })
      .catch((e) => {
        console.error(e);
      });
  }
  private async downloadCardImg() {
    let link = document.createElement("a");
    link.href = this.cardImgUrl;
    link.target = "_blank";
    link.click();
  }
}
</script>
