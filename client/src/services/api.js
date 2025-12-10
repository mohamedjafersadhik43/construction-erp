import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getCurrentUser: () => api.get('/auth/me'),
};

// Projects API
export const projectsAPI = {
    getAll: (params) => api.get('/projects', { params }),
    getById: (id) => api.get(`/projects/${id}`),
    create: (projectData) => api.post('/projects', projectData),
    update: (id, projectData) => api.put(`/projects/${id}`, projectData),
    delete: (id) => api.delete(`/projects/${id}`),
};

// Finance API
export const financeAPI = {
    // Invoices
    getInvoices: (params) => api.get('/finance/invoices', { params }),
    createInvoice: (invoiceData) => api.post('/finance/invoices', invoiceData),
    updateInvoiceStatus: (id, status) => api.put(`/finance/invoices/${id}`, { status }),

    // Accounts
    getAccounts: () => api.get('/finance/accounts'),

    // Transactions
    getTransactions: (params) => api.get('/finance/transactions', { params }),
};

// Insights API
export const insightsAPI = {
    getDashboardStats: () => api.get('/insights/dashboard'),
    getProjectRisk: (projectId) => api.get(`/insights/risk/${projectId}`),
    getFinancialSummary: () => api.get('/insights/financial-summary'),
};

export default api;
