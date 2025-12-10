# Deployment Guide - GitHub & Vercel

## 📋 Prerequisites

1. **GitHub Account** - Create one at https://github.com
2. **Vercel Account** - Sign up at https://vercel.com (use GitHub login)
3. **Git Installed** - Download from https://git-scm.com

## 🔧 Step 1: Push to GitHub

### Initialize Git Repository

```bash
cd C:\Users\fshah\.gemini\antigravity\scratch\construction-erp

# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Construction ERP System"
```

### Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `construction-erp` (or your choice)
3. Description: "Construction Mini ERP & Finance System"
4. Keep it **Public** or **Private** (your choice)
5. **DO NOT** initialize with README (we already have one)
6. Click "Create repository"

### Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/construction-erp.git

# Push code
git branch -M main
git push -u origin main
```

## 🚀 Step 2: Deploy Backend to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. **Root Directory**: Select `server`
5. **Framework Preset**: Other
6. **Build Command**: Leave empty
7. **Output Directory**: Leave empty
8. **Install Command**: `npm install`

### Environment Variables (Important!)

Click "Environment Variables" and add:

```
JWT_SECRET=your_super_secret_jwt_key_production_12345
NODE_ENV=production
```

Click "Deploy"

### Get Backend URL

After deployment, you'll get a URL like:
```
https://construction-erp-server.vercel.app
```

**Save this URL!** You'll need it for the frontend.

## 🎨 Step 3: Deploy Frontend to Vercel

### Update Frontend Environment

Before deploying frontend, update the API URL:

1. Edit `client/.env`:
```env
VITE_API_URL=https://your-backend-url.vercel.app/api
```

2. Commit the change:
```bash
git add client/.env
git commit -m "Update API URL for production"
git push
```

### Deploy Frontend

1. Go to Vercel Dashboard
2. Click "Add New" → "Project"
3. Import the **same** GitHub repository
4. **Root Directory**: Select `client`
5. **Framework Preset**: Vite
6. **Build Command**: `npm run build`
7. **Output Directory**: `dist`
8. **Install Command**: `npm install`

### Environment Variables for Frontend

Add:
```
VITE_API_URL=https://your-backend-url.vercel.app/api
```

Click "Deploy"

## ✅ Step 4: Verify Deployment

### Test Backend

Visit: `https://your-backend-url.vercel.app/api/health`

You should see:
```json
{
  "status": "OK",
  "message": "Construction ERP API is running"
}
```

### Test Frontend

Visit: `https://your-frontend-url.vercel.app`

You should see the login page!

## 🔄 Step 5: Update README

Update your README.md with the live URLs:

```markdown
🔗 **Live Demo**: https://your-frontend-url.vercel.app
📡 **API**: https://your-backend-url.vercel.app/api
```

Commit and push:
```bash
git add README.md
git commit -m "Add live demo URLs"
git push
```

## 📝 Important Notes

### Database Persistence

⚠️ **Important**: Vercel's serverless functions are stateless. The SQLite database file will be reset on each deployment.

**For Production**, you should:

1. **Option A**: Use a cloud database service
   - Supabase (PostgreSQL)
   - PlanetScale (MySQL)
   - MongoDB Atlas

2. **Option B**: Use Vercel Postgres
   - Built-in PostgreSQL database
   - Easy integration

### Updating the Application

Whenever you make changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

Vercel will automatically redeploy!

## 🎯 Custom Domain (Optional)

1. Go to your Vercel project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## 🐛 Troubleshooting

### Backend Not Working

- Check Vercel logs in the dashboard
- Verify environment variables are set
- Check that `vercel.json` is in the server directory

### Frontend Not Connecting to Backend

- Verify `VITE_API_URL` is set correctly
- Check browser console for CORS errors
- Ensure backend URL includes `/api` at the end

### CORS Errors

The backend is configured to accept requests from any origin in production. If you have issues, check `server/index.js` CORS configuration.

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console (F12)
3. Verify all environment variables are set

---

**Deployment Complete!** 🎉

Your Construction ERP system is now live and accessible from anywhere!
