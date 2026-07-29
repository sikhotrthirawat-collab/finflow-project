<template>
  <div class="app-container">
    <!-- Sidebar Navigation -->
    <aside class="sidebar" :class="{ collapsed: isSidebarCollapsed }">
      <!-- Floating collapse button centered vertically on the right border -->
      <button 
        @click="isSidebarCollapsed = !isSidebarCollapsed" 
        class="sidebar-toggle-btn"
        :title="isSidebarCollapsed ? 'ขยายเมนู' : 'ย่อเมนู'"
      >
        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polyline :points="isSidebarCollapsed ? '9 18 15 12 9 6' : '15 18 9 12 15 6'"></polyline>
        </svg>
      </button>

      <div class="brand" style="display: flex; align-items: center; gap: 12px; margin-bottom: 3rem; padding-left: 8px;">
        <span class="brand-icon" style="flex-shrink: 0;">💰</span>
        <span class="brand-name" v-if="!isSidebarCollapsed">FinFlow</span>
      </div>
      
      <ul class="nav-links">
        <li class="nav-item" :class="{ active: currentTab === 'dashboard' }">
          <button @click="currentTab = 'dashboard'">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="9"></rect>
              <rect x="14" y="3" width="7" height="5"></rect>
              <rect x="14" y="12" width="7" height="9"></rect>
              <rect x="3" y="16" width="7" height="5"></rect>
            </svg>
            <span class="nav-text">กระเป๋าเงิน (Pockets)</span>
          </button>
        </li>
        <li class="nav-item" :class="{ active: currentTab === 'transactions' }">
          <button @click="currentTab = 'transactions'">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <span class="nav-text">ประวัติรายการ</span>
          </button>
        </li>
        <li class="nav-item" :class="{ active: currentTab === 'investments' }">
          <button @click="currentTab = 'investments'">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            <span class="nav-text">การลงทุนหุ้น</span>
          </button>
        </li>
        <li class="nav-item" :class="{ active: currentTab === 'budgets' }">
          <button @click="currentTab = 'budgets'">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
            <span class="nav-text">ตั้งค่า Pockets</span>
          </button>
        </li>
      </ul>
      
      <!-- Theme Toggle Switch at bottom of Sidebar -->
      <div class="theme-toggle-container" style="margin-top: auto; padding-top: 1.5rem; border-top: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
        <span v-if="!isSidebarCollapsed" style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 600;">โหมดสว่าง / มืด</span>
        <button 
          @click="toggleTheme" 
          style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 10px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; transition: var(--transition-fast);"
          :style="{ margin: isSidebarCollapsed ? '0 auto' : '0' }"
          title="สลับโหมดหน้าจอ"
        >
          {{ isDarkMode ? '🌙' : '☀️' }}<span v-if="!isSidebarCollapsed" style="margin-left: 4px;">{{ isDarkMode ? 'มืด' : 'สว่าง' }}</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content" :class="{ collapsed: isSidebarCollapsed }">
      <header>
        <div class="page-title">
          <h1>{{ tabTitle }}</h1>
          <p>{{ tabSubtitle }}</p>
        </div>
        
        <!-- Global Month Selector -->
        <div class="month-picker">
          <label style="font-size: 0.8rem; color: var(--text-secondary); margin-right: 8px;">ประจำเดือน:</label>
          <select v-model="selectedMonth">
            <option v-for="m in monthOptions" :key="m.value" :value="m.value">
              {{ m.label }}
            </option>
          </select>
        </div>
      </header>

      <!-- Sub-Components -->
      <component 
        :is="activeComponent" 
        :month="selectedMonth" 
        @update-data="triggerDataRefresh"
        ref="activeCompRef"
      />
    </main>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import Dashboard from './components/Dashboard.vue';
import Transactions from './components/Transactions.vue';
import Budgets from './components/Budgets.vue';
import Investments from './components/Investments.vue';

export default {
  name: 'App',
  components: {
    Dashboard,
    Transactions,
    Budgets,
    Investments
  },
  setup() {
    const currentTab = ref('dashboard');
    const today = new Date();
    const defaultMonth = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
    const selectedMonth = ref(defaultMonth); // Automatically defaults to current month

    const activeCompRef = ref(null);

    const isSidebarCollapsed = ref(false);

    // Light/Dark Theme Control
    const isDarkMode = ref(localStorage.getItem('theme') !== 'light');

    if (!isDarkMode.value) {
      document.body.classList.add('light-theme');
    }

    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value;
      if (isDarkMode.value) {
        document.body.classList.remove('light-theme');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
      }
    };

    // List of months for dropdown (from late 2025 to end of 2026)
    const monthOptions = [
      { value: '2026-12', label: 'ธันวาคม 2569' },
      { value: '2026-11', label: 'พฤศจิกายน 2569' },
      { value: '2026-10', label: 'ตุลาคม 2569' },
      { value: '2026-09', label: 'กันยายน 2569' },
      { value: '2026-08', label: 'สิงหาคม 2569' },
      { value: '2026-07', label: 'กรกฎาคม 2569' },
      { value: '2026-06', label: 'มิถุนายน 2569' },
      { value: '2026-05', label: 'พฤษภาคม 2569' },
      { value: '2026-04', label: 'เมษายน 2569' },
      { value: '2026-03', label: 'มีนาคม 2569' },
      { value: '2026-02', label: 'กุมภาพันธ์ 2569' },
      { value: '2026-01', label: 'มกราคม 2569' },
      { value: '2025-12', label: 'ธันวาคม 2568' }
    ];

    const activeComponent = computed(() => {
      switch (currentTab.value) {
        case 'dashboard': return Dashboard;
        case 'transactions': return Transactions;
        case 'budgets': return Budgets;
        case 'investments': return Investments;
        default: return Dashboard;
      }
    });

    const tabTitle = computed(() => {
      switch (currentTab.value) {
        case 'dashboard': return 'กระเป๋าเงิน & Pockets ของฉัน';
        case 'transactions': return 'ประวัติรายการเงินเข้า-ออก';
        case 'budgets': return 'ตั้งค่าวงเงินกระเป๋า (Pockets)';
        case 'investments': return 'การลงทุนและวิเคราะห์พอร์ตหุ้น';
        default: return 'FinFlow';
      }
    });

    const tabSubtitle = computed(() => {
      switch (currentTab.value) {
        case 'dashboard': return 'กระเป๋าเงินก้อนหลัก และการแบ่งสรรเงินลงกระเป๋าย่อย (Cloud Pockets)';
        case 'transactions': return 'ป้อนประวัติรายละเอียดรายรับและรายจ่ายทั้งหมดประจำวัน';
        case 'budgets': return 'ตั้งค่าเป้าหมาย/กำหนดขนาดของแต่ละกระเป๋าย่อยประจำเดือน';
        case 'investments': return 'บันทึกซื้อขายหุ้น คำนวณต้นทุนเฉลี่ย และวิเคราะห์กำไรขาดทุน (P&L) รายตัวแบบเรียลไทม์';
        default: return '';
      }
    });

    // Helper function to refresh stats or subcomponents if we update data elsewhere
    const triggerDataRefresh = () => {
      console.log("Data changed, triggering refresh in components...");
      // If there are specific refresh methods on child components we can call them or rely on watch dependencies.
    };

    return {
      currentTab,
      selectedMonth,
      monthOptions,
      activeComponent,
      tabTitle,
      tabSubtitle,
      activeCompRef,
      triggerDataRefresh,
      isDarkMode,
      toggleTheme,
      isSidebarCollapsed
    };
  }
};
</script>
