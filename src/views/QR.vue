<template>
  <div class="container">
    <div class="input-area" :class="{ 'is-active': hasQR }">
      <div class="input-content">
        <div class="form-group">
          <div class="input-row">
            <input v-model="wifi.ssid" type="text" placeholder="와이파이 이름 (SSID)" class="custom-input" />
            <input v-model="wifi.password" type="password" placeholder="비밀번호" class="custom-input" />
            <select v-model="wifi.type" class="custom-select">
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">암호 없음</option>
            </select>
          </div>
        </div>
      </div>
      <button @click="generateQR" class="generate-btn" :disabled="!wifi.ssid">
        QR 생성하기
      </button>
    </div>

    <section v-show="hasQR" class="result-section">
      <div class="summary-card">
        <div class="stats">
          <span class="badge primary">Wi-Fi Access QR Code</span>
          <span class="file-info">네트워크: <strong>{{ wifi.ssid }}</strong></span>
        </div>
        <button @click="downloadQR" class="download-btn">📥 QR 이미지 다운로드</button>
      </div>

      <div class="qr-display-container">
        <div class="qr-box">
          <p>스캔하여 바로 연결</p>
          <div class="qr-wrapper">
            <qrcode-vue
                v-if="qrValue"
                :value="qrValue"
                :size="240"
                level="H"
                render-as="canvas"
                ref="qrCanvas"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import QrcodeVue from 'qrcode.vue';

const hasQR = ref(false);
const qrValue = ref('');
const qrCanvas = ref(null);

const wifi = reactive({
  ssid: '',
  password: '',
  type: 'WPA'
});

// 생성하기 버튼 클릭 시 로직
const generateQR = () => {
  if (!wifi.ssid) return;

  // 와이파이 접속 규격 문자열 생성
  qrValue.value = `WIFI:S:${wifi.ssid};T:${wifi.type};P:${wifi.password};;`;
  hasQR.value = true;
};

const downloadQR = () => {
  // qrcode-vue는 내부적으로 canvas를 사용함
  const canvas = document.querySelector('.qr-wrapper canvas');
  if (canvas) {
    const link = document.createElement('a');
    link.download = `wifi_qr_${wifi.ssid}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }
};
</script>

<style scoped>
.container { max-width: 1000px; margin: 0 auto; padding: 20px; font-family: 'Pretendard', sans-serif; }

.input-area {
  border: 2px solid #d1d5db; border-radius: 16px; padding: 40px;
  background: #f9fafb; transition: all 0.3s;
  display: flex; flex-direction: column; align-items: center; gap: 25px;
}
.input-area.is-active { padding: 20px 40px; background: #fff; }

.input-content { display: flex; align-items: center; gap: 20px; width: 100%; justify-content: center; }
.icon { font-size: 2.5rem; }

.input-row { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }

.custom-input, .custom-select {
  padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 1rem; outline: none; transition: border 0.2s;
}
.custom-input:focus { border-color: #3b82f6; }

.generate-btn {
  background: #3b82f6; color: white; border: none; padding: 12px 30px;
  border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.1rem;
  transition: transform 0.2s, background 0.2s;
}
.generate-btn:hover:not(:disabled) { background: #2563eb; transform: translateY(-2px); }
.generate-btn:disabled { background: #94a3b8; cursor: not-allowed; }

.result-section { margin-top: 25px; animation: fadeIn 0.5s ease-out; }
.summary-card {
  display: flex; justify-content: space-between; align-items: center;
  background: #f8fafc; padding: 15px 20px; border-radius: 12px; margin-bottom: 15px;
}

.badge.primary { background: #3b82f6; color: white; padding: 4px 12px; border-radius: 20px; font-weight: 600; margin-right: 15px; }

.qr-display-container {
  display: flex; justify-content: center; margin-top: 20px;
}

.qr-box {
  text-align: center; background: #fff; padding: 30px;
  border-radius: 16px; border: 1px solid #e5e7eb;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
.qr-box p { font-weight: bold; margin-bottom: 20px; color: #4b5563; }

.qr-wrapper {
  padding: 10px; background: white; display: inline-block;
}

.download-btn {
  background: #10b981; color: white; border: none; padding: 10px 18px;
  border-radius: 8px; cursor: pointer; font-weight: bold;
}

@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 600px) {
  .input-row { flex-direction: column; width: 100%; }
  .custom-input, .custom-select { width: 100%; }
}
</style>