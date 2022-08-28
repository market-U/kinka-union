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
            :aspect-ratio="1 / 1"
            alt="No Image..."
            :src="imgSrc"
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
        <v-col>
          <div class="uniFrame" ref="uniFrame">
            <v-img :src="cropedImg" class="uniPhoto" :width="uniProp.canvas.width" :height="uniProp.canvas.height" />
            <canvas
              class="uniCanvas"
              ref="uniCanvas"
              :width="uniProp.canvas.width"
              :height="uniProp.canvas.height"
            ></canvas>
          </div>
          <v-switch v-model="play" label="うごかす"></v-switch>
          <v-switch v-model="imageOverlay" label="うみのなか"></v-switch>
        </v-col>
        <v-col align="center" v-show="false">
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
          {{ uniProp }}
          <v-slider v-model="uniProp.canvas.width" label="canvas幅" min="200" max="1000"></v-slider>
          <v-slider v-model="uniProp.canvas.height" label="canvas高さ" min="200" max="1000"></v-slider>
          <v-slider v-model="uniProp.center.x" label="中心X" min="0" :max="uniProp.canvas.width"></v-slider>
          <v-slider v-model="uniProp.lineWidth" label="線の太さ" min="10" max="180"></v-slider>
          <v-slider v-model="uniProp.lineNum" label="線の数" min="30" max="500"></v-slider>
          <v-slider v-model="uniProp.circleRadius.min" label="中心半径" min="10" max="300"></v-slider>
          <v-slider v-model="uniProp.circleRadius.amplitude" label="ぎざぎざ度合い" min="0" max="100"></v-slider>
          <v-color-picker
            v-model="uniProp.lineColor"
            dot-size="25"
            swatches-max-height="200"
            mode="hexa"
          ></v-color-picker>
          <v-btn @click="createCardImage(false)" :disabled="!file" color="primary">
            <v-icon class="mr-2">mdi-smart-card-outline</v-icon>{{ $t("common.issue") }}
          </v-btn>
        </v-col>
        <v-col v-show="false">
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
            {{
              $t("messages.card_issued", {
                card: $t(`organization.${cardType.organization_type}.card`).toString().toLowerCase(),
              })
            }}
          </span>
          <v-spacer />
        </v-card-title>
        <v-card-text align="center">{{ $t("messages.save_image") }}</v-card-text>
        <v-card-text align="center">
          <img :src="dataURL" style="max-width: min(90%, 720px)" />
        </v-card-text>
        <v-card-text align="center" v-if="false">
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
.uniFrame {
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
  private canvas = false;
  private play = false;
  private playFrameMS = 150;
  private imageOverlay = false;
  private issueImageScale = 1;
  private uniProp = {
    canvas: {
      width: 600,
      height: 600,
    },
    lineNum: 200,
    lineWidth: 200,
    center: {
      x: 300,
      y: 300,
    },
    circleRadius: {
      amplitude: 25,
      min: 35,
    },
    lineColor: { hex: "#000" },
  };

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

  @Watch("uniProp", { deep: true })
  onChangeUniProp() {
    if (this.cropedImg != "") {
      this.play = false;
      this.drawFocusLine();
    }
  }

  @Watch("play")
  onChangePlay(play: boolean) {
    if (play) {
      this.drawFocusLine();
    }
  }

  @Watch("imageOverlay")
  onChangeImageOverlay() {
    this.drawFocusLine();
  }

  private drawFocusLine() {
    const canvas = this.$refs.uniCanvas as HTMLCanvasElement;
    this.focusLine(
      canvas,
      this.uniProp.center.x,
      this.uniProp.center.y,
      this.uniProp.lineWidth,
      this.uniProp.lineNum,
      this.uniProp.circleRadius.min + this.uniProp.circleRadius.amplitude,
      this.uniProp.circleRadius.min,
      this.uniProp.lineColor.hex
    );
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

  private focusLine(
    canvas: HTMLCanvasElement,
    centralX: number,
    centralY: number,
    lineWidth: number,
    lineNum: number,
    circleRadiusMax: number,
    circleRadiusMin: number,
    lineColor: string
  ) {
    const ctx = canvas.getContext("2d");
    let lines: Liner[] = [];
    const csRadius = Math.sqrt(Math.pow(canvas.width / 2, 2) + Math.pow(canvas.height / 2, 2));

    class Liner {
      private deg = 0;
      private moveDeg = 0;
      private endRadius = 0;
      private startPos: Pos = { x: 0, y: 0 };
      private endPos: Pos = { x: 0, y: 0 };
      private movePos: Pos = { x: 0, y: 0 };

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

      update() {
        this.setPos();
      }

      draw() {
        if (ctx) {
          ctx.beginPath();
          ctx.lineWidth = 1;
          ctx.fillStyle = lineColor;
          ctx.moveTo(this.startPos.x, this.startPos.y);
          ctx.lineTo(this.movePos.x, this.movePos.y);
          ctx.lineTo(this.endPos.x, this.endPos.y);
          ctx.fill();
          ctx.closePath();
        }
      }

      render() {
        this.update();
        this.draw();
      }
    }
    const createLines = (num: number) => {
      lines = [];
      [...Array(num)].map(() => lines.push(new Liner()));
    };
    const render = () => {
      if (ctx) ctx.globalCompositeOperation = "source-over";
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      lines.forEach((l) => l.render());
      if (this.imageOverlay) {
        const img = new Image();
        img.src = require(`../assets/cardBG.png`);
        img.onload = function () {
          console.log("Image onload");
          // ctx?.save();
          if (ctx) ctx.globalCompositeOperation = "source-in";
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
      }
      if (this.play) setTimeout(() => render(), this.playFrameMS);
    };

    createLines(lineNum);
    render();
  }
}
interface Pos {
  x: number;
  y: number;
}
</script>
