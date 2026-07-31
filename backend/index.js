const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Helper for sending error responses
const handleError = (res, err, status = 500) => {
  console.error(err);
  res.status(status).json({ error: err.message || 'Internal Server Error' });
};

const getUserId = (req) => {
  return parseInt(req.headers['x-user-id'] || '1', 10);
};

const seedDefaultCategories = async (userId) => {
  const defaultCategories = [
    // Income
    { name: 'เงินเดือน', type: 'income', color: '#10B981', icon: 'salary' },
    { name: 'ฟรีแลนซ์/งานเสริม', type: 'income', color: '#3B82F6', icon: 'freelance' },
    { name: 'การลงทุน/ปันผล', type: 'income', color: '#8B5CF6', icon: 'investment' },
    { name: 'อื่นๆ (รายรับ)', type: 'income', color: '#6B7280', icon: 'other-income' },
    // Expense
    { name: 'อาหารและเครื่องดื่ม', type: 'expense', color: '#EF4444', icon: 'food' },
    { name: 'เดินทาง/น้ำมัน', type: 'expense', color: '#F59E0B', icon: 'transport' },
    { name: 'ช้อปปิ้ง', type: 'expense', color: '#EC4899', icon: 'shopping' },
    { name: 'ที่อยู่อาศัย/ค่าเช่า', type: 'expense', color: '#3B82F6', icon: 'housing' },
    { name: 'สาธารณูปโภค (น้ำ/ไฟ/เน็ต)', type: 'expense', color: '#06B6D4', icon: 'utilities' },
    { name: 'สุขภาพและยารักษาโรค', type: 'expense', color: '#14B8A6', icon: 'health' },
    { name: 'ความบันเทิง/พักผ่อน', type: 'expense', color: '#8B5CF6', icon: 'entertainment' },
    { name: 'อื่นๆ (รายจ่าย)', type: 'expense', color: '#6B7280', icon: 'other-expense' },
    { name: 'เหลือใช้', type: 'expense', color: '#007aff', icon: 'wallet' }
  ];

  for (const cat of defaultCategories) {
    try {
      await db.query(
        'INSERT INTO categories (name, type, color, icon, user_id) VALUES (?, ?, ?, ?, ?)',
        [cat.name, cat.type, cat.color, cat.icon || 'other', userId]
      );
    } catch (err) {
      // Safe to ignore duplicate category name
    }
  }
};

// -------------------------------------------------------------
// CATEGORIES ENDPOINTS
// -------------------------------------------------------------
// AUTH ENDPOINT
// -------------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const [rows] = await db.query(
      'SELECT id, username FROM users WHERE username = ? AND password = ?',
      [username.trim().toLowerCase(), password.trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Username หรือ Password ไม่ถูกต้อง' });
    }

    const user = rows[0];
    
    // Auto-seed categories if they don't have any
    const [check] = await db.query('SELECT COUNT(*) as count FROM categories WHERE user_id = ?', [user.id]);
    if (check[0].count === 0) {
      await seedDefaultCategories(user.id);
    }

    res.json({ success: true, user });
  } catch (err) {
    handleError(res, err);
  }
});

// -------------------------------------------------------------
// CATEGORIES ENDPOINTS
// -------------------------------------------------------------
app.get('/api/categories', async (req, res) => {
  try {
    const userId = getUserId(req);
    
    // Check if user has any categories, if not seed them
    const [check] = await db.query('SELECT COUNT(*) as count FROM categories WHERE user_id = ?', [userId]);
    if (check[0].count === 0) {
      await seedDefaultCategories(userId);
    }

    const [rows] = await db.query('SELECT * FROM categories WHERE user_id = ? ORDER BY type, name', [userId]);
    res.json(rows);
  } catch (err) {
    handleError(res, err);
  }
});

// Add new category
app.post('/api/categories', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { name, type, color, icon } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const [result] = await db.query(
      'INSERT INTO categories (name, type, color, icon, user_id) VALUES (?, ?, ?, ?, ?)',
      [name, type, color || '#3B82F6', icon || 'other', userId]
    );
    res.status(201).json({ id: result.insertId, name, type, color, icon });
  } catch (err) {
    handleError(res, err);
  }
});

// Delete category
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    // 1. Get the category details first (verify owner)
    const [cats] = await db.query('SELECT name FROM categories WHERE id = ? AND user_id = ?', [id, userId]);
    if (cats.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const catName = cats[0].name;

    // 2. Check if there are transactions using this category
    const [txs] = await db.query('SELECT COUNT(*) as count FROM transactions WHERE category = ? AND user_id = ?', [catName, userId]);
    if (txs[0].count > 0) {
      return res.status(400).json({ error: 'ไม่สามารถลบหมวดหมู่นี้ได้ เนื่องจากมีรายการธุรกรรมบันทึกไว้ในหมวดหมู่นี้อยู่' });
    }

    // 3. Delete category
    await db.query('DELETE FROM categories WHERE id = ? AND user_id = ?', [id, userId]);

    // 4. Delete any associated budget for this category
    await db.query('DELETE FROM budgets WHERE category = ? AND user_id = ?', [catName, userId]);

    res.json({ message: 'Category deleted successfully', id: parseInt(id) });
  } catch (err) {
    handleError(res, err);
  }
});

// Update category (name and color) with transactional cascading updates to transactions and budgets
app.put('/api/categories/:id', async (req, res) => {
  const connection = await db.getConnection();
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { name, color } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await connection.beginTransaction();

    // 1. Get the category details first (verify owner)
    const [cats] = await connection.query('SELECT name FROM categories WHERE id = ? AND user_id = ?', [id, userId]);
    if (cats.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Category not found' });
    }
    const oldName = cats[0].name;
    const newName = name.trim();

    // 2. Update category table
    await connection.query(
      'UPDATE categories SET name = ?, color = ? WHERE id = ? AND user_id = ?',
      [newName, color || '#3B82F6', id, userId]
    );

    // 3. Cascade update transaction records and budgets if name changed
    if (oldName !== newName) {
      await connection.query('UPDATE transactions SET category = ? WHERE category = ? AND user_id = ?', [newName, oldName, userId]);
      await connection.query('UPDATE budgets SET category = ? WHERE category = ? AND user_id = ?', [newName, oldName, userId]);
    }

    await connection.commit();
    res.json({ id: parseInt(id), name: newName, color });
  } catch (err) {
    await connection.rollback();
    handleError(res, err);
  } finally {
    connection.release();
  }
});

// -------------------------------------------------------------
// TRANSACTIONS ENDPOINTS
// -------------------------------------------------------------

// Get all transactions (with optional search/filters)
app.get('/api/transactions', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { startDate, endDate, type, category, search } = req.query;
    let query = 'SELECT * FROM transactions WHERE user_id = ?';
    const params = [userId];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND (description LIKE ? OR category LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY date DESC, id DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    handleError(res, err);
  }
});

// Add single transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { date, type, category, amount, description } = req.body;
    if (!date || !type || !category || amount === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const [result] = await db.query(
      'INSERT INTO transactions (date, type, category, amount, description, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [date, type, category, amount, description || '', userId]
    );
    res.status(201).json({ id: result.insertId, date, type, category, amount, description });
  } catch (err) {
    handleError(res, err);
  }
});

// Add bulk transactions (useful for Excel Import)
app.post('/api/transactions/bulk', async (req, res) => {
  try {
    const userId = getUserId(req);
    const transactions = req.body; // Expecting array of { date, type, category, amount, description }
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ error: 'Body must be a non-empty array of transactions' });
    }

    const values = [];
    for (const tx of transactions) {
      if (!tx.date || !tx.type || !tx.category || tx.amount === undefined) {
        return res.status(400).json({ error: 'Some transactions are missing required fields' });
      }
      values.push([tx.date, tx.type, tx.category, tx.amount, tx.description || '', userId]);
    }

    const [result] = await db.query(
      'INSERT INTO transactions (date, type, category, amount, description, user_id) VALUES ?',
      [values]
    );

    res.status(201).json({ message: `Successfully imported ${result.affectedRows} transactions` });
  } catch (err) {
    handleError(res, err);
  }
});

// Update transaction
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { date, type, category, amount, description } = req.body;
    
    if (!date || !type || !category || amount === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await db.query(
      'UPDATE transactions SET date = ?, type = ?, category = ?, amount = ?, description = ? WHERE id = ? AND user_id = ?',
      [date, type, category, amount, description || '', id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized' });
    }

    res.json({ id: parseInt(id), date, type, category, amount, description });
  } catch (err) {
    handleError(res, err);
  }
});

// Delete transaction
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized' });
    }
    res.json({ message: 'Transaction deleted successfully', id: parseInt(id) });
  } catch (err) {
    handleError(res, err);
  }
});


// -------------------------------------------------------------
// BUDGETS ENDPOINTS
// -------------------------------------------------------------

// Get budgets for a month (e.g. 2026-07)
app.get('/api/budgets', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ error: 'Month parameter (YYYY-MM) is required' });
    }
    const [rows] = await db.query('SELECT * FROM budgets WHERE month = ? AND user_id = ?', [month, userId]);
    res.json(rows);
  } catch (err) {
    handleError(res, err);
  }
});

// Set / Update budget
app.post('/api/budgets', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { category, amount, month } = req.body;
    if (!category || amount === undefined || !month) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await db.query(
      `INSERT INTO budgets (category, amount, month, user_id) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE amount = ?`,
      [category, amount, month, userId, amount]
    );

    res.json({ message: 'Budget set successfully', category, amount, month });
  } catch (err) {
    handleError(res, err);
  }
});


// -------------------------------------------------------------
// SUMMARY / ANALYTICS ENDPOINTS
// -------------------------------------------------------------
app.get('/api/summary', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { month } = req.query; // Expecting YYYY-MM
    if (!month) {
      return res.status(400).json({ error: 'Month parameter (YYYY-MM) is required' });
    }

    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    // 1. Total income & expense
    const [totals] = await db.query(
      `SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as totalIncome,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as totalExpense
       FROM transactions 
       WHERE date >= ? AND date <= LAST_DAY(?) AND user_id = ?`,
      [startDate, startDate, userId]
    );

    // 2. Category breakdown for expenses
    const [categoryBreakdown] = await db.query(
      `SELECT category, SUM(amount) as amount, '#6B7280' as color
       FROM transactions 
       WHERE date >= ? AND date <= LAST_DAY(?) AND type = 'expense' AND user_id = ?
       GROUP BY category`,
      [startDate, startDate, userId]
    );

    // Fetch categories to map colors
    const [dbCategories] = await db.query("SELECT name, color FROM categories WHERE type = 'expense' AND user_id = ?", [userId]);
    const colorMap = {};
    dbCategories.forEach(c => {
      colorMap[c.name] = c.color;
    });

    const breakdownWithColors = categoryBreakdown.map(item => ({
      ...item,
      color: colorMap[item.category] || '#6B7280'
    }));

    // 3. Budgets comparison
    const [budgets] = await db.query('SELECT category, amount FROM budgets WHERE month = ? AND user_id = ?', [month, userId]);
    
    res.json({
      month,
      totalIncome: parseFloat(totals[0].totalIncome || 0),
      totalExpense: parseFloat(totals[0].totalExpense || 0),
      balance: parseFloat((totals[0].totalIncome || 0) - (totals[0].totalExpense || 0)),
      breakdown: breakdownWithColors,
      budgets: budgets
    });

  } catch (err) {
    handleError(res, err);
  }
});

// -------------------------------------------------------------
// INVESTMENTS ENDPOINTS & DB INIT
// -------------------------------------------------------------
async function initTables() {
  try {
    // 1. Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(100) NOT NULL
      )
    `);

    // 2. Seed default users
    await db.query(`
      INSERT IGNORE INTO users (id, username, password) VALUES 
      (1, 'oat', '123'),
      (2, 'beem', '123')
    `);

    // 3. Create investments and stock prices tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS investments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          date DATE NOT NULL,
          symbol VARCHAR(15) NOT NULL,
          type ENUM('BUY', 'SELL', 'DEPOSIT', 'WITHDRAW') NOT NULL,
          shares DECIMAL(16, 7) NOT NULL,
          price DECIMAL(16, 6) NOT NULL,
          commission DECIMAL(10, 2) DEFAULT 0,
          notes VARCHAR(255)
      )
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS stock_prices (
          symbol VARCHAR(15) PRIMARY KEY,
          current_price DECIMAL(16, 6) NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 4. Add user_id column with default 1 (oat) to tables
    const tablesToMigrate = ['categories', 'budgets', 'transactions', 'investments'];
    for (const table of tablesToMigrate) {
      try {
        await db.query(`ALTER TABLE ${table} ADD COLUMN user_id INT DEFAULT 1`);
        console.log(`Column user_id added to ${table} successfully.`);
      } catch (err) {
        // Safe to ignore if column already exists (Error 1060 / ER_DUP_FIELDNAME)
        if (err.errno !== 1060 && err.code !== 'ER_DUP_FIELDNAME') {
          console.error(`Error adding user_id to ${table}:`, err);
        }
      }
    }

    // 5. Update unique constraints in categories
    try {
      await db.query('ALTER TABLE categories DROP INDEX name_type');
      console.log("Index name_type dropped from categories.");
    } catch (err) {
      // Safe to ignore if index does not exist (Error 1091 / Can't drop key)
    }
    try {
      await db.query('ALTER TABLE categories DROP INDEX name');
      console.log("Index name dropped from categories.");
    } catch (err) {
      // Safe to ignore
    }
    try {
      await db.query('ALTER TABLE categories ADD UNIQUE KEY user_name_type (user_id, name, type)');
      console.log("Index user_name_type added to categories.");
    } catch (err) {
      // Safe to ignore if duplicate key
    }

    // 6. Update unique constraints in budgets
    try {
      await db.query('ALTER TABLE budgets DROP INDEX category_month');
      console.log("Index category_month dropped from budgets.");
    } catch (err) {
      // Safe to ignore
    }
    try {
      await db.query('ALTER TABLE budgets ADD UNIQUE KEY user_category_month (user_id, category, month)');
      console.log("Index user_category_month added to budgets.");
    } catch (err) {
      // Safe to ignore
    }
    
    // 7. Verify column definitions (original code checks)
    try {
      await db.query('ALTER TABLE investments MODIFY COLUMN shares DECIMAL(16, 7) NOT NULL');
      console.log("Investments shares column verified as DECIMAL(16,7).");
    } catch (err) {}

    try {
      await db.query("ALTER TABLE investments MODIFY COLUMN type ENUM('BUY', 'SELL', 'DEPOSIT', 'WITHDRAW') NOT NULL");
      console.log("Investments type column updated with DEPOSIT/WITHDRAW support.");
    } catch (err) {}

    try {
      await db.query('ALTER TABLE investments MODIFY COLUMN price DECIMAL(16, 6) NOT NULL');
      await db.query('ALTER TABLE stock_prices MODIFY COLUMN current_price DECIMAL(16, 6) NOT NULL');
      console.log("Investments price columns verified as DECIMAL(16,6).");
    } catch (err) {}

    console.log("Database migration and tables check completed successfully.");
  } catch (err) {
    console.error("Error during initTables:", err);
  }
}
initTables();

// Get all investment transactions
app.get('/api/investments', async (req, res) => {
  try {
    const userId = getUserId(req);
    const [rows] = await db.query('SELECT * FROM investments WHERE user_id = ? ORDER BY date DESC, id DESC', [userId]);
    res.json(rows);
  } catch (err) {
    handleError(res, err);
  }
});

// Add investment transaction
app.post('/api/investments', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { date, symbol, type, shares, price, commission, notes } = req.body;
    if (!date || !symbol || !type || shares === undefined || shares === null || price === undefined || price === null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const cleanSymbol = symbol.toUpperCase().trim();
    const [result] = await db.query(
      'INSERT INTO investments (date, symbol, type, shares, price, commission, notes, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [date, cleanSymbol, type, parseFloat(shares), parseFloat(price), parseFloat(commission || 0), notes || '', userId]
    );
    
    // Also insert stock price default if not exists (global catalog)
    await db.query(
      'INSERT IGNORE INTO stock_prices (symbol, current_price) VALUES (?, ?)',
      [cleanSymbol, parseFloat(price)]
    );

    res.status(201).json({ id: result.insertId, date, symbol: cleanSymbol, type, shares, price, commission, notes });
  } catch (err) {
    handleError(res, err);
  }
});

// Delete investment transaction
app.delete('/api/investments/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM investments WHERE id = ? AND user_id = ?', [id, userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized' });
    }
    res.json({ message: 'Deleted successfully', id: parseInt(id) });
  } catch (err) {
    handleError(res, err);
  }
});

// Delete all transactions of a specific stock symbol (delete holding)
app.delete('/api/investments/symbol/:symbol', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { symbol } = req.params;
    const cleanSymbol = symbol.toUpperCase().trim();
    await db.query('DELETE FROM investments WHERE symbol = ? AND user_id = ?', [cleanSymbol, userId]);
    res.json({ message: `Successfully deleted holding for ${cleanSymbol}` });
  } catch (err) {
    handleError(res, err);
  }
});

// Update stock current market price
app.post('/api/investments/prices', async (req, res) => {
  try {
    const { symbol, current_price } = req.body;
    if (!symbol || current_price === undefined) {
      return res.status(400).json({ error: 'Symbol and current_price are required' });
    }
    const cleanSymbol = symbol.toUpperCase().trim();
    await db.query(
      'INSERT INTO stock_prices (symbol, current_price) VALUES (?, ?) ON DUPLICATE KEY UPDATE current_price = ?',
      [cleanSymbol, parseFloat(current_price), parseFloat(current_price)]
    );
    res.json({ message: 'Stock price updated successfully', symbol: cleanSymbol, current_price });
  } catch (err) {
    handleError(res, err);
  }
});

// Get portfolio summary and P&L calculation
app.get('/api/investments/portfolio', async (req, res) => {
  try {
    const userId = getUserId(req);
    // 1. Fetch all transactions and current prices
    const [txs] = await db.query('SELECT * FROM investments WHERE user_id = ? ORDER BY date ASC, id ASC', [userId]);
    const [prices] = await db.query('SELECT * FROM stock_prices');
    
    const priceMap = {};
    prices.forEach(p => {
      priceMap[p.symbol] = parseFloat(p.current_price);
    });

    // 2. Process transactions to calculate holdings
    const portfolio = {};
    
    txs.forEach(t => {
      if (t.type === 'DEPOSIT' || t.type === 'WITHDRAW') return;
      const symbol = t.symbol;
      const type = t.type;
      const shares = parseFloat(t.shares);
      const price = parseFloat(t.price);
      const comm = parseFloat(t.commission || 0);

      if (!portfolio[symbol]) {
        portfolio[symbol] = {
          symbol,
          remainingShares: 0,
          totalBuyShares: 0,
          totalBuyCost: 0, // includes commission
          totalSellShares: 0,
          totalSellRevenue: 0,
          averageBuyCost: 0
        };
      }

      const p = portfolio[symbol];
      if (type === 'BUY') {
        p.remainingShares += shares;
        p.totalBuyShares += shares;
        p.totalBuyCost += (shares * price) + comm;
      } else if (type === 'SELL') {
        p.remainingShares -= shares;
        p.totalSellShares += shares;
        p.totalSellRevenue += (shares * price) - comm;
      }
    });

    // 3. Finalize calculations for each holding
    const holdings = [];
    let totalInvestedCapital = 0;
    let totalCurrentValue = 0;

    Object.keys(portfolio).forEach(symbol => {
      const p = portfolio[symbol];
      
      // Calculate weighted average cost of BUY transactions
      p.averageBuyCost = p.totalBuyShares > 0 ? (p.totalBuyCost / p.totalBuyShares) : 0;
      
      // If we still hold shares
      if (p.remainingShares > 0) {
        const currentPrice = priceMap[symbol] !== undefined ? priceMap[symbol] : p.averageBuyCost;
        const investedCapital = p.remainingShares * p.averageBuyCost;
        const currentValue = p.remainingShares * currentPrice;
        const profitLoss = currentValue - investedCapital;
        const profitLossPercent = investedCapital > 0 ? (profitLoss / investedCapital) * 100 : 0;

        totalInvestedCapital += investedCapital;
        totalCurrentValue += currentValue;

        holdings.push({
          symbol,
          remainingShares: p.remainingShares,
          averageBuyCost: p.averageBuyCost,
          currentPrice,
          investedCapital,
          currentValue,
          profitLoss,
          profitLossPercent
        });
      }
    });

    res.json({
      holdings,
      totalInvestedCapital,
      totalCurrentValue,
      totalGainLoss: totalCurrentValue - totalInvestedCapital,
      totalGainLossPercent: totalInvestedCapital > 0 ? ((totalCurrentValue - totalInvestedCapital) / totalInvestedCapital) * 100 : 0
    });
  } catch (err) {
    handleError(res, err);
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
