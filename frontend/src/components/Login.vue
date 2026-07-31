<template>
  <div class="fb-login-wrapper">
    <div class="fb-login-container">
      
      <!-- Left Column: Branding (Desktop only, centers on mobile) -->
      <div class="fb-brand-section">
        <h1 class="fb-logo-text">finflow</h1>
        <h2 class="fb-tagline">
          FinFlow ช่วยให้คุณเชื่อมต่อการเงิน จัดสรรงบประมาณกระเป๋าย่อย และวิเคราะห์พอร์ตหุ้นของคุณในที่เดียว
        </h2>
      </div>

      <!-- Right Column: Login Form Card -->
      <div class="fb-card-section">
        <div class="fb-login-card">
          <form @submit.prevent="handleLogin" class="fb-form">
            <!-- Username Input -->
            <div class="fb-input-wrapper">
              <input 
                v-model="username" 
                type="text" 
                placeholder="ชื่อผู้ใช้งาน หรือ หมายเลขโทรศัพท์" 
                required 
                class="fb-input"
              />
            </div>

            <!-- Password Input -->
            <div class="fb-input-wrapper" style="position: relative;">
              <input 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                placeholder="รหัสผ่าน" 
                required 
                class="fb-input"
              />
              <button 
                type="button" 
                class="fb-password-toggle" 
                @click="showPassword = !showPassword"
                tabindex="-1"
              >
                {{ showPassword ? 'ซ่อน' : 'แสดง' }}
              </button>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="fb-login-btn" :disabled="isLoading">
              <span v-if="isLoading">กำลังเข้าสู่ระบบ...</span>
              <span v-else>เข้าสู่ระบบ</span>
            </button>

            <!-- Forgot Password Link -->
            <div class="fb-forgot-pwd">
              <a href="#" @click.prevent="alertForgot">ลืมรหัสผ่านใช่หรือไม่?</a>
            </div>

            <!-- Divider -->
            <div class="fb-divider"></div>

            <!-- Create New Account Button -->
            <div class="fb-create-btn-wrapper">
              <button type="button" class="fb-create-btn" @click="alertCreate">
                สร้างบัญชีใหม่
              </button>
            </div>
          </form>
        </div>
        
        <!-- Bottom Link / Subtitle -->
        <p class="fb-bottom-text">
          <strong>สร้างเพจ</strong> สำหรับ oat และ beem เท่านั้นในการสลับบัญชีใช้งาน
        </p>
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
          alert(data.error || 'ชื่อผู้ใช้งาน หรือ รหัสผ่าน ไม่ถูกต้อง');
        }
      } catch (err) {
        console.error(err);
        alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์หลังบ้านได้');
      } finally {
        isLoading.value = false;
      }
    };

    const alertForgot = () => {
      alert('คำใบ้รหัสผ่าน: รหัสผ่านของ oat และ beem คือ 123 ครับ 🔑');
    };

    const alertCreate = () => {
      alert('ระบบสมัครสมาชิกใหม่ปิดชั่วคราว! กรุณาใช้บัญชี oat หรือ beem ในการใช้งาน (รหัสผ่าน 123) ครับ 🔒');
    };

    return {
      username,
      password,
      showPassword,
      error,
      isLoading,
      handleLogin,
      alertForgot,
      alertCreate
    };
  }
};
</script>

<style scoped>
.fb-login-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  font-family: SFProDisplay-Regular, Helvetica, Arial, sans-serif;
  overflow-y: auto;
}

/* Container limits width and splits desktop columns */
.fb-login-container {
  width: 100%;
  max-width: 980px;
  padding: 20px 40px 100px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

/* Left Column: Branding text */
.fb-brand-section {
  flex: 1;
  max-width: 500px;
  padding-bottom: 40px;
  text-align: left;
}

.fb-logo-text {
  color: #1877f2;
  font-size: 4rem;
  font-weight: bold;
  letter-spacing: -2px;
  margin: 0 0 10px -4px;
  font-family: Helvetica, Arial, sans-serif;
}

.fb-tagline {
  font-size: 1.75rem;
  font-weight: normal;
  line-height: 1.34;
  color: #1c1e21;
  margin: 0;
  word-break: keep-all;
  font-family: SFProDisplay-Regular, Helvetica, Arial, sans-serif;
}

/* Right Column: Card section */
.fb-card-section {
  width: 100%;
  max-width: 396px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.fb-login-card {
  background: #ffffff;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}

.fb-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.fb-input-wrapper {
  width: 100%;
  box-sizing: border-box;
}

.fb-input {
  width: 100%;
  height: 52px;
  border: 1px solid #dddfe2;
  border-radius: 6px;
  font-size: 17px;
  padding: 14px 16px;
  box-sizing: border-box;
  color: #1c1e21;
  outline: none;
  transition: border-color 0.1s, box-shadow 0.1s;
}

.fb-input:focus {
  border-color: #1877f2;
  box-shadow: 0 0 0 2px #e7f3ff;
}

.fb-input::placeholder {
  color: #8d949e;
}

/* Password Toggle text style like a link */
.fb-password-toggle {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #1877f2;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  z-index: 10;
}

.fb-password-toggle:hover {
  text-decoration: underline;
}

/* Submit Log In Button */
.fb-login-btn {
  background-color: #1877f2;
  border: none;
  border-radius: 6px;
  color: #ffffff;
  font-size: 20px;
  font-weight: bold;
  height: 48px;
  line-height: 48px;
  padding: 0 16px;
  cursor: pointer;
  transition: background-color 0.1s;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fb-login-btn:hover {
  background-color: #166fe5;
}

.fb-login-btn:active {
  background-color: #1464cc;
}

.fb-login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Forgotten password link */
.fb-forgot-pwd {
  text-align: center;
  margin-top: 4px;
}

.fb-forgot-pwd a {
  color: #1877f2;
  font-size: 14px;
  text-decoration: none;
  font-family: SFProText-Regular, Helvetica, Arial, sans-serif;
}

.fb-forgot-pwd a:hover {
  text-decoration: underline;
}

/* Horizontal line divider */
.fb-divider {
  align-items: center;
  border-bottom: 1px solid #dadde1;
  display: flex;
  margin: 8px 0;
  text-align: center;
}

/* Create New Account Button */
.fb-create-btn-wrapper {
  text-align: center;
  padding-top: 6px;
}

.fb-create-btn {
  background-color: #42b72a;
  border: none;
  border-radius: 6px;
  color: #ffffff;
  font-size: 17px;
  font-weight: bold;
  height: 48px;
  line-height: 48px;
  padding: 0 16px;
  cursor: pointer;
  transition: background-color 0.1s;
}

.fb-create-btn:hover {
  background-color: #36a420;
}

.fb-create-btn:active {
  background-color: #2b9217;
}

/* Sub-card small text */
.fb-bottom-text {
  font-size: 14px;
  color: #1c1e21;
  text-align: center;
  margin-top: 20px;
  font-family: SFProText-Regular, Helvetica, Arial, sans-serif;
}

.fb-bottom-text strong {
  cursor: pointer;
}

.fb-bottom-text strong:hover {
  text-decoration: underline;
}

/* Responsive queries */
@media (max-width: 900px) {
  .fb-login-container {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px 20px 50px 20px;
    gap: 40px;
  }

  .fb-brand-section {
    text-align: center;
    max-width: 400px;
    padding-bottom: 0;
  }

  .fb-logo-text {
    font-size: 3.25rem;
    margin: 0 0 8px 0;
  }

  .fb-tagline {
    font-size: 1.35rem;
    line-height: 1.3;
  }

  .fb-card-section {
    max-width: 396px;
  }
}
</style>
