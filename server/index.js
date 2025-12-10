import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import insightRoutes from './routes/insightRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for now
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/insights', insightRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Construction ERP API is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Construction Mini ERP API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            projects: '/api/projects',
            finance: '/api/finance',
            insights: '/api/insights'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log('='.repeat(50));
        console.log('🏗️  Construction Mini ERP Server');
        console.log('='.repeat(50));
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 API Base: http://localhost:${PORT}/api`);
        console.log('='.repeat(50));
        console.log('Available endpoints:');
        console.log('  - POST   /api/auth/register');
        console.log('  - POST   /api/auth/login');
        console.log('  - GET    /api/projects');
        console.log('  - POST   /api/projects');
        console.log('  - GET    /api/finance/invoices');
        console.log('  - POST   /api/finance/invoices');
        console.log('  - GET    /api/insights/dashboard');
        console.log('  - GET    /api/insights/risk/:id');
        console.log('='.repeat(50));
    });
}

export default app;
