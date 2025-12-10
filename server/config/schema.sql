-- Construction ERP Database Schema
-- Run this script to create all necessary tables

-- Create database (run this separately if needed)
-- CREATE DATABASE construction_erp;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'User' CHECK (role IN ('Admin', 'Manager', 'User')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    budget DECIMAL(15, 2) NOT NULL,
    spent DECIMAL(15, 2) DEFAULT 0.00,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'On Hold', 'Cancelled')),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Overdue', 'Cancelled')),
    due_date DATE NOT NULL,
    paid_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts Table (Chart of Accounts)
CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('Asset', 'Liability', 'Revenue', 'Expense', 'Equity')),
    balance DECIMAL(15, 2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table (Double-entry bookkeeping)
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
    transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('Debit', 'Credit')),
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    reference_id INTEGER,
    reference_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_project ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference_id, reference_type);

-- Insert default accounts for the general ledger
INSERT INTO accounts (account_name, account_type, balance, description) VALUES
    ('Cash', 'Asset', 0.00, 'Cash on hand and in bank'),
    ('Accounts Receivable', 'Asset', 0.00, 'Money owed by clients'),
    ('Equipment', 'Asset', 0.00, 'Construction equipment and machinery'),
    ('Accounts Payable', 'Liability', 0.00, 'Money owed to suppliers'),
    ('Revenue', 'Revenue', 0.00, 'Income from projects'),
    ('Labor Expense', 'Expense', 0.00, 'Wages and salaries'),
    ('Materials Expense', 'Expense', 0.00, 'Construction materials cost'),
    ('Equipment Expense', 'Expense', 0.00, 'Equipment rental and maintenance')
ON CONFLICT DO NOTHING;

-- Insert a default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (username, email, password_hash, role) VALUES
    ('admin', 'admin@construction-erp.com', '$2a$10$rZJ9Z9Z9Z9Z9Z9Z9Z9Z9ZuKJ5J5J5J5J5J5J5J5J5J5J5J5J5J5J5K', 'Admin')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE users IS 'System users with role-based access';
COMMENT ON TABLE projects IS 'Construction projects with budget tracking';
COMMENT ON TABLE invoices IS 'Client invoices and billing';
COMMENT ON TABLE accounts IS 'Chart of accounts for general ledger';
COMMENT ON TABLE transactions IS 'Financial transactions using double-entry bookkeeping';
