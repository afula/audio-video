<template>
  <div class="common-layout">
    <el-container>
      <el-header >
          <p class="header-title">audio-video</p> 
      </el-header>
      <el-main >
      <el-card class="box-card" v-on:click="clickLoad"  >
        <div class="text item">
            <el-icon  class="avatar-uploader-icon" ><Plus /></el-icon>
            <input type="file" id="files" ref="refFile" style="display: none" v-on:change="fileLoad($event)" accept="video/*">
            <div>点击选择视频</div>
        </div>
        </el-card>
      </el-main> 
    </el-container>
  </div>
</template>

<style>
.el-header{
  /* background-color: #b3c0d1; */
  color: var(--el-text-color-primary);
  text-align: center;
  font-size: 80;
  /* line-height: 60px; */
  height: 90px;
}

.header-title{
    text-align: center;
    font-size: 36px;
    font-weight:bold;
}

.el-main {
  background-color: #ffff;
  text-align: center;
}

.avatar-uploader-icon {
  font-size: 100px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  text-align: center;
}


</style>

<script>
import { Plus ,Upload} from '@element-plus/icons-vue'
export default {
  components: {
    Plus,
    Upload
  },

  methods: {
    clickLoad() {
          this.$refs.refFile.dispatchEvent(new MouseEvent('click'))
      },
     fileLoad(e) {
      console.log(e)
      const resultFile = e.target.files;
      console.log(resultFile[0])
      const aBlob = new Blob([resultFile[0]],{type:'video/mp4'})
      console.log(aBlob)
      const videoUrl = URL.createObjectURL(aBlob)
      this.$router.push({ name: 'home', params: { videoUrl: videoUrl } })
     }
   
  }

}
</script>

