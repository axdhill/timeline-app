# Deployment Guide

## Railway Deployment Options

### Option 1: Fix GitHub Integration

1. Go to GitHub Settings → Integrations → Applications
2. Find "Railway" in Authorized GitHub Apps
3. Click "Configure"
4. Ensure `axdhill/timeline-app` is in the selected repositories
5. If it's there, try removing and re-adding it
6. Save changes

### Option 2: Direct URL Import

1. In Railway, click "New Project"
2. Choose "Deploy from GitHub repo"
3. Instead of browsing, paste: `https://github.com/axdhill/timeline-app`
4. Railway should detect and import the repo

### Option 3: Railway CLI Deployment

```bash
# Login to Railway
railway login

# Initialize new project
railway init

# Link to existing project (if you have one)
railway link

# Deploy
railway up

# Get deployment URL
railway open
```

### Option 4: Template Deployment

1. Fork the repository to your account
2. Make any necessary changes
3. Use Railway's template system:
   ```
   https://railway.app/new/github?repo=https://github.com/axdhill/timeline-app
   ```

### Option 5: Manual Git Push

```bash
# Add Railway as remote
railway link
git remote add railway $(railway url)

# Push to Railway
git push railway main
```

## Environment Variables

No environment variables are required for basic deployment. The app will run on the port Railway provides automatically.

## Post-Deployment

Once deployed, Railway will:
1. Detect Node.js/Next.js automatically
2. Run `npm install`
3. Run `npm run build`
4. Start the app with `npm run start`

The app will be available at your Railway-provided URL.