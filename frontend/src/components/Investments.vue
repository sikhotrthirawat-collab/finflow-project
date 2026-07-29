<template>
  <div style="display: flex; flex-direction: column; gap: 1.5rem;">
    <!-- 1. Consolidated Summary Header (Apple Style Columns) -->
    <div class="glass-card" style="padding: 1.25rem 1.75rem; border-radius: 20px; border: 1px solid var(--border-color); background: var(--bg-card); display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1.5rem; box-shadow: var(--shadow-sm); align-items: center;">
      <!-- สินทรัพย์รวมทั้งหมด (Total Assets) -->
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 1.5rem;">💰</span>
        <div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600;">สินทรัพย์รวมทั้งหมด (Total Assets)</div>
          <div style="font-family: var(--font-display); font-weight: 850; font-size: 1.45rem; color: var(--color-primary); line-height: 1.2;">
            ${{ formatNumber(totalInvestedCost + usdCashBalance) }} USD
          </div>
          <div style="font-size: 0.725rem; color: var(--text-muted); font-weight: 600; margin-top: 2px;">
            ≈ ฿{{ formatNumber((totalInvestedCost + usdCashBalance) * exchangeRate) }} THB
          </div>
        </div>
      </div>

      <!-- สินทรัพย์รวมหุ้น (Total Stocks) -->
      <div style="display: flex; align-items: center; gap: 12px; border-left: 1.5px solid var(--border-color); padding-left: 1.25rem;">
        <span style="font-size: 1.5rem;">📈</span>
        <div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600;">สินทรัพย์รวมหุ้น (Total Stocks)</div>
          <div style="font-family: var(--font-display); font-weight: 800; font-size: 1.45rem; color: var(--text-primary); line-height: 1.2;">
            ${{ formatNumber(totalInvestedCost) }} USD
          </div>
          <div style="font-size: 0.725rem; color: var(--text-muted); font-weight: 600; margin-top: 2px;">
            ≈ ฿{{ formatNumber(totalInvestedCost * exchangeRate) }} THB
          </div>
        </div>
      </div>

      <!-- เงินสดคงเหลือ (Dime! Cash) -->
      <div style="display: flex; align-items: center; gap: 12px; border-left: 1.5px solid var(--border-color); padding-left: 1.25rem;">
        <span style="font-size: 1.5rem;">🇺🇸</span>
        <div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; color: #af52de;">เงินสดคงเหลือ (Dime! Cash)</div>
          <div style="font-family: var(--font-display); font-weight: 800; font-size: 1.45rem; color: var(--text-primary); line-height: 1.2;">
            ${{ formatNumber(usdCashBalance) }} USD
          </div>
          <div style="font-size: 0.725rem; color: var(--text-muted); font-weight: 600; margin-top: 2px;">
            ≈ ฿{{ formatNumber(usdCashBalance * exchangeRate) }} THB
          </div>
        </div>
      </div>

      <!-- Exchange Rate Config -->
      <div style="display: flex; align-items: center; gap: 8px; border-left: 1.5px solid var(--border-color); padding-left: 1.25rem; justify-content: flex-end;">
        <label style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; white-space: nowrap;">อัตราแลกเปลี่ยน:</label>
        <div style="display: flex; align-items: center; background: rgba(0,0,0,0.02); padding: 6px 10px; border-radius: 10px; border: 1px solid var(--border-color);">
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-right: 4px; white-space: nowrap;">1 USD =</span>
          <input v-model.number="exchangeRate" type="number" step="any" style="width: 50px; background: none; border: none; color: var(--text-primary); font-family: var(--font-display); font-weight: 700; font-size: 0.85rem; outline: none; text-align: center;" />
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 4px;">THB</span>
        </div>
      </div>
    </div>

    <!-- 2. Split Screen: Left (Holdings & Allocation Graph) & Right (Forms & History Ledger) -->
    <div style="display: grid; grid-template-columns: 1.6fr 1fr; gap: 2rem; align-items: start; flex-wrap: wrap;">
      
      <!-- LEFT SECTION: Simplified Purchased Stocks Table with Date & Graph -->
      <div style="display: flex; flex-direction: column; gap: 2rem;">
        
        <!-- Table Card -->
        <div class="glass-card" style="padding: 1.75rem; border-radius: 24px; border: 1px solid var(--border-color); background: var(--bg-card); box-shadow: var(--shadow-md);">
          <h3 style="font-family: var(--font-display); font-weight: 700; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%;">
            <span style="display: flex; align-items: center; gap: 8px;"><span>📈</span> รายการหุ้นที่ซื้อ</span>
            <button @click="exportPDF" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; font-weight: 700; border-radius: 10px; display: flex; align-items: center; gap: 6px; border: 1.5px solid var(--border-color);">
              <span>📄</span> ออกรายงาน PDF
            </button>
          </h3>
          
          <div class="table-container" v-if="stockTransactions && stockTransactions.length > 0">
            <table>
              <thead>
                <tr>
                  <th>วันที่เข้าซื้อ</th>
                  <th>ชื่อหุ้น</th>
                  <th style="text-align: right;">จำนวนหุ้น</th>
                  <th style="text-align: right;">ราคาที่เข้าซื้อ</th>
                  <th style="text-align: right;">ต้นทุนรวม</th>
                  <th style="text-align: center;">ลบ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in stockTransactions" :key="t.id">
                  <td style="color: var(--text-secondary); font-size: 0.85rem; font-weight: 500;">{{ formatDate(t.date) }}</td>
                  <td style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">{{ t.symbol }}</td>
                  <td style="text-align: right; font-family: var(--font-display); font-weight: 600;">{{ formatShares(t.shares) }}</td>
                  <td style="text-align: right; font-family: var(--font-display);">
                    ${{ formatHighPrecisionPrice(t.price) }}
                    <div style="font-size: 0.7rem; color: var(--text-muted);">≈ ฿{{ formatNumber(t.price * exchangeRate) }}</div>
                  </td>
                  <td style="text-align: right; color: var(--text-primary); font-weight: 600; font-family: var(--font-display);">
                    ${{ formatNumber(t.shares * t.price) }}
                    <div style="font-size: 0.7rem; color: var(--text-muted);">≈ ฿{{ formatNumber((t.shares * t.price) * exchangeRate) }}</div>
                  </td>
                  <td style="text-align: center;">
                    <button @click="deleteTransaction(t.id)" class="btn btn-sm btn-danger" style="padding: 4px 10px; font-size: 0.75rem; border-radius: 8px; font-weight: 700;">
                      🗑️ ลบ
                  </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div v-else style="text-align: center; color: var(--text-muted); padding: 3rem 1rem;">
            <span style="font-size: 2rem;">📊</span>
            <p style="margin-top: 10px; font-size: 0.9rem;">ยังไม่มีรายการหุ้นในพอร์ต</p>
          </div>
        </div>

        <!-- Doughnut Allocation Chart Card -->
        <div class="glass-card" style="padding: 1.75rem; border-radius: 24px; border: 1px solid var(--border-color); background: var(--bg-card); box-shadow: var(--shadow-md);" v-show="portfolioData.holdings && portfolioData.holdings.length > 0">
          <h3 style="font-family: var(--font-display); font-weight: 700; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 8px;">
            <span>🍰</span> สัดส่วนการถือครองหุ้น (Asset Allocation)
          </h3>
          <div style="position: relative; height: 230px; display: flex; align-items: center; justify-content: center;">
            <canvas ref="chartCanvas"></canvas>
          </div>
        </div>

      </div>

      <!-- RIGHT SECTION: Tabbed Forms & Full History -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        
        <!-- Tabbed Menu selector -->
        <div style="display: flex; gap: 8px; border-bottom: 1.5px solid var(--border-color); padding-bottom: 10px;">
          <button @click="activeFormTab = 'stock'" class="btn btn-sm" :class="activeFormTab === 'stock' ? 'btn-primary' : 'btn-secondary'" style="flex: 1; border-radius: 10px; padding: 8px 12px; font-weight: 700;">
            📈 ซื้อหุ้น
          </button>
          <button @click="activeFormTab = 'cash'" class="btn btn-sm" :class="activeFormTab === 'cash' ? 'btn-primary' : 'btn-secondary'" style="flex: 1; border-radius: 10px; padding: 8px 12px; font-weight: 700;">
            💰 โอนเงินสด
          </button>
        </div>

        <!-- Tab 1: Simple Buy Form with USD/THB currency selector -->
        <div v-if="activeFormTab === 'stock'" class="glass-card" style="padding: 1.5rem; border-radius: 20px; border: 1px solid var(--border-color); background: var(--bg-card); box-shadow: var(--shadow-md);">
          <h4 style="font-family: var(--font-display); font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: 6px;">
            <span>➕</span> เพิ่มรายการซื้อหุ้น
          </h4>
          <form @submit.prevent="submitTransaction">
            <div class="form-group" style="margin-bottom: 0.85rem;">
              <label>ชื่อหุ้น (Symbol)</label>
              <input v-model="form.symbol" type="text" class="form-control" placeholder="เช่น MU, PTT" required style="padding: 8px 12px; font-size: 0.85rem;" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1.25fr; gap: 0.85rem; margin-bottom: 0.85rem;">
              <div class="form-group" style="margin: 0;">
                <label>ราคาหุ้นต่อหุ้น ($ USD)</label>
                <input v-model.number="form.price" type="number" step="any" min="0.000001" class="form-control" placeholder="0.00" required @input="onAmountOrPriceInput" style="padding: 8px 12px; font-size: 0.85rem;" />
              </div>
              <div class="form-group" style="margin: 0;">
                <label>เงินที่ใช้ซื้อ</label>
                <div style="display: flex; gap: 6px; align-items: center;">
                  <input v-model.number="form.amountToSpend" type="number" step="any" min="0.01" class="form-control" placeholder="0.00" required @input="onAmountOrPriceInput" style="padding: 8px 12px; font-size: 0.85rem; flex: 1; min-width: 0;" />
                  <select v-model="form.currency" @change="onAmountOrPriceInput" style="width: 95px; flex-shrink: 0; padding: 8px; font-size: 0.8rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); font-weight: 700; height: 38px;">
                    <option value="USD">USD ($)</option>
                    <option value="THB">THB (฿)</option>
                  </select>
                </div>
                <!-- Converted helper text -->
                <div v-if="form.currency === 'THB' && form.amountToSpend > 0" style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px; font-weight: 600;">
                  ≈ ${{ formatNumber(form.amountToSpend / exchangeRate) }} USD
                </div>
              </div>
            </div>

            <!-- Calculated Shares field -->
            <div class="form-group" style="margin-bottom: 0.85rem;">
              <label>จำนวนหุ้นที่ได้รับ (คำนวณอัตโนมัติ)</label>
              <input v-model.number="form.shares" type="number" step="any" min="0.0000001" class="form-control" placeholder="คำนวณให้อัตโนมัติ" required @input="onSharesInput" style="padding: 8px 12px; font-size: 0.85rem; background: var(--bg-secondary); font-weight: 700;" />
            </div>

            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label>วันที่เข้าซื้อ</label>
              <div style="position: relative;">
                <input 
                  type="text" 
                  class="form-control" 
                  :value="form.dateText"
                  readonly
                  @click="triggerDatePicker"
                  style="cursor: pointer; background: var(--bg-secondary); padding: 8px 12px; font-size: 0.85rem;"
                />
                <input 
                  ref="nativeDatePicker"
                  type="date" 
                  @change="onDateChange"
                  style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; pointer-events: none;"
                />
                <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; font-size: 0.85rem;">📅</span>
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; font-weight: 700; border-radius: 10px; padding: 8px; font-size: 0.85rem;">
              บันทึกการซื้อหุ้น (หักเงินสด)
            </button>
          </form>
        </div>

        <!-- Tab 2: Simple Cash Flow Form (Deposit/Withdraw) -->
        <div v-if="activeFormTab === 'cash'" class="glass-card" style="padding: 1.5rem; border-radius: 20px; border: 1px solid var(--border-color); background: var(--bg-card); box-shadow: var(--shadow-md);">
          <h4 style="font-family: var(--font-display); font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: 6px;">
            <span>💰</span> โอนเงินเข้า/ออก
          </h4>
          <form @submit.prevent="submitCashTransaction">
            <div class="form-group" style="margin-bottom: 0.85rem;">
              <label>ประเภทรายการ</label>
              <select v-model="cashForm.type" class="form-control" required style="padding: 8px 12px; font-size: 0.85rem;">
                <option value="DEPOSIT">🟢 โอนเงินเข้าบัญชีลงทุน (Deposit)</option>
                <option value="WITHDRAW">🔴 ถอนเงินออก (Withdraw)</option>
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 0.85rem;">
              <label>จำนวนเงินสดที่โอน</label>
              <div style="display: flex; gap: 6px; align-items: center;">
                <input v-model.number="cashForm.amount" type="number" step="any" min="0.01" class="form-control" placeholder="0.00" required style="padding: 8px 12px; font-size: 0.85rem; flex: 1; min-width: 0;" />
                <select v-model="cashForm.currency" style="width: 95px; flex-shrink: 0; padding: 8px; font-size: 0.8rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); font-weight: 700; height: 38px;">
                  <option value="USD">USD ($)</option>
                  <option value="THB">THB (฿)</option>
                </select>
              </div>
              <!-- Converted helper text -->
              <div v-if="cashForm.currency === 'THB' && cashForm.amount > 0" style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px; font-weight: 600;">
                ≈ ${{ formatNumber(cashForm.amount / exchangeRate) }} USD
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label>วันที่ทำรายการ</label>
              <div style="position: relative;">
                <input 
                  type="text" 
                  class="form-control" 
                  :value="cashForm.dateText"
                  readonly
                  @click="triggerCashDatePicker"
                  style="cursor: pointer; background: var(--bg-secondary); padding: 8px 12px; font-size: 0.85rem;"
                />
                <input 
                  ref="nativeCashDatePicker"
                  type="date" 
                  @change="onCashDateChange"
                  style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; pointer-events: none;"
                />
                <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; font-size: 0.85rem;">📅</span>
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; font-weight: 700; border-radius: 10px; padding: 8px; font-size: 0.85rem;">
              บันทึกรายการโอนเงิน
            </button>
          </form>
        </div>

        <!-- Full Ledger History List -->
        <div class="glass-card" style="padding: 1.5rem; border-radius: 20px; border: 1px solid var(--border-color); background: var(--bg-card); box-shadow: var(--shadow-md);">
          <h4 style="font-family: var(--font-display); font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: 6px;">
            <span>📜</span> ประวัติธุรกรรมทั้งหมด
          </h4>
          
          <div style="max-height: 280px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 4px;">
            <div v-for="t in transactions" :key="t.id" 
                 style="padding: 10px; border-radius: 10px; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.01); font-size: 0.8rem;">
              <div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span class="badge" :class="getBadgeClass(t.type)" style="font-size: 0.6rem; padding: 2px 6px; border-radius: 6px;">
                    {{ getTypeText(t.type) }}
                  </span>
                  <span style="font-weight: 700; color: var(--text-primary);">{{ t.symbol }}</span>
                </div>
                <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">
                  <template v-if="t.type === 'BUY' || t.type === 'SELL'">
                    {{ formatShares(t.shares) }} หุ้น @ ${{ formatHighPrecisionPrice(t.price) }}
                  </template>
                  <template v-else>
                    จำนวนเงินสด ${{ formatNumber(t.price) }}
                  </template>
                </div>
              </div>
              <div style="text-align: right; display: flex; align-items: center; gap: 8px;">
                <div>
                  <div style="font-weight: 700;" :style="{ color: getTransactionColor(t.type) }">
                    {{ getTransactionSign(t.type) }}${{ formatNumber(t.type === 'BUY' || t.type === 'SELL' ? t.shares * t.price : t.price) }}
                  </div>
                  <div style="font-size: 0.65rem; color: var(--text-muted);">{{ formatDate(t.date) }}</div>
                </div>
                <button @click="deleteTransaction(t.id)" style="background: none; border: none; color: var(--color-danger); cursor: pointer; padding: 2px; font-size: 0.75rem;" title="ลบ">
                  🗑️
                </button>
              </div>
            </div>
            
            <div v-if="transactions.length === 0" style="text-align: center; color: var(--text-muted); padding: 1.5rem 0; font-size: 0.75rem;">
              ยังไม่มีประวัติการทำธุรกรรม
            </div>
          </div>
        </div>

      </div>

    </div>

  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import Chart from 'chart.js/auto';

export default {
  name: 'Investments',
  props: {
    month: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const portfolioData = ref({
      holdings: [],
      totalInvestedCapital: 0,
      totalCurrentValue: 0,
      totalGainLoss: 0,
      totalGainLossPercent: 0
    });
    
    const transactions = ref([]);
    const nativeDatePicker = ref(null);
    const nativeCashDatePicker = ref(null);
    const chartCanvas = ref(null);
    const activeFormTab = ref('stock'); // 'stock' or 'cash'
    let chartInstance = null;
    
    const form = ref({
      symbol: '',
      shares: '',
      price: '',
      amountToSpend: '',
      currency: 'USD', // USD or THB
      date: '',
      dateText: ''
    });

    const cashForm = ref({
      type: 'DEPOSIT',
      amount: '',
      currency: 'USD', // USD or THB
      date: '',
      dateText: ''
    });

    // Exchange rate persisted in localStorage
    const exchangeRate = ref(parseFloat(localStorage.getItem('usd_exchange_rate') || '33.50'));
    watch(exchangeRate, (newVal) => {
      localStorage.setItem('usd_exchange_rate', newVal.toString());
    });

    // Dynamic cash balance based on ledger transaction records
    const usdCashBalance = computed(() => {
      let cash = 0;
      transactions.value.forEach(t => {
        const val = parseFloat(t.price || 0);
        const shares = parseFloat(t.shares || 0);
        
        if (t.type === 'DEPOSIT') {
          cash += val;
        } else if (t.type === 'WITHDRAW') {
          cash -= val;
        } else if (t.type === 'BUY') {
          cash -= (shares * val);
        } else if (t.type === 'SELL') {
          cash += (shares * val);
        }
      });
      return cash;
    });

    // Dynamic total invested stock cost calculation
    const totalInvestedCost = computed(() => {
      return stockTransactions.value.reduce((sum, t) => sum + (parseFloat(t.shares || 0) * parseFloat(t.price || 0)), 0);
    });

    // Filter only stock transactions for the holdings list
    const stockTransactions = computed(() => {
      return transactions.value.filter(t => t.type === 'BUY' || t.type === 'SELL');
    });

    // Event handlers for auto-calculating fields
    const onAmountOrPriceInput = () => {
      const price = parseFloat(form.value.price);
      let amount = parseFloat(form.value.amountToSpend);
      
      if (form.value.currency === 'THB') {
        amount = amount / exchangeRate.value; // Convert THB to USD for calculation
      }

      if (price > 0 && amount > 0) {
        // Calculate shares up to 7 decimal digits
        form.value.shares = parseFloat((amount / price).toFixed(7));
      } else {
        form.value.shares = '';
      }
    };

    const onSharesInput = () => {
      const price = parseFloat(form.value.price);
      const shares = parseFloat(form.value.shares);
      
      if (price > 0 && shares > 0) {
        const usdAmount = shares * price;
        if (form.value.currency === 'THB') {
          form.value.amountToSpend = parseFloat((usdAmount * exchangeRate.value).toFixed(2));
        } else {
          form.value.amountToSpend = parseFloat(usdAmount.toFixed(2));
        }
      } else {
        form.value.amountToSpend = '';
      }
    };

    // BE Date Helpers
    const getTodayDateText = () => {
      const date = new Date();
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear() + 543).slice(-2);
      return `${day}/${month}/${year}`;
    };

    const parseDateText = (text) => {
      if (!text) return '';
      const parts = text.split('/');
      if (parts.length !== 3) return '';
      const day = parts[0];
      const month = parts[1];
      const yearBE = parseInt(parts[2]);
      const yearAD = yearBE + 2000 - 543;
      return `${yearAD}-${month}-${day}`;
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear() + 543).slice(-2);
      return `${day}/${month}/${year}`;
    };

    const formatNumber = (num) => {
      if (num === undefined || num === null) return '0.00';
      return parseFloat(num).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatHighPrecisionPrice = (num) => {
      if (num === undefined || num === null) return '0.00';
      const parsed = parseFloat(num);
      const hasDecimals = parsed % 1 !== 0;
      if (!hasDecimals) return parsed.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      
      const parts = parsed.toString().split('.');
      const decimalPlaces = parts[1] ? parts[1].length : 2;
      return parsed.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: Math.max(2, Math.min(6, decimalPlaces)) });
    };

    const formatShares = (num) => {
      if (num === undefined || num === null) return '0';
      if (Number.isInteger(num)) return num.toString();
      return parseFloat(num).toFixed(7).replace(/\.?0+$/, '');
    };

    // Date picker controls
    const triggerDatePicker = () => {
      if (nativeDatePicker.value) nativeDatePicker.value.showPicker();
    };

    const onDateChange = (e) => {
      const val = e.target.value;
      if (!val) return;
      const date = new Date(val);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear() + 543).slice(-2);
      form.value.dateText = `${day}/${month}/${year}`;
      form.value.date = val;
    };

    const triggerCashDatePicker = () => {
      if (nativeCashDatePicker.value) nativeCashDatePicker.value.showPicker();
    };

    const onCashDateChange = (e) => {
      const val = e.target.value;
      if (!val) return;
      const date = new Date(val);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear() + 543).slice(-2);
      cashForm.value.dateText = `${day}/${month}/${year}`;
      cashForm.value.date = val;
    };

    const resetForm = () => {
      form.value = {
        symbol: '',
        shares: '',
        price: '',
        amountToSpend: '',
        currency: 'USD',
        date: new Date().toISOString().split('T')[0],
        dateText: getTodayDateText()
      };
    };

    const resetCashForm = () => {
      cashForm.value = {
        type: 'DEPOSIT',
        amount: '',
        currency: 'USD',
        date: new Date().toISOString().split('T')[0],
        dateText: getTodayDateText()
      };
    };

    // Load Data
    const fetchData = async () => {
      try {
        const [portfolioRes, txsRes] = await Promise.all([
          fetch('/api/investments/portfolio').then(r => r.json()),
          fetch('/api/investments').then(r => r.json())
        ]);
        portfolioData.value = portfolioRes;
        transactions.value = txsRes;
        
        await nextTick();
        renderChart();
      } catch (err) {
        console.error('Error fetching investments data:', err);
      }
    };

    // Submit Stock Purchase
    const submitTransaction = async () => {
      let purchaseValueUSD = parseFloat(form.value.shares || 0) * parseFloat(form.value.price || 0);

      // Round to 2 decimal places to avoid float epsilon comparison issues (e.g. 29.940001 > 29.94)
      const purchaseRounded = Math.round(purchaseValueUSD * 100) / 100;
      const cashRounded = Math.round(usdCashBalance.value * 100) / 100;

      if (purchaseRounded > cashRounded) {
        alert(`ยอดเงินสดในบัญชี Dime! Cash ไม่เพียงพอสำหรับการซื้อหุ้นลอตนี้!\n(ยอดซื้อ: $${formatNumber(purchaseRounded)} | เงินสดคงเหลือ: $${formatNumber(cashRounded)})`);
        return;
      }

      try {
        const parsedDate = parseDateText(form.value.dateText);
        const data = {
          date: parsedDate,
          symbol: form.value.symbol,
          type: 'BUY',
          shares: form.value.shares,
          price: form.value.price,
          commission: 0,
          notes: form.value.currency === 'THB' ? `ซื้อด้วยเงินบาท ฿${formatNumber(form.value.amountToSpend)}` : 'ซื้อหักเงินสด'
        };

        const res = await fetch('/api/investments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (res.ok) {
          resetForm();
          fetchData();
        } else {
          alert('เกิดข้อผิดพลาดในการบันทึกรายการซื้อหุ้น');
        }
      } catch (err) {
        console.error('Error submitting transaction:', err);
      }
    };

    // Submit Cash Flow
    const submitCashTransaction = async () => {
      let usdAmount = parseFloat(cashForm.value.amount);
      if (cashForm.value.currency === 'THB') {
        usdAmount = parseFloat((usdAmount / exchangeRate.value).toFixed(2));
      }

      const withdrawRounded = Math.round(usdAmount * 100) / 100;
      const cashRounded = Math.round(usdCashBalance.value * 100) / 100;

      if (cashForm.value.type === 'WITHDRAW' && usdAmount > usdCashBalance.value) {
        alert(`ยอดเงินสดในบัญชี Dime! Cash ไม่เพียงพอสำหรับการถอนเงินสดจำนวนนี้!\n(ยอดถอน: $${formatNumber(usdAmount)} | เงินสดคงเหลือ: $${formatNumber(usdCashBalance.value)})`);
        return;
      }

      try {
        const parsedDate = parseDateText(cashForm.value.dateText);
        const data = {
          date: parsedDate,
          symbol: 'CASH',
          type: cashForm.value.type,
          shares: 0,
          price: usdAmount,
          commission: 0,
          notes: cashForm.value.currency === 'THB' 
            ? `${cashForm.value.type === 'DEPOSIT' ? 'โอนเข้า' : 'ถอนออก'}ด้วยเงินบาท ฿${formatNumber(cashForm.value.amount)}`
            : `${cashForm.value.type === 'DEPOSIT' ? 'โอนเงินสดเข้า' : 'ถอนเงินสดออก'}`
        };

        const res = await fetch('/api/investments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (res.ok) {
          resetCashForm();
          fetchData();
        } else {
          alert('เกิดข้อผิดพลาดในการบันทึกรายการโอนเงิน');
        }
      } catch (err) {
        console.error('Error submitting cash transaction:', err);
      }
    };

    // Delete Transaction record
    const deleteTransaction = async (id) => {
      if (!confirm('คุณแน่ใจหรือไม่ที่จะลบรายการธุรกรรมนี้?')) return;
      try {
        const res = await fetch(`/api/investments/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          fetchData();
        }
      } catch (err) {
        console.error('Error deleting transaction:', err);
      }
    };

    // Chart.js allocation renderer
    const renderChart = () => {
      if (!chartCanvas.value) return;

      const holdings = portfolioData.value.holdings || [];
      
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }

      if (holdings.length === 0) return;

      const labels = holdings.map(h => h.symbol);
      const data = holdings.map(h => h.investedCapital);
      
      const appleColors = [
        '#007aff', // blue
        '#34c759', // green
        '#af52de', // purple
        '#ff9500', // orange
        '#5856d6', // indigo
        '#ff2d55', // pink
        '#ffcc00', // yellow
        '#5ac8fa'  // teal
      ];

      chartInstance = new Chart(chartCanvas.value, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: appleColors.slice(0, holdings.length),
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: document.body.classList.contains('light-theme') ? '#1d1d1f' : '#f8fafc',
                font: {
                  family: '-apple-system, BlinkMacSystemFont, "SF Pro Text"',
                  size: 11
                },
                boxWidth: 10,
                padding: 10
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const val = context.raw;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const pct = Math.round((val / total) * 100);
                  return `  ${context.label}: $${val.toLocaleString(undefined, {minimumFractionDigits: 2})} (${pct}%)`;
                }
              }
            }
          },
          cutout: '70%'
        }
      });
    };

    // Dedicated HTML Printable Window Generator (Export to vector PDF)
    const exportPDF = () => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('กรุณาอนุญาตให้แสดง Pop-up เพื่อเปิดตัวแปลงเอกสาร PDF ครับ');
        return;
      }
      
      const holdingsHTML = portfolioData.value.holdings.map(h => `
        <tr>
          <td>${h.symbol}</td>
          <td style="text-align: right;">${formatShares(h.remainingShares)}</td>
          <td style="text-align: right;">$${formatHighPrecisionPrice(h.averageBuyCost)} (฿${formatNumber(h.averageBuyCost * exchangeRate.value)})</td>
          <td style="text-align: right; font-weight: bold;">$${formatNumber(h.investedCapital)} (฿${formatNumber(h.investedCapital * exchangeRate.value)})</td>
        </tr>
      `).join('');

      const txsHTML = transactions.value.map(t => `
        <tr>
          <td>${formatDate(t.date)}</td>
          <td><span style="padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; background: ${t.type === 'BUY' || t.type === 'DEPOSIT' ? '#e8f5e9' : '#ffebee'}; color: ${t.type === 'BUY' || t.type === 'DEPOSIT' ? '#2e7d32' : '#c62828'};">${getTypeText(t.type)}</span></td>
          <td>${t.symbol}</td>
          <td style="text-align: right;">${t.type === 'BUY' || t.type === 'SELL' ? formatShares(t.shares) : '-'}</td>
          <td style="text-align: right;">$${formatHighPrecisionPrice(t.price)}</td>
          <td style="text-align: right; font-weight: bold;">${getTransactionSign(t.type)}$${formatNumber(t.type === 'BUY' || t.type === 'SELL' ? t.shares * t.price : t.price)}</td>
        </tr>
      `).join('');

      printWindow.document.write(`
        <html>
          <head>
            <title>FinFlow Stock Portfolio Report - ${new Date().toLocaleDateString('th-TH')}</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                color: #1d1d1f;
                padding: 30px;
                line-height: 1.5;
              }
              .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 2px solid #e5e5e5;
                padding-bottom: 15px;
                margin-bottom: 30px;
              }
              .title {
                font-size: 24px;
                font-weight: 800;
              }
              .date {
                font-size: 14px;
                color: #86868b;
              }
              .summary-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin-bottom: 30px;
              }
              .summary-card {
                background: #f5f5f7;
                padding: 15px;
                border-radius: 12px;
                border: 1px solid #e5e5e5;
              }
              .summary-label {
                font-size: 12px;
                color: #86868b;
                font-weight: 600;
              }
              .summary-value {
                font-size: 20px;
                font-weight: 700;
                margin-top: 5px;
              }
              .summary-subtext {
                font-size: 12px;
                color: #86868b;
                margin-top: 2px;
              }
              h3 {
                font-size: 18px;
                font-weight: 700;
                margin-top: 30px;
                margin-bottom: 10px;
                border-bottom: 1px solid #e5e5e5;
                padding-bottom: 5px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 25px;
                font-size: 13px;
              }
              th {
                background: #f5f5f7;
                font-weight: 700;
                text-align: left;
                padding: 8px 12px;
                border-bottom: 1px dashed #e5e5e5;
              }
              td {
                padding: 10px 12px;
                border-bottom: 1px solid #f5f5f7;
              }
              tr:last-child td {
                border-bottom: none;
              }
              @media print {
                body { padding: 0; }
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="title">FinFlow Stock Portfolio Report</div>
                <div style="font-size: 12px; color: #86868b; margin-top: 2px;">รายงานสรุปพอร์ตหุ้นและเงินสดสะสม</div>
              </div>
              <div class="date">พิมพ์เมื่อ: ${new Date().toLocaleDateString('th-TH')}</div>
            </div>

            <div class="summary-grid">
              <div class="summary-card">
                <div class="summary-label">สินทรัพย์รวมทั้งหมด</div>
                <div class="summary-value">$${formatNumber(totalInvestedCost.value + usdCashBalance.value)} USD</div>
                <div class="summary-subtext">≈ ฿${formatNumber((totalInvestedCost.value + usdCashBalance.value) * exchangeRate.value)} THB</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">สินทรัพย์รวมหุ้น</div>
                <div class="summary-value">$${formatNumber(totalInvestedCost.value)} USD</div>
                <div class="summary-subtext">≈ ฿${formatNumber(totalInvestedCost.value * exchangeRate.value)} THB</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">เงินสดคงเหลือ Dime! Cash</div>
                <div class="summary-value">$${formatNumber(usdCashBalance.value)} USD</div>
                <div class="summary-subtext">≈ ฿${formatNumber(usdCashBalance.value * exchangeRate.value)} THB</div>
              </div>
            </div>

            <h3>📊 สรุปหุ้นที่ถือครอง</h3>
            <table>
              <thead>
                <tr>
                  <th>ชื่อหุ้น</th>
                  <th style="text-align: right;">จำนวนหุ้น</th>
                  <th style="text-align: right;">ราคาที่เข้าซื้อ (เฉลี่ย)</th>
                  <th style="text-align: right;">ต้นทุนรวม</th>
                </tr>
              </thead>
              <tbody>
                ${holdingsHTML || '<tr><td colspan="4" style="text-align: center; color: #86868b;">ไม่มีรายการหุ้นในพอร์ต</td></tr>'}
              </tbody>
            </table>

            <h3>📜 ประวัติธุรกรรมทั้งหมด</h3>
            <table>
              <thead>
                <tr>
                  <th>วันที่</th>
                  <th>ประเภท</th>
                  <th>ชื่อย่อ</th>
                  <th style="text-align: right;">จำนวนหุ้น</th>
                  <th style="text-align: right;">ราคา/หน่วย</th>
                  <th style="text-align: right;">ยอดรวม</th>
                </tr>
              </thead>
              <tbody>
                ${txsHTML || '<tr><td colspan="6" style="text-align: center; color: #86868b;">ไม่มีประวัติการทำธุรกรรม</td></tr>'}
              </tbody>
            </table>

            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              }
            <\/script>
          </body>
        </html>
      `);
      printWindow.document.close();
    };

    // Helpers for Badge UI styling
    const getBadgeClass = (type) => {
      switch (type) {
        case 'BUY': return 'badge-income';
        case 'SELL': return 'badge-expense';
        case 'DEPOSIT': return 'badge-income';
        case 'WITHDRAW': return 'badge-expense';
        default: return '';
      }
    };

    const getTypeText = (type) => {
      switch (type) {
        case 'BUY': return 'ซื้อหุ้น';
        case 'SELL': return 'ขายหุ้น';
        case 'DEPOSIT': return 'โอนเข้า';
        case 'WITHDRAW': return 'ถอนออก';
        default: return '';
      }
    };

    const getTransactionSign = (type) => {
      return (type === 'BUY' || type === 'WITHDRAW') ? '-' : '+';
    };

    const getTransactionColor = (type) => {
      return (type === 'BUY' || type === 'WITHDRAW') ? 'var(--color-danger)' : 'var(--color-success)';
    };

    watch(() => props.month, () => {
      fetchData();
    });

    onMounted(() => {
      resetForm();
      resetCashForm();
      fetchData();

      // Theme-reactive chart color re-rendering observer
      const observer = new MutationObserver(() => {
        if (chartInstance) {
          renderChart();
        }
      });
      observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    });

    onUnmounted(() => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    });

    return {
      portfolioData,
      transactions,
      stockTransactions,
      form,
      cashForm,
      nativeDatePicker,
      nativeCashDatePicker,
      chartCanvas,
      activeFormTab,
      usdCashBalance,
      exchangeRate,
      totalInvestedCost,
      onAmountOrPriceInput,
      onSharesInput,
      formatNumber,
      formatHighPrecisionPrice,
      formatDate,
      formatShares,
      triggerDatePicker,
      onDateChange,
      triggerCashDatePicker,
      onCashDateChange,
      submitTransaction,
      submitCashTransaction,
      deleteTransaction,
      getBadgeClass,
      getTypeText,
      getTransactionSign,
      getTransactionColor,
      exportPDF
    };
  }
};
</script>

<style scoped>
.table-container {
  overflow-x: auto;
}
.badge-income {
  background-color: rgba(52, 199, 89, 0.12);
  color: var(--color-success);
}
.badge-expense {
  background-color: rgba(255, 59, 48, 0.12);
  color: var(--color-danger);
}
canvas {
  max-width: 100% !important;
  max-height: 100% !important;
}
</style>
