<template>
  <div class="login-wrapper">
    <!-- Glowing background decorative spots -->
    <div class="glow-spot blue"></div>
    <div class="glow-spot purple"></div>

    <div class="login-card glass-card">
      <div class="login-header">
        <span class="logo-emoji">🌊</span>
        <h2>FinFlow Pro</h2>
        <p>กรุณาเข้าสู่ระบบเพื่อจัดการบัญชีการเงินของคุณ</p>
      </div>

      <form @submit.prevent="handleLogin" style="display: flex; flex-direction: column; gap: 1.15rem; width: 100%;">
        <div class="form-group">
          <label for="username">ชื่อผู้ใช้งาน (Username)</label>
          <input 
            v-model="username" 
            type="text" 
            id="username" 
            class="form-control" 
            placeholder="กรอกชื่อผู้ใช้งาน เช่น oat, beem" 
            required 
            style="border-radius: 12px;"
          />
        </div>

        <div class="form-group" style="margin-bottom: 0.5rem;">
          <label for="password">รหัสผ่าน (Password)</label>
          <input 
            v-model="password" 
            type="password" 
            id="password" 
            class="form-control" 
            placeholder="กรอกรหัสผ่าน" 
            required
            style="border-radius: 12px;"
          />
        </div>

        <button type="submit" class="btn btn-primary login-btn" :disabled="isLoading">
          <span v-if="isLoading">กำลังเข้าสู่ระบบ...</span>
          <span v-else>เข้าสู่ระบบ 🔐</span>
        </button>

        <div v-if="error" class="error-banner">
          ⚠️ {{ error }}
        </div>
      </form>
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
      error,
      isLoading,
      handleLogin
    };
  }
};
</script>

<style scoped>
.login-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #0b0f19;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  overflow: hidden;
}

/* Light mode overrides support */
:global(body.light-theme) .login-wrapper {
  background-color: #f5f5f7;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2.5rem;
  border-radius: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 10;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
  width: 100%;
}

.logo-emoji {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.75rem;
  filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.4));
}

.login-header h2 {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 6px;
  background: linear-gradient(135deg, #fff 30%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

:global(body.light-theme) .login-header h2 {
  background: linear-gradient(135deg, #0f172a 30%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-header p {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.login-btn {
  width: 100%;
  font-weight: 700;
  border-radius: 12px;
  padding: 12px;
  font-size: 0.95rem;
  margin-top: 5px;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.35);
}

.error-banner {
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.2);
  color: var(--color-danger);
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 0.8rem;
  text-align: center;
  font-weight: 600;
  width: 100%;
  margin-top: 10px;
}

/* Glowing spots decoration */
.glow-spot {
  position: absolute;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 1;
  opacity: 0.6;
}

.glow-spot.blue {
  top: 15%;
  left: 20%;
  background: rgba(0, 122, 255, 0.15);
}

.glow-spot.purple {
  bottom: 15%;
  right: 20%;
  background: rgba(175, 82, 222, 0.15);
}
</style>
