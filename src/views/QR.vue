<template>
  <div class="container">
    <div class="input-area" :class="{ 'is-active': hasQR }">
      <div class="tab-menu">
        <button
            :class="['tab-btn', { active: mode === 'wifi' }]"
            @click="switchMode('wifi')"
        >🛜 Wi-Fi</button>
        <button
            :class="['tab-btn', { active: mode === 'url' }]"
            @click="switchMode('url')"
        >🔗 URL</button>
      </div>

      <div class="input-content">
        <div class="form-group">
          <div v-if="mode === 'wifi'" class="input-row">
            <input v-model="wifi.ssid" type="text" placeholder="와이파이 이름 (SSID)" class="custom-input" />
            <input v-model="wifi.password" type="password" placeholder="비밀번호" class="custom-input" />
            <select v-model="wifi.type" class="custom-select">
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">암호 없음</option>
            </select>
          </div>

          <div v-else class="input-row">
            <input v-model="url" type="text" placeholder="https://example.com" class="custom-input url-field" />
          </div>
        </div>
      </div>

      <button @click="generateQR" class="generate-btn" :disabled="isBtnDisabled">
        {{ mode === 'wifi' ? 'Wi-Fi QR 생성하기' : 'URL QR 생성하기' }}
      </button>
    </div>

    <section v-show="hasQR" class="result-section">
      <div class="summary-card">
        <div class="stats">
          <span class="badge primary">{{ mode === 'wifi' ? 'Wi-Fi Access' : 'Web Link' }}</span>
          <span class="file-info text-truncate">대상: <strong>{{ displayInfo }}</strong></span>
        </div>
        <button @click="downloadQR" class="download-btn">📥 이미지 다운로드</button>
      </div>

      <div class="qr-display-container">
        <div class="qr-box">
          <p>{{ mode === 'wifi' ? '스캔하여 바로 연결' : '스캔하여 주소로 이동' }}</p>
          <div class="qr-wrapper">
            <qrcode-vue
                v-if="qrValue"
                :value="qrValue"
                :size="240"
                level="H"
                render-as="canvas"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import QrcodeVue from 'qrcode.vue';

const mode = ref('wifi'); // 'wifi' 또는 'url'
const hasQR = ref(false);
const qrValue = ref('');
const url = ref('');

const wifi = reactive({
  ssid: '',
  password: '',
  type: 'WPA'
});

// 모드 전환 시 초기화
const switchMode = (newMode) => {
  mode.value = newMode;
  hasQR.value = false;
  qrValue.value = '';

  // 1. URL 입력값 초기화
  url.value = '';

  // 2. Wi-Fi 객체 초기화
  wifi.ssid = '';
  wifi.password = '';
  wifi.type = 'WPA';
};

const getCurrentURL = () => {
  url.value = window.location.href;
};

// 버튼 비활성화 로직
const isBtnDisabled = computed(() => {
  return mode.value === 'wifi' ? !wifi.ssid : !url.value;
});

// 결과창에 보여줄 텍스트 정보
const displayInfo = computed(() => {
  return mode.value === 'wifi' ? wifi.ssid : url.value;
});

const generateQR = () => {
  if (mode.value === 'wifi') {
    qrValue.value = `WIFI:S:${wifi.ssid};T:${wifi.type};P:${wifi.password};;`;
  } else {
    qrValue.value = url.value;
  }
  hasQR.value = true;
};

const downloadQR = () => {
  const canvas = document.querySelector('.qr-wrapper canvas');
  if (canvas) {
    const link = document.createElement('a');
    link.download = `qr_${mode.value}_${displayInfo.value}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }
};
</script>

<style scoped>
/* 기존 스타일 유지 + 탭 스타일 추가 */
.container { max-width: 1000px; margin: 0 auto; padding: 20px; font-family: 'Pretendard', sans-serif; }

.tab-menu {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  background: #e2e8f0;
  padding: 5px;
  border-radius: 12px;
}

.tab-btn {
  padding: 10px 25px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: #64748b;
  transition: all 0.2s;
}

.tab-btn.active {
  background: white;
  color: #3b82f6;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.url-field { width: 350px !important; }

.current-btn {
  padding: 0 15px;
  background: #64748b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.input-area {
  border: 2px solid #d1d5db; border-radius: 16px; padding: 40px;
  background: #f9fafb; transition: all 0.3s;
  display: flex; flex-direction: column; align-items: center;
}
.input-area.is-active { padding: 30px 40px; background: #fff; }

.input-row { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; animation: fadeIn 0.3s; }

.custom-input, .custom-select {
  padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 1rem; outline: none;
}

.generate-btn {
  margin-top: 25px;
  background: #3b82f6; color: white; border: none; padding: 12px 30px;
  border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.1rem;
}

.generate-btn:disabled { background: #94a3b8; cursor: not-allowed; }

.text-truncate {
  max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  display: inline-block; vertical-align: middle;
}

/* 나머지 기존 애니메이션 및 스타일 유지 */
.result-section { margin-top: 25px; animation: fadeIn 0.5s ease-out; }
.summary-card {
  display: flex; justify-content: space-between; align-items: center;
  background: #f8fafc; padding: 15px 20px; border-radius: 12px; margin-bottom: 15px;
}
.badge.primary { background: #3b82f6; color: white; padding: 4px 12px; border-radius: 20px; font-weight: 600; }
.qr-display-container { display: flex; justify-content: center; margin-top: 20px; }
.qr-box { text-align: center; background: #fff; padding: 30px; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
.qr-wrapper { padding: 10px; background: white; display: inline-block; }
.download-btn { background: #10b981; color: white; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-weight: bold; }

@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>