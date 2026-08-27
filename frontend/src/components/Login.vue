<template>
  <div class="rov-login-wrapper">
    <!-- Background Music -->
    <audio ref="lobbyMusic" loop src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"></audio>

    <!-- Floating Background Particles (Game Lobby Embers) -->
    <div class="particles-container">
      <div class="particle p1"></div>
      <div class="particle p2"></div>
      <div class="particle p3"></div>
      <div class="particle p4"></div>
      <div class="particle p5"></div>
      <div class="particle p6"></div>
      <div class="particle p7"></div>
      <div class="particle p8"></div>
    </div>

    <!-- Top Utility Controls -->
    <div class="rov-top-row">
      <button class="music-toggle-btn" @click="toggleMusic" :class="{ muted: isMuted }" title="Lobby Music">
        <span class="music-icon">{{ isMuted ? '🔈' : '🔊' }}</span>
      </button>

      <div class="rov-system-buttons">
        <button class="rov-circle-btn" @click="alertSettings" title="Server settings">⚙️</button>
        <button class="rov-circle-btn text-btn" @click="alertSettings">TH</button>
        <button class="rov-circle-btn" @click="alertSettings" title="Repair Game">🔧</button>
      </div>
    </div>

    <!-- Center Cinematic Section -->
    <div class="rov-cinematic-container">
      <!-- Metallic glowing title -->
      <div class="rov-title-area animate-fade-in">
        <h1 class="rov-game-title">FINFLOW</h1>
        <p class="rov-game-subtitle">ARENA OF FINANCE</p>
      </div>

      <!-- Main Interaction Window -->
      <div class="rov-interface-panel animate-scale-up">
        <div class="panel-border-top"></div>
        <div class="panel-inner-content">

          <!-- View 1: Character (Profile) Selection -->
          <div v-if="view === 'quick'">
            <h3 class="rov-section-title">SELECT ACCOUNT HERO</h3>
            <p class="rov-section-desc">เลือกตัวละครเพื่อเข้าสมรภูมิการเงิน</p>

            <div class="hero-select-grid">
              <!-- Profile 1: Oat -->
              <div 
                class="hero-card" 
                :class="{ active: tempSelected === 'oat' }"
                @click="tempSelected = 'oat'"
              >
                <div class="hero-portrait-frame">
                  <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80" alt="Oat" class="hero-avatar" />
                  <div class="hero-role-badge tank">TANK</div>
                </div>
                <h4 class="hero-name">Oat</h4>
                <p class="hero-stats">Level 99 | Budget Fighter</p>
              </div>

              <!-- Profile 2: Beem -->
              <div 
                class="hero-card" 
                :class="{ active: tempSelected === 'beem' }"
                @click="tempSelected = 'beem'"
              >
                <div class="hero-portrait-frame">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" alt="Beem" class="hero-avatar" />
                  <div class="hero-role-badge mage">MAGE</div>
                </div>
                <h4 class="hero-name">Beem</h4>
                <p class="hero-stats">Level 99 | Wealth Saver</p>
              </div>
            </div>

            <!-- Big Start Game Button -->
            <div class="action-section">
              <button 
                class="rov-start-btn" 
                :disabled="!tempSelected"
                @click="confirmHero"
              >
                <span class="btn-glowing-effect"></span>
                START GAME
              </button>

              <div class="extra-login-actions">
                <button class="rov-text-link" @click="goToCustom">Switch Account</button>
                <span class="divider">|</span>
                <button class="rov-text-link" @click="alertCreate">Create Account</button>
              </div>
            </div>
          </div>

          <!-- View 2: Passcode Lock Entry -->
          <div v-else-if="view === 'password'" class="secure-passcode-view">
            <button class="rov-back-btn" @click="backToSelect">❮ Back to Heroes</button>
            
            <h3 class="rov-section-title">SECURE ACCESS</h3>
            <p class="rov-section-desc">กรุณาระบุรหัสผ่านของบัญชี {{ selectedUser.displayName }}</p>

            <div class="selected-hero-shield animate-pulse">
              <div class="shield-portrait-wrapper">
                <img :src="selectedUser.avatar" alt="Avatar" class="shield-avatar" />
              </div>
              <div class="shield-name">{{ selectedUser.displayName }}</div>
            </div>

            <form @submit.prevent="handleQuickLogin" class="rov-game-form">
              <div class="rov-input-group">
                <span class="input-icon">🔑</span>
                <input 
                  v-model="password" 
                  :type="showPassword ? 'text' : 'password'" 
                  :placeholder="'PASSCODE FOR ' + selectedUser.displayName.toUpperCase()" 
                  required 
                  class="rov-game-input"
                  ref="passwordInput"
                />
                <button 
                  type="button" 
                  class="rov-pwd-toggle" 
                  @click="showPassword = !showPassword"
                >
                  {{ showPassword ? 'HIDE' : 'SHOW' }}
                </button>
              </div>

              <button type="submit" class="rov-enter-arena-btn" :disabled="isLoading">
                <span v-if="isLoading">LOGGING IN...</span>
                <span v-else>ENTER ARENA</span>
              </button>

              <div class="extra-links">
                <a href="#" @click.prevent="alertForgot">Forgotten password?</a>
              </div>
            </form>
          </div>

          <!-- View 3: Custom Credentials Login -->
          <div v-else-if="view === 'custom'" class="secure-passcode-view">
            <button class="rov-back-btn" @click="backToSelect">❮ Back to Heroes</button>

            <h3 class="rov-section-title">GUILD SIGN IN</h3>
            <p class="rov-section-desc">ลงชื่อเข้าสู่สมรภูมิด้วยบัญชีภายนอก</p>

            <form @submit.prevent="handleCustomLogin" class="rov-game-form" style="margin-top: 15px;">
              <div class="rov-input-group">
                <span class="input-icon">👤</span>
                <input 
                  v-model="username" 
                  type="text" 
                  placeholder="USERNAME OR ID" 
                  required 
                  class="rov-game-input"
                />
              </div>

              <div class="rov-input-group">
                <span class="input-icon">🔑</span>
                <input 
                  v-model="password" 
                  :type="showPassword ? 'text' : 'password'" 
                  placeholder="PASSWORD" 
                  required 
                  class="rov-game-input"
                />
                <button 
                  type="button" 
                  class="rov-pwd-toggle" 
                  @click="showPassword = !showPassword"
                >
                  {{ showPassword ? 'HIDE' : 'SHOW' }}
                </button>
              </div>

              <button type="submit" class="rov-enter-arena-btn" :disabled="isLoading">
                <span v-if="isLoading">LOGGING IN...</span>
                <span v-else>LOG IN</span>
              </button>

              <div class="extra-links">
                <a href="#" @click.prevent="alertForgot">Forgotten password?</a>
              </div>
            </form>
          </div>

        </div>
        <div class="panel-border-bottom"></div>
      </div>
    </div>

    <!-- Studio Branding Footer -->
    <div class="rov-footer">
      <p class="branding-title">FINFLOW STUDIO</p>
      <p class="legal-text">© 2026 FINFLOW ARENA OF FINANCE. ALL RIGHTS RESERVED.</p>
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
    const isLoading = ref(false);
    
    // Media & Sound state
    const lobbyMusic = ref(null);
    const isMuted = ref(true);

    // Hero selection state
    const tempSelected = ref('');
    const selectedUser = ref({
      username: '',
      displayName: '',
      avatar: ''
    });

    const passwordInput = ref(null);

    const toggleMusic = () => {
      if (!lobbyMusic.value) return;
      if (isMuted.value) {
        lobbyMusic.value.play().catch(e => console.log('Audio playback blocked:', e));
        isMuted.value = false;
      } else {
        lobbyMusic.value.pause();
        isMuted.value = true;
      }
    };

    const confirmHero = () => {
      if (tempSelected.value === 'oat') {
        selectProfile('oat', 'Oat', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80');
      } else if (tempSelected.value === 'beem') {
        selectProfile('beem', 'Beem', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80');
      }
    };

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

    const backToSelect = () => {
      view.value = 'quick';
      tempSelected.value = '';
    };

    const goToCustom = () => {
      view.value = 'custom';
      username.value = '';
      password.value = '';
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
      alert('Password Hint: The password for Oat and Beem is 123 🔑');
    };

    const alertCreate = () => {
      alert('Registration is closed! Please use Oat or Beem (password: 123) to log in. 🔒');
    };

    const alertSettings = () => {
      alert('Login configurations are coming soon! ⚙️');
    };

    return {
      view,
      username,
      password,
      showPassword,
      isLoading,
      lobbyMusic,
      isMuted,
      tempSelected,
      selectedUser,
      passwordInput,
      toggleMusic,
      confirmHero,
      selectProfile,
      backToSelect,
      goToCustom,
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
/* Full Screen Gaming Wrapper */
.rov-login-wrapper {
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: radial-gradient(circle at center, #1b263b 0%, #0d1b2a 100%),
              url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80');
  background-size: cover;
  background-position: center;
  background-blend-mode: overlay;
  font-family: 'Cinzel', 'Noto Sans Thai', 'Palatino Linotype', Georgia, serif;
  color: #e0e1dd;
}

/* Background Embers/Particles Effect */
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: radial-gradient(circle, rgba(255,183,3,1) 0%, rgba(255,183,3,0) 80%);
  border-radius: 50%;
  filter: blur(1px);
  bottom: -20px;
  opacity: 0;
  animation: floatUp 15s infinite linear;
}

.p1 { left: 10%; width: 5px; height: 5px; animation-delay: 0s; animation-duration: 12s; }
.p2 { left: 25%; width: 8px; height: 8px; animation-delay: 2s; animation-duration: 18s; }
.p3 { left: 40%; width: 4px; height: 4px; animation-delay: 4s; animation-duration: 14s; }
.p4 { left: 55%; width: 9px; height: 9px; animation-delay: 1s; animation-duration: 16s; }
.p5 { left: 70%; width: 6px; height: 6px; animation-delay: 5s; animation-duration: 13s; }
.p6 { left: 85%; width: 7px; height: 7px; animation-delay: 3s; animation-duration: 17s; }
.p7 { left: 33%; width: 5px; height: 5px; animation-delay: 7s; animation-duration: 15s; }
.p8 { left: 78%; width: 8px; height: 8px; animation-delay: 6s; animation-duration: 19s; }

@keyframes floatUp {
  0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0; }
  10% { opacity: 0.8; }
  90% { opacity: 0.4; }
  100% { transform: translateY(-110vh) scale(0.3) rotate(360deg); opacity: 0; }
}

/* Top Utility Row */
.rov-top-row {
  width: 90%;
  max-width: 1400px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  z-index: 10;
}

/* Music Button styled like game lobby controls */
.music-toggle-btn {
  background: rgba(13, 27, 42, 0.7);
  border: 2px solid #c5a880;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(197, 168, 128, 0.3);
  transition: all 0.3s ease;
}

.music-toggle-btn:hover {
  transform: scale(1.1);
  border-color: #ffd700;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
}

.music-toggle-btn.muted {
  border-color: #5f5f5f;
  box-shadow: none;
  opacity: 0.7;
}

.music-icon {
  font-size: 20px;
}

.rov-system-buttons {
  display: flex;
  gap: 12px;
}

.rov-circle-btn {
  background: rgba(13, 27, 42, 0.7);
  border: 1px solid #c5a880;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #c5a880;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.rov-circle-btn:hover {
  border-color: #ffd700;
  color: #ffd700;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
}

.rov-circle-btn.text-btn {
  font-size: 11px;
}

/* Cinematic Main Content Container */
.rov-cinematic-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
  z-index: 5;
  padding: 20px;
}

/* Metallic Glowing Title */
.rov-title-area {
  text-align: center;
  margin-bottom: 30px;
}

.rov-game-title {
  font-size: 64px;
  font-weight: 900;
  letter-spacing: 8px;
  margin: 0;
  padding: 0;
  background: linear-gradient(to bottom, #ffffff 40%, #c5a880 70%, #8a6f48 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.3));
  text-shadow: 0 0 20px rgba(197, 168, 128, 0.5);
  animation: titleGlow 4s ease-in-out infinite alternate;
}

.rov-game-subtitle {
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 6px;
  margin: 8px 0 0 0;
  color: #c5a880;
  text-shadow: 0 0 5px rgba(197, 168, 128, 0.8);
}

@keyframes titleGlow {
  0% { filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.2)); }
  100% { filter: drop-shadow(0 0 18px rgba(255, 215, 0, 0.5)); }
}

/* Translucent Gaming Interface Panel */
.rov-interface-panel {
  width: 100%;
  max-width: 520px;
  background: rgba(13, 27, 42, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(197, 168, 128, 0.25);
  border-radius: 4px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7),
              inset 0 0 20px rgba(197, 168, 128, 0.05);
  position: relative;
  padding: 30px;
}

/* Gold Corner Accents for Gaming Feel */
.panel-border-top::before, .panel-border-top::after,
.panel-border-bottom::before, .panel-border-bottom::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border-color: #c5a880;
  border-style: solid;
}

.panel-border-top::before { top: -2px; left: -2px; border-width: 3px 0 0 3px; }
.panel-border-top::after { top: -2px; right: -2px; border-width: 3px 3px 0 0; }
.panel-border-bottom::before { bottom: -2px; left: -2px; border-width: 0 0 3px 3px; }
.panel-border-bottom::after { bottom: -2px; right: -2px; border-width: 0 3px 3px 0; }

.panel-inner-content {
  position: relative;
}

.rov-section-title {
  font-size: 20px;
  letter-spacing: 2px;
  text-align: center;
  color: #ffd700;
  margin: 0 0 4px 0;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
}

.rov-section-desc {
  font-size: 12px;
  text-align: center;
  color: #8b9bb4;
  margin: 0 0 24px 0;
  letter-spacing: 1px;
}

/* Character Selection Layout (Side-by-side) */
.hero-select-grid {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.hero-card {
  flex: 1;
  background: rgba(27, 38, 59, 0.4);
  border: 1px solid rgba(197, 168, 128, 0.2);
  border-radius: 4px;
  padding: 20px 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  position: relative;
}

.hero-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255,215,0,0.05) 0%, rgba(255,215,0,0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.hero-card:hover {
  transform: translateY(-5px);
  border-color: rgba(197, 168, 128, 0.8);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3),
              0 0 10px rgba(197, 168, 128, 0.2);
}

.hero-card:hover::before {
  opacity: 1;
}

/* Glowing active state when character is selected */
.hero-card.active {
  border-color: #ffd700;
  background: rgba(27, 38, 59, 0.7);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3),
              inset 0 0 10px rgba(255, 215, 0, 0.1);
}

/* Portrait Frame styled like character selector */
.hero-portrait-frame {
  width: 90px;
  height: 90px;
  margin: 0 auto 12px auto;
  border-radius: 50%;
  padding: 4px;
  border: 2px solid rgba(197, 168, 128, 0.4);
  position: relative;
  background: rgba(13, 27, 42, 0.8);
  box-shadow: 0 0 10px rgba(0,0,0,0.5);
  transition: border-color 0.3s ease;
}

.hero-card.active .hero-portrait-frame {
  border-color: #ffd700;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
}

.hero-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

/* Gaming role tag badges */
.hero-role-badge {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 2px;
  letter-spacing: 1px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.4);
}

.hero-role-badge.tank {
  background: #3a86c8;
  color: #fff;
  border: 1px solid #6cb6ff;
}

.hero-role-badge.mage {
  background: #a842f4;
  color: #fff;
  border: 1px solid #d495ff;
}

.hero-name {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 4px 0;
  color: #e0e1dd;
  letter-spacing: 1px;
}

.hero-card.active .hero-name {
  color: #ffd700;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.4);
}

.hero-stats {
  font-size: 11px;
  color: #8b9bb4;
  margin: 0;
}

/* Epic START GAME Button */
.action-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 10px;
}

.rov-start-btn {
  width: 100%;
  height: 52px;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 3px;
  background: linear-gradient(180deg, #ffd700 0%, #d4af37 50%, #aa7c11 100%);
  border: 2px solid #ffe875;
  border-radius: 4px;
  color: #0d1b2a;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5),
              0 0 10px rgba(255, 215, 0, 0.3);
  transition: all 0.2s ease;
}

.rov-start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.5);
  border-color: #ffffff;
}

.rov-start-btn:active:not(:disabled) {
  transform: translateY(1px);
}

.rov-start-btn:disabled {
  background: linear-gradient(180deg, #424e60 0%, #2f3844 100%);
  border-color: #556272;
  color: #6c7a8b;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-glowing-effect {
  position: absolute;
  top: 0;
  left: -150%;
  width: 50%;
  height: 100%;
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
  transform: skewX(-25deg);
  animation: shineLoop 3s infinite ease-in-out;
}

@keyframes shineLoop {
  0% { left: -150%; }
  50% { left: 150%; }
  100% { left: 150%; }
}

.extra-login-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 12px;
}

.rov-text-link {
  background: none;
  border: none;
  color: #c5a880;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
}

.rov-text-link:hover {
  color: #ffd700;
  text-decoration: underline;
}

.divider {
  color: rgba(197, 168, 128, 0.3);
}

/* View 2 & 3: Passcode Form Entry styling */
.rov-back-btn {
  background: none;
  border: none;
  color: #c5a880;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
}

.rov-back-btn:hover {
  color: #ffd700;
}

/* selected hero shield display */
.selected-hero-shield {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.shield-portrait-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  padding: 3px;
  border: 2px solid #ffd700;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
}

.shield-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.shield-name {
  font-size: 20px;
  font-weight: bold;
  color: #ffd700;
  margin-top: 8px;
  letter-spacing: 1px;
}

.rov-game-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Translucent Game Input fields */
.rov-input-group {
  position: relative;
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  background: rgba(13, 27, 42, 0.8);
  border: 1px solid rgba(197, 168, 128, 0.3);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.rov-input-group:focus-within {
  border-color: #ffd700;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.input-icon {
  padding: 0 12px;
  font-size: 16px;
  color: #c5a880;
}

.rov-game-input {
  flex-grow: 1;
  background: none;
  border: none;
  outline: none;
  height: 100%;
  color: #ffffff;
  font-size: 14px;
  letter-spacing: 1px;
}

.rov-game-input::placeholder {
  color: #5b6b80;
  letter-spacing: 1px;
}

.rov-pwd-toggle {
  background: none;
  border: none;
  color: #c5a880;
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;
  padding: 0 14px;
  letter-spacing: 1px;
  height: 100%;
  transition: color 0.2s ease;
}

.rov-pwd-toggle:hover {
  color: #ffd700;
}

/* Metallic Login/Enter Arena Button */
.rov-enter-arena-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 2px;
  background: linear-gradient(180deg, #c5a880 0%, #9e7f55 100%);
  border: 1px solid #ffd700;
  border-radius: 4px;
  color: #0d1b2a;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.4);
  transition: all 0.2s ease;
}

.rov-enter-arena-btn:hover:not(:disabled) {
  background: linear-gradient(180deg, #ffd700 0%, #c5a880 100%);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
}

.rov-enter-arena-btn:disabled {
  background: #303742;
  border-color: #555;
  color: #888;
  cursor: not-allowed;
  box-shadow: none;
}

.extra-links {
  text-align: center;
  font-size: 12px;
}

.extra-links a {
  color: #c5a880;
  text-decoration: none;
  transition: color 0.2s ease;
}

.extra-links a:hover {
  color: #ffd700;
  text-decoration: underline;
}

/* Studio Branding Footer */
.rov-footer {
  width: 100%;
  text-align: center;
  padding: 24px 0;
  z-index: 10;
  background: linear-gradient(to top, rgba(13, 27, 42, 0.9) 0%, rgba(13, 27, 42, 0) 100%);
}

.branding-title {
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 4px;
  color: #ffd700;
  margin: 0 0 6px 0;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
}

.legal-text {
  font-size: 9px;
  letter-spacing: 1px;
  color: #5b6b80;
  margin: 0;
}

/* Animation utilities */
.animate-fade-in {
  animation: fadeIn 1s ease-out forwards;
}

.animate-scale-up {
  animation: scaleUp 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

.animate-pulse {
  animation: gentlePulse 2s infinite ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes gentlePulse {
  0% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(255,215,0,0)); }
  50% { transform: scale(1.02); filter: drop-shadow(0 0 8px rgba(255,215,0,0.3)); }
  100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(255,215,0,0)); }
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .rov-game-title {
    font-size: 44px;
  }
  .rov-interface-panel {
    padding: 20px;
  }
  .hero-select-grid {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
