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
            <div style="display: flex; gap: 6px; align-items: center;">
              <button type="button" @click="openAllowanceAnalysisModal" class="btn btn-sm" style="padding: 2px 8px; font-size: 0.7rem; font-weight: 700; border-radius: 8px; background: rgba(59, 130, 246, 0.15); color: var(--color-primary); border: 1px solid rgba(59, 130, 246, 0.25); cursor: pointer; display: flex; align-items: center; gap: 3px; height: 22px;">
                📊 วิเคราะห์
              </button>
              <span style="font-size: 0.725rem; color: var(--color-success); font-weight: 700; background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 10px; height: 22px; display: inline-flex; align-items: center;">
                เหลืออีก {{ daysRemainingInfo.remainingDays }} วัน
              </span>
            </div>
          </div>

          <!-- Target End Date Setting -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding: 8px 12px; background: rgba(59, 130, 246, 0.04); border-radius: 12px; border: 1px solid var(--border-color); font-size: 0.75rem;">
            <span style="color: var(--text-secondary); font-weight: 600; display: flex; align-items: center; gap: 4px;">
              <span>📅</span> เฉลี่ยถึงวันที่:
            </span>
            <div style="position: relative; display: flex; align-items: center; gap: 4px; cursor: pointer;">
              <span style="color: var(--color-primary); font-weight: 700; text-decoration: underline;">
                {{ formatDate(daysRemainingInfo.targetDateStr) }}
              </span>
              <span style="font-size: 0.7rem; color: var(--text-muted);">✏️</span>
              <input 
                type="date" 
                v-model="allowanceTargetInputDate"
                @change="updateAllowanceTargetDate" 
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;" 
              />
            </div>
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

          <!-- Cash Pocket Integration Tip/Badge -->
          <div style="font-size: 0.7rem; display: flex; align-items: center; justify-content: center; gap: 4px; padding: 6px 12px; border-radius: 10px; margin-bottom: 12px; font-weight: 600;"
               :style="cashPocket ? { background: 'rgba(16, 185, 129, 0.08)', color: '#34c759', border: '1px solid rgba(16, 185, 129, 0.15)' } : { background: 'rgba(0, 122, 255, 0.05)', color: 'var(--color-primary)', border: '1px solid rgba(0, 122, 255, 0.12)' }">
            <template v-if="cashPocket">
              <span>🔋</span> รวมคำนวณร่วมกับ Pocket "เงินสด" อีก ฿{{ formatNumber(cashPocket.remaining) }} แล้ว
            </template>
            <template v-else>
              <span>💡</span> Tip: คุณสามารถสร้าง Pocket ชื่อ "เงินสด" เพื่อรวมคิดกับงบกินใช้นี้ได้
            </template>
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
                *หักจากซอง <b>"เหลือใช้"</b> อัตโนมัติ (คงเหลือสะสม ฿{{ formatNumber(freeSpendPocket?.remaining || 0) }}<span v-if="cashPocket"> + เงินสด ฿{{ formatNumber(cashPocket.remaining) }}</span>)
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

    <!-- Daily Spending Trend Chart (สถิติการใช้จ่ายรายวัน) -->
    <div class="glass-card" style="border-radius: 24px; padding: 1.5rem; border: 1px solid var(--border-color); background: var(--bg-card); box-shadow: var(--shadow-md); margin-top: 2rem; margin-bottom: 2rem;">
      <h4 style="font-family: var(--font-display); font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; justify-content: space-between; gap: 6px; flex-wrap: wrap;">
        <span style="display: flex; align-items: center; gap: 6px;">
          <span>📈</span> สถิติการใช้จ่ายรายวันของเดือนนี้ (Daily Spending Chart)
        </span>
        <span style="font-size: 0.75rem; color: var(--text-secondary); background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 20px;">
          เทียบกับงบแนะนำรายวัน
        </span>
      </h4>

      <div style="width: 100%; margin-top: 1rem;">
        <div style="height: 280px; width: 100%; position: relative;">
          <canvas ref="dailyChartCanvas"></canvas>
          <div v-if="hasNoExpensesThisMonth" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--text-muted); font-size: 0.85rem; text-align: center;">
            <span style="font-size: 2.5rem; display: block; margin-bottom: 8px;">📊</span>
            ไม่มีข้อมูลรายจ่ายการกินใช้ในเดือนนี้เพื่อวาดกราฟ
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

    <!-- Modal 5: Choose Deduct Pocket for Quick Spend -->
    <div class="modal-overlay" :class="{ active: isQuickSpendChoiceModalOpen }" @click.self="isQuickSpendChoiceModalOpen = false">
      <div class="modal-content" style="max-width: 400px; border-radius: 24px; padding: 1.5rem; text-align: center;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">💸</div>
        <h3 style="font-family: var(--font-display); font-weight: 700; margin-bottom: 8px;">เลือกกระเป๋าเพื่อจ่ายออก</h3>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 20px;">
          คุณกำลังทำรายการจ่าย: <b>{{ dailyForm.description }}</b><br/>
          จำนวนเงิน: <span style="font-weight: 800; color: var(--color-danger); font-size: 1.1rem;">฿{{ formatNumber(dailyForm.amount) }}</span>
        </p>

        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px;">
          <!-- Option 1: ซองเหลือใช้ -->
          <button @click="executeDailySpendWithCategory('เหลือใช้')" class="btn btn-primary" style="padding: 12px; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, var(--color-primary) 0%, #2563eb 100%); border: none; cursor: pointer; color: white;">
            <span style="font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; gap: 6px;">
              <span>💸</span> ซองเหลือใช้
            </span>
            <span style="font-size: 0.8rem; font-weight: 600; opacity: 0.8;">
              คงเหลือ ฿{{ formatNumber(freeSpendPocket?.remaining || 0) }}
            </span>
          </button>

          <!-- Option 2: ซองเงินสด -->
          <button v-if="cashPocket" @click="executeDailySpendWithCategory('เงินสด')" class="btn btn-success" style="padding: 12px; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); cursor: pointer; color: white;">
            <span style="font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; gap: 6px;">
              <span>💵</span> ซองเงินสด
            </span>
            <span style="font-size: 0.8rem; font-weight: 600; opacity: 0.8;">
              คงเหลือ ฿{{ formatNumber(cashPocket.remaining) }}
            </span>
          </button>
        </div>

        <button @click="isQuickSpendChoiceModalOpen = false" class="btn btn-secondary" style="width: 100%; border-radius: 12px; font-weight: 700; cursor: pointer;">
          ยกเลิกรายการ
        </button>
      </div>
    </div>

    <!-- Allowance Analysis Modal -->
    <div class="modal-overlay" :class="{ active: isAllowanceAnalysisModalOpen }" @click.self="closeAllowanceAnalysisModal">
      <div class="modal-content" style="max-width: 550px; border-radius: 24px;">
        <div class="modal-header">
          <h3 style="display: flex; align-items: center; gap: 8px;">
            <span>📊</span> วิเคราะห์เงินกินใช้รายวันอย่างละเอียด
          </h3>
          <button @click="closeAllowanceAnalysisModal" class="close-btn">&times;</button>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          
          <!-- Rating / Grade Header -->
          <div style="padding: 1rem; border-radius: 16px; display: flex; align-items: center; gap: 12px;" :style="allowanceReport.gradeStyle">
            <span style="font-size: 2.2rem;">{{ allowanceReport.gradeEmoji }}</span>
            <div>
              <div style="font-size: 0.75rem; font-weight: 600; opacity: 0.85;">ประเมินพฤติกรรมวันนี้</div>
              <div style="font-size: 1.45rem; font-weight: 850;">อยู่ในเกณฑ์: {{ allowanceReport.gradeText }}</div>
            </div>
          </div>

          <!-- Comparison Stats Cards -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: 12px; border: 1px solid var(--border-color);">
              <div style="font-size: 0.725rem; color: var(--text-secondary); margin-bottom: 2px;">งบวันนี้ที่ควรใช้</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: var(--color-success);">฿{{ formatNumber(dailyAllowanceTarget) }}</div>
            </div>
            <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: 12px; border: 1px solid var(--border-color);">
              <div style="font-size: 0.725rem; color: var(--text-secondary); margin-bottom: 2px;">ใช้ไปแล้ววันนี้</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: var(--color-danger);">฿{{ formatNumber(spentToday) }}</div>
            </div>
          </div>

          <!-- Visual Budget Gauge (Health Bar style) -->
          <div style="background: rgba(255,255,255,0.02); padding: 14px; border-radius: 16px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; font-weight: 700;">
              <span>📊 สัดส่วนการใช้จ่ายวันนี้ (Daily Budget Gauge)</span>
              <span :style="{ color: spentToday <= dailyAllowanceTarget ? 'var(--color-success)' : 'var(--color-danger)' }">
                {{ allowanceReport.percentUsed }}%
              </span>
            </div>
            <div style="height: 10px; background: rgba(255,255,255,0.05); border-radius: 5px; overflow: hidden; position: relative;">
              <div 
                :style="{ 
                  width: Math.min(allowanceReport.percentUsed, 100) + '%', 
                  backgroundColor: spentToday <= dailyAllowanceTarget ? 'var(--color-success)' : 'var(--color-danger)',
                  height: '100%',
                  borderRadius: '5px',
                  boxShadow: spentToday <= dailyAllowanceTarget ? 'none' : '0 0 10px rgba(255, 59, 48, 0.4)',
                  transition: 'width 0.5s ease'
                }"
              ></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">
              <span>฿0.00</span>
              <span v-if="spentToday > dailyAllowanceTarget" style="color: var(--color-danger);">ใช้เกินงบไป ฿{{ formatNumber(spentToday - dailyAllowanceTarget) }}!</span>
              <span v-else style="color: var(--color-primary);">ยังเหลือโควตา ฿{{ formatNumber(dailyAllowanceTarget - spentToday) }}</span>
              <span>เป้า: ฿{{ formatNumber(dailyAllowanceTarget) }}</span>
            </div>
          </div>

          <!-- Analysis text blocks -->
          <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.85rem; line-height: 1.5;">
            
            <!-- Strengths / Advantages -->
            <div style="background: rgba(52, 199, 89, 0.05); padding: 12px 16px; border-radius: 14px; border: 1px solid rgba(52, 199, 89, 0.15);">
              <div style="font-weight: 700; color: var(--color-success); margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                <span>✅</span> ข้อดี / จุดแข็งของการกินใช้ตอนนี้:
              </div>
              <p style="color: var(--text-secondary);">
                {{ allowanceReport.advantages }}
              </p>
            </div>

            <!-- Weaknesses / Drawbacks -->
            <div style="background: rgba(255, 59, 48, 0.05); padding: 12px 16px; border-radius: 14px; border: 1px solid rgba(255, 59, 48, 0.15);">
              <div style="font-weight: 700; color: var(--color-danger); margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                <span>⚠️</span> ข้อเสีย / ข้อควรระวัง:
              </div>
              <p style="color: var(--text-secondary);">
                {{ allowanceReport.drawbacks }}
              </p>
            </div>

            <!-- Recommendations -->
            <div style="background: rgba(0, 122, 255, 0.05); padding: 12px 16px; border-radius: 14px; border: 1px solid rgba(0, 122, 255, 0.15);">
              <div style="font-weight: 700; color: var(--color-primary); margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                <span>💡</span> คำแนะนำในการปรับปรุงตัว:
              </div>
              <p style="color: var(--text-secondary);">
                {{ allowanceReport.recommendations }}
              </p>
            </div>

          </div>

          <button @click="closeAllowanceAnalysisModal" class="btn btn-secondary" style="width: 100%; border-radius: 12px; font-weight: 700; margin-top: 5px;">
            เข้าใจแล้ว & ปิดหน้าต่าง
          </button>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Trigger redeploy for Vercel public status
import { ref, watch, onMounted, computed, nextTick } from 'vue';
import Chart from 'chart.js/auto';

export default {
  name: 'Dashboard',
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

    const userProfile = ref({ allowance_target_date: null });
    const allowanceTargetInputDate = ref('');

    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`/api/user/profile?t=${Date.now()}`, {
          headers: { 'x-user-id': String(getUserId()) }
        });
        if (res.ok) {
          userProfile.value = await res.json();
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };

    const updateAllowanceTargetDate = async (e) => {
      const newDate = e.target.value;
      if (!newDate) return;
      
      try {
        const res = await fetch('/api/user/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': String(getUserId())
          },
          body: JSON.stringify({
            allowance_target_date: newDate
          })
        });
        
        if (res.ok) {
          userProfile.value.allowance_target_date = newDate;
          fetchData();
        }
      } catch (err) {
        console.error('Error updating allowance target date:', err);
      }
    };

    // Modal Controls
    const isIncomeModalOpen = ref(false);
    const isExpenseModalOpen = ref(false);
    const isAdjustModalOpen = ref(false);
    const isHistoryModalOpen = ref(false);
    const selectedEnvelope = ref(null);
    const selectedEnvelopeForHistory = ref(null);
    const isAllowanceAnalysisModalOpen = ref(false);
    const isQuickSpendChoiceModalOpen = ref(false);

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

    // Days remaining calculations (Until the user's custom date or end of the next month)
    const daysRemainingInfo = computed(() => {
      const today = new Date();
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const oneDayMs = 24 * 60 * 60 * 1000;

      // Determine the target date
      let targetDateObj;
      if (userProfile.value && userProfile.value.allowance_target_date) {
        try {
          const parts = userProfile.value.allowance_target_date.split('-');
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          const d = parseInt(parts[2], 10);
          targetDateObj = new Date(y, m, d);
          if (isNaN(targetDateObj.getTime())) {
            throw new Error('Invalid Date');
          }
        } catch (e) {
          targetDateObj = new Date(today.getFullYear(), today.getMonth() + 2, 0);
        }
      } else {
        // Fallback to default: end of next month
        targetDateObj = new Date(today.getFullYear(), today.getMonth() + 2, 0);
      }

      const diffMs = targetDateObj.getTime() - todayMidnight.getTime();
      // Ensure remainingDays is at least 1 to avoid division by zero or negative days
      const remainingDays = Math.max(1, Math.round(diffMs / oneDayMs) + 1);
      
      const yearStr = targetDateObj.getFullYear();
      const monthStr = String(targetDateObj.getMonth() + 1).padStart(2, '0');
      const dayStr = String(targetDateObj.getDate()).padStart(2, '0');
      const targetDateStr = `${yearStr}-${monthStr}-${dayStr}`;

      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const currentMonthStr = `${year}-${String(month).padStart(2, '0')}`;

      if (props.month !== currentMonthStr) {
        const parts = props.month.split('-');
        const totalDaysInSelected = new Date(parts[0], parts[1], 0).getDate();
        return {
          totalDays: totalDaysInSelected,
          remainingDays: totalDaysInSelected,
          isCurrentMonth: false,
          targetDateStr
        };
      }

      return {
        totalDays: new Date(year, month, 0).getDate(),
        remainingDays: remainingDays,
        isCurrentMonth: true,
        targetDateStr
      };
    });

    // Find the 'เหลือใช้' (Free Spending) pocket
    const freeSpendPocket = computed(() => {
      return budgetProgressList.value.find(p => p.category === 'เหลือใช้') || null;
    });

    // Find the 'เงินสด' (Cash) pocket
    const cashPocket = computed(() => {
      return budgetProgressList.value.find(p => p.category.trim() === 'เงินสด') || null;
    });

    // Total allowance pool remaining (Free Spend + Cash Pocket remaining)
    const totalAllowancePoolRemaining = computed(() => {
      const freeRemaining = freeSpendPocket.value ? freeSpendPocket.value.remaining : 0;
      const cashRemaining = cashPocket.value ? cashPocket.value.remaining : 0;
      return freeRemaining + cashRemaining;
    });

    // Calculate how much has been spent today under the 'เหลือใช้' or 'เงินสด' categories
    const spentToday = computed(() => {
      const today = new Date();
      const todayStr = today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
        String(today.getDate()).padStart(2, '0');

      return allTransactions.value
        .filter(tx => tx.type === 'expense' && (tx.category === 'เหลือใช้' || tx.category === 'เงินสด') && tx.date.startsWith(todayStr))
        .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    });

    // Daily Recommended Target: remaining balance before today's spend / remaining days
    const dailyAllowanceTarget = computed(() => {
      if (!freeSpendPocket.value) return 0;
      const totalPoolForRemainingDays = totalAllowancePoolRemaining.value + spentToday.value;
      const allowance = totalPoolForRemainingDays / daysRemainingInfo.value.remainingDays;
      return allowance > 0 ? allowance : 0;
    });

    // Remaining allowance for today specifically
    const remainingTodayAllowance = computed(() => {
      const remaining = dailyAllowanceTarget.value - spentToday.value;
      return remaining > 0 ? remaining : 0;
    });

    const openAllowanceAnalysisModal = () => {
      isAllowanceAnalysisModalOpen.value = true;
    };

    const closeAllowanceAnalysisModal = () => {
      isAllowanceAnalysisModalOpen.value = false;
    };

    const allowanceReport = computed(() => {
      const target = dailyAllowanceTarget.value;
      const spent = spentToday.value;
      const pocketRemaining = totalAllowancePoolRemaining.value;
      const percentUsed = target > 0 ? Math.round((spent / target) * 100) : 0;
      
      let gradeText = 'ดีเยี่ยม';
      let gradeEmoji = '🟢';
      let gradeStyle = {
        background: 'rgba(52, 199, 89, 0.12)',
        color: '#34c759',
        border: '1.5px solid rgba(52, 199, 89, 0.25)'
      };
      
      let advantages = 'คุณควบคุมการกินใช้รายวันได้ยอดเยี่ยมมาก วันนี้ใช้จ่ายไปไม่เกินเกณฑ์เฉลี่ยที่แนะนำ ทำให้เงินในซองเหลือใช้ยังเพิ่มพูนและคงสภาพคล่องได้เป็นอย่างดี!';
      let drawbacks = 'ไม่มีข้อเสียที่ร้ายแรงในวันนี้ แต่ให้ระวังสิ่งล่อตาล่อใจในอนาคตที่อาจทำให้พฤติกรรมนี้เปลี่ยนแปลงไป';
      let recommendations = 'รักษาพฤติกรรมความมีวินัยแบบนี้ต่อไปเรื่อย ๆ หากทำได้จนจบเดือน คุณจะมีเงินเหลือสะสมเป็นเงินเก็บก้อนใหญ่ในซองเหลือใช้นี้แน่นอนครับ!';

      if (spent === 0) {
        gradeText = 'ยอดเยี่ยม (ไม่มีการใช้จ่าย)';
        gradeEmoji = '💎';
        gradeStyle = {
          background: 'rgba(0, 122, 255, 0.12)',
          color: '#007aff',
          border: '1.5px solid rgba(0, 122, 255, 0.25)'
        };
        advantages = 'วันนี้คุณยังไม่ได้ใช้จ่ายเงินจากซองกินใช้รายวันเลย! เป็นพฤติกรรมการอดออมที่ยอดเยี่ยมมาก เหมาะสำหรับการรีเซ็ตสภาพคล่องหรือเร่งสร้างเงินออมสะสมครับ';
        drawbacks = 'ไม่มีข้อเสีย แต่อย่าอดอาหารหรือประหยัดจนส่งผลต่อสุขภาพร่างกายนะครับ!';
        recommendations = `หากมีความจำเป็นในการกินใช้ ให้กินใช้อยู่ในงบแนะนำ ฿${formatNumber(target)} ต่อวัน แต่หากสามารถออมได้แบบวันนี้เรื่อย ๆ เงินคงเหลือสะสมของคุณจะเติบโตอย่างรวดเร็วมากครับ`;
      } else if (spent > target) {
        const ratio = target > 0 ? (spent / target).toFixed(1) : spent;
        gradeText = 'เริ่มตึงตัว (ใช้เงินเกินงบแนะนำ)';
        gradeEmoji = '⚠️';
        gradeStyle = {
          background: 'rgba(255, 149, 0, 0.12)',
          color: '#ff9500',
          border: '1.5px solid rgba(255, 149, 0, 0.25)'
        };
        
        advantages = 'ข้อดีคือคุณยังมีการดึงเงินจากซองสะสมที่มีความจุรองรับอยู่ ซึ่งไม่ได้ทำให้งบรวมทั้งหมดติดลบในทันทีเนื่องจากยังมีเงินสะสมรองรับระบบ';
        drawbacks = `วันนี้คุณกินใช้ไป ฿${formatNumber(spent)} ซึ่งคิดเป็น ${ratio} เท่าของงบที่แนะนำต่อวัน (฿${formatNumber(target)}) หากทำเช่นนี้ติดต่อกัน เงินสะสมในซอง "เหลือใช้" (฿${formatNumber(pocketRemaining)}) จะหมดลงเร็วกว่าปกติอย่างเห็นได้ชัดในอนาคตอันใกล้!`;
        
        const nextThreeDaysTarget = (pocketRemaining / Math.max(1, daysRemainingInfo.value.remainingDays)) * 0.9;
        recommendations = `เพื่อปรับสมดุลพอร์ตการกินใช้ แนะนำให้จำกัดงบการกินใช้ในอีก 2-3 วันข้างหน้าให้อยู่ที่ประมาณวันละ ฿${formatNumber(nextThreeDaysTarget)} หรือหลีกเลี่ยงการซื้อของฟุ่มเฟือยชั่วคราว เพื่อดึงงบกลับเข้าสู่แผนเดิมครับ`;

        if (pocketRemaining <= 0) {
          gradeText = 'อันตราย (ซองเหลือใช้หมดแล้ว)';
          gradeEmoji = '🚨';
          gradeStyle = {
            background: 'rgba(255, 59, 48, 0.12)',
            color: '#ff3b30',
            border: '1.5px solid rgba(255, 59, 48, 0.25)'
          };
          advantages = 'คุณได้รู้ตัวเร็วว่าขณะนี้กระเป๋าเงินกินใช้รายวันได้หมดโควตาลงแล้ว ทำให้สามารถควบคุมเบรกการจ่ายเงินในส่วนอื่น ๆ ได้ทันที';
          drawbacks = `กระเป๋าเงิน "เหลือใช้" ของคุณตอนนี้ติดลบหรือมีค่าเป็น 0 แล้ว! ทำให้วันนี้และวันต่อ ๆ ไปจะไม่มีงบสำหรับกินใช้รายวันแนะนำอีกต่อไป และการกินใช้ใด ๆ หลังจากนี้จะไปดึงทรัพยากรหลักหรือเบียดบังกระเป๋าออมเงินด้านอื่นทันที`;
          recommendations = 'แนะนำให้รีบทำการ "โอนเงินเข้า (📥)" จาก Pockets อื่นที่ยังเหลือใช้ หรือนำเงินนอก Pocket เติมเข้ามาในซอง "เหลือใช้" จำนวนหนึ่งเพื่อคืนสภาพคล่อง และกำหนดงบเฉลี่ยรายวันต่อวันใหม่อีกครั้งอย่างมีวินัยครับ';
        }
      }

      return {
        gradeText,
        gradeEmoji,
        gradeStyle,
        advantages,
        drawbacks,
        recommendations,
        percentUsed
      };
    });

    // Main fetch functions
    const fetchData = async () => {
      try {
        await fetchUserProfile();

        // 1. Fetch categories
        const resCat = await fetch(`/api/categories?t=${Date.now()}`, {
          headers: { 'x-user-id': String(getUserId()) }
        });
        if (resCat.ok) {
          categories.value = await resCat.json();
        }

        // 2. Fetch monthly summary stats
        const resSummary = await fetch(`/api/summary?month=${props.month}&t=${Date.now()}`, {
          headers: { 'x-user-id': String(getUserId()) }
        });
        if (resSummary.ok) {
          summary.value = await resSummary.json();
          calculateBudgetProgress();
        }

        // 3. Fetch all monthly transactions to compute daily spend
        const resTx = await fetch(`/api/transactions?startDate=${props.month}-01&endDate=${props.month}-31&t=${Date.now()}`, {
          headers: { 'x-user-id': String(getUserId()) }
        });
        if (resTx.ok) {
          allTransactions.value = await resTx.json();
          recentTransactions.value = allTransactions.value.slice(0, 5); // display only top 5 recent
          nextTick(updateDailyChart);
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
          headers: { 
            'Content-Type': 'application/json',
            'x-user-id': String(getUserId())
          },
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
          headers: { 
            'Content-Type': 'application/json',
            'x-user-id': String(getUserId())
          },
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
          headers: { 
            'Content-Type': 'application/json',
            'x-user-id': String(getUserId())
          },
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

    // Submit Daily Expense (Deducts from "เหลือใช้" or prompts choice)
    const submitDailySpend = async () => {
      if (!dailyForm.value.description || !dailyForm.value.amount || !dailyForm.value.date) return;
      
      // If the cash pocket exists, open the selection modal to let the user choose
      if (cashPocket.value) {
        isQuickSpendChoiceModalOpen.value = true;
      } else {
        // Otherwise directly deduct from "เหลือใช้"
        await executeDailySpendWithCategory('เหลือใช้');
      }
    };

    const executeDailySpendWithCategory = async (category) => {
      try {
        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-id': String(getUserId())
          },
          body: JSON.stringify({
            date: parseDateText(dailyForm.value.date),
            type: 'expense',
            category: category,
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
          isQuickSpendChoiceModalOpen.value = false;
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
        message: `📅 เหลือเวลาใช้เงินอีก ${daysRemainingInfo.value.remainingDays} วัน (เฉลี่ยถึงวันที่ ${formatDate(daysRemainingInfo.value.targetDateStr)})`
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

    // Daily Spending Chart variables and rendering
    const dailyChartCanvas = ref(null);
    let dailyChartInstance = null;

    const hasNoExpensesThisMonth = computed(() => {
      const dailyExpenses = allTransactions.value.filter(tx => tx.type === 'expense' && (tx.category === 'เหลือใช้' || tx.category === 'เงินสด'));
      return dailyExpenses.length === 0;
    });

    const updateDailyChart = () => {
      if (!dailyChartCanvas.value) return;

      const totalDays = daysRemainingInfo.value.totalDays || 30;
      const dailyTotals = Array(totalDays).fill(0);
      
      const dailyExpenses = allTransactions.value.filter(tx => tx.type === 'expense' && (tx.category === 'เหลือใช้' || tx.category === 'เงินสด'));
      dailyExpenses.forEach(tx => {
        const txDate = new Date(tx.date);
        const day = txDate.getDate(); // 1-indexed
        if (day >= 1 && day <= totalDays) {
          dailyTotals[day - 1] += parseFloat(tx.amount);
        }
      });

      const allowanceTarget = dailyAllowanceTarget.value;
      const limitData = Array(totalDays).fill(allowanceTarget);

      const backgroundColors = dailyTotals.map(amount => {
        return amount > allowanceTarget 
          ? 'rgba(239, 68, 68, 0.7)' // Red warning for exceeding target
          : 'rgba(59, 130, 246, 0.6)'; // Blue for below target
      });

      const borderColors = dailyTotals.map(amount => {
        return amount > allowanceTarget ? '#ef4444' : '#3b82f6';
      });

      if (dailyChartInstance) {
        dailyChartInstance.destroy();
      }

      if (hasNoExpensesThisMonth.value) {
        return;
      }

      dailyChartInstance = new Chart(dailyChartCanvas.value, {
        type: 'bar',
        data: {
          labels: Array.from({ length: totalDays }, (_, i) => String(i + 1)),
          datasets: [
            {
              label: 'งบแนะนำรายวัน (฿)',
              type: 'line',
              data: limitData,
              borderColor: '#10b981',
              borderWidth: 2,
              borderDash: [6, 6],
              pointRadius: 0,
              fill: false
            },
            {
              label: 'ยอดใช้จ่ายจริง (฿)',
              data: dailyTotals,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 1,
              borderRadius: 8
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              left: 10,
              right: 10,
              top: 10,
              bottom: 5
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.05)'
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.85)',
                font: {
                  family: 'Sarabun, sans-serif',
                  size: 10
                },
                callback: value => '฿' + value
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.85)',
                font: {
                  family: 'Sarabun, sans-serif',
                  size: 9
                }
              }
            }
          },
          plugins: {
            legend: {
              labels: {
                color: 'rgba(255, 255, 255, 0.8)',
                font: {
                  family: 'Sarabun, sans-serif'
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  return ` ${context.dataset.label}: ฿${parseFloat(context.raw).toFixed(2)}`;
                }
              }
            }
          }
        }
      });
    };

    // Watchers
    watch(() => daysRemainingInfo.value.targetDateStr, (newVal) => {
      allowanceTargetInputDate.value = newVal;
    }, { immediate: true });

    watch(() => props.month, () => {
      fetchData();
    });

    watch(allTransactions, () => {
      nextTick(updateDailyChart);
    }, { deep: true });

    onMounted(async () => {
      await fetchData();
      nextTick(updateDailyChart);
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
      dailyChartCanvas,
      hasNoExpensesThisMonth,
      updateDailyChart,
      daysRemainingInfo,
      freeSpendPocket,
      spentToday,
      dailyAllowanceTarget,
      remainingTodayAllowance,
      smartInsights,
      isHistoryModalOpen,
      selectedEnvelopeForHistory,
      pocketHistoryList,
      isAllowanceAnalysisModalOpen,
      allowanceReport,
      openAllowanceAnalysisModal,
      closeAllowanceAnalysisModal,
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
      getInsightIcon,
      userProfile,
      updateAllowanceTargetDate,
      allowanceTargetInputDate,
      cashPocket,
      totalAllowancePoolRemaining,
      isQuickSpendChoiceModalOpen,
      executeDailySpendWithCategory
    };
  }
};
</script>
