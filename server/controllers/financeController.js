import db from '../config/db.js';

// Create new invoice
export const createInvoice = async (req, res) => {
    const { project_id, invoice_number, client_name, amount, due_date } = req.body;

    try {
        // Validate input
        if (!invoice_number || !client_name || !amount || !due_date) {
            return res.status(400).json({ error: 'All invoice fields are required.' });
        }

        // Create invoice
        const invoiceResult = await db.query(
            `INSERT INTO invoices (project_id, invoice_number, client_name, amount, due_date) 
       VALUES (?, ?, ?, ?, ?) 
       RETURNING *`,
            [project_id, invoice_number, client_name, amount, due_date]
        );

        const invoice = invoiceResult.rows[0];

        // Update Accounts Receivable (increase asset)
        const arAccount = await db.query(
            `SELECT id FROM accounts WHERE account_name = 'Accounts Receivable' LIMIT 1`
        );

        if (arAccount.rows.length > 0) {
            const accountId = arAccount.rows[0].id;

            // Debit Accounts Receivable (increase asset)
            await db.query(
                `INSERT INTO transactions (account_id, transaction_type, amount, description, reference_id, reference_type)
         VALUES (?, 'Debit', ?, ?, ?, 'Invoice')`,
                [accountId, amount, `Invoice ${invoice_number} for ${client_name}`, invoice.id]
            );

            // Update account balance
            await db.query(
                `UPDATE accounts SET balance = balance + ? WHERE id = ?`,
                [amount, accountId]
            );

            // Credit Revenue (increase revenue)
            const revenueAccount = await db.query(
                `SELECT id FROM accounts WHERE account_name = 'Revenue' LIMIT 1`
            );

            if (revenueAccount.rows.length > 0) {
                const revenueId = revenueAccount.rows[0].id;

                await db.query(
                    `INSERT INTO transactions (account_id, transaction_type, amount, description, reference_id, reference_type)
           VALUES (?, 'Credit', ?, ?, ?, 'Invoice')`,
                    [revenueId, amount, `Revenue from Invoice ${invoice_number}`, invoice.id]
                );

                await db.query(
                    `UPDATE accounts SET balance = balance + ? WHERE id = ?`,
                    [amount, revenueId]
                );
            }
        }

        res.status(201).json({
            message: 'Invoice created successfully',
            invoice
        });
    } catch (error) {
        console.error('Create invoice error:', error);
        res.status(500).json({ error: 'Server error creating invoice.' });
    }
};

// Get all invoices
export const getInvoices = async (req, res) => {
    try {
        const { status, project_id } = req.query;

        let query = `
      SELECT i.*, p.name as project_name 
      FROM invoices i 
      LEFT JOIN projects p ON i.project_id = p.id
      WHERE 1=1
    `;
        let params = [];

        if (status) {
            query += ` AND i.status = ?`;
            params.push(status);
        }

        if (project_id) {
            query += ` AND i.project_id = ?`;
            params.push(project_id);
        }

        query += ' ORDER BY i.created_at DESC';

        const result = await db.query(query, params);

        res.json({
            count: result.rows.length,
            invoices: result.rows
        });
    } catch (error) {
        console.error('Get invoices error:', error);
        res.status(500).json({ error: 'Server error fetching invoices.' });
    }
};

// Update invoice status (e.g., mark as paid)
export const updateInvoiceStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        // Get invoice details
        const invoiceResult = await db.query('SELECT * FROM invoices WHERE id = ?', [id]);

        if (invoiceResult.rows.length === 0) {
            return res.status(404).json({ error: 'Invoice not found.' });
        }

        const invoice = invoiceResult.rows[0];

        // Update invoice status
        const updateResult = await db.query(
            `UPDATE invoices 
       SET status = ?, 
           paid_date = CASE WHEN ? = 'Paid' THEN date('now') ELSE paid_date END
       WHERE id = ?
       RETURNING *`,
            [status, status, id]
        );

        // If marking as paid, update accounts
        if (status === 'Paid' && invoice.status !== 'Paid') {
            // Get Cash and Accounts Receivable accounts
            const cashAccount = await db.query(
                `SELECT id FROM accounts WHERE account_name = 'Cash' LIMIT 1`
            );
            const arAccount = await db.query(
                `SELECT id FROM accounts WHERE account_name = 'Accounts Receivable' LIMIT 1`
            );

            if (cashAccount.rows.length > 0 && arAccount.rows.length > 0) {
                const cashId = cashAccount.rows[0].id;
                const arId = arAccount.rows[0].id;

                // Debit Cash (increase asset)
                await db.query(
                    `INSERT INTO transactions (account_id, transaction_type, amount, description, reference_id, reference_type)
           VALUES (?, 'Debit', ?, ?, ?, 'Payment')`,
                    [cashId, invoice.amount, `Payment received for Invoice ${invoice.invoice_number}`, id]
                );

                await db.query(
                    `UPDATE accounts SET balance = balance + ? WHERE id = ?`,
                    [invoice.amount, cashId]
                );

                // Credit Accounts Receivable (decrease asset)
                await db.query(
                    `INSERT INTO transactions (account_id, transaction_type, amount, description, reference_id, reference_type)
           VALUES (?, 'Credit', ?, ?, ?, 'Payment')`,
                    [arId, invoice.amount, `Payment received for Invoice ${invoice.invoice_number}`, id]
                );

                await db.query(
                    `UPDATE accounts SET balance = balance - ? WHERE id = ?`,
                    [invoice.amount, arId]
                );
            }
        }

        res.json({
            message: 'Invoice status updated successfully',
            invoice: updateResult.rows[0]
        });
    } catch (error) {
        console.error('Update invoice error:', error);
        res.status(500).json({ error: 'Server error updating invoice.' });
    }
};

// Get all accounts (Chart of Accounts)
export const getAccounts = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM accounts ORDER BY account_type, account_name');

        res.json({
            count: result.rows.length,
            accounts: result.rows
        });
    } catch (error) {
        console.error('Get accounts error:', error);
        res.status(500).json({ error: 'Server error fetching accounts.' });
    }
};

// Get all transactions
export const getTransactions = async (req, res) => {
    try {
        const { account_id, reference_type } = req.query;

        let query = `
      SELECT t.*, a.account_name, a.account_type 
      FROM transactions t 
      JOIN accounts a ON t.account_id = a.id
      WHERE 1=1
    `;
        let params = [];

        if (account_id) {
            query += ` AND t.account_id = ?`;
            params.push(account_id);
        }

        if (reference_type) {
            query += ` AND t.reference_type = ?`;
            params.push(reference_type);
        }

        query += ' ORDER BY t.created_at DESC LIMIT 100';

        const result = await db.query(query, params);

        res.json({
            count: result.rows.length,
            transactions: result.rows
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Server error fetching transactions.' });
    }
};

export default { createInvoice, getInvoices, updateInvoiceStatus, getAccounts, getTransactions };
