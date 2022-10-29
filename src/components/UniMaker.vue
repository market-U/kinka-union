<template>
  <div>
    <v-stepper non-linear v-model="e1">
      <v-stepper-header v-show="false">
        <v-stepper-step editable step="1"
          ><span class="ml-1"> {{ $t("common.select_photo") }} </span></v-stepper-step
        >
        <v-stepper-step editable step="2"
          ><span class="ml-1">{{ $t("uni_maker.uni_settings") }}</span></v-stepper-step
        >
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content step="1">
          <v-row no-gutters justify="center" align-content="center" class="mb-2">
            <v-btn color="primary" class="text-none" @click="fileInput.click()" outlined>
              <v-icon left> mdi-camera </v-icon>
              {{ $t("common.select_photo") }}
            </v-btn>
            <v-spacer />
            <v-btn color="primary" @click="e1 = 2" :disabled="!cropedImg">
              {{ $t("common.next") }}
              <v-icon>mdi-arrow-right</v-icon>
            </v-btn>
          </v-row>

          <v-row no-gutters justify="center" align-content="center">
            <v-col align="center" cols="12" md="6">
              <vue-cropper
                ref="cropper"
                class="ma-3 cropper"
                :style="`background-color: ${cardType.colors.default_photo_bg};`"
                :guides="true"
                :view-mode="2"
                drag-mode="crop"
                :background="true"
                :rotatable="true"
                :aspect-ratio="1 / 1"
                alt="No Image..."
                :src="imgSrc"
                preview=".photoPreview"
                @cropend="cropImage"
                @ready="cropImage"
              />
            </v-col>
          </v-row>
          <v-row no-gutters justify="center" align-content="center">
            <v-col class="pa-3" cols="12" md="6">
              <input
                ref="fileInput"
                style="display: none"
                type="file"
                accept="image/jpeg, image/jpg, image/png"
                @change="onChangeFileInput"
              />
            </v-col>
          </v-row>
        </v-stepper-content>

        <v-stepper-content step="2">
          <v-row no-gutters justify="center" align-content="center" class="mb-2">
            <v-btn @click="e1 = 1" color="primary"
              ><v-icon class="mr-2">mdi-arrow-left</v-icon>{{ $t("common.back") }}</v-btn
            >
            <v-spacer />
            <v-btn @click="createCardImage(false)" color="accent">
              <v-icon class="mr-2">mdi-waves-arrow-up</v-icon>{{ $t("uni_maker.create") }}
            </v-btn>
          </v-row>
          <v-row no-gutters justify="center" align-content="center">
            <v-col cols="12" md="6">
              <div style="position: relative">
                <div
                  class="uniFrame"
                  ref="uniFrame"
                  @click="uniClick"
                  @touchstart="uniTouchStart"
                  @touchend="uniTouchEnd"
                  @touchmove="uniTouch"
                  :style="`width:${uniProp.canvas.width}px; height:${uniProp.canvas.height}px; zoom: ${zoom}; ${
                    canvas ? 'position:absolute; left: -1920px;' : ''
                  }`"
                >
                  <v-img
                    :src="cropedImg"
                    class="uniPhoto"
                    :width="uniProp.canvas.width"
                    :height="uniProp.canvas.height"
                  />
                  <canvas
                    class="uniCanvas"
                    ref="uniCanvas"
                    :width="uniProp.canvas.width"
                    :height="uniProp.canvas.height"
                    style="touch-action: none"
                  ></canvas>
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <v-row no-gutters justify="center" align-content="center">
                <v-card-text>{{ $t("uni_maker.msg_tap_uni_position") }}</v-card-text>
                <v-btn-toggle v-model="uniBG" mandatory color="primary" :label="$t('uni_maker.background')">
                  <v-btn><v-icon :color="uniProp.lineColor.hex">mdi-square</v-icon></v-btn>
                  <v-btn v-for="asset in uniBGAssets" :key="asset.name">
                    <v-img :src="require(`@/assets/${asset.path}`)" width="40"></v-img>
                  </v-btn>
                </v-btn-toggle>
              </v-row>
              <v-toolbar class="ma-0" elevation="0">
                <template>
                  <v-menu bottom offset-y>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn dense v-bind="attrs" v-on="on" icon color="primary">
                        <v-icon>mdi-palette</v-icon>
                      </v-btn>
                    </template>
                    <v-card :width="dispWidth" class="pa-3">
                      <v-card-title
                        >{{ $t("uni_maker.color") }}<v-spacer /><v-btn icon
                          ><v-icon>mdi-close</v-icon></v-btn
                        ></v-card-title
                      >
                      <v-color-picker
                        v-model="uniProp.lineColor"
                        dot-size="25"
                        swatches-max-height="140"
                        mode="hexa"
                        show-swatches
                        hide-sliders
                        hide-canvas
                        hide-inputs
                      >
                      </v-color-picker>
                    </v-card>
                  </v-menu>
                  <v-menu bottom offset-y>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn v-bind="attrs" v-on="on" icon color="primary"><v-icon>mdi-octagram</v-icon></v-btn>
                    </template>
                    <v-card :width="dispWidth" class="pa-3">
                      <v-card-title
                        >{{ $t("uni_maker.shape") }}<v-spacer /><v-btn icon
                          ><v-icon>mdi-close</v-icon></v-btn
                        ></v-card-title
                      >
                      <v-slider
                        v-show="false"
                        v-model="uniProp.canvas.width"
                        :label="$t('uni_maker.canvas_weight')"
                        min="400"
                        max="2000"
                      ></v-slider>
                      <v-slider
                        v-show="false"
                        v-model="uniProp.canvas.height"
                        :label="$t('uni_maker.canvas_height')"
                        min="400"
                        max="2000"
                      ></v-slider>
                      <v-slider
                        v-model="uniProp.circleRadius.min"
                        :label="$t('uni_maker.size')"
                        min="20"
                        max="600"
                      ></v-slider>
                      <v-slider
                        v-model="uniProp.circleRadius.amplitude"
                        :label="$t('uni_maker.naughtiness')"
                        min="0"
                        max="100"
                      ></v-slider>
                    </v-card>
                  </v-menu>
                  <v-menu bottom offset-y>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn v-bind="attrs" v-on="on" icon color="primary"><v-icon>mdi-cog</v-icon></v-btn>
                    </template>
                    <v-card :width="dispWidth" class="pa-3">
                      <v-card-title>
                        {{ $t("uni_maker.other_settings") }}<v-spacer /><v-btn icon
                          ><v-icon>mdi-close</v-icon></v-btn
                        ></v-card-title
                      >
                      <v-slider
                        v-model="uniProp.lineWidth"
                        :label="$t('uni_maker.line_width')"
                        min="10"
                        max="180"
                      ></v-slider>
                      <v-slider
                        v-model="uniProp.lineNum"
                        :label="$t('uni_maker.line_number')"
                        min="30"
                        max="500"
                      ></v-slider>
                    </v-card>
                  </v-menu>
                  <v-btn @click="onChangeUniProp(uniProp, uniProp)" icon color="primary">
                    <v-icon>mdi-reload</v-icon>
                  </v-btn>
                  <v-spacer />
                  <v-btn-toggle v-model="plays" color="primary" rounded>
                    <v-btn icon>
                      <v-icon v-show="!play" color="primary">mdi-play</v-icon>
                      <v-icon v-show="play" color="primary">mdi-pause</v-icon>
                    </v-btn>
                  </v-btn-toggle>
                  <v-spacer />
                </template>
              </v-toolbar>
            </v-col>
          </v-row>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>

    <v-overlay v-show="canvas">
      <v-progress-circular color="primary" indeterminate />
    </v-overlay>

    <!-- issue dialog -->
    <v-dialog :fullscreen="mobile" v-model="dialog">
      <v-card style="background-color: white">
        <v-card-title>
          <v-spacer />
          <span v-if="forStaff">{{
            $t("messages.card_copy_issued", {
              card: $t(`organization.${cardType.organization_type}.card_title`).toString().toLowerCase(),
            })
          }}</span>
          <span v-else>
            {{ $t("uni_maker.msg_created") }}
          </span>
          <v-spacer />
        </v-card-title>
        <v-card-text align="center">{{ $t("messages.save_image") }}</v-card-text>
        <v-card-text align="center" class="pa-0">
          <img :src="dataURL" style="max-width: min(90%, 720px)" />
        </v-card-text>
        <v-card-text align="center" v-if="false">
          <img :src="cropedImg" style="max-width: min(90%, 720px)" />
        </v-card-text>
        <v-card-text align="center">
          {{ $t("messages.share_image") }}
          <v-dialog v-model="tweetDialog" width="500">
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on">
                <v-icon color="light-blue">mdi-twitter</v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-title>{{ $t("common.attention") }}</v-card-title>
              <v-card-text>
                {{ $t("messages.tweet_attention") }}
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn :href="tweetShareURL" target="_blank">
                  <v-icon color="light-blue">mdi-twitter</v-icon>
                  {{ $t("common.tweet") }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeDialog" color="primary"><v-icon>mdi-close</v-icon>{{ $t("common.close") }}</v-btn>
          <v-spacer />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<style>
@media only screen and (max-width: 959px) {
  .v-stepper:not(.v-stepper--vertical) .v-stepper__label {
    display: flex !important;
  }
}
</style>
<style scoped>
@font-face {
  font-family: "Yasashisa Bold";
  src: url("@/assets/fonts/yasashisa.ttf") format("truetype");
}
.uniFrame {
  margin-right: auto;
  margin-left: auto;
  position: relative;
}
.uniPhoto {
  position: absolute;
}
.uniCanvas {
  position: absolute;
  /* background-color: blanchedalmond; */
}
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
.cardTitle {
  position: absolute;
  top: 134px;
  left: 177px;
  font-size: 91px;
  letter-spacing: 0.14em;
  font-family: "Murecho";
  font-weight: 500;
  -webkit-text-size-adjust: auto;
}
.organizationName {
  display: flex;
  position: absolute;
  color: var(--v-accent-base);
  top: 156px;
  right: 156px;
  font-size: 59px;
  /* letter-spacing: 0.11em; */
  font-family: "Yasashisa Bold";
  -webkit-text-size-adjust: auto;
}
.photoPreview {
  width: 474px;
  height: 632px;
  overflow: hidden;
  position: absolute;
  top: 385px;
  left: 200px;
  border-radius: 24px;
  background-color: white;
}
.infoPreview {
  width: 976px;
  height: 632px;
  overflow: hidden;
  position: absolute;
  top: 385px;
  left: 746px;
  border-radius: 24px;
  text-align: center;
  background-color: rgb(255, 255, 255);
  display: flex;
  flex-direction: column;
  font-family: "Murecho";
  font-weight: 300;
  -webkit-text-size-adjust: auto;
}
.memberNo {
  font-size: 60px;
  line-height: 80px;
}
.division {
  font-size: 60px;
  line-height: 80px;
}
.memberName {
  font-weight: 500;
  text-align: center;
  flex-grow: 1;
  font-size: 84px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.cropper {
  max-width: 400px;
  min-height: 200px;
  text-align: center;
}
@media only screen and (max-width: 959px) {
  .v-stepper:not(.v-stepper--vertical) .v-stepper__label {
    display: flex !important;
  }
}
</style>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { MODEL } from "@/module";
import { ref } from "vue";
import VueCropper from "vue-cropperjs";
import html2canvas from "html2canvas";
import "cropperjs/dist/cropper.css";

@Component({
  components: {
    VueCropper,
  },
})
export default class CardMaker extends Vue {
  @Prop({ required: true }) cardType?: MODEL.CardType;
  private imgSrc = ref();
  private cropedImg?: string | ArrayBuffer | null = "";
  private file = null;
  private memberNo = "";
  private division = "";
  private memberName = "";
  private trim = false;
  private forStaff = false;
  private downloadFileName = "";
  private dataURL = "";
  private dialog = false;
  private tweetDialog = false;
  private canvas = false;
  // private play = false;
  private plays = null;
  private playFrameMS = 100;
  private issueImageScale = 1;
  private uniBGAssets = [
    {
      name: "sea",
      path: "uniBG03.png",
    },
    {
      name: "sea2",
      path: "uniBG02.png",
    },
    {
      name: "leaf",
      path: "uniBG04.png",
    },
    {
      name: "battle",
      path: "uniBG05.png",
    },
  ];
  private overlayImgList: HTMLImageElement[] = [];
  private e1 = 1;
  private uniBG = 0;
  private uniProp = {
    canvas: {
      width: 1200,
      height: 1200,
    },
    lineNum: 450,
    lineWidth: 140,
    center: {
      x: 600,
      y: 600,
    },
    circleRadius: {
      amplitude: 50,
      min: 160,
    },
    lineColor: {
      alpha: 1,
      hex: "#000000",
      hexa: "#000000FF",
      hue: 0,
      rgba: { r: 255, g: 0, b: 0, a: 1 },
    },
  };
  get computedUniProp() {
    return JSON.parse(JSON.stringify(this.uniProp));
  }
  created() {
    const staff = this.$route.query.staff;
    if (staff != null) {
      this.forStaff = true;
    }
  }

  mounted() {
    this.imgSrc = require(`@/assets/${this.cardType?.assets.default_photo}`);
    this.uniBGAssets.forEach((asset) => {
      const img = new Image();
      img.src = require(`@/assets/${asset.path}`);
      this.overlayImgList.push(img);
    });
  }

  get play(): boolean {
    if (this.plays == null) {
      return false;
    } else {
      return true;
    }
  }

  @Watch("cardType")
  onChangeCardType() {
    this.imgSrc = require(`@/assets/${this.cardType?.assets.default_photo}`);
  }

  @Watch("computedUniProp", { deep: true })
  onChangeUniProp(after: any, before: any) {
    let refresh = true;
    if (JSON.stringify(before.lineColor) != JSON.stringify(after.lineColor)) {
      refresh = false;
      this.uniBG = 0;
      // this.imageOverlay = false;
    }
    // if (this.cropedImg != "") {
    this.plays = null;
    this.drawFocusLine(refresh);
    // }
  }

  @Watch("play")
  onChangePlay(play: boolean) {
    if (play) {
      this.drawFocusLine(true);
    }
  }

  @Watch("uniBG")
  onChangeBGImage() {
    this.drawFocusLine(false);
  }

  @Watch("imageOverlay")
  onChangeImageOverlay() {
    this.drawFocusLine(false);
  }

  private uniClick(event: PointerEvent) {
    // console.log(event.offsetX, event.offsetY);
    this.uniProp.center = { x: event.offsetX / this.zoom, y: event.offsetY / this.zoom };
  }

  private logging = "";
  private pinchDist = 0;
  private pinching = false;
  private touchCount = 0;
  private uniTouchStart(event: any) {
    if (event.changedTouches.length >= 2) {
      this.pinching = true;
      const t1 = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
      const t2 = { x: event.changedTouches[1].clientX, y: event.changedTouches[1].clientY };
      const dist = Math.sqrt(Math.pow(t2.x - t1.x, 2) + Math.pow(t2.y - t2.y, 2));
      this.pinchDist = dist;
    }
    this.touchCount = event.touches.length;
  }
  private uniTouchEnd(event: any) {
    if (event.touches.length == 0) {
      this.pinching = false;
      this.pinchDist = 0;
    }
    this.touchCount = event.touches.length;
  }
  private uniTouch(event: any) {
    const changedTouchesCount = event.changedTouches.length;
    this.touchCount = event.touches.length;
    console.log(event);
    // this.logging = `${touchCount}`;
    if (this.touchCount >= 2) {
      if (!this.pinching) {
        this.pinching = true;
      }
    }
    if (changedTouchesCount >= 2) {
      const t1 = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
      const t2 = { x: event.changedTouches[1].clientX, y: event.changedTouches[1].clientY };
      const dist = Math.sqrt(Math.pow(t2.x - t1.x, 2) + Math.pow(t2.y - t2.y, 2));
      if (this.pinchDist < dist) {
        this.uniProp.circleRadius.min = Math.min(600, this.uniProp.circleRadius.min + 10);
      } else {
        this.uniProp.circleRadius.min = Math.max(0, this.uniProp.circleRadius.min - 10);
      }
      this.pinchDist = dist;
    } else {
      if (!this.pinching) {
        const touch = event.changedTouches[0];
        const bounds = touch.target.getBoundingClientRect();
        const x = touch.clientX - bounds.left * this.zoom;
        const y = touch.clientY - bounds.top * this.zoom;
        // console.log("要素内で... x=" + x, "y=" + y);
        this.uniProp.center = { x: x / this.zoom, y: y / this.zoom };
      }
    }
  }

  private drawFocusLine(refresh?: boolean) {
    const canvas = this.$refs.uniCanvas as HTMLCanvasElement;
    this.focusLine(
      canvas,
      this.uniProp.center.x,
      this.uniProp.center.y,
      this.uniProp.lineWidth,
      this.uniProp.lineNum,
      this.uniProp.circleRadius.min + this.uniProp.circleRadius.amplitude,
      this.uniProp.circleRadius.min,
      this.uniProp.lineColor.hex,
      refresh
    );
  }

  private get imageOverlay(): boolean {
    return this.uniBG != 0;
  }

  private get cropper() {
    return this.$refs.cropper as any;
  }

  private get fileInput() {
    return this.$refs.fileInput as any;
  }

  get trimClass(): string {
    return this.trim ? "overflowHidden" : "";
  }

  get filled(): boolean {
    return this.file != null && this.memberNo !== "" && this.memberName !== "" && this.division !== "";
  }

  get mobile(): boolean {
    return this.$vuetify.breakpoint.mobile;
  }

  get numberLabel(): string {
    return this.$t(`organization.${this.cardType?.organization_type}.membership_no`).toString();
  }

  get logoStyleString(): string {
    return `letter-spacing: ${this.$t("common.logo_spacing", "ja")};`;
  }

  get titleStyleString(): string {
    return `color: ${this.cardType?.colors.title_font};`;
  }

  get memberNameStyle(): string {
    return this.cardType?.layout?.title_pr ? `padding-right: ${this.cardType?.layout?.title_pr}` : "";
  }

  get cardOverlay(): string | undefined {
    return this.cardType?.assets.overlay;
  }

  get dispWidth(): number {
    return this.$vuetify.breakpoint.width;
  }

  get mdColWidth(): number {
    if (this.$vuetify.breakpoint.mdAndUp) return this.dispWidth / 2;
    else return this.dispWidth;
  }

  get zoom(): number {
    if (this.canvas) {
      return 1;
    } else {
      const root = this.$refs.root as HTMLElement;
      const [marginTortalm, previewOriginalWidth, maxZoom] = [48, this.uniProp.canvas.width, 0.5];
      return Math.min((this.mdColWidth - marginTortalm) / previewOriginalWidth, maxZoom);
    }
  }
  get overlayImg(): HTMLImageElement {
    if (this.uniBG > 0 && this.uniBG <= this.overlayImgList.length) {
      return this.overlayImgList[this.uniBG - 1];
    } else {
      return this.overlayImgList[0];
    }
  }
  private onChangeFileInput() {
    this.file = this.fileInput.files[0];
    if (this.file == null) {
      this.cropper.destroy();
    } else {
      this.cropper.replace(URL.createObjectURL(this.file));
    }
  }

  private cropImage() {
    // get image data for post processing, e.g. upload or setting image src
    if (this.file !== null) {
      this.cropedImg = this.cropper.getCroppedCanvas().toDataURL();
      this.drawFocusLine(true);
    }
  }
  private rotate(deg: number) {
    // guess what this does :)
    this.cropper.rotate(deg);
  }

  private move(offsetX: number, offsetY: number) {
    this.cropper.move(offsetX, offsetY);
  }

  private relativeZoom(ratio: number) {
    this.cropper.relativeZoom(ratio);
  }

  private reset(ratio: number) {
    this.cropper.reset();
  }
  private async createCardImage(download: boolean) {
    this.plays = null;
    this.canvas = true;
    Vue.nextTick(async () => {
      const preview: HTMLElement = this.$refs.uniFrame as HTMLElement;
      const params: Parameters<typeof html2canvas> = [
        preview,
        {
          scale: this.issueImageScale,
          width: this.uniProp.canvas.width,
          height: this.uniProp.canvas.height,
        },
      ];
      const canvasElement = await html2canvas(...params).catch((e) => {
        console.error(e);
        this.canvas = false;
        return;
      });
      if (!canvasElement) {
        this.canvas = false;
        return;
      }
      const dataURL = canvasElement.toDataURL("image/png");
      this.canvas = false;
      if (download) {
        let link = document.createElement("a");
        link.href = dataURL;
        link.target = "_blank";
        if (this.downloadFileName !== "") {
          link.download = `${this.downloadFileName}.png`;
        } else {
          link.download = `${this.memberNo}_${this.division}_${this.memberName}.png`;
        }
        link.click();
      } else {
        this.dataURL = dataURL;
        this.dialog = true;
      }
    });
  }

  private closeDialog() {
    this.dialog = false;
    this.dataURL = "";
  }

  private cardBGLoaded() {
    this.$nextTick(() => {
      this.trim = true;
    });
  }

  private lines: LineInterface[] = [];
  private focusLine(
    canvas: HTMLCanvasElement,
    centralX: number,
    centralY: number,
    lineWidth: number,
    lineNum: number,
    circleRadiusMax: number,
    circleRadiusMin: number,
    lineColor: string,
    refresh?: boolean
  ) {
    const ctx = canvas.getContext("2d");
    let lines: Liner[] = [];

    const csRadius = Math.sqrt(
      Math.pow(Math.max(canvas.width - centralX, centralX), 2) +
        Math.pow(Math.max(canvas.height - centralY, centralY), 2)
    );

    class Liner implements LineInterface {
      private deg = 0;
      private moveDeg = 0;
      private endRadius = 0;
      private startPos: Pos = { x: 0, y: 0 };
      private endPos: Pos = { x: 0, y: 0 };
      private movePos: Pos = { x: 0, y: 0 };
      private lineColor = "#000000FF";

      constructor() {
        this.initialize();
      }

      private initialize() {
        this.deg = this.getRandomInt(360, 0);
      }

      private getRandomInt = (max: number, min: number): number => {
        return Math.floor(Math.random() * (max - min)) + min;
      };

      getCircumPos = {
        x: (deg: number, rad: number, cx: number): number => {
          return Math.cos((Math.PI / 180) * deg) * rad + cx;
        },
        y: (deg: number, rad: number, cy: number): number => {
          return Math.sin((Math.PI / 180) * deg) * rad + cy;
        },
      };

      setPos() {
        this.moveDeg = this.deg + this.getRandomInt(lineWidth, 1) / 10;
        this.endRadius = this.getRandomInt(circleRadiusMax, circleRadiusMin);
        this.startPos = {
          x: this.getCircumPos.x(this.deg, csRadius, centralX),
          y: this.getCircumPos.y(this.deg, csRadius, centralY),
        };
        this.movePos = {
          x: this.getCircumPos.x(this.moveDeg, csRadius, centralX),
          y: this.getCircumPos.y(this.moveDeg, csRadius, centralY),
        };
        this.endPos = {
          x: this.getCircumPos.x(this.moveDeg, this.endRadius, centralX),
          y: this.getCircumPos.y(this.moveDeg, this.endRadius, centralY),
        };
      }

      setColor(color: string) {
        this.lineColor = color;
      }

      update() {
        this.setPos();
      }

      draw() {
        if (ctx) {
          ctx.beginPath();
          ctx.lineWidth = 1;
          ctx.fillStyle = this.lineColor;
          ctx.moveTo(this.startPos.x, this.startPos.y);
          ctx.lineTo(this.movePos.x, this.movePos.y);
          ctx.lineTo(this.endPos.x, this.endPos.y);
          ctx.fill();
          ctx.closePath();
        }
      }

      render(refresh: boolean) {
        if (refresh) {
          this.update();
        }
        this.draw();
      }
    }

    const createLines = (num: number) => {
      this.lines = [];
      [...Array(num)].map(() => this.lines.push(new Liner()));
    };

    const render = (refresh: boolean) => {
      if (ctx) ctx.globalCompositeOperation = "source-over";
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      this.lines.forEach((l) => {
        l.setColor(lineColor);
        l.render(refresh);
      });
      if (this.imageOverlay) {
        if (ctx) ctx.globalCompositeOperation = "source-in";
        const [width, height] = [this.overlayImg.width, this.overlayImg.height];
        let origin = { x: 0, y: 0 };
        if (width - height > 0) {
          // 高さの方が短い
          // 比率チェック
          const scale = canvas.height / height;
          const gap = (width * scale - canvas.width) / 2;
          ctx?.drawImage(this.overlayImg, gap * -1, 0, width * scale, canvas.height);
        } else {
          // 幅の方が短い
          const scale = canvas.width / width;
          const gap = (height * scale - canvas.height) / 2;
          ctx?.drawImage(this.overlayImg, 0, gap * -1, canvas.height, height * scale);
        }
      }
      if (this.play)
        setTimeout(() => {
          if (this.play) render(refresh);
        }, this.playFrameMS);
    };

    const shouldRefresh = refresh || this.lines.length == 0;
    if (shouldRefresh) {
      createLines(lineNum);
    }
    render(shouldRefresh);
  }

  get orgNameHashTag(): string {
    return `#${this.$t("uni_maker.app_name", "ja")} #${this.$t("uni_maker.app_name", "en")}`;
  }

  get shareText(): string {
    return encodeURIComponent(`${this.$t("uni_maker.msg_created")}

${this.orgNameHashTag}
`);
  }

  get tweetShareURL(): string {
    let url = `${location.protocol}//${location.host}${location.pathname}`;
    const shareURL = `https://twitter.com/intent/tweet?text=${this.shareText}&url=${url}`;
    return shareURL;
  }
}
interface Pos {
  x: number;
  y: number;
}
interface LineInterface {
  update(): void;
  setPos(): void;
  draw(): void;
  render(refresh: boolean): void;
  setColor(color: string): void;
}
</script>
