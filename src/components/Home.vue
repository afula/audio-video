<template>
  <div class="VideoChoose">
    <video controls ref="videoPlayer" class="video-dispaly">
    <source :src="videoUrl" type="video/mp4">
    </video>
    <div v-loading="loading" class="BaseRecorder">
    <div class="BaseRecorder-record">
       <!-- <input type="file" @change="filechange($event)" accept="video/*"> -->
      <!-- <button @click="videoPlayOrStop()">{{playingTitle}}</button> -->
      <!-- <button @click="removeAudio()">消除音频</button> -->
      <el-button  @click="startRecorder()" class="operate-recorder">开始配音</el-button>
      <el-button @click="pauseRecorder()" class="operate-recorder">暂停配音</el-button>
      <el-button  @click="resumeRecorder()" class="operate-recorder">继续配音</el-button>
      <el-button  @click="stopRecorder()" class="operate-recorder">结束配音</el-button>
      
    </div>
    <div class="BaseRecorder-play">
      <el-button  @click="transcode()">音视频合成</el-button >
      <el-button :disabled="isDisableClick" @click="transcodePlay()">预览</el-button >
      <el-button :disabled="isDisableClick" @click="videoDownload">下载</el-button >
      <!-- <button @click="playRecorder()">录音播放</button> -->
      <!-- <button @click="pausePlayRecorder()">暂停录音播放</button> -->
      <!-- <button @click="resumePlayRecorder()">恢复录音播放</button> -->
      <!-- <button @click="stopPlayRecorder()">停止录音播放</button> -->
    </div>
    <div class="BaseRecorder-download">
      <!-- <button @click="downPCM()">下载PCM</button> -->
      <!-- <button @click="downWAV()">下载WAV</button> -->
    </div>
    <div class="BaseRecorder-destroy">
      <!-- <button type="error" @click="destroyRecorder()">销毁录音</button> -->
    </div>
       <div class="BaseRecorder-wave">
      <canvas v-if="isShowCanvas" ref="record"></canvas>
      <!-- <canvas ref="play"></canvas> -->
    </div>
   </div>
  </div>
</template>

<script>
import Recorder from 'js-audio-recorder'
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { ElMessage } from 'element-plus'

export default {
  name: 'home',
  data() {
    return {
      ffmpeg:null,
      recorder: null,
      // 波浪图-录音
      drawRecordId: null,
      // 波浪图-播放
      drawPlayId: null,
      videoUrl:"",
      recoderUrl:"",
      playing:false,
      isShowCanvas:true,
      isDisableClick:true,
      loading:false,
      playingTitle:"视频播放"
    }
  },
  mounted() {
    this.videoUrl = this.$route.params.videoUrl
    console.log(this.$route.params)
    console.log(this.$route.params.videoUrl)
    this.init()
  },
  methods: {
    //配音
    async  transcode() {
      // const file = 'taylorswift.mp4'
      // const audio = 'my.mp3'
      this.ffmpeg.FS('writeFile', 'test.mp4', await fetchFile(this.videoUrl));
      this.ffmpeg.FS('writeFile', 'my.wav', await fetchFile(this.recoderUrl));
      console.log(this.videoUrl)
      console.log("音频url")
      if(this.recoderUrl == "" || this.recoderUrl == null){
        ElMessage.error("没有找到音频!")
        return

      }
      console.log(this.recoderUrl)
      this.loading = true
      //音频格式转换
      await this.ffmpeg.run('-i','my.wav','my.mp3');
      //消除音频
      await this.ffmpeg.run('-i','test.mp4','-vcodec','copy','-an','no_audio_video.mp4');
      //音视频合成
      await this.ffmpeg.run('-y','-i','no_audio_video.mp4','-i','my.mp3','-vcodec','copy','-acodec','copy','get.mp4');
      const data = this.ffmpeg.FS('readFile', 'get.mp4');
      const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
      this.videoUrl = url
      console.log(this.videoUrl)
      this.$refs.videoPlayer.load()
      this.loading = false
      this.isDisableClick = false
      console.log(url)
    },
    //消除音频
    async removeAudio(){
      this.ffmpeg.FS('writeFile', 'test.mp4', await fetchFile(this.videoUrl));
      //消除音频
      await this.ffmpeg.run('-i','test.mp4','-vcodec','copy','-an','no_audio_video.mp4');
      const data = this.ffmpeg.FS('readFile', 'no_audio_video.mp4');
      const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
      this.videoUrl = url
      console.log(this.videoUrl)
      this.$refs.videoPlayer.load()
      console.log(url)

    },
    //从本地选择视频文件
    filechange(e){   
      console.log(e)
      const resultFile = e.target.files;
      console.log(resultFile[0])
      const aBlob = new Blob([resultFile[0]],{type:'video/mp4'})
      console.log(aBlob)
      this.videoUrl = URL.createObjectURL(aBlob)
      this.$refs.videoPlayer.load()
      // const reader = new FileReader();
      // reader.onload=(ev)=>{
      //   this.videoUrl = ev.target.result
      //   console.log(this.videoUrl)
      //   this.$refs.videoPlayer.load()
      // }
      // reader.readAsDataURL(aBlob)
      
    },
    // 初始化
    async init() {
      this.recorder = new Recorder({
        // 采样位数，支持 8 或 16，默认是16
        sampleBits: 16,
        // 采样率，支持 11025、16000、22050、24000、44100、48000，根据浏览器默认值
        sampleRate: 48000,
        // 声道，支持 1 或 2， 默认是1
        numChannels: 1,
        // 是否边录边转换，默认是false
        compiling: false
      }),
      this.ffmpeg = createFFmpeg({  
      log: true,
      });
      await this.ffmpeg.load();
    },

    //视频预览
    videoPlayOrStop(){
      if(this.playing){
        this.$refs.videoPlayer.pause()
        this.playingTitle = "视频播放"
        this.playing = false
      }else{
        this.$refs.videoPlayer.play()
        this.playingTitle = "暂停播放"
        this.playing = true
      }
   

    },
    // 开始录音
    startRecorder() {
      this.$refs.videoPlayer.load()
      this.$refs.videoPlayer.muted = true
      this.isDisableClick = true
      this.recorder.start().then(
        () => {
          this.$refs.videoPlayer.play()
          this.drawRecord()
          this.isShowCanvas = true
        },
        error => {
          // 出错了
          console.log(`${error.name} : ${error.message}`)
           ElMessage.error(`${error.message}`)
        }
      )
    },
    // 继续录音
    resumeRecorder() {
      this.$refs.videoPlayer.play()
      this.recorder.resume()
      this.drawRecord()
    },
    // 暂停录音
    pauseRecorder() {
      this.recorder.pause()
      this.$refs.videoPlayer.pause()
      this.drawRecordId && cancelAnimationFrame(this.drawRecordId)
      this.drawRecordId = null
    },
    // 结束录音
    stopRecorder() {
      this.recorder.stop()
      this.$refs.videoPlayer.pause()
      this.drawRecordId && cancelAnimationFrame(this.drawRecordId)
      this.drawRecordId = null
      this.getWAVData()
      this.isShowCanvas = false
    },
    // 录音播放
    playRecorder() {
      this.recorder.play()
      this.drawPlay() // 绘制波浪图
    },
    // 暂停录音播放
    pausePlayRecorder() {
      this.recorder.pausePlay()
    },
    // 恢复录音播放
    resumePlayRecorder() {
      this.recorder.resumePlay()
      this.drawPlay() // 绘制波浪图
    },
    // 停止录音播放
    stopPlayRecorder() {
      this.recorder.stopPlay()
    },
    //预览
    transcodePlay(){
      this.$refs.videoPlayer.muted = false
      this.$refs.videoPlayer.play()

    },
    //下载
    videoDownload(){
      var a = document.createElement('a')
      var url = this.videoUrl
      a.href = url
      a.download = "my-diy"
      a.click()
      // window.URL.revokeObjectURL(url)

    },
    // 销毁录音
    destroyRecorder() {
      this.recorder.destroy().then(function() {
        this.drawRecordId && cancelAnimationFrame(this.drawRecordId)
        this.drawRecordId = null

        this.drawPlayId && cancelAnimationFrame(this.drawPlayId)
        this.drawPlayId = null

        this.recorder = null
      })
    },
    // 获取录音buffer
    getRecordata(){
      // 获取录音数据 buffer
      var buffer = this.recorder.getRecordAnalyseData()
      this.recoderUrl = URL.createObjectURL(new Blob([buffer], { type: 'video/mp3' }));
      console.log(buffer)
    },

    // 获取录音PCM数据
    getPCMData(){
      var pcmBlob = this.recorder.getPCMBlob()
      console.log(pcmBlob)
      this.recoderUrl = URL.createObjectURL(pcmBlob);
      console.log(this.recoderUrl)

    },

      // 获取录音WAV数据
    getWAVData(){
      var Blob = this.recorder.getWAVBlob()
      console.log(Blob)
      this.recoderUrl = URL.createObjectURL(Blob);
      console.log(this.recoderUrl)

    },

    /**
     *  下载录音文件
     * */
    // 下载pcm
    downPCM() {
      // 这里传参进去的时文件名
      this.recorder.downloadPCM('新文件')
    },
    // 下载wav
    downWAV() {
      // 这里传参进去的时文件名
      this.recorder.downloadWAV('新文件')
    },

    /**
     * 绘制波浪图-录音
     * */
    drawRecord() {
      this.drawRecordId = requestAnimationFrame(this.drawRecord)
      this.drawWave({
        canvas: this.$refs.record,
        dataArray: this.recorder.getRecordAnalyseData(),
        bgcolor: 'rgb(255, 255, 255)',
        lineWidth: 1,
        lineColor: 'rgb(0, 128, 255)'
      })
    },
    /**
     * 绘制波浪图-播放
     * */
    drawPlay() {
      this.drawPlayId = requestAnimationFrame(this.drawPlay)
      this.drawWave({
        canvas: this.$refs.play,
        dataArray: this.recorder.getPlayAnalyseData()
      })
    },
    drawWave({
      canvas,
      dataArray,
      bgcolor = 'rgb(255, 255, 255)',
      lineWidth = 2,
      lineColor = 'rgb(0, 0, 0)'
    }) {
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      const bufferLength = dataArray.length
      // 一个点占多少位置，共有bufferLength个点要绘制
      const sliceWidth = canvas.width / bufferLength
      // 绘制点的x轴位置
      let x = 0

      // 填充背景色
      ctx.fillStyle = bgcolor
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      // console.log(canvas)

      // 设定波形绘制颜色
      ctx.lineWidth = lineWidth
      ctx.strokeStyle = lineColor

      ctx.beginPath()

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128
        const y = (v * canvas.height) / 2

        if (i === 0) {
          // 第一个点
          ctx.moveTo(x, y)
        } else {
          // 剩余的点
          ctx.lineTo(x, y)
        }
        // 依次平移，绘制所有点
        x += sliceWidth
      }

      // 最后一个点
      ctx.lineTo(canvas.width, canvas.height / 2)
      ctx.stroke()
    }
  }
}
</script>
<style >
.VideoChoose{
  direction: flex;
  flex-direction:column
}

.BaseRecorder{
  margin-top: 10px;
}

.video-dispaly{
  width: 640px;
  height: 400px;
}

.operate-recorder{
  margin-left: 16px;
  margin-bottom: 20px;
}

.BaseRecorder-play{
  margin-bottom: 10px;
}


</style>