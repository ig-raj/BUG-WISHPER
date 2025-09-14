# Deploy Bug Whisperer to Netlify + Railway

Since Bug Whisperer has both frontend and backend, we'll use a hybrid approach:
- **Frontend**: Deploy to Netlify (free, fast CDN)
- **Backend**: Deploy to Railway (free Node.js hosting)

## Step 1: Deploy Backend to Railway

Follow the Railway setup guide first to deploy your backend API.
You'll get a URL like: `https://your-backend.up.railway.app`

## Step 2: Configure Frontend for Production

Update the frontend to use your Railway backend:

```bash
# Create production build with API URL
cd frontend
REACT_APP_API_URL=https://your-backend.up.railway.app npm run build
```

## Step 3: Deploy Frontend to Netlify

### Option A: Drag & Drop (Easiest)
1. Go to [netlify.com](https://netlify.com)
2. Sign up/login
3. Drag the `frontend/build` folder to the deploy area
4. Your frontend will be live at: `https://random-name.netlify.app`

### Option B: Git Integration
1. Push your code to GitHub
2. Connect Netlify to your GitHub repo
3. Set build settings:
   - **Build command**: `cd frontend && npm run build`
   - **Publish directory**: `frontend/build`
   - **Environment variables**: `REACT_APP_API_URL=https://your-backend.up.railway.app`

## Step 4: Update CORS

Update your backend's CORS settings to allow your Netlify domain:

```javascript
// In server.js
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend.netlify.app'
  ]
}));
```

## Benefits of This Setup

- **Frontend**: Lightning fast via Netlify's global CDN
- **Backend**: Full Node.js support on Railway
- **Cost**: Both have generous free tiers
- **Scalability**: Can handle significant traffic
- **Custom Domains**: Both support custom domains

## Alternative: All-in-One Railway

For simplicity, you can also deploy everything to Railway as shown in the Railway setup guide. The frontend will be served by your Express server.