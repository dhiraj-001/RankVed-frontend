# 🚀 Frontend Deployment Guide

## Complete Standalone React Frontend

Your frontend is now completely separated and ready for deployment to any hosting platform.

### 📁 Project Structure

```
frontend/
├── src/
│   ├── components/       # UI components
│   ├── contexts/         # React contexts
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilities & config
│   ├── pages/           # Page components
│   ├── types/           # TypeScript types
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── package.json         # Dependencies
├── vite.config.ts       # Build config
└── .env                 # Environment variables
```

### 🔧 Environment Setup

1. **Copy environment variables**:
   ```bash
   cp .env.example .env
   ```

2. **Update API URL**:
   ```env
   VITE_API_URL=https://your-backend-url.com
   ```

### 🌐 Deployment Options

#### Option 1: Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/rankved-frontend.git
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import GitHub repository
   - Configure:
     - **Framework**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Environment Variables**: Add `VITE_API_URL`

#### Option 2: Deploy to Netlify

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy**:
   - Drag `dist` folder to [netlify.com](https://netlify.com)
   - Or connect GitHub for automatic deployments

### 🔗 Backend Connection

The frontend connects to your backend via the `VITE_API_URL` environment variable.

#### Backend Options:

**Option A: Keep Backend on Replit**
- Set `VITE_API_URL=https://your-replit-project.replit.app`
- Enable "Always On" in Replit

**Option B: Deploy Backend Separately**
- Deploy to Railway, Render, or similar
- Update `VITE_API_URL` to new backend URL

### 🛠 CORS Configuration

Update your backend to allow requests from your frontend domain:

```javascript
// In your backend (server/index.ts)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://your-frontend-domain.com');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
```

### ✅ Testing

1. **Test locally**:
   ```bash
   npm run dev
   ```

2. **Test production build**:
   ```bash
   npm run build
   npm run preview
   ```

3. **Verify API connections**:
   - Check dashboard loads
   - Test chatbot creation
   - Verify lead collection

### 📋 Checklist

- [ ] Frontend builds successfully
- [ ] Environment variables configured
- [ ] Backend CORS configured
- [ ] API endpoints working
- [ ] Authentication working
- [ ] File uploads working
- [ ] Webhooks configured (if needed)

### 🚨 Troubleshooting

**Build Errors**:
- Check TypeScript errors
- Verify all imports are correct
- Ensure environment variables are set

**API Connection Issues**:
- Verify `VITE_API_URL` is correct
- Check backend CORS settings
- Verify backend is running and accessible

**Authentication Problems**:
- Check cookie settings
- Verify session configuration
- Ensure credentials are included in requests

### 📦 What's Included

- ✅ Complete React frontend
- ✅ TypeScript configuration
- ✅ Tailwind CSS styling
- ✅ API client with environment variable support
- ✅ All UI components
- ✅ Form handling with validation
- ✅ Data fetching with React Query
- ✅ Responsive design
- ✅ Production build optimization