# 🚨 CRITICAL: DEPLOY BACKEND TO RAILWAY NOW

## Current Problem:
Your backend code is ready but **NOT DEPLOYED**. The frontend is trying to call API endpoints on itself, which returns HTML instead of JSON. That's why you get:
- ❌ 405 Method Not Allowed errors
- ❌ "API returned non-array data: <!DOCTYPE html>..."
- ❌ All signup, login, and product fetching fails

## Solution: Deploy Backend as Separate Railway Service

### Step 1: Go to Railway Dashboard
1. Open https://railway.app/dashboard
2. Find your project (or create new one)

### Step 2: Add Backend Service
1. Click "New Service" or "+ New"
2. Select "GitHub Repo"
3. Choose your repository
4. **CRITICAL**: After selecting repo, click "Settings" → "Service Settings"
5. Set **Root Directory** to: `back-end`
6. Save settings

### Step 3: Add Environment Variables
In the backend service settings, add these variables:

```
DATABASE_URL=postgresql://postgres:IjRtTekDXrXTIIWjaVbpOoNxeEgLYTlK@centerbeam.proxy.rlwy.net:47288/railway

JWT_SECRET=f6f728d826e60fc03af58a59814eb416500154fb878546312d2fb08c843adc6c6f674e89f673a96e356a5ac807873794e1842126fd72be9a618565db82203f63

GEMINI_API_KEY=AIzaSyD0DmaVDl3o-yYPjYBLJ3fU7ipnq7M2OvA
```

**DO NOT add PORT** - Railway sets this automatically

### Step 4: Deploy
1. Click "Deploy"
2. Wait for deployment to complete (watch the logs)
3. Railway will give you a URL like:
   - `https://back-end-production-xxxx.up.railway.net`
   - Or you can set custom domain like `https://glamora-api.up.railway.app`

### Step 5: Test Backend
Open these URLs in your browser to verify backend is working:

1. Health check: `https://your-backend-url/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

2. Products: `https://your-backend-url/products`
   - Should return: `[]` or array of products

If you see HTML instead of JSON, the backend is NOT deployed correctly.

### Step 6: Update Frontend .env
Once backend is deployed and working, update `front-end/.env`:

```env
VITE_API_URL=https://your-actual-backend-url-from-railway
```

Replace `https://your-actual-backend-url-from-railway` with the actual URL from Railway.

### Step 7: Rebuild and Redeploy Frontend
```bash
cd front-end
npm run build
```

Then redeploy the `dist` folder to Railway (your existing frontend service).

---

## Quick Checklist:
- [ ] Create new Railway service for backend
- [ ] Set root directory to `back-end`
- [ ] Add environment variables (DATABASE_URL, JWT_SECRET, GEMINI_API_KEY)
- [ ] Deploy and wait for completion
- [ ] Test: `https://your-backend-url/health`
- [ ] Test: `https://your-backend-url/products`
- [ ] Update `front-end/.env` with backend URL
- [ ] Rebuild frontend: `npm run build`
- [ ] Redeploy frontend

---

## Current Setup (WRONG):
```
Frontend: https://glamora.up.railway.app ✅ DEPLOYED
Backend: ❌ NOT DEPLOYED
API calls: https://glamora.up.railway.app (calling frontend, not backend!)
```

## Correct Setup (AFTER DEPLOYMENT):
```
Frontend: https://glamora.up.railway.app ✅ DEPLOYED
Backend: https://glamora-api.up.railway.app ✅ DEPLOYED
API calls: https://glamora-api.up.railway.app (calling backend!)
```

---

## Why This Happens:
You have TWO separate applications:
1. **Frontend** (React/Vite) - serves HTML/CSS/JS
2. **Backend** (Express/Node) - serves JSON API

Both need to be deployed separately. Right now only frontend is deployed.

When frontend tries to call `/signup` or `/products` on `https://glamora.up.railway.app`, it's calling the frontend server, which doesn't have those API routes, so it returns the index.html file (405 error).

## After You Deploy:
Reply with your backend URL and I'll update the frontend .env file for you.
