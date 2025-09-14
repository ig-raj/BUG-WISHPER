# Deploy Bug Whisperer to Heroku

## Prerequisites
- Heroku account (free tier available)
- Heroku CLI installed

## Deployment Steps

### 1. Install Heroku CLI
```bash
# Windows (using chocolatey)
choco install heroku-cli

# Or download from: https://devcenter.heroku.com/articles/heroku-cli
```

### 2. Login to Heroku
```bash
heroku login
```

### 3. Create Heroku App
```bash
# From your project root directory
heroku create your-bug-whisperer-app-name
```

### 4. Set Environment Variables (Optional)
```bash
# If you want GitHub integration
heroku config:set GITHUB_TOKEN=your_github_token_here
```

### 5. Deploy
```bash
# Add Heroku remote (if not added automatically)
heroku git:remote -a your-bug-whisperer-app-name

# Deploy to Heroku
git add .
git commit -m "Deploy Bug Whisperer"
git push heroku main
```

### 6. Open Your App
```bash
heroku open
```

Your Bug Whisperer will be available at:
`https://your-bug-whisperer-app-name.herokuapp.com`

## Heroku Configuration

The app will automatically:
- Install dependencies with `npm install`
- Build frontend with `npm run build`
- Start server with `npm start`
- Use PORT environment variable provided by Heroku

## Troubleshooting

Check logs if deployment fails:
```bash
heroku logs --tail
```