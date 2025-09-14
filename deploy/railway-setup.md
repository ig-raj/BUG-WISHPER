# Deploy Bug Whisperer to Railway

Railway is one of the easiest platforms to deploy Node.js apps with a generous free tier.

## Quick Deployment (Recommended)

### Option 1: Deploy from GitHub (Easiest)

1. **Push to GitHub**:
   ```bash
   # Create a new repository on GitHub
   # Then push your code
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/bug-whisperer.git
   git push -u origin main
   ```

2. **Deploy on Railway**:
   - Go to [railway.app](https://railway.app)
   - Sign up/login with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your bug-whisperer repository
   - Railway will automatically detect it's a Node.js app and deploy!

3. **Your app will be live** at: `https://your-app-name.up.railway.app`

### Option 2: Deploy with Railway CLI

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login**:
   ```bash
   railway login
   ```

3. **Deploy**:
   ```bash
   # From your project root
   railway init
   railway up
   ```

## Configuration

Railway automatically:
- Detects Node.js and installs dependencies
- Runs build commands
- Sets up environment variables
- Provides HTTPS and custom domains

## Environment Variables (Optional)

If you need GitHub integration:
1. Go to your Railway project dashboard
2. Click "Variables" tab
3. Add: `GITHUB_TOKEN` = `your_token_here`

## Custom Domain (Optional)

1. In Railway dashboard, go to "Settings"
2. Add your custom domain
3. Update DNS records as instructed

## Free Tier Limits

Railway free tier includes:
- $5 worth of usage per month
- Automatic sleep after inactivity
- Custom domains
- HTTPS certificates

Perfect for Bug Whisperer demo!