# Deployment Checklist for Railway

## Changes Made to Fix 405 Errors:

1. ✅ Fixed duplicate `/google` route in signup router
2. ✅ Simplified CORS to allow all origins (for debugging)
3. ✅ Added trust proxy for Railway
4. ✅ Fixed PORT configuration to use Railway's PORT
5. ✅ Added error handling middleware
6. ✅ Added debug logging
7. ✅ Added health check endpoint

## To Deploy:

```bash
# 1. Commit all changes
git add .
git commit -m "Fix 405 errors and CORS configuration"

# 2. Push to Railway (if connected to Git)
git push

# OR if using Railway CLI:
railway up
```

## After Deployment:

1. Check Railway logs to see if server started correctly
2. Test health endpoint: https://glamora.up.railway.app/health
3. Check logs for debug output showing incoming requests
4. Test signup: POST https://glamora.up.railway.app/signup
5. Test Google auth: POST https://glamora.up.railway.app/google

## Environment Variables on Railway:

Make sure these are set:
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - Your JWT secret
- `PORT` - Railway sets this automatically
- `GEMINI_API_KEY` - Your Gemini API key

## If Still Getting 405:

1. Check Railway logs for the actual error
2. Verify the deployment completed successfully
3. Try restarting the Railway service
4. Check if Railway is using the correct start command: `npm start`

## Routes Available:

- GET  /health
- POST /signup
- POST /login
- POST /google
- GET  /products
- POST /admin/* (requires auth)
- POST /orders (requires auth)
- POST /contact
