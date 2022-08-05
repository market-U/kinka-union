<template>
  <div>
    <v-file-input v-model="file" accept="image/*" label="組合員の写真を選択してください" @change="onChangeFileInput" />
    <!-- <input type="file" name="image" accept="image/*" style="font-size: 1.2em; padding: 10px 0" @change="setImage" /> -->
    <v-btn @click="rotate" v-if="file != []">Rotate</v-btn>
    <v-btn @click="cropImage" v-if="file != []">crop</v-btn>
    <div class="preview" style="border-radius: 16px">aaa</div>
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
      preview=".preview"
      @cropend="cropImage"
    />
    <v-img :src="cropedImg" alt="Cropped Image" />
  </div>
</template>
<style scoped>
.preview {
  width: 200px;
  height: 500px;
  overflow: hidden;
  background-color: yellow;
}
</style>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import VueCropper from "vue-cropperjs";
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

  private onChangeFileInput() {
    const cropper: VueCropper = this.$refs.cropper as VueCropper;
    cropper.replace(URL.createObjectURL(this.file));
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
}
</script>
