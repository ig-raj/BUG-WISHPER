// build.js - Build script for Vercel deployment
const { execSync } = require('child_process');
const path = require('path');

console.log('Starting build process...');

try {
    // Change to frontend directory and install dependencies
    console.log('Installing frontend dependencies...');
    process.chdir(path.join(__dirname, 'frontend'));
    execSync('npm ci', { stdio: 'inherit' });
    
    // Build the frontend
    console.log('Building frontend...');
    execSync('npm run build', { stdio: 'inherit' });
    
    console.log('Build completed successfully!');
} catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
}