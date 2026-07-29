<template>
  <div>
    <!-- Overview Banner -->
    <div class="glass-card" style="margin-bottom: 1.5rem;">
      <h3 style="font-family: var(--font-display); font-weight: 700; margin-bottom: 0.5rem;">ระบบนำเข้าธุรกรรมจาก Excel</h3>
      <p style="color: var(--text-secondary); font-size: 0.9rem;">
        ระบบอัจฉริยะสามารถวิเคราะห์และนำเข้าข้อมูลโดยอัตโนมัติ ทั้งจากไฟล์ Excel ที่คุณใช้อยู่เดิม หรือไฟล์เทมเพลตมาตรฐาน
      </p>
    </div>

    <!-- Drag & Drop Upload Zone -->
    <div class="glass-card" style="margin-bottom: 1.5rem;">
      <div 
        class="dropzone" 
        :class="{ dragover: isDragOver }"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleFileDrop"
        @click="triggerFileSelect"
      >
        <input 
          type="file" 
          ref="fileInput" 
          style="display: none;" 
          accept=".xlsx, .xls"
          @change="handleFileSelect"
        />
        <div class="dropzone-icon">📥</div>
        <div class="dropzone-text">ลากและวางไฟล์ Excel (.xlsx) ที่นี่ หรือคลิกเพื่อเลือกไฟล์</div>
        <div class="dropzone-subtext">รองรับไฟล์ "การเงิน.xlsx", "การเงินปี 2569.xlsx" และไฟล์ฟอร์แมตทั่วไป</div>
      </div>

      <!-- File details / Analysis Results -->
      <div v-if="parsedFile" style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.08);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div>
            <h4 style="font-family: var(--font-display); font-weight: 600;">ผลการวิเคราะห์ไฟล์: {{ parsedFile.name }}</h4>
            <p style="font-size: 0.8rem; color: var(--text-muted);">ชีทที่พบ: {{ parsedFile.sheets.join(', ') }}</p>
          </div>
          <button @click="resetParser" class="btn btn-secondary">ล้างข้อมูล</button>
        </div>

        <!-- Custom Mode Detected: การเงิน.xlsx -->
        <div v-if="customMode === 'finance_bills_cash'" class="glass-card" style="background-color: rgba(59, 130, 246, 0.05); border-color: rgba(59, 130, 246, 0.2); margin-bottom: 1.5rem;">
          <h5 style="color: var(--color-primary); font-size: 1rem; font-weight: 700; margin-bottom: 10px;">🌟 ตรวจพบฟอร์แมตไฟล์ "การเงิน.xlsx" ของคุณ!</h5>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 15px;">
            มีตัวเลือกในการนำเข้าข้อมูลดังนี้:
          </p>
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            <button @click="parseCustomBills" class="btn btn-primary btn-sm">
              1. นำเข้ารายการบิลค้างจ่าย (จากชีท Finance)
            </button>
            <button @click="parseCustomCashAccount" class="btn btn-success btn-sm">
              2. นำเข้าบันทึกรายจ่ายเงินสด (จากชีท บัญชีเงินสด)
            </button>
          </div>
        </div>

        <!-- Custom Mode Detected: การเงินปี 2569.xlsx -->
        <div v-if="customMode === 'balance_sheet_2569'" class="glass-card" style="background-color: rgba(139, 92, 246, 0.05); border-color: rgba(139, 92, 246, 0.2); margin-bottom: 1.5rem;">
          <h5 style="color: var(--color-purple); font-size: 1rem; font-weight: 700; margin-bottom: 10px;">🌟 ตรวจพบฟอร์แมตไฟล์ "การเงินปี 2569.xlsx"!</h5>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 15px;">
            เราสามารถดึงข้อมูลสินทรัพย์และหนี้สินมาจำลองรายการธุรกรรมเบื้องต้นได้:
          </p>
          <div style="display: flex; gap: 10px;">
            <button @click="parseCustomBalanceSheet" class="btn btn-primary">
              นำเข้าข้อมูลรายจ่ายค้างชำระ (หนี้สิน)
            </button>
          </div>
        </div>

        <!-- Preview Table of parsed transactions -->
        <div v-if="transactionsPreview.length > 0">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h5 style="font-size: 1rem; font-weight: 600;">รายการธุรกรรมที่เตรียมนำเข้า ({{ transactionsPreview.length }} รายการ)</h5>
            <button @click="importTransactions" class="btn btn-success" :disabled="isImporting">
              {{ isImporting ? 'กำลังนำเข้า...' : 'กดยืนยันนำเข้าฐานข้อมูล' }}
            </button>
          </div>

          <div class="table-container" style="max-height: 300px; overflow-y: auto;">
            <table>
              <thead>
                <tr>
                  <th>วันที่</th>
                  <th>ประเภท</th>
                  <th>หมวดหมู่</th>
                  <th>รายละเอียด</th>
                  <th style="text-align: right;">จำนวนเงิน</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(tx, idx) in transactionsPreview" :key="idx">
                  <td>{{ tx.date }}</td>
                  <td>
                    <span class="badge" :class="tx.type === 'income' ? 'badge-income' : 'badge-expense'">
                      {{ tx.type === 'income' ? 'รายรับ' : 'รายจ่าย' }}
                    </span>
                  </td>
                  <td>{{ tx.category }}</td>
                  <td style="color: var(--text-secondary);">{{ tx.description }}</td>
                  <td style="text-align: right; font-weight: 700;" :style="{ color: tx.type === 'income' ? 'var(--color-success)' : 'var(--color-danger)' }">
                    ฿{{ tx.amount.toLocaleString() }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Standard parser warning/result -->
        <div v-else-if="!customMode" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          <p>ตรวจพบว่าไฟล์เป็นฟอร์แมตทั่วไป หากต้องการกรอกข้อมูล ลองอัปโหลดแบบมาตรฐาน หรือใช้โหมดชีทพิเศษ</p>
        </div>
      </div>
    </div>

    <!-- Instructions / Template Download Card -->
    <div class="glass-card">
      <h4 style="font-family: var(--font-display); font-weight: 600; margin-bottom: 1rem;">คำแนะนำสำหรับการนำเข้าไฟล์มาตรฐาน</h4>
      <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem;">
        หากต้องการสร้างตารางการเงินรูปแบบมาตรฐานเพื่ออัปโหลด สามารถสร้างตารางใน Excel ให้มีหัวตาราง (Row 1) ดังนี้:
      </p>
      
      <div style="background-color: rgba(11, 15, 25, 0.4); padding: 12px; border-radius: var(--radius-md); font-family: monospace; font-size: 0.85rem; color: var(--text-primary); margin-bottom: 1.5rem; overflow-x: auto;">
        วันที่ (YYYY-MM-DD) | ประเภท (income หรือ expense) | หมวดหมู่ | จำนวนเงิน | รายละเอียด
      </div>

      <button @click="downloadTemplate" class="btn btn-secondary">
        ⬇️ ดาวน์โหลดเทมเพลต Excel มาตรฐาน
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import * as XLSX from 'xlsx';

export default {
  name: 'ExcelImporter',
  props: {
    month: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const isDragOver = ref(false);
    const fileInput = ref(null);
    const parsedFile = ref(null);
    const customMode = ref(''); // 'finance_bills_cash', 'balance_sheet_2569', or ''
    const transactionsPreview = ref([]);
    const isImporting = ref(false);
    
    // Store raw parsed workbook sheet tables
    let rawWorkbook = null;

    const triggerFileSelect = () => {
      fileInput.value.click();
    };

    const handleFileSelect = (e) => {
      if (e.target.files.length > 0) {
        processExcelFile(e.target.files[0]);
      }
    };

    const handleFileDrop = (e) => {
      isDragOver.value = false;
      if (e.dataTransfer.files.length > 0) {
        processExcelFile(e.dataTransfer.files[0]);
      }
    };

    // Parse Excel content into sheets
    const processExcelFile = (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          
          rawWorkbook = workbook;
          parsedFile.value = {
            name: file.name,
            sheets: workbook.SheetNames
          };

          // Detect custom file formats
          const sheetNames = workbook.SheetNames;
          if (sheetNames.includes('Finance') && sheetNames.includes('บัญชีเงินสด')) {
            customMode.value = 'finance_bills_cash';
          } else if (sheetNames.includes('Sheet1') && sheetNames.includes('Sheet2')) {
            // Check if Sheet1 looks like the personal balance sheet
            const sheet1 = workbook.Sheets['Sheet1'];
            const cellA1 = sheet1['A1'] ? sheet1['A1'].v : '';
            if (cellA1 && cellA1.includes('งบดุล')) {
              customMode.value = 'balance_sheet_2569';
            } else {
              parseStandardExcel(workbook);
            }
          } else {
            parseStandardExcel(workbook);
          }
        } catch (err) {
          alert('ไม่สามารถอ่านไฟล์ Excel ได้: ' + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    };

    // Standard/Generic Excel parsing (Template parser)
    const parseStandardExcel = (workbook) => {
      try {
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        if (rows.length < 2) {
          alert('ไฟล์ไม่มีข้อมูลเพียงพอ');
          return;
        }

        const previewList = [];
        // Row 0 is headers: วันที่ | ประเภท | หมวดหมู่ | จำนวนเงิน | รายละเอียด
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length < 4) continue;
          
          let rawDate = row[0];
          let dateStr = '';
          if (rawDate instanceof Date) {
            dateStr = rawDate.toISOString().split('T')[0];
          } else if (rawDate) {
            dateStr = String(rawDate).trim();
          }

          let type = String(row[1]).toLowerCase().trim();
          if (type.includes('รับ') || type.includes('income')) {
            type = 'income';
          } else {
            type = 'expense';
          }

          const category = String(row[2]).trim();
          const amount = parseFloat(row[3]);
          const description = row[4] ? String(row[4]).trim() : '';

          if (dateStr && category && !isNaN(amount)) {
            previewList.push({
              date: dateStr,
              type,
              category,
              amount,
              description
            });
          }
        }

        transactionsPreview.value = previewList;
        customMode.value = '';
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการวิเคราะห์ตารางมาตรฐาน: ' + err.message);
      }
    };

    // Parse bills from sheet 'Finance'
    const parseCustomBills = () => {
      if (!rawWorkbook) return;
      try {
        const sheet = rawWorkbook.Sheets['Finance'];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const list = [];
        
        // Let's parse columns B-F starting from row 6 (0-indexed row 5 is header, row 6 onwards has data)
        // Headers: ลำดับ(B), รายการ(C), ราคา(D), วันที่ต้องจ่าย(E), สิ้นสุดวันที่(F)
        for (let i = 6; i < 15; i++) {
          const row = rows[i];
          if (!row) continue;
          
          const itemName = row[2]; // Column C (3rd col)
          const priceVal = row[3]; // Column D (4th col)
          const payDay = row[4];   // Column E (5th col)

          if (itemName && priceVal && !isNaN(parseFloat(priceVal))) {
            const dayNum = String(payDay).padStart(2, '0');
            list.push({
              date: `${props.month}-${dayNum}`,
              type: 'expense',
              category: getBillCategory(itemName),
              amount: parseFloat(priceVal),
              description: `บิลอัตโนมัติ: ${itemName}`
            });
          }
        }

        // Also Anchariya's bills in columns H-L starting from row 6
        // Headers: ลำดับ(H), รายการ(I), ราคา(J), วันที่ต้องจ่าย(K), สิ้นสุดวันที่(L)
        // Which is columns 7, 8, 9, 10, 11 (0-indexed indices)
        for (let i = 6; i < 15; i++) {
          const row = rows[i];
          if (!row) continue;
          
          const itemName = row[8]; // Column I (9th col)
          const priceVal = row[9]; // Column J (10th col)
          const payDay = row[10];  // Column K (11th col)

          if (itemName && priceVal && !isNaN(parseFloat(priceVal))) {
            const dayNum = String(payDay).padStart(2, '0');
            list.push({
              date: `${props.month}-${dayNum}`,
              type: 'expense',
              category: getBillCategory(itemName),
              amount: parseFloat(priceVal),
              description: `บิล (Anchariya): ${itemName}`
            });
          }
        }

        transactionsPreview.value = list;
        alert(`ดึงรายการบิลค้างจ่ายสำเร็จ! พบ ${list.length} รายการ`);
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการดึงบิล: ' + err.message);
      }
    };

    // Match bill names to default category
    const getBillCategory = (name) => {
      const n = name.toLowerCase();
      if (n.includes('telephone') || n.includes('sim') || n.includes('เน็ต') || n.includes('ไฟ') || n.includes('น้ำ')) {
        return 'สาธารณูปโภค (น้ำ/ไฟ/เน็ต)';
      }
      if (n.includes('ครีม') || n.includes('skin') || n.includes('แว่น')) {
        return 'สุขภาพและยารักษาโรค';
      }
      return 'อื่นๆ (รายจ่าย)';
    };

    // Parse cash expenses from sheet 'บัญชีเงินสด'
    const parseCustomCashAccount = () => {
      if (!rawWorkbook) return;
      try {
        const sheet = rawWorkbook.Sheets['บัญชีเงินสด'];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const list = [];
        
        // This sheet has weekly block grids starting in Column G (index 6) to Column O (index 14)
        // We will scan the sheets for headers like 'Monday' or dates like "วันที่ 09/12/2567"
        // Let's traverse the rows and look for date headers.
        
        let currentWeekBaseDate = null;

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (!row) continue;

          // Detect row like: Row 6: [..., "วันที่ 09/12/2567 ถึง 15/12/2567"]
          // Column G (index 6) contains this date range
          const rangeCell = row[6];
          if (rangeCell && String(rangeCell).includes('วันที่')) {
            const match = String(rangeCell).match(/วันที่\s+(\d{2})\/(\d{2})\/(\d{4})/);
            if (match) {
              const d = parseInt(match[1]);
              const m = parseInt(match[2]);
              const y = parseInt(match[3]) - 543; // convert Thai Buddhist Era year to Gregorian
              currentWeekBaseDate = new Date(y, m - 1, d);
              console.log("Parsed Week Base Date:", currentWeekBaseDate);
            }
            continue;
          }

          // Check if this row has "List" and "Price" headers (e.g. Row 10 is headers for Monday, Tuesday etc.)
          if (row[6] === 'List' && row[7] === 'Price') {
            // Read subsequent rows until empty to get the transactions for this week block
            let offset = 1;
            while (i + offset < rows.length) {
              const txRow = rows[i + offset];
              if (!txRow) break;
              
              // If the row starts a new week range, stop scanning this block
              if (txRow[6] && String(txRow[6]).includes('วันที่')) {
                break;
              }

              // Monday is index 6 (List), index 7 (Price)
              // Tuesday is index 8 (List), index 9 (Price)
              // Wednesday is index 10 (List), index 11 (Price)
              // Thursday is index 12 (List), index 13 (Price)
              // Friday is index 14 (List), index 15 (Price) - but max col might be less
              const daysCols = [
                { name: 'Monday', listIdx: 6, priceIdx: 7, dayOffset: 0 },
                { name: 'Tuesday', listIdx: 8, priceIdx: 9, dayOffset: 1 },
                { name: 'Wednesday', listIdx: 10, priceIdx: 11, dayOffset: 2 },
                { name: 'Thursday', listIdx: 12, priceIdx: 13, dayOffset: 3 },
                { name: 'Friday', listIdx: 14, priceIdx: 15, dayOffset: 4 }
              ];

              let hasData = false;
              daysCols.forEach(day => {
                const itemName = txRow[day.listIdx];
                const priceVal = txRow[day.priceIdx];

                if (itemName && priceVal && !isNaN(parseFloat(priceVal))) {
                  hasData = true;
                  let txDateStr = '';
                  
                  if (currentWeekBaseDate) {
                    const targetDate = new Date(currentWeekBaseDate);
                    targetDate.setDate(currentWeekBaseDate.getDate() + day.dayOffset);
                    txDateStr = targetDate.toISOString().split('T')[0];
                  } else {
                    txDateStr = `${props.month}-01`; // fallback
                  }

                  list.push({
                    date: txDateStr,
                    type: 'expense',
                    category: getCashCategory(itemName),
                    amount: parseFloat(priceVal),
                    description: `จ่ายสด: ${itemName}`
                  });
                }
              });

              if (!hasData && offset > 8) {
                // If 8 consecutive rows are empty, safe to break the week block loop
                break;
              }
              offset++;
            }
            i += offset - 1; // advance row cursor
          }
        }

        transactionsPreview.value = list;
        alert(`ดึงรายการบัญชีเงินสดสำเร็จ! พบ ${list.length} รายการ`);
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการดึงข้อมูลเงินสด: ' + err.message);
      }
    };

    // Category mapper for cash items
    const getCashCategory = (name) => {
      const n = name.toLowerCase();
      if (n.includes('ข้าว') || n.includes('อาหาร') || n.includes('น้ำ') || n.includes('บุฟเฟต์') || n.includes('กิน') || n.includes('seven') || n.includes('เซเว่น')) {
        return 'อาหารและเครื่องดื่ม';
      }
      if (n.includes('รถ') || n.includes('น้ำมัน') || n.includes('เดินทาง') || n.includes('บีทีเอส') || n.includes('bts') || n.includes('mrt')) {
        return 'เดินทาง/น้ำมัน';
      }
      if (n.includes('ของเล่น') || n.includes('เกม') || n.includes('หนัง') || n.includes('เที่ยว')) {
        return 'ความบันเทิง/พักผ่อน';
      }
      if (n.includes('เสื้อ') || n.includes('กางเกง') || n.includes('ช้อป') || n.includes('ซื้อของ')) {
        return 'ช้อปปิ้ง';
      }
      return 'อื่นๆ (รายจ่าย)';
    };

    // Parse liabilities from 'การเงินปี 2569.xlsx' Sheet1
    const parseCustomBalanceSheet = () => {
      if (!rawWorkbook) return;
      try {
        const sheet = rawWorkbook.Sheets['Sheet1'];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const list = [];

        // Columns: A is asset name, B is asset value, C is liability name, D is liability value
        // Row 2 is headers: สินทรัพย์, มูลค่า, หนี้สิน, มูลค่า (index 1)
        // Row 3 to 7 are liabilities
        for (let i = 2; i < 7; i++) {
          const row = rows[i];
          if (!row) continue;
          
          const debtName = row[2]; // Column C (3rd)
          const debtValue = row[3]; // Column D (4th)

          if (debtName && debtValue && !isNaN(parseFloat(debtValue))) {
            list.push({
              date: `${props.month}-01`,
              type: 'expense',
              category: getBillCategory(debtName),
              amount: parseFloat(debtValue),
              description: `ยอดค้างชำระ (งบดุล): ${debtName}`
            });
          }
        }

        transactionsPreview.value = list;
        alert(`ดึงหนี้สินเป็นธุรกรรมค่าใช้จ่ายสำเร็จ! พบ ${list.length} รายการ`);
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการดึงข้อมูลหนี้สิน: ' + err.message);
      }
    };

    // Import the preview transactions array to the server
    const importTransactions = async () => {
      if (transactionsPreview.value.length === 0) return;
      isImporting.value = true;
      try {
        const res = await fetch('/api/transactions/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transactionsPreview.value)
        });

        if (res.ok) {
          alert('นำเข้าธุรกรรมการเงินเข้าสู่ฐานข้อมูลเรียบร้อยแล้ว!');
          transactionsPreview.value = [];
          parsedFile.value = null;
          customMode.value = '';
          emit('update-data');
        } else {
          const errData = await res.json();
          alert('นำเข้าล้มเหลว: ' + errData.error);
        }
      } catch (err) {
        console.error('Import error:', err);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      } finally {
        isImporting.value = false;
      }
    };

    const resetParser = () => {
      parsedFile.value = null;
      customMode.value = '';
      transactionsPreview.value = [];
      rawWorkbook = null;
    };

    // Download/Generate standard CSV/Excel sheet layout
    const downloadTemplate = () => {
      const templateData = [
        ['วันที่ (YYYY-MM-DD)', 'ประเภท (income/expense)', 'หมวดหมู่', 'จำนวนเงิน', 'รายละเอียด'],
        ['2026-07-01', 'income', 'เงินเดือน', 45000, 'เงินเดือนประจำเดือนกรกฎาคม'],
        ['2026-07-03', 'expense', 'อาหารและเครื่องดื่ม', 350, 'ค่าข้าวส้มตำเที่ยง'],
        ['2026-07-05', 'expense', 'เดินทาง/น้ำมัน', 800, 'เติมน้ำมันรถยนต์'],
        ['2026-07-10', 'income', 'ฟรีแลนซ์/งานเสริม', 5000, 'รับจ้างเขียนโปรแกรม']
      ];
      
      const ws = XLSX.utils.aoa_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Template');
      XLSX.writeFile(wb, 'import_finance_template.xlsx');
    };

    return {
      isDragOver,
      fileInput,
      parsedFile,
      customMode,
      transactionsPreview,
      isImporting,
      triggerFileSelect,
      handleFileSelect,
      handleFileDrop,
      parseCustomBills,
      parseCustomCashAccount,
      parseCustomBalanceSheet,
      importTransactions,
      resetParser,
      downloadTemplate
    };
  }
};
</script>
