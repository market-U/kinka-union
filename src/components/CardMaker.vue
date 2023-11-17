<template>
  <div>
    <v-stepper v-model="step" elevation="0" vertical>
      <v-stepper-step step="1" editable :complete="file != null" edit-icon="$complete">
        {{ $t("labels.photo_section_title") }}
      </v-stepper-step>
      <v-stepper-content step="1">
        <v-row no-gutters>
          <v-col align="center" cols="12" md="12">
            <v-file-input
              v-model="file"
              filled
              rounded
              dense
              accept="image/*"
              :label="
                $t('messages.select_photo', {
                  member: $t(`organization.${cardType.organization_type}.member`).toString().toLowerCase(),
                })
              "
              @change="onChangeFileInput"
              :clearable="false"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col align="center" cols="12" md="12">
            <vue-cropper
              ref="cropper"
              class="ma-3 cropper"
              :style="`background-color: ${cardType.colors.default_photo_bg}; filter: contrast(${imgContrast}%) brightness(${imgBrightness}%)`"
              :guides="true"
              :view-mode="2"
              drag-mode="crop"
              :auto-crop-area="0.5"
              :min-container-width="250"
              :min-container-height="180"
              :background="true"
              :rotatable="true"
              alt="No Image..."
              :src="imgSrc"
              :aspect-ratio="3 / 4"
              preview=".photoPreview"
              @cropend="cropImage"
            />
          </v-col>
          <v-col class="pa-3" cols="12" md="12">
            <div class="toolButtons" style="text-align: center">
              <v-btn @click="rotate(-90)" :disabled="!file" icon color="primary"
                ><v-icon>mdi-file-rotate-left</v-icon></v-btn
              >
              <v-btn @click="rotate(90)" :disabled="!file" icon color="primary"
                ><v-icon>mdi-file-rotate-right</v-icon></v-btn
              >
              <v-btn @click="move(-10, 0)" :disabled="!file" icon color="primary"
                ><v-icon>mdi-arrow-left</v-icon></v-btn
              >
              <v-btn @click="move(10, 0)" :disabled="!file" icon color="primary"
                ><v-icon>mdi-arrow-right</v-icon></v-btn
              >
              <v-btn @click="move(0, -10)" :disabled="!file" icon color="primary"><v-icon>mdi-arrow-up</v-icon></v-btn>
              <v-btn @click="move(0, 10)" :disabled="!file" icon color="primary"><v-icon>mdi-arrow-down</v-icon></v-btn>
              <v-btn @click="relativeZoom(0.1)" :disabled="!file" icon color="primary"
                ><v-icon>mdi-magnify-plus</v-icon></v-btn
              >
              <v-btn @click="relativeZoom(-0.1)" :disabled="!file" icon color="primary"
                ><v-icon>mdi-magnify-minus</v-icon></v-btn
              >
              <v-btn @click="reset()" :disabled="!file" icon color="primary"><v-icon>mdi-undo-variant</v-icon></v-btn>
            </div>
          </v-col>
        </v-row>
        <v-row v-show="false" no-gutters>
          明るさ<v-slider v-model="imgBrightness" step="1" min="25" max="200"></v-slider> </v-row
        ><v-row v-show="false" no-gutters>
          コントラスト<v-slider v-model="imgContrast" step="1" min="25" max="200"></v-slider>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <v-card-actions>
              <v-spacer />
              <v-btn @click="step = 2" color="primary"><v-icon>mdi-redo</v-icon>{{ $t("common.next") }}</v-btn>
              <!-- <v-btn @click="step = 3" text>next</v-btn> -->
            </v-card-actions>
          </v-col>
        </v-row>
      </v-stepper-content>
      <v-stepper-step step="2" editable :complete="profileFilled" edit-icon="$complete">
        {{ $t("labels.input_profile") }}
      </v-stepper-step>
      <v-stepper-content step="2">
        <v-row>
          <v-col>
            <span>
              {{ $t("labels.card_preview") }}
            </span>
            <div
              class="cardFrame mt-1"
              :class="trimClass"
              ref="cardFrame"
              :style="`zoom: ${zoom}; ${canvas ? 'position:absolute; left: -1920px;' : ''}`"
            >
              <div class="cardPreview" ref="cardPreview">
                <v-img :src="require(`../assets/${cardType.assets.card_bg}`)" @load="cardBGLoaded()" />
                <div class="cardTitle" :style="titleStyleString">
                  {{ $t(`organization.${cardType.organization_type}.card_title`) }}
                </div>
                <div class="organizationName" :style="logoStyleString" v-if="cardType.assets.logo">
                  <v-img :src="require(`@/assets/${cardType.assets.logo}`)" width="84px" class="mr-2" />
                  {{
                    $t(`organization.${cardType.organization_type}.name`, "ja", {
                      msg: $t(`bird.${cardType.bird_type}`, "ja").toString(),
                    })
                  }}
                </div>
                <div
                  class="photoPreview"
                  :style="`filter: contrast(${imgContrast}%) brightness(${imgBrightness}%)`"
                ></div>
                <div class="infoPreview pa-10" :style="`color: ${cardType.colors.card_info_font};`">
                  <v-card-title class="memberNo ma-2">{{ numberLabel }} {{ memberNo }}</v-card-title>
                  <v-card-title class="division ma-2">{{ divisionLabel }}</v-card-title>
                  <div class="memberName" :style="memberNameStyle">{{ memberName }}</div>
                </div>
                <v-img class="cardOverlay" ref="overlayImg" v-show="cardOverlay" :src="overlayImgSrc" />
              </div>
            </div>
          </v-col>
          <v-col>
            <v-text-field :label="numberLabel" v-model="memberNo" />
            <div class="d-flex flex-column">
              <v-text-field :label="$t('labels.division_name')" v-model="division" />
              <div class="d-flex justify-end">
                <v-checkbox v-model="hideDivision" style="margin-top: -20px; margin-bottom: -20px">
                  <div slot="label">
                    <div class="text-caption">{{ $t("labels.hide_division") }}</div>
                  </div>
                </v-checkbox>
              </div>
            </div>
            <v-text-field :label="$t('labels.member_name')" v-model="memberName" />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-card-actions>
              <v-spacer />
              <v-btn @click="step = 1"><v-icon>mdi-undo</v-icon>{{ $t("common.back") }}</v-btn>
              <v-btn
                @click="
                  createCardImage(false);
                  step = 3;
                "
                :disabled="!filled"
                color="primary"
                ><v-icon class="mr-2">mdi-smart-card-outline</v-icon>{{ $t("common.issue") }}</v-btn
              >
            </v-card-actions>
          </v-col>
        </v-row>
      </v-stepper-content>
      <v-stepper-step step="3">{{ $t("common.issue") }}</v-stepper-step>
      <v-stepper-content step="3">
        <v-card-title align="center" class="text-subtitle-1 font-weight-bold">
          <v-spacer />
          <span>
            {{
              $t("messages.card_issued", {
                card: $t(`organization.${cardType.organization_type}.card`).toString().toLowerCase(),
              })
            }}
          </span>
          <v-spacer />
        </v-card-title>
        <v-row align="center" justify="center" no-gutters>
          <img :src="dataURL" style="max-width: min(100%, 720px)" />
        </v-row>
        <v-row align="center" justify="center">
          <v-col align="center">
            <v-alert
              align="left"
              border="left"
              class="mr-1 ml-1"
              colored-border
              color="primary"
              elevation="2"
              max-width="720px"
            >
              <div class="text-body-2">{{ $t("messages.save_image") }}</div>
              <div class="text-body-2">
                {{ $t("messages.share_image") }}
              </div>
              <v-card-actions>
                <v-spacer />
                <v-btn
                  v-if="canShare"
                  @click="shareCardImg()"
                  small
                  outlined
                  rounded
                  color="light-blue"
                  :loading="shareLoading"
                  ><v-icon color="light-blue">mdi-share</v-icon>{{ $t("common.share") }}</v-btn
                >
                <v-btn v-else :href="tweetShareURL" target="_blank" small outlined rounded color="light-blue"
                  ><v-icon color="light-blue">mdi-twitter</v-icon>{{ $t("common.tweet") }}</v-btn
                >
              </v-card-actions>
            </v-alert>
          </v-col>
        </v-row>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="step = 2"><v-icon>mdi-undo</v-icon>{{ $t("common.back") }}</v-btn>
        </v-card-actions>
        <v-card-title align="center" class="text-subtitle-1 font-weight-bold">
          <v-spacer />
          <span>{{ $t("messages.for_purchase") }}</span>
          <v-spacer />
        </v-card-title>
        <v-card-text align="center">
          <v-spacer />
          <v-btn @click="dialog = true" color="primary" rounded>
            <v-icon>mdi-credit-card-fast</v-icon>{{ $t("labels.apply_card") }}</v-btn
          >
          <v-spacer />
        </v-card-text>
        <v-spacer />
        <v-dialog v-model="dialog" fullscreen>
          <v-card>
            <v-system-bar height="36" fixed
              ><v-spacer /><v-btn @click="closeDialog" icon><v-icon>mdi-close</v-icon></v-btn>
            </v-system-bar>
            <v-card-title class="mt-8"
              ><div>{{ $t("labels.upload_data") }}</div>
            </v-card-title>
            <v-card-text class="text-body-1">{{ $t("messages.upload_instruction") }}</v-card-text>
            <v-card-text>
              <v-row justify="center">
                <img :src="dataURL" style="max-width: min(100%, 720px)" />
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                @click="uploadCardImage"
                color="primary"
                :disabled="uploadURL != '' || uploading"
                :loading="uploading"
                ><v-icon>mdi-upload</v-icon>{{ $t("common.upload") }}</v-btn
              >
              <v-spacer />
            </v-card-actions>
            <v-card-text v-show="uploadDialog">
              <v-divider class="mb-4" />
              <div>
                <v-row align="center" justify="center">
                  <v-col align="center">
                    <v-alert
                      type="info"
                      color="primary"
                      border="left"
                      colored-border
                      elevation="2"
                      max-width="720px"
                      align="left"
                    >
                      <div>
                        {{ $t("messages.upload_complete") }}
                      </div>
                      <v-divider class="ma-2" />
                      <div class="breakword text-body-2">{{ uploadURL }}</div>
                    </v-alert>
                  </v-col>
                </v-row>
                <v-card-actions>
                  <v-spacer />
                  <v-btn @click="copyToClipboard(uploadURL)" color="primary">
                    <v-icon class="ma-2">mdi-content-copy</v-icon>{{ $t("labels.copy_url") }}
                  </v-btn>
                  <v-spacer />
                </v-card-actions>
                <v-card-actions>
                  <v-spacer />
                  <v-btn href="https://t.co/RU2ekX0HhG" target="blank" color="primary" outlined rounded disabled>
                    <v-icon class="ma-2">mdi-store</v-icon>{{ $t("labels.store_link") }}
                  </v-btn>
                  <v-spacer />
                </v-card-actions>
                <v-row justify="center">
                  <v-col align="center" class="text-caption">
                    {{ $t("messages.sales_closed") }}
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
          </v-card>
          <v-snackbar v-model="snackbar" type="success" :timeout="timeout">{{ $t("messages.copied") }}</v-snackbar>
        </v-dialog>
      </v-stepper-content>
    </v-stepper>

    <v-overlay v-model="canvas">
      <v-progress-circular color="primary" indeterminate />
    </v-overlay>
  </div>
</template>
<style scoped>
@font-face {
  font-family: "Yasashisa Bold";
  src: url("@/assets/fonts/yasashisa.ttf") format("truetype");
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
.breakword {
  word-break: break-all;
}
</style>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { MODEL } from "@/module";
import { ref } from "vue";
import { v4 as uuidv4 } from "uuid";
import { BlockBlobClient, AnonymousCredential } from "@azure/storage-blob";
import VueCropper from "vue-cropperjs";
import html2canvas from "html2canvas";
import "cropperjs/dist/cropper.css";
import { NavigationGuardNext, Route } from "vue-router";

@Component({
  components: {
    VueCropper,
  },
})
export default class CardMaker extends Vue {
  @Prop({ required: true }) cardType?: MODEL.CardType;
  private imgSrc = ref();
  private overlayImgSrc? = ref();
  private cropedImg?: string | ArrayBuffer | null = "";
  private file = null;
  private memberNo = "";
  private division = "";
  private hideDivision = false;
  private memberName = "";
  private trim = false;
  // private forStaff = false;
  private downloadFileName = "";
  private dataURL = "";
  private dialog = false;
  private uploadDialog = false;
  private canvas = false;
  private snackbar = false;
  private timeout = 2000;
  private uploadURL = "";
  private step = 1;
  private uploading = false;
  private imgBrightness = 100;
  private imgContrast = 100;
  private shareLoading = false;

  created() {
    // const staff = this.$route.query.staff;
    // if (staff != null) {
    //   this.forStaff = true;
    // }
  }

  mounted() {
    this.setUpImgSrc();
  }

  @Watch("step")
  onChangeStep(step: number, stepBefore: number) {
    if (stepBefore >= 3 && step < 3) {
      this.resetImageData();
    }
  }

  @Watch("cardType")
  onChangeCardType() {
    this.setUpImgSrc();
    this.step = 2;
  }

  private setUpImgSrc() {
    this.imgSrc = require(`@/assets/${this.cardType?.assets.default_photo}`);
    if (this.cardOverlay) {
      this.overlayImgSrc = require(`@/assets/${this.cardOverlay}`);
    } else {
      this.overlayImgSrc = undefined;
    }
  }

  private get cropper() {
    return this.$refs.cropper as any;
  }

  get trimClass(): string {
    return this.trim ? "overflowHidden" : "";
  }

  get profileFilled(): boolean {
    return this.memberNo !== "" && this.memberName !== "" && (this.hideDivision || this.division !== "");
  }

  get filled(): boolean {
    return this.file != null && this.profileFilled;
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

  get canShare(): boolean {
    return navigator.share !== undefined ? true : false;
  }

  private onChangeFileInput() {
    if (this.file == null) {
      this.cropper.destroy();
    } else {
      this.cropper.replace(URL.createObjectURL(this.file));
    }
  }

  private cropImage() {
    // get image data for post processing, e.g. upload or setting image src
    this.cropedImg = this.cropper.getCroppedCanvas().toDataURL();
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
    this.canvas = true;
    Vue.nextTick(async () => {
      const preview: HTMLElement = this.$refs.cardFrame as HTMLElement;
      const params: Parameters<typeof html2canvas> = [preview, { scale: 1 }];
      const canvasElement = await html2canvas(...params).catch((e) => {
        console.error(e);
        return;
      });
      if (!canvasElement) {
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
      }
    });
  }

  private async getCardBlobFromDataURL(dataUrl: string): Promise<Blob | null> {
    return await (await fetch(dataUrl)).blob();
  }

  private async getCardBlob(copy: boolean): Promise<Blob | null> {
    const preview: HTMLElement = copy ? (this.$refs.cardPreview as HTMLElement) : (this.$refs.cardFrame as HTMLElement);
    const params: Parameters<typeof html2canvas> = [preview, { scale: 1 }];
    const canvasElement = await html2canvas(...params).catch((e) => {
      console.error(e);
      this.uploading = false;
      return null;
    });
    if (!canvasElement) {
      console.error("canvasElement not found");
      return null;
    }
    return new Promise((resolve, reject) => {
      canvasElement.toBlob((blob) => {
        resolve(blob);
      });
    });
  }

  private async uploadCardImage() {
    this.uploading = true;
    Vue.nextTick(async () => {
      this.getCardBlob(true).then((blob) => {
        if (blob) {
          this.uploadImgToBlobStorage(blob).finally(() => {
            // this.uploading = false;
          });
        } else {
          console.error("blob from canvasElement not found");
          this.uploading = false;
        }
      });
    });
  }

  private generateUUID(): string {
    return uuidv4();
  }

  private async uploadImgToBlobStorage(blob: Blob): Promise<void> {
    const cardID = this.generateUUID();
    const filename = `${cardID}.png`;
    fetch("/api/credentials")
      .then((res) => res.json())
      .then((json) => {
        const blockBlobClient = new BlockBlobClient(
          `${json.url}/${this.cardType!.bird_type}/${filename}?${json.sasToken}`,
          new AnonymousCredential()
        );
        return blockBlobClient.uploadData(blob);
      })
      .then((blobRes) => {
        let href = window.location.href;
        if (!href.endsWith("/")) {
          href = href.padEnd(href.length + 1, "/");
        }
        this.uploadURL = `${href}copy/${cardID}`;
        this.uploadDialog = true;
        return;
      })
      .finally(() => {
        this.uploading = false;
      });
    return;
  }

  private resetImageData() {
    console.debug("resetImageData");
    this.dataURL = "";
    this.uploadURL = "";
  }

  private closeDialog() {
    this.dialog = false;
    this.closeUploadDialog();
  }

  private closeUploadDialog() {
    this.uploadDialog = false;
    this.uploadURL = "";
  }

  private cardBGLoaded() {
    this.$nextTick(() => {
      this.trim = true;
    });
  }

  get organizationName(): string {
    return this.$t(`organization.${this.cardType?.organization_type}.name`, {
      msg: this.$t(`bird.${this.cardType?.bird_type}`).toString(),
    }).toString();
  }

  get orgNameHashTag(): string {
    return `#${this.organizationName.replace(/ /g, "")}`;
  }

  get appNameHashTag(): string {
    return `#${"KinkaUnionCardMaker"}`;
  }

  get divisionLabel(): string {
    return this.hideDivision ? this.division : this.$t("caption.division", { msg: this.division }).toString();
  }

  get shareText(): string {
    return `${this.$t("common.welcome_msg", { msg: this.organizationName })}!!

${this.numberLabel} ${this.memberNo}
${this.divisionLabel}
${this.memberName}

${this.orgNameHashTag}
${this.appNameHashTag}
`;
  }

  get shareTextEncoded(): string {
    return encodeURIComponent(this.shareText);
  }

  get tweetShareURL(): string {
    let url = `${location.protocol}//${location.host}${location.pathname}`;
    const shareURL = `https://twitter.com/intent/tweet?text=${this.shareTextEncoded}&url=${url}`;
    return shareURL;
  }

  private async shareCardImg(): Promise<void> {
    if (this.canShare) {
      this.shareLoading = true;
      Vue.nextTick(async () => {
        const blob = await this.getCardBlobFromDataURL(this.dataURL);
        this.shareLoading = false;
        if (blob) {
          navigator
            .share({
              text: `${this.shareText}
${location.protocol}//${location.host}${location.pathname}`,
              files: [new File([blob], "card.png", { type: "text/plain" })],
            })
            .then(() => {
              console.log("Share was successful.");
            })
            .catch((error) => {
              console.log("Sharing failed", error);
            });
        } else {
          console.error("failed to get blob.");
        }
      });
    } else {
      console.error("navigation.share not supported.");
    }
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
}
</script>
