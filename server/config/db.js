import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create database file
const dbPath = join(__dirname, '..', 'construction_erp.db');

// Initialize SQLite database
const sqliteDb = new Database(dbPath);

// Enable foreign keys
sqliteDb.pragma('foreign_keys = ON');

console.log('✅ Connected to SQLite database');

// Create tables
const schema = `
-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'User' CHECK (role IN ('Admin', 'Manager', 'User')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    budget REAL NOT NULL,
    spent REAL DEFAULT 0.00,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'On Hold', 'Cancelled')),
    start_date DATE,
    end_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Overdue', 'Cancelled')),
    due_date DATE NOT NULL,
    paid_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Accounts Table (Chart of Accounts)
CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('Asset', 'Liability', 'Revenue', 'Expense', 'Equity')),
    balance REAL DEFAULT 0.00,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table (Double-entry bookkeeping)
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('Debit', 'Credit')),
    amount REAL NOT NULL,
    description TEXT,
    reference_id INTEGER,
    reference_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_project ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference_id, reference_type);
`;

// Execute schema
sqliteDb.exec(schema);

// Insert default accounts
const insertAccounts = sqliteDb.prepare(`
  INSERT OR IGNORE INTO accounts (account_name, account_type, balance, description) 
  VALUES (?, ?, ?, ?)
`);

const defaultAccounts = [
    ['Cash', 'Asset', 0.00, 'Cash on hand and in bank'],
    ['Accounts Receivable', 'Asset', 0.00, 'Money owed by clients'],
    ['Equipment', 'Asset', 0.00, 'Construction equipment and machinery'],
    ['Accounts Payable', 'Liability', 0.00, 'Money owed to suppliers'],
    ['Revenue', 'Revenue', 0.00, 'Income from projects'],
    ['Labor Expense', 'Expense', 0.00, 'Wages and salaries'],
    ['Materials Expense', 'Expense', 0.00, 'Construction materials cost'],
    ['Equipment Expense', 'Expense', 0.00, 'Equipment rental and maintenance']
];

defaultAccounts.forEach(account => {
    try {
        insertAccounts.run(...account);
    } catch (err) {
        // Account already exists, ignore
    }
});

console.log('✅ Database schema initialized');

// Helper function to convert PostgreSQL placeholders to SQLite
const convertPlaceholders = (sql) => {
    // Replace $1, $2, etc. with ?
    return sql.replace(/\$\d+/g, '?');
};

// Helper function to run queries (mimics pg pool.query)
export const query = (sql, params = []) => {
    try {
        // Convert PostgreSQL placeholders to SQLite
        const convertedSql = convertPlaceholders(sql);

        const upperSql = convertedSql.trim().toUpperCase();

        if (upperSql.startsWith('SELECT')) {
            const stmt = sqliteDb.prepare(convertedSql);
            const rows = stmt.all(...params);
            return { rows };
        } else if (upperSql.startsWith('INSERT')) {
            // Handle RETURNING clause
            if (upperSql.includes('RETURNING')) {
                // Split the query to handle RETURNING
                const parts = convertedSql.split(/RETURNING/i);
                const insertSql = parts[0].trim();

                const stmt = sqliteDb.prepare(insertSql);
                const info = stmt.run(...params);

                // Get the inserted row
                const lastId = info.lastInsertRowid;
                const tableName = insertSql.match(/INSERT INTO (\w+)/i)[1];
                const selectStmt = sqliteDb.prepare(`SELECT * FROM ${tableName} WHERE id = ?`);
                const rows = selectStmt.all(lastId);
                return { rows };
            } else {
                const stmt = sqliteDb.prepare(convertedSql);
                const info = stmt.run(...params);
                return { rows: [{ id: info.lastInsertRowid }] };
            }
        } else if (upperSql.startsWith('UPDATE')) {
            // Handle RETURNING clause for UPDATE
            if (upperSql.includes('RETURNING')) {
                const parts = convertedSql.split(/RETURNING/i);
                const updateSql = parts[0].trim();

                const stmt = sqliteDb.prepare(updateSql);
                const info = stmt.run(...params);

                // Extract table name and WHERE clause to get updated row
                const match = updateSql.match(/UPDATE (\w+).*WHERE\s+(\w+)\s*=\s*\?/i);
                if (match) {
                    const tableName = match[1];
                    const idColumn = match[2];
                    const idValue = params[params.length - 1]; // Last parameter is usually the ID

                    const selectStmt = sqliteDb.prepare(`SELECT * FROM ${tableName} WHERE ${idColumn} = ?`);
                    const rows = selectStmt.all(idValue);
                    return { rows };
                }
                return { rows: [] };
            } else {
                const stmt = sqliteDb.prepare(convertedSql);
                const info = stmt.run(...params);
                return { rows: [{ changes: info.changes }] };
            }
        } else if (upperSql.startsWith('DELETE')) {
            if (upperSql.includes('RETURNING')) {
                // For DELETE with RETURNING, we need to get the row first
                const match = convertedSql.match(/DELETE FROM (\w+) WHERE (\w+) = \?/i);
                if (match) {
                    const tableName = match[1];
                    const idColumn = match[2];

                    // Get the row before deleting
                    const selectStmt = sqliteDb.prepare(`SELECT * FROM ${tableName} WHERE ${idColumn} = ?`);
                    const rows = selectStmt.all(...params);

                    // Now delete
                    const deleteStmt = sqliteDb.prepare(`DELETE FROM ${tableName} WHERE ${idColumn} = ?`);
                    deleteStmt.run(...params);

                    return { rows };
                }
            }
            const stmt = sqliteDb.prepare(convertedSql);
            const info = stmt.run(...params);
            return { rows: [{ changes: info.changes }] };
        } else {
            const stmt = sqliteDb.prepare(convertedSql);
            const info = stmt.run(...params);
            return { rows: [{ changes: info.changes }] };
        }
    } catch (error) {
        console.error('Database query error:', error);
        console.error('SQL:', sql);
        console.error('Params:', params);
        throw error;
    }
};

// Transaction support (simplified for SQLite)
export const getClient = () => {
    return {
        query,
        release: () => { },
    };
};

export default { query, getClient };
