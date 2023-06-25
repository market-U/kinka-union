<template>
  <div>
    <v-card class="ma-3 pa-3">
      <v-card-title>{{ $t("labels.photo_section_title") }}</v-card-title>
      <v-row>
        <v-col align="center" cols="12" md="6">
          <vue-cropper
            ref="cropper"
            class="ma-3 cropper"
            :style="`background-color: ${cardType.colors.default_photo_bg};`"
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
        <v-col class="pa-3" cols="12" md="6">
          <v-file-input
            class="ma-3"
            v-model="file"
            accept="image/*"
            :label="
              $t('messages.select_photo', {
                member: $t(`organization.${cardType.organization_type}.member`).toString().toLowerCase(),
              })
            "
            @change="onChangeFileInput"
            :clearable="false"
          />
          <div class="toolButtons" style="text-align: center">
            <v-btn @click="rotate(-90)" :disabled="!file" icon color="primary"
              ><v-icon>mdi-file-rotate-left</v-icon></v-btn
            >
            <v-btn @click="rotate(90)" :disabled="!file" icon color="primary"
              ><v-icon>mdi-file-rotate-right</v-icon></v-btn
            >
            <v-btn @click="move(-10, 0)" :disabled="!file" icon color="primary"><v-icon>mdi-arrow-left</v-icon></v-btn>
            <v-btn @click="move(10, 0)" :disabled="!file" icon color="primary"><v-icon>mdi-arrow-right</v-icon></v-btn>
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
    </v-card>
    <v-card class="ma-3 pa-3">
      <v-card-title>{{ $t("labels.card_preview") }}</v-card-title>
      <v-row>
        <v-col align="center">
          <div
            class="cardFrame"
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
              <div class="photoPreview"></div>
              <div class="infoPreview pa-10" :style="`color: ${cardType.colors.card_info_font};`">
                <v-card-title class="memberNo ma-2">{{ numberLabel }} {{ memberNo }}</v-card-title>
                <v-card-title class="division ma-2">{{ $t("caption.division", { msg: division }) }}</v-card-title>
                <div class="memberName" :style="memberNameStyle">{{ memberName }}</div>
              </div>
              <v-img class="cardOverlay" :src="cardOverlay ? require(`../assets/${cardOverlay}`) : ''" />
            </div>
          </div>
          <v-row v-if="forStaff">
            <v-spacer />
            <v-checkbox v-model="trim" :label="$t('labels.hide_bleed')" row style="display: inline"></v-checkbox>
            <v-spacer />
          </v-row>
        </v-col>
        <v-col>
          <v-text-field :label="numberLabel" v-model="memberNo" />
          <v-text-field :label="$t('labels.division_name')" v-model="division" />
          <v-text-field :label="$t('labels.member_name')" v-model="memberName" />
          <v-text-field
            v-if="forStaff"
            :label="$t('common.dl_file_name')"
            hint="指定しない場合は {組合員No.}_{支部名}_{おなまえ}.png となります。"
            v-model="downloadFileName"
          />
          <v-card-actions>
            <v-spacer />
            <v-btn @click="createCardImage(false)" :disabled="!file" color="primary" v-if="forStaff"
              ><v-icon class="mr-2">mdi-smart-card-outline</v-icon>{{ $t("common.show_copy") }}</v-btn
            >
            <v-btn @click="createCardImage(false)" :disabled="!file" color="primary" v-else
              ><v-icon class="mr-2">mdi-smart-card-outline</v-icon>{{ $t("common.issue") }}</v-btn
            >
            <v-btn @click="createCardImage(true)" :disabled="!file" color="primary" v-if="forStaff"
              ><v-icon>mdi-download</v-icon>{{ $t("common.download_copy") }}</v-btn
            >
          </v-card-actions>
        </v-col>
      </v-row>
    </v-card>

    <v-overlay v-model="canvas">
      <v-progress-circular color="primary" indeterminate />
    </v-overlay>

    <!-- issue dialog -->
    <v-dialog v-model="dialog">
      <v-card style="background-color: white">
        <v-system-bar height="36">
          <v-spacer />
          <v-btn @click="closeDialog" icon><v-icon>mdi-close</v-icon></v-btn>
        </v-system-bar>
        <v-card-title align="center">
          <v-spacer />
          <span v-if="forStaff">{{
            $t("messages.card_copy_issued", {
              card: $t(`organization.${cardType.organization_type}.card_title`).toString().toLowerCase(),
            })
          }}</span>
          <span v-else>
            {{
              $t("messages.card_issued", {
                card: $t(`organization.${cardType.organization_type}.card`).toString().toLowerCase(),
              })
            }}
          </span>
          <v-spacer />
        </v-card-title>
        <v-card-text align="center">
          <img :src="dataURL" style="max-width: min(90%, 720px)" />
        </v-card-text>
        <v-card-text align="center" v-if="false">
          <img :src="cropedImg" style="max-width: min(90%, 720px)" />
        </v-card-text>
        <v-card-text>
          <li>
            <span>{{ $t("messages.save_image") }}</span>
          </li>
          <li>
            <span> {{ $t("messages.share_image") }}</span>
            <v-btn :href="tweetShareURL" target="_blank" icon><v-icon color="light-blue">mdi-twitter</v-icon></v-btn>
          </li>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="uploadCardImage" color="error" :disabled="uploadDialog"
            ><v-icon>mdi-upload</v-icon>この画像でカードを申し込む</v-btn
          >
          <v-spacer />
        </v-card-actions>
        <v-card-text v-if="uploadDialog">
          <v-alert dense type="info"
            >以下のURLにカード画像をアップロードしました。 カードのご購入時、このURLを備考欄に入力してください。
            <span class="breakword">{{ uploadURL }}</span>
          </v-alert>
          <v-spacer />
          <v-btn @click="copyToClipboard(uploadURL)"> <v-icon class="ma-2">mdi-content-copy</v-icon>コピーする </v-btn>
        </v-card-text>
        <v-snackbar v-model="snackbar" type="success" :timeout="timeout"> コピーしました </v-snackbar>
      </v-card>
    </v-dialog>
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
  word-wrap: break-word;
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
  private uploadDialog = false;
  private canvas = false;
  private snackbar = false;
  private timeout = 2000;
  private uploadURL = "";

  created() {
    const staff = this.$route.query.staff;
    if (staff != null) {
      this.forStaff = true;
    }
  }

  mounted() {
    this.imgSrc = require(`@/assets/${this.cardType?.assets.default_photo}`);
  }

  @Watch("cardType")
  onChangeCardType() {
    this.imgSrc = require(`@/assets/${this.cardType?.assets.default_photo}`);
  }

  private get cropper() {
    return this.$refs.cropper as any;
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
      const preview: HTMLElement = this.forStaff
        ? (this.$refs.cardPreview as HTMLElement)
        : (this.$refs.cardFrame as HTMLElement);
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
        this.dialog = true;
      }
    });
  }

  private async uploadCardImage(download: boolean) {
    this.canvas = true;
    Vue.nextTick(async () => {
      const preview: HTMLElement = this.$refs.cardPreview as HTMLElement;
      const params: Parameters<typeof html2canvas> = [preview, { scale: 1 }];
      const canvasElement = await html2canvas(...params).catch((e) => {
        console.error(e);
        return;
      });
      if (!canvasElement) {
        return;
      }
      const dataURL = canvasElement.toDataURL("image/png");
      canvasElement.toBlob((blob) => {
        if (blob) {
          this.uploadImgToBlobStorage(blob);
        }
      });
      this.canvas = false;
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
      });
    return;
  }

  private closeDialog() {
    this.dialog = false;
    this.dataURL = "";
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

  get shareText(): string {
    return encodeURIComponent(`${this.$t("common.welcome_msg", { msg: this.organizationName })}!!

${this.numberLabel} ${this.memberNo}
${this.$t("caption.division", { msg: this.division })}
${this.memberName}

${this.orgNameHashTag}
${this.appNameHashTag}
`);
  }

  get tweetShareURL(): string {
    let url = `${location.protocol}//${location.host}${location.pathname}`;
    const shareURL = `https://twitter.com/intent/tweet?text=${this.shareText}&url=${url}`;
    return shareURL;
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
