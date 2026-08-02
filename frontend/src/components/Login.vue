<template>
  <div class="fb-login-wrapper">
    <div class="fb-login-container">
      
      <!-- LEFT COLUMN: Facebook-Style Illustration Collage & Tagline -->
      <div class="fb-brand-section">
        <div class="collage-container">
          <!-- Blue circular logo -->
          <div class="logo-circle">
            <span class="logo-inner-icon">f</span>
          </div>

          <!-- Floating card 1: Plant -->
          <div class="collage-card card-plant">
            <img src="https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=300&q=80" alt="Plant" />
            <div class="card-icon-tag">🏡</div>
          </div>

          <!-- Floating card 2: Portrait -->
          <div class="collage-card card-portrait">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" alt="Portrait" />
            <span class="time-tag">⏱️ 16:45</span>
          </div>

          <!-- Floating card 3: Skatepark -->
          <div class="collage-card card-skatepark">
            <img src="https://images.unsplash.com/photo-1520156473893-b42419639e4d?auto=format&fit=crop&w=300&q=80" alt="Skatepark" />
            <div class="card-star-tag">⭐</div>
          </div>

          <!-- Floating card 4: Wave avatar -->
          <div class="collage-card card-avatar-circle">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" alt="Avatar" />
          </div>

          <!-- Stickers -->
          <div class="sticker sticker-laugh">😂</div>
          <div class="sticker sticker-heart">❤️</div>
        </div>

        <h2 class="fb-tagline">
          Explore<br />
          things <span class="text-highlight">you<br />like</span>
        </h2>
      </div>

      <!-- RIGHT COLUMN: Login Form Cards (Toggles between Quick, Password and Custom Login) -->
      <div class="fb-card-section">
        
        <!-- View 1: Quick Recent Logins -->
        <div v-if="view === 'quick'" class="fb-login-card">
          <div class="card-header-row">
            <span class="card-heading-title">Recent Logins</span>
            <button class="settings-btn" @click="alertSettings">⚙️</button>
          </div>

          <div class="profiles-list">
            <!-- Profile 1: Oat -->
            <div class="profile-item" @click="selectProfile('oat', 'Oat', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80')">
              <div class="profile-avatar-wrapper">
                <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80" alt="Oat" />
              </div>
              <span class="profile-display-name">Oat</span>
              <span class="profile-arrow">❯</span>
            </div>

            <!-- Profile 2: Beem -->
            <div class="profile-item" @click="selectProfile('beem', 'Beem', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80')">
              <div class="profile-avatar-wrapper">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" alt="Beem" />
              </div>
              <span class="profile-display-name">Beem</span>
              <span class="profile-arrow">❯</span>
            </div>

            <!-- Profile 3: Krubob -->
            <div class="profile-item" @click="selectProfile('krubob', 'Krubob', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80')">
              <div class="profile-avatar-wrapper">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80" alt="Krubob" />
              </div>
              <span class="profile-display-name">Krubob</span>
              <span class="profile-arrow">❯</span>
            </div>
          </div>

          <div class="action-buttons-stack">
            <button class="btn-fb-white" @click="view = 'custom'">Log In to Another Account</button>
            <button class="btn-fb-blue-outline" @click="alertCreate">Create New Account</button>
          </div>
        </div>

        <!-- View 2: Password Prompt for Selected Profile -->
        <div v-else-if="view === 'password'" class="fb-login-card">
          <div class="password-prompt-header">
            <div class="back-arrow" @click="view = 'quick'">❮</div>
            <span class="card-heading-title">Enter Password</span>
          </div>

          <div class="selected-profile-preview">
            <img :src="selectedUser.avatar" alt="Avatar" class="prompt-avatar" />
            <div class="prompt-display-name">{{ selectedUser.displayName }}</div>
          </div>

          <form @submit.prevent="handleQuickLogin" class="fb-form">
            <div class="fb-input-wrapper" style="position: relative;">
              <input 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                :placeholder="'Password for ' + selectedUser.displayName" 
                required 
                class="fb-input"
                ref="passwordInput"
              />
              <button 
                type="button" 
                class="fb-password-toggle" 
                @click="showPassword = !showPassword"
                tabindex="-1"
              >
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>

            <button type="submit" class="fb-login-btn" :disabled="isLoading">
              <span v-if="isLoading">Logging in...</span>
              <span v-else>Log In</span>
            </button>
          </form>

          <div class="password-prompt-footer">
            <a href="#" @click.prevent="alertForgot">Forgotten password?</a>
          </div>
        </div>

        <!-- View 3: Custom Login (Standard Form) -->
        <div v-else-if="view === 'custom'" class="fb-login-card">
          <div class="password-prompt-header">
            <div class="back-arrow" @click="view = 'quick'">❮</div>
            <span class="card-heading-title">Log In to Facebook</span>
          </div>

          <form @submit.prevent="handleCustomLogin" class="fb-form" style="margin-top: 15px;">
            <div class="fb-input-wrapper">
              <input 
                v-model="username" 
                type="text" 
                placeholder="Username or phone number" 
                required 
                class="fb-input"
              />
            </div>

            <div class="fb-input-wrapper" style="position: relative;">
              <input 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                placeholder="Password" 
                required 
                class="fb-input"
              />
              <button 
                type="button" 
                class="fb-password-toggle" 
                @click="showPassword = !showPassword"
                tabindex="-1"
              >
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>

            <button type="submit" class="fb-login-btn" :disabled="isLoading">
              <span v-if="isLoading">Logging in...</span>
              <span v-else>Log In</span>
            </button>

            <div class="fb-forgot-pwd">
              <a href="#" @click.prevent="alertForgot">Forgotten password?</a>
            </div>
          </form>
        </div>

        <!-- Meta Branding Link -->
        <p class="fb-bottom-text">
          <span class="meta-logo-symbol">∞</span> Meta
        </p>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, nextTick } from 'vue';

export default {
  name: 'Login',
  emits: ['login-success'],
  setup(props, { emit }) {
    const view = ref('quick'); // 'quick', 'password', 'custom'
    const username = ref('');
    const password = ref('');
    const showPassword = ref(false);
    const error = ref('');
    const isLoading = ref(false);
    
    const selectedUser = ref({
      username: '',
      displayName: '',
      avatar: ''
    });

    const passwordInput = ref(null);

    const selectProfile = (userKey, displayName, avatar) => {
      selectedUser.value = {
        username: userKey,
        displayName,
        avatar
      };
      password.value = '';
      showPassword.value = false;
      view.value = 'password';
      
      // Auto focus password input
      nextTick(() => {
        if (passwordInput.value) {
          passwordInput.value.focus();
        }
      });
    };

    const handleQuickLogin = async () => {
      isLoading.value = true;
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: selectedUser.value.username,
            password: password.value
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          emit('login-success', data.user);
        } else {
          alert(data.error || 'Incorrect password.');
        }
      } catch (err) {
        console.error(err);
        alert('Cannot connect to the server.');
      } finally {
        isLoading.value = false;
      }
    };

    const handleCustomLogin = async () => {
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
          alert(data.error || 'Incorrect username or password.');
        }
      } catch (err) {
        console.error(err);
        alert('Cannot connect to the server.');
      } finally {
        isLoading.value = false;
      }
    };

    const alertForgot = () => {
      alert('Password Hint: The password for Oat, Beem, and Krubob is 123 🔑');
    };

    const alertCreate = () => {
      alert('Registration is closed! Please use Oat, Beem, or Krubob (password: 123) to log in. 🔒');
    };

    const alertSettings = () => {
      alert('Login configurations are coming soon! ⚙️');
    };

    return {
      view,
      username,
      password,
      showPassword,
      error,
      isLoading,
      selectedUser,
      passwordInput,
      selectProfile,
      handleQuickLogin,
      handleCustomLogin,
      alertForgot,
      alertCreate,
      alertSettings
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700;800&family=Outfit:wght@400;700;800&display=swap');

.fb-login-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  font-family: SFProDisplay-Regular, Helvetica, 'Sarabun', Arial, sans-serif;
  overflow-y: auto;
}

.fb-login-container {
  width: 100%;
  max-width: 1000px;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 60px;
}

/* LEFT COLUMN: BRANDING & ILLUSTRATION COLLAGE */
.fb-brand-section {
  flex: 1.1;
  max-width: 500px;
  padding-right: 40px;
  border-right: 1px solid #dadde1;
  display: flex;
  flex-direction: column;
}

.fb-tagline {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.15;
  color: #1c1e21;
  margin: 30px 0 0 0;
  letter-spacing: -1px;
  text-align: left;
}

.text-highlight {
  color: #1877f2;
}

/* Collage Container & Layout */
.collage-container {
  position: relative;
  width: 100%;
  height: 320px;
  margin-bottom: 20px;
}

/* Circular Facebook-style logo */
.logo-circle {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 60px;
  height: 60px;
  background-color: #1877f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(24, 119, 242, 0.25);
  z-index: 10;
}

.logo-inner-icon {
  color: #ffffff;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 3rem;
  font-weight: bold;
  margin-top: 14px;
  margin-left: 15px;
}

/* Floating Card Base */
.collage-card {
  position: absolute;
  background: #ffffff;
  border-radius: 16px;
  padding: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border: 1.5px solid #ffffff;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.collage-card:hover {
  transform: scale(1.03) translateY(-4px);
}

.collage-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  display: block;
}

/* Card 1: Plant */
.card-plant {
  width: 130px;
  height: 120px;
  top: 60px;
  left: 100px;
  transform: rotate(-8deg);
}

.card-icon-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 6px;
  padding: 2px 4px;
  font-size: 0.8rem;
}

/* Card 2: Portrait woman */
.card-portrait {
  width: 160px;
  height: 200px;
  top: 30px;
  right: 50px;
  transform: rotate(5deg);
}

.time-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #1877f2;
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
}

/* Card 3: Skatepark */
.card-skatepark {
  width: 110px;
  height: 120px;
  bottom: 10px;
  left: 120px;
  transform: rotate(6deg);
}

.card-star-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #1877f2;
  color: #fff;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
}

/* Card 4: Round profile avatar */
.card-avatar-circle {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  bottom: 20px;
  right: 100px;
  padding: 4px;
  border: 3px solid #1877f2;
  box-shadow: 0 4px 15px rgba(24, 119, 242, 0.3);
}

.card-avatar-circle img {
  border-radius: 50%;
}

/* Stickers */
.sticker {
  position: absolute;
  font-size: 2rem;
  z-index: 15;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
  animation: bounce 4s infinite ease-in-out alternate;
}

.sticker-laugh {
  top: 40px;
  left: 240px;
  animation-delay: 1s;
}

.sticker-heart {
  bottom: 120px;
  right: 20px;
  font-size: 2.2rem;
}

@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-8px); }
}

/* RIGHT COLUMN: CARD SECTION */
.fb-card-section {
  flex: 0.9;
  max-width: 410px;
  display: flex;
  flex-direction: column;
}

.fb-login-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1);
  padding: 24px;
  width: 100%;
  box-sizing: border-box;
}

/* Card Header row with settings cog */
.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.card-heading-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1c1e21;
}

.settings-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #606770;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.settings-btn:hover {
  background-color: #f0f2f5;
}

/* Saved Profiles list */
.profiles-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.profile-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.profile-item:hover {
  background-color: #f2f3f5;
}

.profile-avatar-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 14px;
  border: 1px solid #dddfe2;
}

.profile-avatar-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-display-name {
  flex-grow: 1;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1c1e21;
  text-align: left;
}

.profile-arrow {
  color: #bcc0c4;
  font-size: 1.1rem;
  padding-right: 4px;
}

/* Action Buttons */
.action-buttons-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.btn-fb-white {
  background-color: #ffffff;
  border: 1px solid #ccd0d5;
  border-radius: 20px;
  color: #4b4f56;
  font-size: 15px;
  font-weight: bold;
  height: 40px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s;
}

.btn-fb-white:hover {
  background-color: #f5f6f7;
}

.btn-fb-blue-outline {
  background-color: #ffffff;
  border: 1px solid #1877f2;
  border-radius: 20px;
  color: #1877f2;
  font-size: 15px;
  font-weight: bold;
  height: 40px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s;
}

.btn-fb-blue-outline:hover {
  background-color: #f0f6ff;
}

/* Password Prompt Page Styles */
.password-prompt-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.back-arrow {
  font-size: 1.1rem;
  color: #606770;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.back-arrow:hover {
  background-color: #f0f2f5;
}

.selected-profile-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.prompt-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;
  border: 1px solid #dddfe2;
}

.prompt-display-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1c1e21;
}

.password-prompt-footer {
  text-align: center;
  margin-top: 16px;
}

.password-prompt-footer a {
  color: #1877f2;
  font-size: 14px;
  text-decoration: none;
}

.password-prompt-footer a:hover {
  text-decoration: underline;
}

/* Custom/Standard form override input fields styling */
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

.fb-login-btn {
  background-color: #1877f2;
  border: none;
  border-radius: 6px;
  color: #ffffff;
  font-size: 18px;
  font-weight: bold;
  height: 48px;
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

.fb-forgot-pwd {
  text-align: center;
  margin-top: 4px;
}

.fb-forgot-pwd a {
  color: #1877f2;
  font-size: 14px;
  text-decoration: none;
}

.fb-forgot-pwd a:hover {
  text-decoration: underline;
}

/* Brand Text Infinity symbol */
.fb-bottom-text {
  font-size: 13px;
  color: #8d949e;
  text-align: center;
  margin-top: 30px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.meta-logo-symbol {
  font-size: 1.45rem;
  color: #1877f2;
  line-height: 1;
}

/* RESPONSIVE LAYOUT MEDIA QUERIES */
@media (max-width: 900px) {
  .fb-login-container {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    gap: 40px;
  }

  .fb-brand-section {
    text-align: center;
    padding-right: 0;
    border-right: none;
    align-items: center;
  }

  .fb-tagline {
    font-size: 2.25rem;
    margin: 20px 0 0 0;
  }

  .collage-container {
    max-width: 360px;
    height: 280px;
  }

  .fb-card-section {
    max-width: 396px;
    width: 100%;
  }
}
</style>
