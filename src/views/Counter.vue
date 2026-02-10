<template>
  <div class="container">
    <div
        class="upload-area"
        :class="{
        'is-dragging': isDragging,
        'is-mini': hasData
      }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="$refs.fileInput.click()"
    >
      <input type="file" ref="fileInput" @change="handleFileChange" accept=".xlsx, .xls" hidden />

      <div class="upload-content">
        <span class="upload-icon">{{ hasData ? '📄' : '📂' }}</span>
        <div class="text-group">
          <p v-if="!fileName" class="main-msg">엑셀 파일을 이곳에 끌어다 놓거나 클릭하세요.</p>
          <p v-else class="file-info">현재 파일: <strong>{{ fileName }}</strong></p>
          <p v-if="hasData" class="sub-msg">엑셀 파일을 끌어다 놓거나 클릭하여 다른 파일로 교체할 수 있습니다.</p>
        </div>
      </div>
    </div>

    <section v-if="hasData" class="result-section">
      <div class="summary-card">
        <div class="stats">
          <span class="badge">전체: {{ totalCount }}</span>
          <span class="badge primary">조건 일치: {{ matchCount }}</span>
        </div>
        <button @click="downloadExcel" class="download-btn">📥 결과 다운로드 (.xlsx)</button>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
          <tr>
            <th v-for="key in tableHeaders" :key="key">{{ key }}</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(row, index) in processedData.slice(0, 10)" :key="index">
            <td v-for="key in tableHeaders" :key="key">{{ row[key] }}</td>
          </tr>
          </tbody>
        </table>
      </div>
      <p class="table-note">최근 10개의 데이터만 미리보기로 표시됩니다.</p>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import * as XLSX from 'xlsx';

// 상태 관리
const isDragging = ref(false);
const fileName = ref('');
const processedData = ref([]);
const rawData = ref([]);

// 데이터 존재 여부 체크
const hasData = computed(() => processedData.value.length > 0);

// 테이블 헤더 및 카운트
const tableHeaders = computed(() => hasData.value ? Object.keys(processedData.value[0]) : []);
const totalCount = computed(() => rawData.value.length);
const matchCount = computed(() => processedData.value.length);

const readExcel = (file) => {
  fileName.value = file.name;
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    rawData.value = json;

    // 로직 처리 (예: 데이터가 있는 행만 필터링)
    processedData.value = json;
  };
  reader.readAsArrayBuffer(file);
};

const handleDrop = (e) => {
  isDragging.value = false;
  if (e.dataTransfer.files[0]) readExcel(e.dataTransfer.files[0]);
};

const handleFileChange = (e) => {
  if (e.target.files[0]) readExcel(e.target.files[0]);
};

const downloadExcel = () => {
  const ws = XLSX.utils.json_to_sheet(processedData.value);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Result");
  XLSX.writeFile(wb, `processed_${fileName.value}`);
};
</script>

<style scoped>
.container { max-width: 1000px; margin: 0 auto; padding: 20px; font-family: 'Pretendard', sans-serif; }

header { text-align: center; margin-bottom: 30px; transition: all 0.4s ease; }
header.mini-header { margin-bottom: 15px; }
header.mini-header h1 { font-size: 1.5rem; margin-bottom: 5px; }

.upload-area {
  border: 2px dashed #d1d5db; border-radius: 16px; padding: 60px 20px;
  text-align: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #f9fafb; color: #6b7280;
}

.upload-area.is-mini {
  padding: 15px 30px; border-style: solid; border-width: 1px;
  background: #ffffff; border-color: #e5e7eb; display: flex; align-items: center;
}

.upload-area.is-mini .upload-content {
  display: flex; align-items: center; width: 100%; gap: 15px;
}

.upload-area.is-mini .upload-icon { font-size: 24px; margin-bottom: 0; }
.upload-area.is-mini .text-group { text-align: left; }
.upload-area.is-mini .main-msg, .upload-area.is-mini .sub-msg { margin: 0; font-size: 0.85rem; }

.upload-area:hover { border-color: #3b82f6; background: #eff6ff; }
.is-dragging { border-color: #3b82f6; background: #dbeafe !important; transform: scale(1.02); }

.result-section { margin-top: 25px; animation: fadeIn 0.5s ease-out; }
.summary-card {
  display: flex; justify-content: space-between; align-items: center;
  background: #f8fafc; padding: 15px 20px; border-radius: 12px; margin-bottom: 15px;
}

.badge {
  background: #e2e8f0; padding: 4px 12px; border-radius: 20px;
  font-size: 0.9rem; margin-right: 8px; font-weight: 600;
}
.badge.primary { background: #3b82f6; color: white; }

.download-btn {
  background: #10b981; color: white; border: none; padding: 10px 18px;
  border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s;
}
.download-btn:hover { background: #059669; }

.table-wrapper {
  overflow-x: auto; border: 1px solid #e5e7eb; border-radius: 8px;
  max-height: 400px;
}
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th { background: #f3f4f6; position: sticky; top: 0; padding: 12px; z-index: 1; }
td { padding: 10px 12px; border-top: 1px solid #f3f4f6; }

@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>