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

// -------------------------------------------------------------
// CATEGORIES ENDPOINTS
// -------------------------------------------------------------
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY type, name');
    res.json(rows);
  } catch (err) {
    handleError(res, err);
  }
});

// Add new category
app.post('/api/categories', async (req, res) => {
  try {
    const { name, type, color, icon } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const [result] = await db.query(
      'INSERT INTO categories (name, type, color, icon) VALUES (?, ?, ?, ?)',
      [name, type, color || '#3B82F6', icon || 'other']
    );
    res.status(201).json({ id: result.insertId, name, type, color, icon });
  } catch (err) {
    handleError(res, err);
  }
});

// Delete category
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get the category details first
    const [cats] = await db.query('SELECT name FROM categories WHERE id = ?', [id]);
    if (cats.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const catName = cats[0].name;

    // 2. Check if there are transactions using this category
    const [txs] = await db.query('SELECT COUNT(*) as count FROM transactions WHERE category = ?', [catName]);
    if (txs[0].count > 0) {
      return res.status(400).json({ error: 'ไม่สามารถลบหมวดหมู่นี้ได้ เนื่องจากมีรายการธุรกรรมบันทึกไว้ในหมวดหมู่นี้อยู่' });
    }

    // 3. Delete category
    await db.query('DELETE FROM categories WHERE id = ?', [id]);

    // 4. Delete any associated budget for this category
    await db.query('DELETE FROM budgets WHERE category = ?', [catName]);

    res.json({ message: 'Category deleted successfully', id: parseInt(id) });
  } catch (err) {
    handleError(res, err);
  }
});

// Update category (name and color) with transactional cascading updates to transactions and budgets
app.put('/api/categories/:id', async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await connection.beginTransaction();

    // 1. Get the category details first
    const [cats] = await connection.query('SELECT name FROM categories WHERE id = ?', [id]);
    if (cats.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Category not found' });
    }
    const oldName = cats[0].name;
    const newName = name.trim();

    // 2. Update category table
    await connection.query(
      'UPDATE categories SET name = ?, color = ? WHERE id = ?',
      [newName, color || '#3B82F6', id]
    );

    // 3. Cascade update transaction records and budgets if name changed
    if (oldName !== newName) {
      await connection.query('UPDATE transactions SET category = ? WHERE category = ?', [newName, oldName]);
      await connection.query('UPDATE budgets SET category = ? WHERE category = ?', [newName, oldName]);
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
    const { startDate, endDate, type, category, search } = req.query;
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];

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
    const { date, type, category, amount, description } = req.body;
    if (!date || !type || !category || amount === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const [result] = await db.query(
      'INSERT INTO transactions (date, type, category, amount, description) VALUES (?, ?, ?, ?, ?)',
      [date, type, category, amount, description || '']
    );
    res.status(201).json({ id: result.insertId, date, type, category, amount, description });
  } catch (err) {
    handleError(res, err);
  }
});

// Add bulk transactions (useful for Excel Import)
app.post('/api/transactions/bulk', async (req, res) => {
  try {
    const transactions = req.body; // Expecting array of { date, type, category, amount, description }
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ error: 'Body must be a non-empty array of transactions' });
    }

    const values = [];
    for (const tx of transactions) {
      if (!tx.date || !tx.type || !tx.category || tx.amount === undefined) {
        return res.status(400).json({ error: 'Some transactions are missing required fields' });
      }
      values.push([tx.date, tx.type, tx.category, tx.amount, tx.description || '']);
    }

    const [result] = await db.query(
      'INSERT INTO transactions (date, type, category, amount, description) VALUES ?',
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
    const { id } = req.params;
    const { date, type, category, amount, description } = req.body;
    
    if (!date || !type || !category || amount === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await db.query(
      'UPDATE transactions SET date = ?, type = ?, category = ?, amount = ?, description = ? WHERE id = ?',
      [date, type, category, amount, description || '', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ id: parseInt(id), date, type, category, amount, description });
  } catch (err) {
    handleError(res, err);
  }
});

// Delete transaction
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM transactions WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
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
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ error: 'Month parameter (YYYY-MM) is required' });
    }
    const [rows] = await db.query('SELECT * FROM budgets WHERE month = ?', [month]);
    res.json(rows);
  } catch (err) {
    handleError(res, err);
  }
});

// Set / Update budget
app.post('/api/budgets', async (req, res) => {
  try {
    const { category, amount, month } = req.body;
    if (!category || amount === undefined || !month) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await db.query(
      `INSERT INTO budgets (category, amount, month) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE amount = ?`,
      [category, amount, month, amount]
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
    const { month } = req.query; // Expecting YYYY-MM
    if (!month) {
      return res.status(400).json({ error: 'Month parameter (YYYY-MM) is required' });
    }

    const startDate = `${month}-01`;
    const endDate = `${month}-31`; // MySQL will handle dates correctly or we can calculate properly

    // 1. Total income & expense
    const [totals] = await db.query(
      `SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as totalIncome,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as totalExpense
       FROM transactions 
       WHERE date >= ? AND date <= LAST_DAY(?)`,
      [startDate, startDate]
    );

    // 2. Category breakdown for expenses
    const [categoryBreakdown] = await db.query(
      `SELECT category, SUM(amount) as amount, '#6B7280' as color
       FROM transactions 
       WHERE date >= ? AND date <= LAST_DAY(?) AND type = 'expense'
       GROUP BY category`,
      [startDate, startDate]
    );

    // Fetch categories to map colors
    const [dbCategories] = await db.query('SELECT name, color FROM categories WHERE type = "expense"');
    const colorMap = {};
    dbCategories.forEach(c => {
      colorMap[c.name] = c.color;
    });

    const breakdownWithColors = categoryBreakdown.map(item => ({
      ...item,
      color: colorMap[item.category] || '#6B7280'
    }));

    // 3. Budgets comparison
    const [budgets] = await db.query('SELECT category, amount FROM budgets WHERE month = ?', [month]);
    
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
    
    // Attempt column alteration in case it was created as INT earlier
    try {
      await db.query('ALTER TABLE investments MODIFY COLUMN shares DECIMAL(16, 7) NOT NULL');
      console.log("Investments shares column verified as DECIMAL(16,7).");
    } catch (err) {
      console.log("Table columns verified.");
    }

    // Alter ENUM type if it was created with BUY/SELL only earlier
    try {
      await db.query("ALTER TABLE investments MODIFY COLUMN type ENUM('BUY', 'SELL', 'DEPOSIT', 'WITHDRAW') NOT NULL");
      console.log("Investments type column updated with DEPOSIT/WITHDRAW support.");
    } catch (err) {
      console.log("ENUM columns verified.");
    }

    // Alter price column precision to support high-precision foreign exchange rates and stock prices
    try {
      await db.query('ALTER TABLE investments MODIFY COLUMN price DECIMAL(16, 6) NOT NULL');
      await db.query('ALTER TABLE stock_prices MODIFY COLUMN current_price DECIMAL(16, 6) NOT NULL');
      console.log("Investments price columns verified as DECIMAL(16,6).");
    } catch (err) {
      console.log("Price columns verified.");
    }

    console.log("Investments tables checked/created successfully.");
  } catch (err) {
    console.error("Error creating investments tables:", err);
  }
}
initTables();

// Get all investment transactions
app.get('/api/investments', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM investments ORDER BY date DESC, id DESC');
    res.json(rows);
  } catch (err) {
    handleError(res, err);
  }
});

// Add investment transaction
app.post('/api/investments', async (req, res) => {
  try {
    const { date, symbol, type, shares, price, commission, notes } = req.body;
    if (!date || !symbol || !type || shares === undefined || shares === null || price === undefined || price === null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const cleanSymbol = symbol.toUpperCase().trim();
    const [result] = await db.query(
      'INSERT INTO investments (date, symbol, type, shares, price, commission, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [date, cleanSymbol, type, parseFloat(shares), parseFloat(price), parseFloat(commission || 0), notes || '']
    );
    
    // Also insert stock price default if not exists
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
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM investments WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ message: 'Deleted successfully', id: parseInt(id) });
  } catch (err) {
    handleError(res, err);
  }
});

// Delete all transactions of a specific stock symbol (delete holding)
app.delete('/api/investments/symbol/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const cleanSymbol = symbol.toUpperCase().trim();
    await db.query('DELETE FROM investments WHERE symbol = ?', [cleanSymbol]);
    await db.query('DELETE FROM stock_prices WHERE symbol = ?', [cleanSymbol]);
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
    // 1. Fetch all transactions and current prices
    const [txs] = await db.query('SELECT * FROM investments ORDER BY date ASC, id ASC');
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
