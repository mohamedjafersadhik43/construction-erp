import db from '../config/db.js';

// Calculate project risk using AI logic
export const calculateProjectRisk = async (req, res) => {
    const { id } = req.params;

    try {
        // Get project details
        const projectResult = await db.query('SELECT * FROM projects WHERE id = $1', [id]);

        if (projectResult.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        const project = projectResult.rows[0];

        let riskScore = 0;
        let riskFactors = [];

        // Factor 1: Budget Usage vs Progress
        const budgetUsedPercent = (parseFloat(project.spent) / parseFloat(project.budget)) * 100;
        const progress = parseInt(project.progress) || 0;

        if (budgetUsedPercent > progress + 30) {
            riskScore += 50;
            riskFactors.push({
                factor: 'Budget Overrun',
                severity: 'Critical',
                description: `Spent ${budgetUsedPercent.toFixed(1)}% of budget but only ${progress}% complete`
            });
        } else if (budgetUsedPercent > progress + 15) {
            riskScore += 30;
            riskFactors.push({
                factor: 'Budget Warning',
                severity: 'High',
                description: `Budget usage (${budgetUsedPercent.toFixed(1)}%) exceeds progress (${progress}%)`
            });
        } else if (budgetUsedPercent > progress + 5) {
            riskScore += 15;
            riskFactors.push({
                factor: 'Budget Concern',
                severity: 'Medium',
                description: `Budget usage slightly ahead of progress`
            });
        }

        // Factor 2: Timeline Analysis
        if (project.start_date && project.end_date) {
            const startDate = new Date(project.start_date);
            const endDate = new Date(project.end_date);
            const today = new Date();

            const totalDuration = endDate - startDate;
            const elapsedTime = today - startDate;
            const timeProgress = (elapsedTime / totalDuration) * 100;

            if (timeProgress > progress + 20) {
                riskScore += 30;
                riskFactors.push({
                    factor: 'Schedule Delay',
                    severity: 'High',
                    description: `${timeProgress.toFixed(1)}% of time elapsed but only ${progress}% complete`
                });
            } else if (timeProgress > progress + 10) {
                riskScore += 15;
                riskFactors.push({
                    factor: 'Schedule Risk',
                    severity: 'Medium',
                    description: `Project falling behind schedule`
                });
            }

            // Check if project is overdue
            if (today > endDate && project.status !== 'Completed') {
                riskScore += 40;
                riskFactors.push({
                    factor: 'Overdue Project',
                    severity: 'Critical',
                    description: `Project is past the deadline`
                });
            }
        }

        // Factor 3: Budget Remaining
        const remaining = parseFloat(project.budget) - parseFloat(project.spent);
        const remainingPercent = (remaining / parseFloat(project.budget)) * 100;

        if (remainingPercent < 10 && progress < 90) {
            riskScore += 25;
            riskFactors.push({
                factor: 'Low Budget Reserve',
                severity: 'High',
                description: `Only ${remainingPercent.toFixed(1)}% of budget remaining with ${100 - progress}% work left`
            });
        }

        // Determine risk level
        let riskLevel;
        if (riskScore >= 70) {
            riskLevel = 'Critical';
        } else if (riskScore >= 40) {
            riskLevel = 'High';
        } else if (riskScore >= 20) {
            riskLevel = 'Medium';
        } else {
            riskLevel = 'Low';
        }

        res.json({
            projectId: project.id,
            projectName: project.name,
            riskScore: Math.min(riskScore, 100), // Cap at 100
            riskLevel,
            riskFactors,
            projectMetrics: {
                budget: parseFloat(project.budget),
                spent: parseFloat(project.spent),
                remaining,
                budgetUsedPercent: budgetUsedPercent.toFixed(2),
                progress,
                status: project.status
            },
            recommendations: generateRecommendations(riskLevel, riskFactors)
        });
    } catch (error) {
        console.error('Calculate risk error:', error);
        res.status(500).json({ error: 'Server error calculating risk.' });
    }
};

// Generate recommendations based on risk factors
const generateRecommendations = (riskLevel, riskFactors) => {
    const recommendations = [];

    if (riskLevel === 'Critical' || riskLevel === 'High') {
        recommendations.push('Schedule immediate project review meeting');
        recommendations.push('Identify cost-saving opportunities');
        recommendations.push('Consider reallocating resources');
    }

    riskFactors.forEach(factor => {
        if (factor.factor.includes('Budget')) {
            recommendations.push('Review and optimize material costs');
            recommendations.push('Negotiate better rates with suppliers');
        }
        if (factor.factor.includes('Schedule')) {
            recommendations.push('Increase workforce or extend working hours');
            recommendations.push('Identify and remove project bottlenecks');
        }
    });

    if (recommendations.length === 0) {
        recommendations.push('Continue monitoring project metrics');
        recommendations.push('Maintain current project pace');
    }

    return [...new Set(recommendations)]; // Remove duplicates
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        // Get project statistics
        const projectStats = await db.query(`
      SELECT 
        COUNT(*) as total_projects,
        COUNT(*) FILTER (WHERE status = 'Active') as active_projects,
        COUNT(*) FILTER (WHERE status = 'Completed') as completed_projects,
        SUM(budget) as total_budget,
        SUM(spent) as total_spent,
        AVG(progress) as avg_progress
      FROM projects
    `);

        // Get financial statistics
        const financeStats = await db.query(`
      SELECT 
        COUNT(*) as total_invoices,
        COUNT(*) FILTER (WHERE status = 'Paid') as paid_invoices,
        COUNT(*) FILTER (WHERE status = 'Pending') as pending_invoices,
        COUNT(*) FILTER (WHERE status = 'Overdue') as overdue_invoices,
        SUM(amount) as total_revenue,
        SUM(amount) FILTER (WHERE status = 'Paid') as collected_revenue,
        SUM(amount) FILTER (WHERE status = 'Pending' OR status = 'Overdue') as outstanding_revenue
      FROM invoices
    `);

        // Get account balances
        const accountBalances = await db.query(`
      SELECT account_name, account_type, balance 
      FROM accounts 
      ORDER BY account_type, account_name
    `);

        // Calculate average risk across all active projects
        const activeProjects = await db.query(`
      SELECT id, budget, spent, progress 
      FROM projects 
      WHERE status = 'Active'
    `);

        let totalRisk = 0;
        let riskCount = 0;

        activeProjects.rows.forEach(project => {
            const budgetUsedPercent = (parseFloat(project.spent) / parseFloat(project.budget)) * 100;
            const progress = parseInt(project.progress) || 0;

            let projectRisk = 0;
            if (budgetUsedPercent > progress + 30) projectRisk = 50;
            else if (budgetUsedPercent > progress + 15) projectRisk = 30;
            else if (budgetUsedPercent > progress + 5) projectRisk = 15;

            totalRisk += projectRisk;
            riskCount++;
        });

        const avgRiskScore = riskCount > 0 ? totalRisk / riskCount : 0;

        // Get recent transactions
        const recentTransactions = await db.query(`
      SELECT t.*, a.account_name 
      FROM transactions t 
      JOIN accounts a ON t.account_id = a.id 
      ORDER BY t.created_at DESC 
      LIMIT 10
    `);

        res.json({
            projects: {
                total: parseInt(projectStats.rows[0].total_projects) || 0,
                active: parseInt(projectStats.rows[0].active_projects) || 0,
                completed: parseInt(projectStats.rows[0].completed_projects) || 0,
                totalBudget: parseFloat(projectStats.rows[0].total_budget) || 0,
                totalSpent: parseFloat(projectStats.rows[0].total_spent) || 0,
                avgProgress: parseFloat(projectStats.rows[0].avg_progress) || 0
            },
            finance: {
                totalInvoices: parseInt(financeStats.rows[0].total_invoices) || 0,
                paidInvoices: parseInt(financeStats.rows[0].paid_invoices) || 0,
                pendingInvoices: parseInt(financeStats.rows[0].pending_invoices) || 0,
                overdueInvoices: parseInt(financeStats.rows[0].overdue_invoices) || 0,
                totalRevenue: parseFloat(financeStats.rows[0].total_revenue) || 0,
                collectedRevenue: parseFloat(financeStats.rows[0].collected_revenue) || 0,
                outstandingRevenue: parseFloat(financeStats.rows[0].outstanding_revenue) || 0
            },
            accounts: accountBalances.rows,
            risk: {
                averageRiskScore: avgRiskScore.toFixed(2),
                riskLevel: avgRiskScore >= 40 ? 'High' : avgRiskScore >= 20 ? 'Medium' : 'Low'
            },
            recentTransactions: recentTransactions.rows
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ error: 'Server error fetching dashboard statistics.' });
    }
};

// Get financial summary (for reports)
export const getFinancialSummary = async (req, res) => {
    try {
        const summary = await db.query(`
      SELECT 
        account_type,
        SUM(balance) as total_balance
      FROM accounts
      GROUP BY account_type
      ORDER BY account_type
    `);

        const assets = summary.rows.find(r => r.account_type === 'Asset')?.total_balance || 0;
        const liabilities = summary.rows.find(r => r.account_type === 'Liability')?.total_balance || 0;
        const revenue = summary.rows.find(r => r.account_type === 'Revenue')?.total_balance || 0;
        const expenses = summary.rows.find(r => r.account_type === 'Expense')?.total_balance || 0;

        res.json({
            balanceSheet: {
                assets: parseFloat(assets),
                liabilities: parseFloat(liabilities),
                equity: parseFloat(assets) - parseFloat(liabilities)
            },
            incomeStatement: {
                revenue: parseFloat(revenue),
                expenses: parseFloat(expenses),
                netIncome: parseFloat(revenue) - parseFloat(expenses)
            },
            accountsByType: summary.rows
        });
    } catch (error) {
        console.error('Get financial summary error:', error);
        res.status(500).json({ error: 'Server error fetching financial summary.' });
    }
};

export default { calculateProjectRisk, getDashboardStats, getFinancialSummary };
