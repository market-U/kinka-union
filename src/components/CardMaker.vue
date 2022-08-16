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
            :label="$t('messages.select_photo', { member: $t(`organization.${cardType.organization_type}.member`) })"
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
          <div class="cardFrame" :class="trimClass" ref="cardFrame" :style="`zoom: ${zoom}`">
            <div class="cardPreview" ref="cardPreview">
              <v-img :src="require(`../assets/${cardType.assets.card_bg}`)" @load="cardBGLoaded()" />
              <div class="cardTitle">{{ $t(`organization.${cardType.organization_type}.card_title`) }}</div>
              <div class="organizationName" :style="logoStyleString">
                <v-img :src="require(`@/assets/${cardType.assets.logo}`)" width="84px" class="mr-2" />
                {{
                  $t(`organization.${cardType.organization_type}.name`, {
                    msg: $t(`bird.${cardType.bird_type}`).toString(),
                  })
                }}
              </div>
              <div class="photoPreview"></div>
              <div class="infoPreview pa-10" :style="`color: ${cardType.colors.card_info_font};`">
                <v-card-title class="memberNo ma-2">{{ numberLabel }} {{ memberNo }}</v-card-title>
                <v-card-title class="division ma-2">{{ $t("caption.division", { msg: division }) }}</v-card-title>
                <div class="memberName">{{ memberName }}</div>
              </div>
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

    <!-- issue dialog -->
    <v-dialog :fullscreen="mobile" v-model="dialog">
      <v-card style="background-color: white">
        <v-card-title>
          <v-spacer />
          <span v-if="forStaff">組合員証の原稿を発行しました！</span>
          <span v-else>組合員証を発行しました！</span>
          <v-spacer />
        </v-card-title>
        <v-card-text align="center">長押しやマウスの右クリックで、画像を保存してください。</v-card-text>
        <v-card-text align="center">
          <img :src="dataURL" style="max-width: min(90%, 720px)" />
        </v-card-text>
        <v-card-text align="center">
          <img :src="cropedImg" style="max-width: min(90%, 720px)" />
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
.cardTitle {
  position: absolute;
  color: white;
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
    console.log("on change cardtype");
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
    return `letter-spacing: ${this.$t("common.logo_spacing")};`;
  }

  get zoom(): number {
    const dispWidth = this.$vuetify.breakpoint.width; // - this.$vuetify.breakpoint.scrollBarWidth;
    const root = this.$refs.root as HTMLElement;
    const [marginTortalm, previewOriginalWidth, maxZoom] = [48, 1920, 0.25];
    return Math.min((dispWidth - marginTortalm) / previewOriginalWidth, maxZoom);
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
}
</script>
