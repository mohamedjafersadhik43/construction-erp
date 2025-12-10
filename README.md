# Construction Mini ERP & Finance System

A full-stack Enterprise Resource Planning (ERP) system for the construction industry with project management, financial tracking, and AI-driven risk insights.

🔗 **Live Demo**: [Add your Vercel URL here]

## 🌟 Features

- **User Authentication** - JWT-based auth with role-based access control
- **Project Management** - Track budgets, progress, and timelines
- **Financial Module** - Invoice management with double-entry bookkeeping
- **AI Risk Analysis** - Logic-based risk calculation for projects
- **Dashboard Analytics** - Real-time statistics with Chart.js visualizations

## 🚀 Tech Stack

**Frontend:**
- React.js with Vite
- React Router
- Axios
- Chart.js
- Modern CSS with Glassmorphism

**Backend:**
- Node.js & Express.js
- SQLite (better-sqlite3)
- JWT Authentication
- bcrypt for password hashing

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm

### Local Development

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd construction-erp
```

2. **Install Backend Dependencies**
```bash
cd server
npm install
```

3. **Configure Backend Environment**
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env and set your JWT_SECRET
```

4. **Install Frontend Dependencies**
```bash
cd ../client
npm install
```

5. **Start Development Servers**

Backend:
```bash
cd server
npm start
```

Frontend:
```bash
cd client
npm run dev
```

6. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## 🔐 Default Credentials

Register a new user through the application interface. The first user you create can be set as Admin.

## 📁 Project Structure

```
construction-erp/
├── server/          # Backend (Node.js + Express)
│   ├── config/      # Database configuration
│   ├── controllers/ # Business logic
│   ├── middleware/  # Auth middleware
│   └── routes/      # API routes
├── client/          # Frontend (React + Vite)
│   └── src/
│       ├── components/  # Reusable components
│       ├── pages/       # Page components
│       ├── services/    # API services
│       └── context/     # React context
└── README.md
```

## 🌐 Deployment

### Backend (Vercel)
The backend is configured for Vercel deployment with serverless functions.

### Frontend (Vercel)
The frontend is built with Vite and optimized for Vercel deployment.

## 📝 API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `GET /api/finance/invoices` - Get invoices
- `POST /api/finance/invoices` - Create invoice
- `GET /api/insights/dashboard` - Get dashboard stats
- `GET /api/insights/risk/:id` - Calculate project risk

## 🎨 Features Showcase

- Modern dark theme with glassmorphism effects
- Responsive design for all devices
- Real-time data visualization
- AI-powered risk assessment
- Double-entry bookkeeping system

## 📄 License

This project is for educational purposes.

## 👨‍💻 Author

Created as part of the Devopod Assignment

---

**Built with ❤️ for Construction Industry Management**
