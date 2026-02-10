<template>
  <div class="container">
    <div
        class="upload-area"
        :class="{ 'is-dragging': isDragging, 'is-mini': hasImage }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="$refs.fileInput.click()"
    >
      <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" hidden />
      <div class="upload-content">
        <span class="upload-icon">{{ hasImage ? '🖼️' : '📸' }}</span>
        <div class="text-group">
          <p v-if="!fileName" class="main-msg">이미지 파일을 이곳에 끌어다 놓거나 클릭하세요.</p>
          <p v-else class="file-info">현재 파일: <strong>{{ fileName }}</strong></p>
          <p v-if="hasImage" class="sub-msg">이미지 파일을 파일을 끌어다 놓거나 클릭하여 다른 이미지로 교체 가능합니다.</p>
        </div>
      </div>
    </div>

    <section v-show="hasImage" class="result-section">
      <div class="summary-card">
        <div class="stats">
          <span class="badge primary">OpenCV Canny Edge Detection</span>
        </div>
        <button @click="downloadImage" class="download-btn">📥 라인 이미지 다운로드</button>
      </div>

      <div class="canvas-container">
        <div class="canvas-box">
          <p>원본 이미지</p>
          <img ref="sourceImg" class="preview-img" @load="processImage" />
        </div>
        <div class="canvas-box">
          <p>추출된 라인</p>
          <canvas ref="outputCanvas"></canvas>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const isDragging = ref(false);
const fileName = ref('');
const hasImage = ref(false);
const sourceImg = ref(null);
const outputCanvas = ref(null);

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) loadImage(file);
};

const handleDrop = (e) => {
  isDragging.value = false;
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) loadImage(file);
};

const loadImage = (file) => {
  fileName.value = file.name;
  const reader = new FileReader();
  reader.onload = (e) => {
    sourceImg.value.src = e.target.result;
    hasImage.value = true;
  };
  reader.readAsDataURL(file);
};

// OpenCV 프로세싱 핵심 로직
const processImage = () => {
  if (!window.cv) {
    alert("OpenCV.js가 아직 로드되지 않았습니다. 잠시만 기다려주세요.");
    return;
  }

  const cv = window.cv;
  // 1. 이미지 읽기
  let src = cv.imread(sourceImg.value);
  let dst = new cv.Mat();

  // 2. 그레이스케일 변환
  cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);

  // 3. 노이즈 제거 (가우시안 블러)
  let ksize = new cv.Size(5, 5);
  cv.GaussianBlur(src, src, ksize, 0, 0, cv.BORDER_DEFAULT);

  // 4. 캐니 엣지 검출 (임계값 50, 150)
  cv.Canny(src, dst, 50, 150, 3, false);

  // 5. 색상 반전 (흰 배경에 검정 선으로 변경)
  cv.bitwise_not(dst, dst);

  // 6. 결과 출력
  cv.imshow(outputCanvas.value, dst);

  // 메모리 해제
  src.delete();
  dst.delete();
};

const downloadImage = () => {
  const link = document.createElement('a');
  link.download = `lined_${fileName.value}`;
  link.href = outputCanvas.value.toDataURL();
  link.click();
};
</script>

<style scoped>
/* 기존 엑셀 스타일 유지 */
.container { max-width: 1000px; margin: 0 auto; padding: 20px; font-family: 'Pretendard', sans-serif; }
header { text-align: center; margin-bottom: 30px; transition: all 0.4s ease; }
header.mini-header { margin-bottom: 15px; }

.upload-area {
  border: 2px dashed #d1d5db; border-radius: 16px; padding: 60px 20px;
  text-align: center; cursor: pointer; background: #f9fafb;
  color: #6b7280; transition: all 0.3s;
}
.upload-area.is-mini { padding: 15px 30px; border-style: solid; display: flex; align-items: center; background: #fff; }
.upload-area.is-mini .upload-content { display: flex; align-items: center; gap: 15px; }
.is-dragging { border-color: #3b82f6; background: #dbeafe !important; }

.result-section { margin-top: 25px; animation: fadeIn 0.5s ease-out; }
.summary-card {
  display: flex; justify-content: space-between; align-items: center;
  background: #f8fafc; padding: 15px 20px; border-radius: 12px; margin-bottom: 15px;
}

.badge.primary { background: #3b82f6; color: white; padding: 4px 12px; border-radius: 20px; font-weight: 600; }

/* 이미지 및 캔버스 레이아웃 */
.canvas-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

.canvas-box {
  text-align: center;
  background: #eee;
  padding: 10px;
  border-radius: 8px;
}

.canvas-box p { font-weight: bold; margin-bottom: 10px; color: #4b5563; }

.preview-img, canvas {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.download-btn {
  background: #10b981; color: white; border: none; padding: 10px 18px;
  border-radius: 8px; cursor: pointer; font-weight: bold;
}

@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>