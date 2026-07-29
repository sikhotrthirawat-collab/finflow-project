SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS finance_db;
USE finance_db;

-- 1. Table for categories (Optional but helpful, we can start with predefined list or dynamic database categories)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    color VARCHAR(7) NOT NULL, -- Hex color code e.g. '#FF5733'
    icon VARCHAR(30) NOT NULL,  -- FontAwesome or custom icon name
    UNIQUE KEY `name_type` (`name`, `type`)
);

-- 2. Table for transactions
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table for budgets
CREATE TABLE IF NOT EXISTS budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    month VARCHAR(7) NOT NULL, -- Format 'YYYY-MM'
    UNIQUE KEY `category_month` (`category`, `month`)
);

-- Insert Default Categories
INSERT INTO categories (name, type, color, icon) VALUES
-- Income
('เงินเดือน', 'income', '#10B981', 'salary'),
('ฟรีแลนซ์/งานเสริม', 'income', '#3B82F6', 'freelance'),
('การลงทุน/ปันผล', 'income', '#8B5CF6', 'investment'),
('อื่นๆ (รายรับ)', 'income', '#6B7280', 'other-income'),
-- Expense
('อาหารและเครื่องดื่ม', 'expense', '#EF4444', 'food'),
('เดินทาง/น้ำมัน', 'expense', '#F59E0B', 'transport'),
('ช้อปปิ้ง', 'expense', '#EC4899', 'shopping'),
('ที่อยู่อาศัย/ค่าเช่า', 'expense', '#3B82F6', 'housing'),
('สาธารณูปโภค (น้ำ/ไฟ/เน็ต)', 'expense', '#06B6D4', 'utilities'),
('สุขภาพและยารักษาโรค', 'expense', '#14B8A6', 'health'),
('ความบันเทิง/พักผ่อน', 'expense', '#8B5CF6', 'entertainment'),
('อื่นๆ (รายจ่าย)', 'expense', '#6B7280', 'other-expense')
ON DUPLICATE KEY UPDATE name=name;

-- Insert Seed Data for Transactions
INSERT INTO transactions (date, type, category, amount, description) VALUES
('2026-07-01', 'income', 'เงินเดือน', 45000.00, 'เงินเดือนประจำเดือนกรกฎาคม'),
('2026-07-02', 'expense', 'ที่อยู่อาศัย/ค่าเช่า', 8500.00, 'ค่าเช่าคอนโด'),
('2026-07-03', 'expense', 'อาหารและเครื่องดื่ม', 350.00, 'มื้อกลางวันร้านส้มตำ'),
('2026-07-05', 'expense', 'สาธารณูปโภค (น้ำ/ไฟ/เน็ต)', 1200.00, 'ค่าเน็ตและค่าไฟ'),
('2026-07-07', 'income', 'ฟรีแลนซ์/งานเสริม', 8500.00, 'ออกแบบโลโก้ให้ลูกค้า'),
('2026-07-10', 'expense', 'ช้อปปิ้ง', 1990.00, 'ซื้อรองเท้าวิ่งใหม่'),
('2026-07-12', 'expense', 'เดินทาง/น้ำมัน', 800.00, 'เติมน้ำมันรถยนต์'),
('2026-07-15', 'expense', 'อาหารและเครื่องดื่ม', 1200.00, 'บุฟเฟต์ปิ้งย่างกับครอบครัว'),
('2026-07-20', 'expense', 'สุขภาพและยารักษาโรค', 450.00, 'ซื้อยาแก้แพ้และวิตามิน'),
('2026-07-22', 'income', 'การลงทุน/ปันผล', 1500.00, 'เงินปันผลหุ้นกู้'),
('2026-07-25', 'expense', 'ความบันเทิง/พักผ่อน', 240.00, 'ตั๋วหนังและป๊อปคอร์น');

-- Insert Seed Data for Budgets
INSERT INTO budgets (category, amount, month) VALUES
('อาหารและเครื่องดื่ม', 10000.00, '2026-07'),
('เดินทาง/น้ำมัน', 4000.00, '2026-07'),
('ช้อปปิ้ง', 5000.00, '2026-07'),
('ความบันเทิง/พักผ่อน', 3000.00, '2026-07'),
('สาธารณูปโภค (น้ำ/ไฟ/เน็ต)', 2000.00, '2026-07');
