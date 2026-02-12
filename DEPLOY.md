# Deploy Lazy Minter to Render.com (Free Tier)

## Prerequisites
- GitHub account
- Render.com account (free)

## Step 1: Push to GitHub

Your code is ready and committed locally. Now push it to GitHub:

```bash
# Create a new repo on GitHub.com (via web browser):
# 1. Go to https://github.com/new
# 2. Repository name: lazy-minter
# 3. Make it Public
# 4. Don't initialize with README (we already have code)
# 5. Click "Create repository"

# Then run these commands:
cd "/home/hdx/Pictures/Lazy Minter"
git remote add origin https://github.com/YOUR_USERNAME/lazy-minter.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy on Render.com

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com/
   - Click "New +" → "Web Service"

2. **Connect GitHub Repository**
   - Click "Connect account" if needed
   - Select your `lazy-minter` repository
   - Click "Connect"

3. **Configure Service** (Render will auto-detect `render.yaml`)
   - **Name**: `lazy-minter` (or your choice)
   - **Region**: Oregon (Free)
   - **Branch**: `main`
   - **Build Command**: `cd frontend && npm install && npm run build && cd ../backend && npm install`
   - **Start Command**: `cd backend && node server.js`
   - **Plan**: Free

4. **Environment Variables**
   - Render auto-sets `PORT`
   - Add: `ALLOWED_ORIGINS` = `https://lazy-minter.onrender.com` (or your actual URL)
   - Add: `NODE_ENV` = `production`

5. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes for build
   - Your app will be live at: `https://lazy-minter.onrender.com`

## Step 3: Update ALLOWED_ORIGINS

After deployment, update the env var with your actual Render URL:

1. Go to your service → "Environment"
2. Edit `ALLOWED_ORIGINS`
3. Set to your deployed URL (e.g., `https://lazy-minter-abc123.onrender.com`)
4. Save (service will auto-redeploy)

## Verification

Once deployed, test:
- ✓ App loads at your Render URL
- ✓ Marketplace shows 6 collections
- ✓ Workshop loads real SVG trait images
- ✓ Wallet creation works (with confirmation dialog)
- ✓ Collection switching works

## Free Tier Limitations

- App sleeps after 15 min of inactivity
- First request after sleep takes ~30s to wake up
- 750 hours/month free (enough for 24/7 uptime)

## Troubleshooting

**Build fails?**
- Check Render build logs
- Ensure `package.json` exists in both `frontend/` and `backend/`

**App won't load?**
- Check `ALLOWED_ORIGINS` matches your deployed URL
- Check Render logs for errors

**Collections not loading?**
- Ensure `backend/data/collections/` was committed to Git
- Check browser console for API errors

---

## Alternative: Quick Deploy Button

You can also add this to your GitHub README for one-click deploy:

\`\`\`markdown
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)
\`\`\`

This uses the `render.yaml` file automatically.
