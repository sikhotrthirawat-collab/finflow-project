<template>
  <div>
    <!-- Main Wallet Card (Make by KBank Style) -->
    <div class="glass-card main-wallet-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 24px; padding: 2rem; margin-bottom: 2rem; box-shadow: var(--shadow-md); position: relative; overflow: hidden;">
      <!-- Subtle decorative glowing circles -->
      <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; border-radius: 50%; background: rgba(59, 130, 246, 0.15); filter: blur(40px);"></div>
      <div style="position: absolute; bottom: -30px; left: 10%; width: 120px; height: 120px; border-radius: 50%; background: rgba(16, 185, 129, 0.12); filter: blur(35px);"></div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.5rem;">💳</span>
          <span style="font-family: var(--font-display); font-weight: 700; color: var(--text-secondary); letter-spacing: 0.5px;">บัญชีเงินก้อนหลัก (Main Wallet)</span>
        </div>
        <button @click="openQuickIncomeModal" class="btn btn-success" style="padding: 6px 14px; font-size: 0.8rem; font-weight: 700; border-radius: 20px; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);">
          ➕ เติมเงินก้อนรายรับ
        </button>
      </div>

      <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 20px;">
        <div>
          <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">ยอดเงินคงเหลือจริงในบัญชี</div>
          <div style="font-family: var(--font-display); font-size: 2.8rem; font-weight: 800; color: var(--text-primary); line-height: 1; letter-spacing: -1px;">
            ฿{{ formatNumber(summary.balance) }}
          </div>
        </div>

        <div style="display: flex; gap: 20px; background: rgba(0,0,0,0.03); padding: 12px 20px; border-radius: 16px; border: 1px solid var(--border-color);">
          <div style="border-right: 1px solid var(--border-color); padding-right: 20px;">
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">รวมเงินใน Pockets</div>
            <div style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: var(--color-primary);">
              ฿{{ formatNumber(totalAllocatedBudget - summary.totalExpense) }}
            </div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">เงินออมนอก Pocket</div>
            <div style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: var(--color-success);">
              ฿{{ formatNumber(unallocatedBudget) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Workspace Layout Grid: Left (Pockets) & Right (Daily Logger & Smart AI) -->
    <div class="responsive-split-grid">
      
      <!-- LEFT SECTION: Cloud Pockets Grid -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <h3 style="font-family: var(--font-display); font-weight: 700; display: flex; align-items: center; gap: 8px; margin: 0;">
            <span>📂</span> Cloud Pockets (กระเป๋าย่อย)
          </h3>
          <span style="font-size: 0.825rem; color: var(--text-secondary); background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 20px;">
            มีทั้งหมด {{ budgetProgressList.length }} Pockets
          </span>
        </div>

        <div v-if="budgetProgressList.length > 0" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.25rem;">
          <div v-for="item in budgetProgressList" :key="item.category" class="glass-card pocket-card" :style="getPocketCardStyle(item)">
            <div :style="{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', backgroundColor: item.color }"></div>

            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; margin-top: 4px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="font-size: 1.5rem; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: rgba(255,255,255,0.04);">
                  {{ getPocketEmoji(item.category) }}
                </div>
                <div>
                  <div style="font-weight: 700; font-size: 0.95rem;">{{ item.category }}</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px;">
                    {{ getPocketDescription(item.category) }}
                  </div>
                </div>
              </div>

              <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary);">
                เป้า: ฿{{ formatNumber(item.budget) }}
              </span>
            </div>

            <!-- Pocket Status Info -->
            <div style="background: rgba(0,0,0,0.12); padding: 10px; border-radius: 10px; margin-bottom: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 0.75rem; color: var(--text-secondary);">คงเหลือใน Pocket:</span>
                <span style="font-family: var(--font-display); font-weight: 800; font-size: 1.05rem; color: var(--text-primary);">
                  ฿{{ formatNumber(item.remaining) }}
                </span>
              </div>
              <div class="progress-container" style="height: 4px; margin-top: 6px; background: rgba(255,255,255,0.05);">
                <div 
                  class="progress-bar" 
                  :class="getProgressColorClass(item.percent)"
                  :style="{ width: Math.min(item.percent, 100) + '%' }"
                ></div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: var(--text-muted); margin-top: 4px;">
                <span>เหลือ {{ item.percent }}%</span>
                <span>จ่ายแล้ว: ฿{{ formatNumber(item.spent) }}</span>
              </div>
            </div>

            <!-- Pocket Actions -->
            <div style="display: flex; gap: 6px;">
              <button @click="openQuickDeductModal(item)" class="btn btn-sm btn-danger" style="flex: 1.1; padding: 6px; font-size: 0.75rem; font-weight: 700; border-radius: 10px; display: inline-flex; justify-content: center; align-items: center; gap: 2px;" :disabled="item.remaining <= 0">
                💸 จ่ายออก
              </button>
              <button @click="openAdjustBudgetModal(item)" class="btn btn-sm btn-secondary" style="flex: 0.9; padding: 6px; font-size: 0.75rem; font-weight: 700; border-radius: 10px; display: inline-flex; justify-content: center; align-items: center; gap: 2px;">
                📥 โอนเข้า
              </button>
              <button @click="openPocketHistoryModal(item)" class="btn btn-sm btn-info" style="flex: 1; padding: 6px; font-size: 0.75rem; font-weight: 700; border-radius: 10px; display: inline-flex; justify-content: center; align-items: center; gap: 2px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); color: var(--color-primary);">
                📜 ประวัติ
              </button>
            </div>
          </div>
        </div>

        <div v-else class="glass-card" style="text-align: center; color: var(--text-muted); padding: 4rem 2rem; border-radius: 20px;">
          <span style="font-size: 3rem;">🎯</span>
          <p style="margin-top: 10px;">ยังไม่มีกระเป๋าย่อย (Pocket) ถูกสร้างไว้</p>
          <button @click="currentTabRedirect" class="btn btn-primary" style="margin-top: 10px;">ไปสร้าง Cloud Pockets</button>
        </div>
      </div>

      <!-- RIGHT SECTION: Daily Spending Logger & Smart AI Insights -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        
        <!-- 1. Daily Allowance Spending Logger (ซองเหลือใช้รายวัน) -->
        <div class="glass-card" style="border-radius: 24px; padding: 1.5rem; border: 1px solid var(--border-color); background: var(--bg-card); box-shadow: var(--shadow-md);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h4 style="font-family: var(--font-display); font-weight: 700; margin: 0; display: flex; align-items: center; gap: 6px;">
              <span>🍽️</span> เงินกินใช้รายวัน ( allowance )
            </h4>
            <span style="font-size: 0.725rem; color: var(--color-success); font-weight: 700; background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 10px;">
              เหลืออีก {{ daysRemainingInfo.remainingDays }} วัน
            </span>
          </div>

          <!-- Daily Recommended Stats -->
          <div style="background: rgba(0,0,0,0.03); padding: 15px; border-radius: 16px; margin-bottom: 15px; border: 1px solid var(--border-color);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.8rem; color: var(--text-secondary);">งบกินใช้วันนี้แนะนำ:</span>
              <span style="font-family: var(--font-display); font-weight: 800; font-size: 1.25rem; color: var(--color-success);">
                ฿{{ formatNumber(dailyAllowanceTarget) }}
              </span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.8rem; color: var(--text-secondary);">วันนี้กินใช้ไปแล้ว:</span>
              <span style="font-family: var(--font-display); font-weight: 700; font-size: 1.05rem; color: var(--color-danger);">
                -฿{{ formatNumber(spentToday) }}
              </span>
            </div>
            <div style="border-top: 1px dashed var(--border-color); margin-top: 8px; padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">วันนี้เหลือโควตาช็อปอีก:</span>
              <span style="font-family: var(--font-display); font-weight: 800; font-size: 1.25rem;" :style="{ color: remainingTodayAllowance >= 0 ? 'var(--color-primary)' : 'var(--color-danger)' }">
                ฿{{ formatNumber(remainingTodayAllowance) }}
              </span>
            </div>
          </div>

          <!-- Quick Daily Logger Form -->
          <form @submit.prevent="submitDailySpend">
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <!-- Date and Description Side-by-Side -->
              <div style="display: flex; gap: 8px;">
                <div style="position: relative; flex: 1.1; min-width: 0; display: flex; align-items: center;">
                  <input 
                    v-model="dailyForm.date" 
                    type="text" 
                    class="form-control" 
                    style="border-radius: 12px; font-size: 0.85rem; padding: 10px 12px; width: 100%; text-align: center; pointer-events: none;" 
                    placeholder="วว/ดด/ปป" 
                    required 
                  />
                  <span style="position: absolute; right: 8px; font-size: 0.8rem; color: var(--text-muted); pointer-events: none;">📅</span>
                  <input 
                    type="date" 
                    @change="e => { 
                      if (e.target.value) { 
                        const d = new Date(e.target.value); 
                        dailyForm.date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear() + 543).slice(-2)}`; 
                      } 
                    }" 
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;" 
                  />
                </div>
                <input 
                  v-model="dailyForm.description" 
                  type="text" 
                  class="form-control" 
                  placeholder="เช่น ข้าวแกงกลางวัน, กาแฟ" 
                  style="border-radius: 12px; font-size: 0.85rem; padding: 10px 12px; flex: 1.5; min-width: 0;" 
                  required 
                />
              </div>
              <div style="display: flex; gap: 8px;">
                <div style="position: relative; display: flex; align-items: center; flex: 1.2;">
                  <span style="position: absolute; left: 12px; color: var(--text-muted); font-size: 0.85rem;">฿</span>
                  <input 
                    v-model.number="dailyForm.amount" 
                    type="number" 
                    step="0.01" 
                    min="0.01" 
                    class="form-control" 
                    style="padding-left: 28px; border-radius: 12px; font-size: 0.85rem; padding-top: 10px; padding-bottom: 10px;" 
                    placeholder="0.00" 
                    required 
                  />
                </div>
                <button type="submit" class="btn btn-primary" style="flex: 0.8; border-radius: 12px; font-size: 0.85rem; font-weight: 700; background: linear-gradient(135deg, var(--color-primary) 0%, #2563eb 100%);">
                  ⚡ จ่ายด่วน
                </button>
              </div>
              <div style="font-size: 0.725rem; color: var(--text-muted); text-align: center; margin-top: 4px;">
                *หักจากซอง <b>"เหลือใช้"</b> อัตโนมัติ (คงเหลือสะสม ฿{{ formatNumber(freeSpendPocket?.remaining || 0) }})
              </div>
            </div>
          </form>
        </div>

        <!-- 2. FinAI Intelligent Insights (ระบบวิเคราะห์การเงินอัจฉริยะ) -->
        <div class="glass-card" style="border-radius: 24px; padding: 1.5rem; border: 1px solid var(--border-color); background: var(--bg-card); box-shadow: var(--shadow-md);">
          <h4 style="font-family: var(--font-display); font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 6px;">
            <span>🔮</span> FinAI Insights (วิเคราะห์และเตือน)
          </h4>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div v-for="(insight, idx) in smartInsights" :key="idx" 
                 style="display: flex; gap: 10px; align-items: flex-start; padding: 12px; border-radius: 12px; font-size: 0.8rem; line-height: 1.4; border: 1px solid var(--border-color);"
                 :style="{ 
                    backgroundColor: getInsightBgColor(insight.type), 
                    color: getInsightTextColor(insight.type)
                 }">
              <div style="font-size: 1.1rem; flex-shrink: 0; line-height: 1;">
                {{ getInsightIcon(insight.type) }}
              </div>
              <div style="font-weight: 500;">
                {{ insight.message }}
              </div>
            </div>

            <div v-if="smartInsights.length === 0" style="text-align: center; color: var(--text-muted); padding: 1.5rem 0; font-size: 0.8rem;">
              ไม่มีข้อมูลคำแนะนำในขณะนี้
            </div>
          </div>
        </div>

      </div>
    </div>



    <!-- Modal 1: Quick Income Modal -->
    <div class="modal-overlay" :class="{ active: isIncomeModalOpen }" @click.self="closeModals">
      <div class="modal-content" style="border-radius: 24px;">
        <div class="modal-header">
          <h3>💰 เติมเงินเข้าบัญชีก้อนหลัก</h3>
          <button @click="closeModals" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="submitQuickIncome">
          <div class="form-group">
            <label>วันที่โอนเข้า (วัน/เดือน/ปี เช่น 29/07/69)</label>
            <div style="position: relative; display: flex; align-items: center;">
              <input v-model="incomeForm.dateText" type="text" class="form-control" placeholder="วว/ดด/ปป" style="pointer-events: none;" required />
              <span style="position: absolute; right: 12px; color: var(--text-muted); pointer-events: none;">📅</span>
              <input 
                type="date" 
                @change="e => { 
                  if (e.target.value) { 
                    const d = new Date(e.target.value); 
                    incomeForm.dateText = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear() + 543).slice(-2)}`; 
                  } 
                }" 
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;" 
              />
            </div>
          </div>
          <div class="form-group">
            <label>แหล่งที่มาของเงิน</label>
            <select v-model="incomeForm.category" required>
              <option v-for="cat in incomeCategories" :key="cat.id" :value="cat.name">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>จำนวนเงินก้อน (บาท)</label>
            <input v-model.number="incomeForm.amount" type="number" step="0.01" min="0.01" class="form-control" placeholder="0.00" required />
          </div>
          <div class="form-group">
            <label>รายละเอียด/บันทึกช่วยจำ</label>
            <input v-model="incomeForm.description" type="text" class="form-control" placeholder="เช่น เงินเดือนออก, ได้เงินคืนจากพี่" />
          </div>
          <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 1.5rem;">
            <button type="button" @click="closeModals" class="btn btn-secondary" style="border-radius: 12px;">ยกเลิก</button>
            <button type="submit" class="btn btn-success" style="border-radius: 12px;">เติมเข้าบัญชีหลัก</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal 2: Quick Expense (Pay from Pocket) Modal -->
    <div class="modal-overlay" :class="{ active: isExpenseModalOpen }" @click.self="closeModals">
      <div class="modal-content" style="border-radius: 24px;" v-if="selectedEnvelope">
        <div class="modal-header">
          <h3>💸 จ่ายเงินออกจาก Pocket: {{ selectedEnvelope.category }}</h3>
          <button @click="closeModals" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="submitQuickExpense">
          <div class="form-group">
            <label>วันที่จ่าย (วัน/เดือน/ปี เช่น 29/07/69)</label>
            <div style="position: relative; display: flex; align-items: center;">
              <input v-model="expenseForm.dateText" type="text" class="form-control" placeholder="วว/ดด/ปป" style="pointer-events: none;" required />
              <span style="position: absolute; right: 12px; color: var(--text-muted); pointer-events: none;">📅</span>
              <input 
                type="date" 
                @change="e => { 
                  if (e.target.value) { 
                    const d = new Date(e.target.value); 
                    expenseForm.dateText = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear() + 543).slice(-2)}`; 
                  } 
                }" 
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;" 
              />
            </div>
          </div>
          <div class="form-group">
            <label>จำนวนเงินที่จ่าย (บาท)</label>
            <div style="position: relative; display: flex; align-items: center;">
              <span style="position: absolute; left: 12px; color: var(--text-muted); font-size: 0.9rem;">฿</span>
              <input v-model.number="expenseForm.amount" type="number" step="0.01" min="0.01" class="form-control" style="padding-left: 28px;" :max="selectedEnvelope.remaining" placeholder="0.00" required />
            </div>
            <span style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px; display: block;">
              (มีเงินคงเหลือใน Pocket นี้: ฿{{ formatNumber(selectedEnvelope.remaining) }})
            </span>
          </div>
          <div class="form-group">
            <label>รายการที่จ่าย / คำอธิบาย</label>
            <input v-model="expenseForm.description" type="text" class="form-control" placeholder="เช่น ซื้อยาแก้แพ้, จ่ายค่า Shopee บิลนี้" required />
          </div>
          <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 1.5rem;">
            <button type="button" @click="closeModals" class="btn btn-secondary" style="border-radius: 12px;">ยกเลิก</button>
            <button type="submit" class="btn btn-danger" style="border-radius: 12px;">จ่ายเงินออกจาก Pocket</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal 3: Adjust Budget (Transfer In/Set Pocket Goal) Modal -->
    <div class="modal-overlay" :class="{ active: isAdjustModalOpen }" @click.self="closeModals">
      <div class="modal-content" style="border-radius: 24px;" v-if="selectedEnvelope">
        <div class="modal-header">
          <h3>📥 โอนเงิน/จัดสรรงบเข้า Pocket: {{ selectedEnvelope.category }}</h3>
          <button @click="closeModals" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="submitAdjustBudget">
          <div class="form-group">
            <label>จำนวนเงินก้อนเป้าหมายของ Pocket นี้ (บาท)</label>
            <input v-model.number="adjustBudgetAmount" type="number" min="0" class="form-control" placeholder="0.00" required />
          </div>
        </form>
      </div>
    </div>

    <!-- Modal 4: Pocket Transaction History Modal -->
    <div class="modal-overlay" :class="{ active: isHistoryModalOpen }" @click.self="closeModals">
      <div class="modal-content" style="border-radius: 24px; max-width: 600px; width: 90%;">
        <div class="modal-header">
          <h3>📜 ประวัติใน Pocket: {{ selectedEnvelopeForHistory?.category }}</h3>
          <button @click="closeModals" class="close-btn">&times;</button>
        </div>
        
        <div style="margin-top: 1rem;">
          <div v-if="pocketHistoryList.length > 0" class="table-container" style="max-height: 350px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr>
                  <th style="text-align: left; padding: 10px;">วันที่</th>
                  <th style="text-align: left; padding: 10px;">ประเภท</th>
                  <th style="text-align: left; padding: 10px;">รายละเอียด</th>
                  <th style="text-align: right; padding: 10px;">จำนวนเงิน</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tx in pocketHistoryList" :key="tx.id" style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                  <td style="padding: 10px; font-size: 0.85rem;">{{ formatDate(tx.date) }}</td>
                  <td style="padding: 10px;">
                    <span class="badge" :class="tx.type === 'income' ? 'badge-income' : 'badge-expense'" style="font-size: 0.7rem;">
                      {{ tx.type === 'income' ? 'โอนเข้า' : 'จ่ายออก' }}
                    </span>
                  </td>
                  <td style="padding: 10px; color: var(--text-secondary); font-size: 0.85rem;">{{ tx.description || '-' }}</td>
                  <td style="padding: 10px; text-align: right; font-weight: 700;" :style="{ color: tx.type === 'income' ? 'var(--color-success)' : 'var(--color-danger)' }">
                    {{ tx.type === 'income' ? '+' : '-' }}฿{{ formatNumber(tx.amount) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div v-else style="text-align: center; color: var(--text-muted); padding: 3rem 0;">
            <span style="font-size: 2.5rem;">📄</span>
            <p style="margin-top: 10px; font-size: 0.85rem;">ยังไม่มีประวัติการโอนเงิน/ใช้จ่ายใน Pocket นี้</p>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 1rem;">
          <button @click="closeModals" class="btn btn-secondary" style="border-radius: 12px; padding: 8px 20px;">ปิด</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, computed } from 'vue';

export default {
  name: 'Dashboard',
  props: {
    month: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const summary = ref({
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      breakdown: [],
      budgets: []
    });

    const recentTransactions = ref([]);
    const allTransactions = ref([]); // Holds all transactions of the month
    const budgetProgressList = ref([]);
    const categories = ref([]);

    // Modal Controls
    const isIncomeModalOpen = ref(false);
    const isExpenseModalOpen = ref(false);
    const isAdjustModalOpen = ref(false);
    const isHistoryModalOpen = ref(false);
    const selectedEnvelope = ref(null);
    const selectedEnvelopeForHistory = ref(null);

    // Form inputs
    const incomeForm = ref({
      dateText: '',
      category: '',
      amount: '',
      description: ''
    });

    const expenseForm = ref({
      dateText: '',
      amount: '',
      description: ''
    });

    const adjustBudgetAmount = ref('');

    // Daily logger form input
    const dailyForm = ref({
      date: '',
      description: '',
      amount: ''
    });

    // Format helpers
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

    const getProgressColorClass = (remainingPercent) => {
      if (remainingPercent <= 20) return 'danger';
      if (remainingPercent <= 50) return 'warning';
      return 'success';
    };

    // Helper to assign icons to custom user pockets
    const getPocketEmoji = (category) => {
      const cat = category.toLowerCase();
      if (cat.includes('ยาง') || cat.includes('รถ')) return '🚗';
      if (cat.includes('shopee') || cat.includes('ช้อป')) return '🛍️';
      if (cat.includes('น้ำมัน') || cat.includes('รถ') || cat.includes('เดินทาง')) return '⛽';
      if (cat.includes('หุ้น') || cat.includes('ลงทุน')) return '📈';
      if (cat.includes('ครีม') || cat.includes('ผิว') || cat.includes('สุขภาพ')) return '🧴';
      if (cat.includes('ออม') || cat.includes('เก็บเงิน')) return '💰';
      if (cat.includes('เหลือใช้') || cat.includes('กิน') || cat.includes('อาหาร')) return '💸';
      return '📁';
    };

    // Helper to get pocket quick helper labels
    const getPocketDescription = (category) => {
      const cat = category.toLowerCase();
      if (cat.includes('ยาง')) return 'ผ่อนยางรถยนต์ 10 เดือน';
      if (cat.includes('shopee')) return 'ยอดซื้อ Shopee ค้างจ่าย';
      if (cat.includes('น้ำมัน')) return 'ค่าเติมน้ำมันรถส่วนตัว';
      if (cat.includes('หุ้น')) return 'พอร์ตออมหุ้นรายเดือน';
      if (cat.includes('ครีม')) return 'เงินสำรองซื้อครีมสกินแคร์';
      if (cat.includes('ออม')) return 'เงินสะสมสำรองฉุกเฉิน';
      if (cat.includes('เหลือใช้')) return 'เงินกินใช้จ่ายรายวัน';
      return 'จัดสรรค่าใช้จ่ายทั่วไป';
    };

    // Dynamic style based on remaining money percent (100% full vs 0% empty vs regular)
    const getPocketCardStyle = (item) => {
      const baseStyle = {
        borderRadius: '20px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative'
      };

      if (item.percent === 0) {
        // Empty/Spent: darker red outline tint, faded out
        return {
          ...baseStyle,
          background: 'var(--pocket-card-empty)',
          border: '1px solid var(--pocket-card-empty-border)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          opacity: '0.65'
        };
      } else if (item.percent === 100) {
        // Unused/Full: vibrant glow with green tint outline
        return {
          ...baseStyle,
          background: 'var(--pocket-card-full)',
          border: '1px solid var(--pocket-card-full-border)',
          boxShadow: '0 8px 30px var(--pocket-card-full-shadow)'
        };
      } else {
        // Standard in-progress state
        return {
          ...baseStyle,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)'
        };
      }
    };

    // Filter categories to get income categories
    const incomeCategories = computed(() => {
      return categories.value.filter(c => c.type === 'income');
    });

    // Sum of all envelope budgets
    const totalAllocatedBudget = computed(() => {
      return budgetProgressList.value.reduce((sum, item) => sum + item.budget, 0);
    });

    // Unallocated starting balance (Income - Total Budgets)
    const unallocatedBudget = computed(() => {
      return summary.value.totalIncome - totalAllocatedBudget.value;
    });

    // Filter transactions for the selected pocket history modal
    const pocketHistoryList = computed(() => {
      if (!selectedEnvelopeForHistory.value) return [];
      const catName = selectedEnvelopeForHistory.value.category;
      return allTransactions.value.filter(tx => tx.category === catName);
    });

    // Get today's local date string matching selected month
    const getTodayDateStr = () => {
      const today = new Date();
      const localTodayStr = today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
        String(today.getDate()).padStart(2, '0');
      return localTodayStr.startsWith(props.month) ? localTodayStr : `${props.month}-01`;
    };

    // Get today's local date in dd/mm/yy (BE) format
    const getTodayDateText = () => {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = String(today.getFullYear() + 543).slice(-2);
      return `${day}/${month}/${year}`;
    };

    // Parse dd/mm/yy (BE) text into YYYY-MM-DD (CE) for MySQL
    const parseDateText = (text) => {
      if (!text) return getTodayDateStr();
      const parts = text.split('/');
      if (parts.length !== 3) return getTodayDateStr();
      const day = parts[0].trim().padStart(2, '0');
      const month = parts[1].trim().padStart(2, '0');
      let yearBE = parseInt(parts[2].trim());
      if (isNaN(yearBE)) return getTodayDateStr();
      if (yearBE < 100) {
        yearBE += 2500; // 69 -> 2569
      }
      const yearCE = yearBE - 543;
      return `${yearCE}-${month}-${day}`;
    };

    // Days remaining calculations (Until the end of the next month, as requested by the user!)
    const daysRemainingInfo = computed(() => {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const currentMonthStr = `${year}-${String(month).padStart(2, '0')}`;

      if (props.month !== currentMonthStr) {
        const parts = props.month.split('-');
        const totalDaysInSelected = new Date(parts[0], parts[1], 0).getDate();
        return {
          totalDays: totalDaysInSelected,
          remainingDays: totalDaysInSelected,
          isCurrentMonth: false
        };
      }

      // Calculate days from today to the end of next month
      const currentMonthIndex = today.getMonth(); // 0-indexed (e.g. July is 6)
      const endOfNextMonth = new Date(year, currentMonthIndex + 2, 0); // Last day of next month (e.g. August 31)
      const oneDayMs = 24 * 60 * 60 * 1000;
      const todayMidnight = new Date(year, today.getMonth(), today.getDate());
      const diffMs = endOfNextMonth.getTime() - todayMidnight.getTime();
      const remainingDays = Math.round(diffMs / oneDayMs) + 1;

      return {
        totalDays: new Date(year, month, 0).getDate(),
        remainingDays: remainingDays, // July 28 to Aug 31 = 35 days
        isCurrentMonth: true
      };
    });

    // Find the 'เหลือใช้' (Free Spending) pocket
    const freeSpendPocket = computed(() => {
      return budgetProgressList.value.find(p => p.category === 'เหลือใช้') || null;
    });

    // Calculate how much has been spent today under the 'เหลือใช้' category
    const spentToday = computed(() => {
      const today = new Date();
      const todayStr = today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
        String(today.getDate()).padStart(2, '0');

      return allTransactions.value
        .filter(tx => tx.type === 'expense' && tx.category === 'เหลือใช้' && tx.date.startsWith(todayStr))
        .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    });

    // Daily Recommended Target: remaining balance before today's spend / remaining days
    const dailyAllowanceTarget = computed(() => {
      if (!freeSpendPocket.value) return 0;
      const totalPoolForRemainingDays = freeSpendPocket.value.remaining + spentToday.value;
      const allowance = totalPoolForRemainingDays / daysRemainingInfo.value.remainingDays;
      return allowance > 0 ? allowance : 0;
    });

    // Remaining allowance for today specifically
    const remainingTodayAllowance = computed(() => {
      const remaining = dailyAllowanceTarget.value - spentToday.value;
      return remaining > 0 ? remaining : 0;
    });

    // Main fetch functions
    const fetchData = async () => {
      try {
        // 1. Fetch categories
        const resCat = await fetch(`/api/categories?t=${Date.now()}`);
        if (resCat.ok) {
          categories.value = await resCat.json();
        }

        // 2. Fetch monthly summary stats
        const resSummary = await fetch(`/api/summary?month=${props.month}&t=${Date.now()}`);
        if (resSummary.ok) {
          summary.value = await resSummary.json();
          calculateBudgetProgress();
        }

        // 3. Fetch all monthly transactions to compute daily spend
        const resTx = await fetch(`/api/transactions?startDate=${props.month}-01&endDate=${props.month}-31&t=${Date.now()}`);
        if (resTx.ok) {
          allTransactions.value = await resTx.json();
          recentTransactions.value = allTransactions.value.slice(0, 5); // display only top 5 recent
        }
        // Set default date if empty
        if (!dailyForm.value.date) {
          dailyForm.value.date = getTodayDateText();
        }
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
      }
    };

    // Calculate budget progress comparison (Envelopes)
    const calculateBudgetProgress = () => {
      if (!summary.value.budgets) {
        budgetProgressList.value = [];
        return;
      }

      const list = [];
      const breakdownMap = {};
      summary.value.breakdown.forEach(item => {
        breakdownMap[item.category] = parseFloat(item.amount);
      });

      const expenseCats = categories.value.filter(c => c.type === 'expense');
      const budgetMap = {};
      summary.value.budgets.forEach(b => {
        budgetMap[b.category] = parseFloat(b.amount);
      });

      expenseCats.forEach(c => {
        const spent = breakdownMap[c.name] || 0;
        const budgetVal = budgetMap[c.name] || 0;
        
        if (budgetVal > 0 || spent > 0) {
          const remainingPercent = budgetVal > 0 ? Math.max(0, Math.round(((budgetVal - spent) / budgetVal) * 100)) : 0;
          list.push({
            id: c.id,
            category: c.name,
            color: c.color,
            budget: budgetVal,
            spent: spent,
            percent: remainingPercent,
            remaining: budgetVal - spent
          });
        }
      });

      // Sort by spent descending
      budgetProgressList.value = list.sort((a, b) => b.spent - a.spent);
    };

    // Modals Control Handlers
    const openQuickIncomeModal = () => {
      incomeForm.value = {
        dateText: getTodayDateText(),
        category: incomeCategories.value[0]?.name || 'เงินก้อนหลัก',
        amount: '',
        description: ''
      };
      isIncomeModalOpen.value = true;
    };

    const openQuickDeductModal = (envelope) => {
      selectedEnvelope.value = envelope;
      expenseForm.value = {
        dateText: getTodayDateText(),
        amount: '',
        description: ''
      };
      isExpenseModalOpen.value = true;
    };

    const openAdjustBudgetModal = (envelope) => {
      selectedEnvelope.value = envelope;
      adjustBudgetAmount.value = envelope.budget;
      isAdjustModalOpen.value = true;
    };

    const openPocketHistoryModal = (envelope) => {
      selectedEnvelopeForHistory.value = envelope;
      isHistoryModalOpen.value = true;
    };

    const closeModals = () => {
      isIncomeModalOpen.value = false;
      isExpenseModalOpen.value = false;
      isAdjustModalOpen.value = false;
      isHistoryModalOpen.value = false;
      selectedEnvelope.value = null;
      selectedEnvelopeForHistory.value = null;
    };

    // Form Submissions API Integrations
    const submitQuickIncome = async () => {
      try {
        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...incomeForm.value,
            date: parseDateText(incomeForm.value.dateText),
            type: 'income'
          })
        });

        if (res.ok) {
          closeModals();
          fetchData();
          emit('update-data');
        }
      } catch (err) {
        console.error(err);
      }
    };

    const submitQuickExpense = async () => {
      try {
        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...expenseForm.value,
            date: parseDateText(expenseForm.value.dateText),
            category: selectedEnvelope.value.category,
            type: 'expense'
          })
        });

        if (res.ok) {
          closeModals();
          fetchData();
          emit('update-data');
        }
      } catch (err) {
        console.error(err);
      }
    };

    const submitAdjustBudget = async () => {
      try {
        const res = await fetch('/api/budgets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: selectedEnvelope.value.category,
            amount: adjustBudgetAmount.value || 0,
            month: props.month
          })
        });

        if (res.ok) {
          closeModals();
          fetchData();
          emit('update-data');
        }
      } catch (err) {
        console.error(err);
      }
    };

    // Submit Daily Expense (Deducts from "เหลือใช้")
    const submitDailySpend = async () => {
      if (!dailyForm.value.description || !dailyForm.value.amount || !dailyForm.value.date) return;
      try {
        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: parseDateText(dailyForm.value.date),
            type: 'expense',
            category: 'เหลือใช้',
            amount: dailyForm.value.amount,
            description: `กินใช้รายวัน: ${dailyForm.value.description}`
          })
        });

        if (res.ok) {
          dailyForm.value = { 
            date: getTodayDateText(), 
            description: '', 
            amount: '' 
          };
          fetchData();
          emit('update-data');
        }
      } catch (err) {
        console.error(err);
      }
    };

    // Intelligent Smart Insights Calculations
    const smartInsights = computed(() => {
      const insights = [];

      // 1. Target End date info (until end of next month)
      const today = new Date();
      const currentMonthIndex = today.getMonth();
      const endOfNextMonth = new Date(today.getFullYear(), currentMonthIndex + 2, 0);
      const endOfNextMonthStr = endOfNextMonth.toISOString().split('T')[0];

      insights.push({
        type: 'info',
        message: `📅 เหลือเวลาใช้เงินอีก ${daysRemainingInfo.value.remainingDays} วัน (เฉลี่ยถึงสิ้นเดือนหน้า วันที่ ${formatDate(endOfNextMonthStr)})`
      });

      // 2. Savings percentage
      const savingsPocket = budgetProgressList.value.find(p => p.category === 'เงินออม');
      const savingsAmt = savingsPocket ? savingsPocket.budget : 0;
      if (summary.value.totalIncome > 0 && savingsAmt > 0) {
        const ratio = (savingsAmt / summary.value.totalIncome) * 100;
        insights.push({
          type: 'success',
          message: `🎯 ดัชนีการออม: คุณโอนเก็บออมแล้ว ${ratio.toFixed(2)}% ของรายรับทั้งหมด (ซองเงินออม ฿${formatNumber(savingsAmt)})`
        });
      }

      // 3. Envelope alerts (Spent >= 80%, meaning remaining <= 20%)
      budgetProgressList.value.forEach(item => {
        if (item.percent === 0 && item.category !== 'หุ้น' && item.category !== 'เงินออม' && item.category !== 'ยางรถยนต์') {
          insights.push({
            type: 'danger',
            message: `🚨 Pocket [${item.category}] ถูกใช้งานเต็มวงเงินแล้ว (ยอดจ่าย ฿${formatNumber(item.spent)} / ฿${formatNumber(item.budget)})`
          });
        } else if (item.percent <= 20 && item.category !== 'หุ้น' && item.category !== 'เงินออม' && item.category !== 'ยางรถยนต์') {
          insights.push({
            type: 'warning',
            message: `⚠️ Pocket [${item.category}] ใกล้หมดแล้ว! คงเหลือเงินในซองเพียง ${item.percent}% (คงเหลือ ฿${formatNumber(item.remaining)})`
          });
        }
      });

      // 4. Positive Discipline (Untouched pockets)
      const untouched = [];
      budgetProgressList.value.forEach(item => {
        if (item.spent === 0 && item.budget > 0 && ['ยางรถยนต์', 'ค่าครีม', 'เงินออม', 'ค่า Shopee'].includes(item.category)) {
          untouched.push(item.category);
        }
      });
      if (untouched.length > 0) {
        insights.push({
          type: 'success',
          message: `💡 ยินดีด้วย! เดือนนี้คุณยังมีวินัยที่ดีเยี่ยม ยังไม่ได้ถอนเงินออกจาก Pocket [${untouched.join(', ')}] เลย`
        });
      }

      // 5. Zero-based check
      if (summary.value.totalIncome > 0 && unallocatedBudget.value === 0) {
        insights.push({
          type: 'info',
          message: `💡 ยอดเงินนอกซองมีค่าเป็น 0.00 บาท แสดงถึงการทำ Zero-based budgeting ที่ดีเลิศ เงินก้อนรายรับทุกบาทมีซองเป้าหมายรองรับทั้งหมด!`
        });
      }

      return insights;
    });

    // Helper functions for styling insights
    const getInsightBgColor = (type) => {
      return `var(--insight-${type}-bg)`;
    };

    const getInsightTextColor = (type) => {
      return `var(--insight-${type}-text)`;
    };

    const getInsightIcon = (type) => {
      switch (type) {
        case 'success': return '✅';
        case 'warning': return '⚠️';
        case 'danger': return '🚨';
        default: return '💡';
      }
    };

    const currentTabRedirect = () => {
      // Direct redirect logic
    };

    // Watchers
    watch(() => props.month, () => {
      fetchData();
    });

    onMounted(() => {
      fetchData();
    });

    return {
      summary,
      recentTransactions,
      budgetProgressList,
      categories,
      totalAllocatedBudget,
      unallocatedBudget,
      isIncomeModalOpen,
      isExpenseModalOpen,
      isAdjustModalOpen,
      selectedEnvelope,
      incomeForm,
      expenseForm,
      adjustBudgetAmount,
      incomeCategories,
      dailyForm,
      daysRemainingInfo,
      freeSpendPocket,
      spentToday,
      dailyAllowanceTarget,
      remainingTodayAllowance,
      smartInsights,
      isHistoryModalOpen,
      selectedEnvelopeForHistory,
      pocketHistoryList,
      openQuickIncomeModal,
      openQuickDeductModal,
      openAdjustBudgetModal,
      openPocketHistoryModal,
      closeModals,
      submitQuickIncome,
      submitQuickExpense,
      submitAdjustBudget,
      submitDailySpend,
      currentTabRedirect,
      formatNumber,
      formatDate,
      getProgressColorClass,
      getPocketEmoji,
      getPocketDescription,
      getPocketCardStyle,
      getInsightBgColor,
      getInsightTextColor,
      getInsightIcon
    };
  }
};
</script>
