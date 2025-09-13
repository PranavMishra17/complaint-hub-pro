# Deployment Guide - Vercel

## 🚀 Quick Deployment Steps

### **Prerequisites**
- GitHub repository with your code
- Vercel account (free tier works)
- Supabase production database

### **1. Push to GitHub**
```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

### **2. Deploy Frontend**

#### Via Vercel Dashboard:
1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. **Framework**: Vite
4. **Root Directory**: `frontend`
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`

#### Environment Variables (Frontend):
```
VITE_API_URL=https://your-backend-url.vercel.app/api
```

### **3. Deploy Backend**

#### Via Vercel Dashboard:
1. **New Project** → Same GitHub repo
2. **Framework**: Other
3. **Root Directory**: `backend`
4. **Build Command**: `npm run vercel-build`
5. **Output Directory**: `dist`

#### Environment Variables (Backend):
```
NODE_ENV=production
JWT_SECRET=your-production-jwt-secret-256-bits
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_KEY=your-production-service-key
```

### **4. Update Frontend Environment**
After backend deployment, update frontend's `VITE_API_URL` to point to your backend Vercel URL.

### **5. Test Deployment**
```bash
# Test backend health
curl https://your-backend.vercel.app/health

# Test frontend
open https://your-frontend.vercel.app
```

## 🔧 **GitHub Actions Deployment (Automated)**

### **Setup Secrets in GitHub**
Go to your repo → **Settings** → **Secrets and Variables** → **Actions**

Add these secrets:
```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID_FRONTEND=frontend-project-id
VERCEL_PROJECT_ID_BACKEND=backend-project-id
VITE_API_URL=https://your-backend.vercel.app/api
```

### **Get Vercel Credentials**
```bash
# Install Vercel CLI
npm i -g vercel

# Login and get credentials
vercel login
vercel link  # In your project directories
```

From `.vercel/project.json`:
- **projectId** → `VERCEL_PROJECT_ID_FRONTEND/BACKEND`
- **orgId** → `VERCEL_ORG_ID`

From Vercel Dashboard → **Settings** → **Tokens**:
- **Token** → `VERCEL_TOKEN`

### **Automatic Deployment**
Once secrets are configured, every push to `main` branch will auto-deploy both frontend and backend.

## 🔄 **Alternative: Railway Backend**

If Vercel backend has issues, deploy backend to Railway:

### **Railway Setup**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### **Environment Variables (Railway)**
```
NODE_ENV=production
PORT=3001
JWT_SECRET=your-production-jwt-secret
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

## 📋 **Production Checklist**

### **Security**
- [ ] Strong JWT secret (256+ bits)
- [ ] Production Supabase credentials
- [ ] CORS configured for production domains
- [ ] Rate limiting enabled
- [ ] Environment variables secured

### **Database**
- [ ] Production Supabase project
- [ ] Tables created with schema
- [ ] Admin users created
- [ ] RLS policies configured (if needed)

### **Testing**
- [ ] Health endpoint responds
- [ ] Complaint submission works
- [ ] Admin login functional
- [ ] API endpoints accessible
- [ ] Frontend connects to backend

### **Domain Setup**
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] DNS records pointing to Vercel

## 🐛 **Common Issues & Solutions**

### **Backend 500 Errors**
- Check environment variables are set
- Verify Supabase credentials
- Check build logs in Vercel dashboard

### **CORS Errors**
- Add your frontend domain to backend CORS config
- Verify API URL in frontend env

### **Build Failures**
```bash
# Test locally first
cd backend && npm run build
cd frontend && npm run build
```

### **Environment Variables**
- Use Vercel dashboard to set environment variables
- Don't commit `.env` files to Git
- Use `@variable-name` format in vercel.json

## 💡 **Pro Tips**

1. **Monorepo Structure**: Keep frontend/backend in same repo for easier management
2. **Preview Deployments**: Vercel creates preview deployments for PRs
3. **Analytics**: Enable Vercel Analytics for usage insights
4. **Custom Domains**: Free with Vercel Pro plan
5. **Edge Functions**: Consider Vercel Edge Functions for better performance

## 🔗 **Useful Links**
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Supabase Production Setup](https://supabase.com/docs/guides/platform)
- [GitHub Actions for Vercel](https://github.com/amondnet/vercel-action)