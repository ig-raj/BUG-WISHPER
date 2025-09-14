// server.js - Main Express server for Bug Whisperer API
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { analyzeJS } = require('./analyzer/eslintAnalyzer');
const { commitFix } = require('./.kiro/hooks/github_commit');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'frontend/build')));

/**
 * Generates an educational lesson based on code analysis results
 * @param {Object} params - Lesson generation parameters
 * @param {Array} params.issues - Array of detected issues
 * @param {string} params.originalCode - Original code before fixes
 * @param {string} params.fixedCode - Code after auto-fixes applied
 * @returns {string} Educational lesson text
 */
function generateLesson({ issues, originalCode, fixedCode }) {
    if (issues.length === 0) {
        return "Code Quality Check: Excellent!\n• Your code follows JavaScript best practices with no issues detected\n• All syntax and style guidelines are properly followed\n• Keep writing clean, maintainable code like this";
    }

    const errorCount = issues.filter(issue => issue.severity === 'error').length;
    const warningCount = issues.filter(issue => issue.severity === 'warning').length;
    const wasFixed = originalCode !== fixedCode;

    // Get the most common issue type for focused lesson
    const commonRules = issues.map(issue => issue.message.toLowerCase());
    let focusArea = 'code quality';
    let cause = 'Various coding issues were detected';
    let fix = 'Review and apply the suggested fixes';
    let tip = 'Use a linter in your editor for real-time feedback';

    // Customize lesson based on most common issues
    if (commonRules.some(msg => msg.includes('var'))) {
        focusArea = 'variable declarations';
        cause = 'Using var instead of let/const can cause scoping issues';
        fix = wasFixed ? 'Auto-fixed to use const/let for better scoping' : 'Replace var with let or const';
        tip = 'Use const by default, let when reassigning, avoid var';
    } else if (commonRules.some(msg => msg.includes('semicolon') || msg.includes('semi'))) {
        focusArea = 'syntax consistency';
        cause = 'Missing semicolons can lead to unexpected behavior';
        fix = wasFixed ? 'Auto-added missing semicolons' : 'Add semicolons at the end of statements';
        tip = 'Configure your editor to auto-insert semicolons';
    } else if (commonRules.some(msg => msg.includes('unused'))) {
        focusArea = 'code cleanliness';
        cause = 'Unused variables clutter code and may indicate bugs';
        fix = 'Remove unused variables or use them in your logic';
        tip = 'Clean up unused code regularly to maintain readability';
    } else if (commonRules.some(msg => msg.includes('undefined') || msg.includes('undef'))) {
        focusArea = 'variable definitions';
        cause = 'Using undefined variables will cause runtime errors';
        fix = 'Declare variables before using them or import from modules';
        tip = 'Always declare variables with let, const, or function declarations';
    }

    const issueText = errorCount > 0 ? `${errorCount} error(s)` : `${warningCount} warning(s)`;

    return `Code Quality Check: Found ${issueText} in ${focusArea}
• Cause: ${cause}
• Fix: ${fix}
• Practice tip: ${tip}`;
}

// API Routes
app.post('/api/analyze', async (req, res) => {
    try {
        const { language, filename, code } = req.body;

        // Validate input
        if (!language || !filename || !code) {
            return res.status(400).json({
                error: 'Missing required fields: language, filename, code'
            });
        }

        // Currently only support JavaScript
        if (language !== 'javascript') {
            return res.status(400).json({
                error: 'Only JavaScript is supported in this MVP'
            });
        }

        // Debug: Log the input
        console.log('Analyzing code:', { filename, codeLength: code.length, language });
        
        // Analyze the code
        const result = await analyzeJS({ filename, code });
        
        // Debug: Log the analysis result
        console.log('Analysis result:', { 
            issuesCount: result.issues.length, 
            hasFixedCode: !!result.fixed_code,
            issues: result.issues 
        });

        // Generate educational lesson
        const lesson = generateLesson({
            issues: result.issues,
            originalCode: code,
            fixedCode: result.fixed_code
        });

        // Create the complete analysis response
        const analysisResult = {
            issues: result.issues,
            fixed_code: result.fixed_code,
            lesson: lesson
        };

        // Log the analysis result in parseable JSON format
        console.log('Analysis completed for:', filename);
        console.log('```json');
        console.log(JSON.stringify(analysisResult, null, 2));
        console.log('```');

        // Return response with lesson included
        res.json(analysisResult);

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({
            error: 'Internal server error during code analysis',
            details: error.message
        });
    }
});

// GitHub commit endpoint
app.post('/api/github/commit', async (req, res) => {
    try {
        const { owner, repo, baseBranch, newBranchName, path, content, commitMessage } = req.body;
        
        // Validate input
        if (!owner || !repo || !baseBranch || !newBranchName || !path || !content || !commitMessage) {
            return res.status(400).json({
                error: 'Missing required fields: owner, repo, baseBranch, newBranchName, path, content, commitMessage'
            });
        }

        // Call the GitHub commit hook
        const result = await commitFix({
            owner,
            repo,
            baseBranch,
            newBranchName,
            path,
            content,
            commitMessage
        });

        res.json(result);

    } catch (error) {
        console.error('GitHub commit error:', error);
        res.status(500).json({
            error: 'Failed to create GitHub commit and PR',
            details: error.message
        });
    }
});

// Test endpoint for debugging
app.post('/api/test', (req, res) => {
    console.log('Test endpoint called with:', req.body);
    res.json({ 
        message: 'Test endpoint working',
        received: req.body,
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', service: 'Bug Whisperer API' });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
    const buildPath = path.join(__dirname, 'frontend/build/index.html');
    
    // Check if build exists, if not serve a simple message
    if (fs.existsSync(buildPath)) {
        res.sendFile(buildPath);
    } else {
        res.json({ 
            message: 'Bug Whisperer API is running', 
            api: '/api/analyze',
            health: '/api/health'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Bug Whisperer server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
});