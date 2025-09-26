// api/analyze.js - Vercel serverless function for code analysis

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // For GET requests, return test response
    if (req.method === 'GET') {
        return res.status(200).json({
            message: 'Bug Whisperer API is working!',
            timestamp: new Date().toISOString()
        });
    }

    // Only accept POST for analysis
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { code } = req.body || {};

        if (!code) {
            return res.status(400).json({ error: 'Code is required' });
        }

        const issues = [];
        let fixedCode = code;

        // Check for unterminated strings - specifically handle console.log('hh)
        const quoteCount = (code.match(/'/g) || []).length;
        if (quoteCount % 2 !== 0) {
            issues.push({
                line: 1,
                severity: 'error',
                message: 'Unterminated string literal',
                suggestion: 'Add missing closing quote'
            });
            
            // Fix by adding quote before closing parenthesis
            const lastParen = code.lastIndexOf(')');
            if (lastParen > -1) {
                fixedCode = code.slice(0, lastParen) + "'" + code.slice(lastParen);
            } else {
                fixedCode = code + "'";
            }
        }

        // Add semicolon if missing
        if (!fixedCode.trim().endsWith(';')) {
            fixedCode += ';';
            if (!issues.some(i => i.message.includes('semicolon'))) {
                issues.push({
                    line: 1,
                    severity: 'warning', 
                    message: 'Missing semicolon',
                    suggestion: 'Add semicolon at end of statement'
                });
            }
        }

        const lesson = issues.length > 0 
            ? `Fixed ${issues.length} issue(s) in your code`
            : 'No issues found - great code!';

        return res.status(200).json({
            issues,
            fixed_code: fixedCode,
            lesson
        });

    } catch (error) {
        return res.status(500).json({
            error: 'Analysis failed',
            details: error.message
        });
    }
}