<template>
  <div>
    <div class="glass-card" style="margin-bottom: 1.5rem;">
      <h3 style="font-family: var(--font-display); font-weight: 700; margin-bottom: 0.5rem;">ตั้งค่าเป้าหมายวงเงินกระเป๋า (Cloud Pockets)</h3>
      <p style="color: var(--text-secondary); font-size: 0.9rem;">
        จัดสรรแบ่งสรรเงินก้อนจากบัญชีหลักลงสู่ Pockets ต่างๆ เพื่อการควบคุมรายจ่ายและหักยอดตามจริง
      </p>
    </div>

    <!-- Add new custom category form -->
    <div class="glass-card" style="margin-bottom: 1.5rem; padding: 1.5rem;">
      <h4 style="font-family: var(--font-display); font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
        <span>➕</span> สร้างกระเป๋าย่อย (Pocket) ใหม่
      </h4>
      <form @submit.prevent="createNewCategory" style="display: flex; gap: 15px; align-items: flex-end; flex-wrap: wrap;">
        <div style="flex: 2; min-width: 200px;">
          <label style="font-size: 0.8rem; color: var(--text-secondary); display: block; margin-bottom: 6px;">ชื่อ Pocket (กระเป๋าย่อย)</label>
          <input v-model="newCategoryName" type="text" class="form-control" placeholder="เช่น ท่องเที่ยว, ของหวาน, เลี้ยงสัตว์" required />
        </div>
        <div style="flex: 1; min-width: 150px;">
          <label style="font-size: 0.8rem; color: var(--text-secondary); display: block; margin-bottom: 6px;">รหัสสีประจำ Pocket</label>
          <div style="display: flex; gap: 10px; align-items: center;">
            <input v-model="newCategoryColor" type="color" class="form-control" style="padding: 2px; height: 42px; width: 60px; cursor: pointer; background: none; border: 1px solid var(--border-color);" />
            <span style="font-size: 0.85rem; font-family: monospace; color: var(--text-secondary);">{{ newCategoryColor }}</span>
          </div>
        </div>
        <div>
          <button type="submit" class="btn btn-primary" style="height: 42px;">
            สร้าง Pocket
          </button>
        </div>
      </form>
    </div>

    <!-- Budget Form list -->
    <div class="glass-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h4 style="font-family: var(--font-display); font-weight: 600;">รายชื่อกระเป๋าย่อยและวงเงินจัดสรร ({{ displayMonth }})</h4>
        <button @click="saveAllBudgets" class="btn btn-primary" :disabled="isSaving">
          {{ isSaving ? 'กำลังบันทึก...' : 'บันทึกการจัดสรร Pockets ทั้งหมด' }}
        </button>
      </div>

      <div v-if="budgetItems.length > 0" style="display: flex; flex-direction: column; gap: 20px;">
        <div v-for="item in budgetItems" :key="item.category" style="display: grid; grid-template-columns: 1.2fr 1fr 1fr 80px; gap: 15px; align-items: center; padding-bottom: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
          <!-- Category info and label -->
          <div style="display: flex; align-items: center; gap: 12px; width: 100%;">
            <!-- Inline Edit Mode -->
            <template v-if="item.isEditing">
              <input v-model="item.editColor" type="color" style="width: 28px; height: 28px; padding: 0; border: 1px solid var(--border-color); border-radius: 50%; cursor: pointer; background: none; flex-shrink: 0;" />
              <div style="flex: 1; min-width: 0;">
                <input v-model="item.editName" type="text" class="form-control" style="padding: 4px 8px; font-size: 0.9rem;" required />
              </div>
            </template>
            <!-- Normal Mode -->
            <template v-else>
              <div class="category-dot" :style="{ backgroundColor: item.color }"></div>
              <div>
                <div style="font-weight: 600; font-size: 0.95rem;">{{ item.category }}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">
                  ใช้จริงเดือนนี้: ฿{{ formatNumber(item.spent) }}
                </div>
              </div>
            </template>
          </div>

          <!-- Input field for budget -->
          <div>
            <div style="position: relative; display: flex; align-items: center;">
              <span style="position: absolute; left: 12px; color: var(--text-muted); font-size: 0.9rem;">฿</span>
              <input 
                v-model.number="item.amount" 
                type="number" 
                class="form-control" 
                style="padding-left: 28px;"
                placeholder="ไม่ได้กำหนด" 
                min="0"
              />
            </div>
          </div>

          <!-- Quick Actions / status description -->
          <div style="font-size: 0.85rem; color: var(--text-secondary); text-align: right;">
            <span v-if="item.amount > 0">
              <span v-if="item.spent > item.amount" style="color: var(--color-danger); font-weight: 600;">
                ใช้เกินไป ฿{{ formatNumber(item.spent - item.amount) }}
              </span>
              <span v-else style="color: var(--color-success); font-weight: 600;">
                เหลืองบ ฿{{ formatNumber(item.amount - item.spent) }}
              </span>
            </span>
            <span v-else style="color: var(--text-muted);">ไม่ได้กำหนดงบประมาณ</span>
          </div>

          <!-- Category Actions -->
          <div style="text-align: center;">
            <div style="display: flex; gap: 8px; justify-content: center;">
              <!-- Edit mode actions -->
              <template v-if="item.isEditing">
                <button @click="saveCategoryEdit(item)" style="background: none; border: none; color: var(--color-success); cursor: pointer; padding: 4px; display: inline-flex;" title="บันทึก">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </button>
                <button @click="item.isEditing = false" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; display: inline-flex;" title="ยกเลิก">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </template>
              <!-- Normal mode actions -->
              <template v-else>
                <button @click="startEditCategory(item)" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px; display: inline-flex;" title="แก้ไขหมวดหมู่">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path>
                  </svg>
                </button>
                <button @click="deleteCategory(item.id, item.category)" style="background: none; border: none; color: var(--color-danger); cursor: pointer; padding: 4px; display: inline-flex;" title="ลบหมวดหมู่">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div v-else style="text-align: center; color: var(--text-muted); padding: 4rem 0;">
        <span style="font-size: 3rem;">⚙️</span>
        <p style="margin-top: 15px;">กำลังโหลดหมวดหมู่รายจ่าย...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, computed } from 'vue';

export default {
  name: 'Budgets',
  props: {
    month: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const budgetItems = ref([]);
    const isSaving = ref(false);

    // New Category Form Variables
    const newCategoryName = ref('');
    const newCategoryColor = ref('#3b82f6');

    // Display formatted month Thai-style
    const displayMonth = computed(() => {
      const parts = props.month.split('-');
      if (parts.length !== 2) return props.month;
      const year = parseInt(parts[0]) + 543;
      const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
      const monthIdx = parseInt(parts[1]) - 1;
      return `${months[monthIdx]} ${year}`;
    });

    const formatNumber = (num) => {
      if (num === undefined || num === null) return '0.00';
      return parseFloat(num).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const fetchBudgetsAndExpenses = async () => {
      try {
        // 1. Fetch categories
        const resCat = await fetch('/api/categories');
        const categories = resCat.ok ? await resCat.json() : [];
        const expenseCategories = categories.filter(c => c.type === 'expense');

        // 2. Fetch budgets for the month
        const resBudgets = await fetch(`/api/budgets?month=${props.month}`);
        const budgets = resBudgets.ok ? await resBudgets.json() : [];
        const budgetMap = {};
        budgets.forEach(b => {
          budgetMap[b.category] = parseFloat(b.amount);
        });

        // 3. Fetch expenses summary breakdown
        const resSummary = await fetch(`/api/summary?month=${props.month}`);
        const summaryData = resSummary.ok ? await resSummary.json() : null;
        const spentMap = {};
        if (summaryData && summaryData.breakdown) {
          summaryData.breakdown.forEach(item => {
            spentMap[item.category] = parseFloat(item.amount);
          });
        }

        // Combine into unified budgetItems array
        budgetItems.value = expenseCategories.map(cat => ({
          id: cat.id,
          category: cat.name,
          color: cat.color,
          amount: budgetMap[cat.name] || 0,
          spent: spentMap[cat.name] || 0,
          // Inline edit state variables
          isEditing: false,
          editName: cat.name,
          editColor: cat.color
        }));

      } catch (err) {
        console.error('Error fetching budgets/expenses data:', err);
      }
    };

    // Save all budgets in sequential API requests
    const saveAllBudgets = async () => {
      isSaving.value = true;
      try {
        const promises = budgetItems.value.map(item => {
          // If the budget is empty or negative, skip or set to 0
          const amt = item.amount && item.amount > 0 ? item.amount : 0;
          return fetch('/api/budgets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              category: item.category,
              amount: amt,
              month: props.month
            })
          });
        });

        await Promise.all(promises);
        alert('บันทึกงบประมาณสำเร็จเรียบร้อยแล้ว!');
        fetchBudgetsAndExpenses();
        emit('update-data'); // Notify root app to update layout metrics
      } catch (err) {
        console.error('Error saving budgets:', err);
        alert('เกิดข้อผิดพลาดในการบันทึกงบประมาณ');
      } finally {
        isSaving.value = false;
      }
    };

    // Delete Category API Handler
    const deleteCategory = async (id, name) => {
      if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่ "${name}"?`)) return;
      try {
        const res = await fetch(`/api/categories/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          alert(`ลบหมวดหมู่ "${name}" เรียบร้อยแล้ว!`);
          fetchBudgetsAndExpenses();
          emit('update-data');
        } else {
          const errData = await res.json();
          alert('ไม่สามารถลบได้: ' + errData.error);
        }
      } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการติดต่อเซิร์ฟเวอร์');
      }
    };

    // Start Inline Editing for a Category
    const startEditCategory = (item) => {
      // Cancel edit for other items first
      budgetItems.value.forEach(x => {
        x.isEditing = false;
      });
      item.editName = item.category;
      item.editColor = item.color;
      item.isEditing = true;
    };

    // Save Category Name/Color Edit
    const saveCategoryEdit = async (item) => {
      if (!item.editName.trim()) return;
      try {
        const res = await fetch(`/api/categories/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: item.editName.trim(),
            color: item.editColor
          })
        });

        if (res.ok) {
          item.isEditing = false;
          alert('แก้ไขหมวดหมู่สำเร็จ!');
          fetchBudgetsAndExpenses();
          emit('update-data'); // Notify Dashboard to refresh colors/names
        } else {
          const errData = await res.json();
          alert('ไม่สามารถแก้ไขได้: ' + errData.error);
        }
      } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      }
    };

    // Create New Category API Handler
    const createNewCategory = async () => {
      if (!newCategoryName.value) return;
      try {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newCategoryName.value.trim(),
            type: 'expense',
            color: newCategoryColor.value
          })
        });
        if (res.ok) {
          const addedCat = await res.json();
          newCategoryName.value = '';
          newCategoryColor.value = '#3b82f6';
          alert(`สร้างหมวดหมู่ "${addedCat.name}" เรียบร้อยแล้ว!`);
          fetchBudgetsAndExpenses();
        } else {
          const errData = await res.json();
          alert('เกิดข้อผิดพลาด: ' + errData.error);
        }
      } catch (err) {
        console.error(err);
        alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
      }
    };

    watch(() => props.month, () => {
      fetchBudgetsAndExpenses();
    });

    onMounted(() => {
      fetchBudgetsAndExpenses();
    });

    return {
      budgetItems,
      isSaving,
      displayMonth,
      formatNumber,
      saveAllBudgets,
      newCategoryName,
      newCategoryColor,
      createNewCategory,
      deleteCategory,
      startEditCategory,
      saveCategoryEdit
    };
  }
};
</script>
