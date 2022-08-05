<template>
  <div>
    <v-file-input v-model="file" accept="image/*" label="組合員の写真を選択してください" @change="onChangeFileInput" />
    <v-btn @click="rotate" v-if="file != []"><v-icon>mdi-file-rotate-right</v-icon>ROTATE</v-btn>
    <!-- <v-btn @click="cropImage" v-if="file != []">crop</v-btn> -->
    <vue-cropper
      ref="cropper"
      :guides="true"
      :view-mode="2"
      drag-mode="crop"
      :auto-crop-area="0.5"
      :min-container-width="250"
      :min-container-height="180"
      :background="true"
      :rotatable="true"
      alt="Source Image"
      :img-style="imgStyle"
      :aspect-ratio="3 / 4"
      preview=".photoPreview"
      @cropend="cropImage"
    />
    <v-card class="ma-3 pa-3">
      <v-card-title>プレビュー</v-card-title>
      <v-row>
        <v-col>
          <div class="cardPreview" ref="cardPreview">
            <v-img src="../assets/cardBG.png" />
            <div class="photoPreview"></div>
            <div class="infoPreview pa-10">
              <v-card-title class="memberNo ma-2">組合員No. {{ memberNo }}</v-card-title>
              <v-card-title class="division ma-2">{{ division }}支部</v-card-title>
              <div class="memberName">{{ memberName }}</div>
            </div>
          </div>
        </v-col>
        <v-col>
          <v-text-field label="組合員No." v-model="memberNo" />
          <v-text-field label="支部名" v-model="division" />
          <v-text-field label="おなまえ" v-model="memberName" />
          <v-btn @click="download" v-if="file != []"><v-icon>mdi-download</v-icon>download</v-btn>
        </v-col>
      </v-row>
    </v-card>
    <v-img v-show="false" :src="cropedImg" alt="Cropped Image" />
  </div>
</template>
<style scoped>
.cardPreview {
  position: relative;
  zoom: 0.25;
  width: 1920px;
}
.photoPreview {
  width: 474px;
  height: 632px;
  overflow: hidden;
  position: absolute;
  top: 390px;
  left: 200px;
  border-radius: 24px;
  background-color: rgba(255, 183, 0, 0.369);
}
.infoPreview {
  width: 976px;
  height: 632px;
  overflow: hidden;
  position: absolute;
  top: 390px;
  left: 746px;
  border-radius: 24px;
  text-align: center;
  background-color: white;
  display: flex;
  flex-direction: column;
  font-family: "Murecho";
  color: rgb(74, 45, 19);
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
  font-weight: bold;
  text-align: center;
  flex-grow: 1;
  font-size: 84px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import VueCropper from "vue-cropperjs";
import html2canvas from "html2canvas";
import "cropperjs/dist/cropper.css";

@Component({
  components: {
    VueCropper,
  },
})
export default class KinkaUnionCard extends Vue {
  private imgStyle = {
    width: "400px",
    height: "300px",
  };
  private imgSrc?: string | ArrayBuffer | null = "";
  private cropedImg?: string | ArrayBuffer | null = "";
  private file: File[] = [];
  private memberNo = "2222";
  private division = "ﾌｫｰﾝ";
  private memberName = "ハツキ";

  private onChangeFileInput() {
    console.log(this.file);
    const cropper: VueCropper = this.$refs.cropper as VueCropper;
    if (this.file === null) {
      this.file = [];
      cropper.replace(null);
    } else {
      cropper.replace(URL.createObjectURL(this.file));
    }
  }

  private setImage(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = (target.files as FileList)[0];
    if (!file.type.includes("image/")) {
      alert("Please select an image file");
      return;
    }
    if (typeof FileReader === "function") {
      const reader = new FileReader();
      reader.onload = (event) => {
        this.imgSrc = event.target?.result;
        // rebuild cropperjs with the updated source
        const cropper = this.$refs.cropper as VueCropper;
        cropper.replace(event?.target?.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Sorry, FileReader API not supported");
    }
  }
  private cropImage() {
    // get image data for post processing, e.g. upload or setting image src
    const cropper = this.$refs.cropper as VueCropper;
    this.cropedImg = cropper.getCroppedCanvas().toDataURL();
  }
  private rotate() {
    // guess what this does :)
    const cropper = this.$refs.cropper as VueCropper;
    cropper.rotate(90);
  }

  private async download() {
    const preview: HTMLElement = this.$refs.cardPreview as HTMLElement;
    const params: Parameters<typeof html2canvas> = [
      preview,
      {
        // オプションを指定、一旦飛ばします
      },
    ];
    const canvasElement = await html2canvas(...params).catch((e) => {
      console.error(e);
      return;
    });
    if (!canvasElement) {
      return;
    }
    const dataURL = canvasElement.toDataURL("image/png");
    let link = document.createElement("a");
    link.href = dataURL;
    link.download = `${this.memberNo}_${this.division}_${this.memberName}.png`;
    link.click();
  }
}
</script>
