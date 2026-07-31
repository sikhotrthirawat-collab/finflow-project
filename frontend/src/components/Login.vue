<template>
  <div class="login-wrapper">
    <!-- Animated Glowing Background Blobs -->
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>

    <div class="login-card glass-card">
      <div class="brand-section">
        <div class="logo-outer">
          <span class="logo-icon">🌊</span>
        </div>
        <h1 class="brand-title">FinFlow</h1>
        <p class="brand-tagline">ระบบบริหารจัดการเงินและพอร์ตลงทุนระดับโปร</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Username Input -->
        <div class="form-field">
          <label for="username">ชื่อผู้ใช้งาน</label>
          <div class="input-container">
            <span class="input-icon">👤</span>
            <input 
              v-model="username" 
              type="text" 
              id="username" 
              placeholder="กรอกชื่อผู้ใช้งาน ( เช่น oat, beem )" 
              required 
            />
          </div>
        </div>

        <!-- Password Input -->
        <div class="form-field">
          <label for="password">รหัสผ่าน</label>
          <div class="input-container">
            <span class="input-icon">🔒</span>
            <input 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              placeholder="กรอกรหัสผ่าน" 
              required 
            />
            <button 
              type="button" 
              class="password-toggle" 
              @click="showPassword = !showPassword"
              tabindex="-1"
            >
              {{ showPassword ? '👁️' : '🕶️' }}
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="submit-btn" :disabled="isLoading">
          <div class="btn-content" v-if="!isLoading">
            <span>เข้าสู่ระบบความปลอดภัย</span>
            <span class="btn-arrow">⚡</span>
          </div>
          <div class="btn-spinner" v-else>
            <div class="spinner"></div>
            <span>กำลังยืนยันตัวตน...</span>
          </div>
        </button>

        <!-- Error Banner -->
        <transition name="slide-up">
          <div v-if="error" class="error-banner">
            <span class="err-icon">🚨</span>
            <span class="err-text">{{ error }}</span>
          </div>
        </transition>
      </form>

      <div class="login-footer">
        <span>© 2026 FinFlow Project. All rights reserved.</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'Login',
  emits: ['login-success'],
  setup(props, { emit }) {
    const username = ref('');
    const password = ref('');
    const showPassword = ref(false);
    const error = ref('');
    const isLoading = ref(false);

    const handleLogin = async () => {
      error.value = '';
      isLoading.value = true;
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.value,
            password: password.value
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          emit('login-success', data.user);
        } else {
          error.value = data.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
        }
      } catch (err) {
        console.error(err);
        error.value = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์หลังบ้านได้';
      } finally {
        isLoading.value = false;
      }
    };

    return {
      username,
      password,
      showPassword,
      error,
      isLoading,
      handleLogin
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Sarabun:wght@300;400;600;700&display=swap');

.login-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #080b11;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  overflow: hidden;
  font-family: 'Sarabun', 'Outfit', sans-serif;
}

/* Light mode overrides support */
:global(body.light-theme) .login-wrapper {
  background-color: #f6f8fb;
}

/* Glassmorphic Login Card */
.login-card {
  width: 100%;
  max-width: 440px;
  background: rgba(13, 20, 35, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-radius: 32px;
  padding: 3rem 2.5rem 2.25rem 2.5rem;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
}

:global(body.light-theme) .login-card {
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.06),
              inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

/* Brand Section Styling */
.brand-section {
  text-align: center;
  margin-bottom: 2.25rem;
  width: 100%;
}

.logo-outer {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.15);
  transition: transform 0.3s ease;
}

.logo-outer:hover {
  transform: scale(1.05) rotate(5deg);
}

.logo-icon {
  font-size: 2.25rem;
  filter: drop-shadow(0 4px 10px rgba(59, 130, 246, 0.4));
}

.brand-title {
  font-family: 'Outfit', 'Sarabun', sans-serif;
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin: 0 0 6px 0;
  background: linear-gradient(135deg, #ffffff 10%, #93c5fd 60%, #c084fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

:global(body.light-theme) .brand-title {
  background: linear-gradient(135deg, #0f172a 10%, #2563eb 60%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-tagline {
  font-size: 0.825rem;
  color: var(--text-secondary);
  font-weight: 500;
  margin: 0;
}

/* Forms layout */
.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.form-field label {
  font-size: 0.775rem;
  color: var(--text-secondary);
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding-left: 4px;
}

/* Input Containers */
.input-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 14px;
  font-size: 1.1rem;
  color: var(--text-muted);
  pointer-events: none;
  z-index: 5;
}

.input-container input {
  width: 100%;
  height: 48px;
  padding: 0 14px 0 44px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  outline: none;
}

:global(body.light-theme) .input-container input {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.08);
  color: #1e293b;
}

.input-container input::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

:global(body.light-theme) .input-container input::placeholder {
  color: rgba(0, 0, 0, 0.35);
}

.input-container input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
  background: rgba(0, 0, 0, 0.35);
}

:global(body.light-theme) .input-container input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
  background: #ffffff;
}

/* Password Toggle Button */
.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1.1rem;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: opacity 0.2s;
  z-index: 6;
}

.password-toggle:hover {
  opacity: 0.8;
}

/* Submit Button */
.submit-btn {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #7c3aed 100%);
  border: none;
  border-radius: 14px;
  color: #ffffff;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4);
  margin-top: 5px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.55);
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #8b5cf6 100%);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  height: 100%;
}

.btn-arrow {
  transition: transform 0.2s ease;
}

.submit-btn:hover .btn-arrow {
  transform: translateX(4px) scale(1.1);
}

/* Button Spinner */
.btn-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 100%;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error Banner */
.error-banner {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.err-icon {
  font-size: 1.1rem;
}

.err-text {
  color: #ef4444;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.4;
}

/* Footer text */
.login-footer {
  margin-top: 2rem;
  font-size: 0.7rem;
  color: var(--text-muted);
  text-align: center;
}

/* Background Blobs Animation */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 1;
  opacity: 0.45;
  animation: float 20s infinite alternate ease-in-out;
}

:global(body.light-theme) .blob {
  opacity: 0.35;
  filter: blur(100px);
}

.blob-1 {
  width: 320px;
  height: 320px;
  background: rgba(37, 99, 235, 0.2);
  top: 10%;
  left: 15%;
}

.blob-2 {
  width: 380px;
  height: 380px;
  background: rgba(124, 58, 237, 0.18);
  bottom: 10%;
  right: 15%;
  animation-delay: -5s;
  animation-duration: 25s;
}

.blob-3 {
  width: 250px;
  height: 250px;
  background: rgba(6, 182, 212, 0.12);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -10s;
  animation-duration: 18s;
}

@keyframes float {
  0% {
    transform: translate(0, 0) scale(1) rotate(0deg);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1) rotate(120deg);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.95) rotate(240deg);
  }
  100% {
    transform: translate(0, 0) scale(1) rotate(360deg);
  }
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
</style>
