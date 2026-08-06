<template>
  <div>
    <!-- Search & Filter Controls -->
    <div class="glass-card filter-card" style="margin-bottom: 1.5rem; padding: 1.25rem;">
      <div style="display: flex; flex-wrap: wrap; gap: 15px; align-items: center; justify-content: space-between;">
        <div style="display: flex; flex-wrap: wrap; gap: 15px; flex: 1;">
          <!-- Search input -->
          <div style="min-width: 200px; flex: 1;">
            <input 
              v-model="searchQuery" 
              type="text" 
              class="form-control" 
              placeholder="ค้นหาตามรายละเอียด หรือหมวดหมู่..." 
              @input="filterTransactions"
            />
          </div>
          
          <!-- Type Filter -->
          <div style="width: 140px;">
            <select v-model="filterType" @change="filterTransactions">
              <option value="">ทั้งหมด</option>
              <option value="income">เฉพาะรายรับ</option>
              <option value="expense">เฉพาะรายจ่าย</option>
            </select>
          </div>

          <!-- Category Filter -->
          <div style="width: 180px;">
            <select v-model="filterCategory" @change="filterTransactions">
              <option value="">ทุกหมวดหมู่</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.name">
                {{ cat.name }}
              </option>
            </select>
          </div>
        </div>

        <div style="display: flex; gap: 10px;">
          <!-- Export PDF Button -->
          <button @click="printPage" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); color: var(--color-primary);">
            🖨️ ส่งออก PDF / พิมพ์
          </button>
          <button @click="openAddModal" class="btn btn-primary" style="font-weight: 700;">
            <span>+</span> เพิ่มธุรกรรมใหม่
          </button>
        </div>
      </div>
    </div>

    <!-- Main Workspace Area: Left Table, Right Summary & Chart -->
    <div class="responsive-split-grid print-layout-grid">
      
      <!-- LEFT Column: Transactions List Table -->
      <div class="glass-card transactions-table-card" style="padding: 1.25rem;">
        <div class="table-container" v-if="filteredTransactions.length > 0">
          <table>
            <thead>
              <tr>
                <th>วันที่</th>
                <th>ประเภท</th>
                <th>กระเป๋า (Pocket)</th>
                <th>รายละเอียด</th>
                <th style="text-align: right;">จำนวนเงิน</th>
                <th style="text-align: center; width: 100px;" class="actions-col">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in filteredTransactions" :key="tx.id">
                <td>{{ formatDate(tx.date) }}</td>
                <td>
                  <span class="badge" :class="tx.type === 'income' ? 'badge-income' : 'badge-expense'">
                    {{ tx.type === 'income' ? 'โอนเข้า' : 'จ่ายออก' }}
                  </span>
                </td>
                <td style="font-weight: 600;">{{ tx.category }}</td>
                <td style="color: var(--text-secondary);">{{ tx.description || '-' }}</td>
                <td style="text-align: right; font-weight: 700; font-size: 1.05rem;" :style="{ color: tx.type === 'income' ? 'var(--color-success)' : 'var(--color-danger)' }">
                  {{ tx.type === 'income' ? '+' : '-' }}฿{{ formatNumber(tx.amount) }}
                </td>
                <td style="text-align: center;" class="actions-col">
                  <div style="display: flex; gap: 8px; justify-content: center;">
                    <!-- Edit Icon Button -->
                    <button @click="openEditModal(tx)" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px;" title="แก้ไข">
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path>
                      </svg>
                    </button>
                    <!-- Delete Icon Button -->
                    <button @click="deleteTransaction(tx.id)" style="background: none; border: none; color: var(--color-danger); cursor: pointer; padding: 4px;" title="ลบ">
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-else style="text-align: center; color: var(--text-muted); padding: 5rem 0;">
          <span style="font-size: 3rem;">💸</span>
          <p style="margin-top: 15px;">ไม่พบรายการธุรกรรมที่ตรงกับเงื่อนไขในเดือนนี้</p>
        </div>
      </div>

      <!-- RIGHT Column: Summary metrics and Doughnut Chart -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;" class="summary-chart-sidebar">
        <!-- Card 1: Dynamic Metrics Summary -->
        <div class="glass-card" style="padding: 1.5rem; border-radius: 20px;">
          <h4 style="font-family: var(--font-display); font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 6px;">
            <span>📊</span> สรุปเมทริกซ์การเงิน
          </h4>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05);">
              <span style="color: var(--text-secondary); font-size: 0.85rem;">ยอดโอนเข้า (รายรับ):</span>
              <span style="font-weight: 700; color: var(--color-success);">+฿{{ formatNumber(summaryStats.totalIncome) }}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05);">
              <span style="color: var(--text-secondary); font-size: 0.85rem;">ยอดจ่ายออก (รายจ่าย):</span>
              <span style="font-weight: 700; color: var(--color-danger);">-฿{{ formatNumber(summaryStats.totalExpense) }}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 700; font-size: 0.9rem;">ยอดคงเหลือสุทธิ:</span>
              <span style="font-weight: 800; font-size: 1.1rem;" :style="{ color: summaryStats.balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }">
                ฿{{ formatNumber(summaryStats.balance) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Card 2: Chart Breakdown -->
        <div class="glass-card" style="padding: 1.5rem; border-radius: 20px;">
          <h4 style="font-family: var(--font-display); font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 6px;">
            <span>🍩</span> สัดส่วนค่าใช้จ่าย (ตาม Pockets)
          </h4>
          <div style="height: 250px; position: relative;">
            <canvas ref="chartRef"></canvas>
            <div v-if="filteredTransactions.filter(t => t.type === 'expense').length === 0" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--text-muted); font-size: 0.85rem;">
              ไม่มีข้อมูลรายจ่ายเพื่อวาดกราฟ
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Transaction Modal Form -->
    <div class="modal-overlay" :class="{ active: isModalOpen }" @click.self="closeModal">
      <div class="modal-content" style="border-radius: 24px;">
        <div class="modal-header">
          <h3>{{ isEditing ? 'แก้ไขรายการธุรกรรม' : 'เพิ่มรายการธุรกรรมใหม่' }}</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        
        <form @submit.prevent="saveTransaction">
          <!-- Type selector (Tabs) -->
          <div style="display: flex; gap: 10px; margin-bottom: 1.25rem;">
            <button 
              type="button" 
              class="btn" 
              :class="form.type === 'income' ? 'btn-success' : 'btn-secondary'"
              style="flex: 1; border-radius: 12px; font-weight: 700;"
              @click="form.type = 'income'"
            >
              รายรับ
            </button>
            <button 
              type="button" 
              class="btn" 
              :class="form.type === 'expense' ? 'btn-danger' : 'btn-secondary'"
              style="flex: 1; border-radius: 12px; font-weight: 700;"
              @click="form.type = 'expense'"
            >
              รายจ่าย
            </button>
          </div>

          <!-- Date field -->
          <div class="form-group">
            <label>วันที่ (วัน/เดือน/ปี เช่น 29/07/69)</label>
            <div style="position: relative; display: flex; align-items: center;">
              <input v-model="form.dateText" type="text" class="form-control" placeholder="วว/ดด/ปป" style="pointer-events: none;" required />
              <span style="position: absolute; right: 12px; color: var(--text-muted); pointer-events: none;">📅</span>
              <input 
                type="date" 
                @change="e => { 
                  if (e.target.value) { 
                    const d = new Date(e.target.value); 
                    form.dateText = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear() + 543).slice(-2)}`; 
                  } 
                }" 
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;" 
              />
            </div>
          </div>

          <!-- Category Field -->
          <div class="form-group">
            <label>กระเป๋า (Pocket)</label>
            <select v-model="form.category" required>
              <option value="" disabled>เลือกกระเป๋า Pocket</option>
              <option v-for="cat in filteredCategories" :key="cat.id" :value="cat.name">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Amount Field -->
          <div class="form-group">
            <label>จำนวนเงิน (บาท)</label>
            <input 
              v-model.number="form.amount" 
              type="number" 
              step="0.01" 
              class="form-control" 
              placeholder="0.00" 
              min="0.01" 
              required 
            />
          </div>

          <!-- Description Field -->
          <div class="form-group">
            <label>รายละเอียด / บันทึกเพิ่มเติม</label>
            <textarea v-model="form.description" class="form-control" rows="2" placeholder="เช่น ค่าอาหารกลางวัน, โอนเติมเงินเข้าซอง" style="border-radius: 12px;"></textarea>
          </div>

          <!-- Action buttons -->
          <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 1.5rem;">
            <button type="button" @click="closeModal" class="btn btn-secondary" style="border-radius: 12px;">ยกเลิก</button>
            <button type="submit" class="btn btn-primary" style="border-radius: 12px;">บันทึกรายการ</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed, onMounted, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default {
  name: 'Transactions',
  props: {
    month: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const getUserId = () => {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored).id : 1;
    };

    const transactions = ref([]);
    const filteredTransactions = ref([]);
    const categories = ref([]);

    // Filter values
    const searchQuery = ref('');
    const filterType = ref('');
    const filterCategory = ref('');

    // Modal state
    const isModalOpen = ref(false);
    const isEditing = ref(false);
    const editId = ref(null);
    
    const form = ref({
      dateText: '',
      type: 'expense',
      category: '',
      amount: '',
      description: ''
    });

    // Chart properties
    const chartRef = ref(null);
    let chartInstance = null;

    // Formatting helpers
    const formatNumber = (num) => {
      if (num === undefined || num === null) return '0.00';
      return parseFloat(num).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear() + 543).slice(-2);
      return `${day}/${month}/${year}`;
    };

    // Helper to get formatted date string for inputs (e.g. 29/07/69)
    const getFormattedDateText = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear() + 543).slice(-2);
      return `${day}/${month}/${year}`;
    };

    // Get standard YYYY-MM-DD format for MySQL from input date text
    const parseDateText = (text) => {
      if (!text) return '';
      const parts = text.split('/');
      if (parts.length !== 3) return '';
      const day = parts[0].trim().padStart(2, '0');
      const month = parts[1].trim().padStart(2, '0');
      let yearBE = parseInt(parts[2].trim());
      if (isNaN(yearBE)) return '';
      if (yearBE < 100) {
        yearBE += 2500;
      }
      const yearCE = yearBE - 543;
      return `${yearCE}-${month}-${day}`;
    };

    // Computed categories based on type inside form modal
    const filteredCategories = computed(() => {
      return categories.value.filter(c => c.type === form.value.type);
    });

    // Compute dynamic stats based on filtered transactions
    const summaryStats = computed(() => {
      let totalIncome = 0;
      let totalExpense = 0;
      filteredTransactions.value.forEach(tx => {
        if (tx.type === 'income') {
          totalIncome += parseFloat(tx.amount);
        } else {
          totalExpense += parseFloat(tx.amount);
        }
      });
      return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense
      };
    });

    // Fetch master list of categories
    const fetchCategories = async () => {
      try {
        const res = await fetch(`/api/categories?t=${Date.now()}`, {
          headers: { 'x-user-id': String(getUserId()) }
        });
        if (res.ok) {
          categories.value = await res.json();
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    // Fetch transactions based on month
    const fetchTransactions = async () => {
      try {
        const res = await fetch(`/api/transactions?startDate=${props.month}-01&endDate=${props.month}-31&t=${Date.now()}`, {
          headers: { 'x-user-id': String(getUserId()) }
        });
        if (res.ok) {
          transactions.value = await res.json();
          filterTransactions();
          nextTick(updateChart);
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
      }
    };

    // Client-side search and filtering logic
    const filterTransactions = () => {
      filteredTransactions.value = transactions.value.filter(tx => {
        const matchesSearch = !searchQuery.value || 
          (tx.description && tx.description.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
          tx.category.toLowerCase().includes(searchQuery.value.toLowerCase());
        
        const matchesType = !filterType.value || tx.type === filterType.value;
        const matchesCategory = !filterCategory.value || tx.category === filterCategory.value;

        return matchesSearch && matchesType && matchesCategory;
      });
    };

    // Update Doughnut Chart based on filtered transactions
    const updateChart = () => {
      if (!chartRef.value) return;

      const expenses = filteredTransactions.value.filter(tx => tx.type === 'expense');
      const categoryTotals = {};
      expenses.forEach(tx => {
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + parseFloat(tx.amount);
      });

      const labels = Object.keys(categoryTotals);
      const data = Object.values(categoryTotals);

      // Pocket colors Mapping
      const colorMap = {};
      categories.value.forEach(c => {
        colorMap[c.name] = c.color;
      });
      const backgroundColors = labels.map(label => colorMap[label] || '#3b82f6');

      if (chartInstance) {
        chartInstance.destroy();
      }

      if (labels.length === 0) {
        return;
      }

      chartInstance = new Chart(chartRef.value, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: backgroundColors,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: 'rgba(255,255,255,0.7)',
                font: {
                  family: 'Sarabun, sans-serif',
                  size: 11
                }
              }
            }
          }
        }
      });
    };

    // Print/Save as PDF Trigger
    const printPage = () => {
      window.print();
    };

    // Modal Control
    const openAddModal = () => {
      const today = new Date();
      const localTodayStr = today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
        String(today.getDate()).padStart(2, '0');

      isEditing.value = false;
      editId.value = null;
      form.value = {
        dateText: getFormattedDateText(localTodayStr.startsWith(props.month) ? localTodayStr : `${props.month}-01`),
        type: 'expense',
        category: '',
        amount: '',
        description: ''
      };
      isModalOpen.value = true;
    };

    const openEditModal = (tx) => {
      isEditing.value = true;
      editId.value = tx.id;
      const formattedDate = tx.date.split('T')[0];
      form.value = {
        dateText: getFormattedDateText(formattedDate),
        type: tx.type,
        category: tx.category,
        amount: parseFloat(tx.amount),
        description: tx.description
      };
      isModalOpen.value = true;
    };

    const closeModal = () => {
      isModalOpen.value = false;
    };

    // Save transaction handler
    const saveTransaction = async () => {
      try {
        const url = isEditing.value ? `/api/transactions/${editId.value}` : '/api/transactions';
        const method = isEditing.value ? 'PUT' : 'POST';

        const payload = {
          ...form.value,
          date: parseDateText(form.value.dateText)
        };

        const res = await fetch(url, {
          method,
          headers: { 
            'Content-Type': 'application/json',
            'x-user-id': String(getUserId())
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          isModalOpen.value = false;
          fetchTransactions();
          emit('update-data');
        }
      } catch (err) {
        console.error('Error saving transaction:', err);
      }
    };

    // Delete transaction handler
    const deleteTransaction = async (id) => {
      if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) return;
      try {
        const res = await fetch(`/api/transactions/${id}`, {
          method: 'DELETE',
          headers: { 'x-user-id': String(getUserId()) }
        });
        if (res.ok) {
          fetchTransactions();
          emit('update-data');
        }
      } catch (err) {
        console.error('Error deleting transaction:', err);
      }
    };

    // Watchers
    watch(() => props.month, () => {
      fetchTransactions();
    });

    watch(filteredTransactions, () => {
      nextTick(updateChart);
    }, { deep: true });

    watch(categories, () => {
      nextTick(updateChart);
    }, { deep: true });

    // Handle resetting category when form type changes
    watch(() => form.value.type, () => {
      form.value.category = '';
    });

    onMounted(async () => {
      try {
        await Promise.all([fetchCategories(), fetchTransactions()]);
      } catch (err) {
        console.error('Error on mounted loading:', err);
      }
    });

    return {
      transactions,
      filteredTransactions,
      categories,
      searchQuery,
      filterType,
      filterCategory,
      isModalOpen,
      isEditing,
      form,
      filteredCategories,
      summaryStats,
      chartRef,
      openAddModal,
      openEditModal,
      closeModal,
      saveTransaction,
      deleteTransaction,
      filterTransactions,
      formatNumber,
      formatDate,
      printPage
    };
  }
};
</script>

<style>
@media print {
  /* Hide sidebars, month picker, buttons, and filters during print */
  aside.sidebar,
  .month-picker,
  header,
  .btn,
  .filter-card,
  .summary-chart-sidebar,
  .actions-col,
  td.actions-col,
  th.actions-col {
    display: none !important;
  }

  body, html {
    background: #fff !important;
    color: #000 !important;
    font-size: 11pt !important;
  }

  .main-content {
    margin-left: 0 !important;
    padding: 0 !important;
    width: 100% !important;
  }

  .print-layout-grid {
    display: block !important;
    width: 100% !important;
  }

  .transactions-table-card {
    background: none !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
  }

  table {
    border-collapse: collapse !important;
    width: 100% !important;
  }
  
  th, td {
    border: 1px solid #777 !important;
    color: #000 !important;
    padding: 8px !important;
    font-size: 10pt !important;
  }

  /* Force background colors on print */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>
