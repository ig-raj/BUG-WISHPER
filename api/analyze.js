// api/analyze.js - Vercel serverless function for code analysis

// Simple code analyzer that works in serverless environment
function simpleAnalyzeJS({ code }) {
    const issues = [];
    const lines = code.split('\n');
    let fixedCode = code;
    
    // Check for common issues
    lines.forEach((line, index) => {
        const lineNum = index + 1;
        const trimmedLine = line.trim();
        
        // Check for unterminated strings
        if (trimmedLine.includes('"') || trimmedLine.includes("'")) {
            const doubleQuotes = (line.match(/"/g) || []).length;
            const singleQuotes = (line.match(/'/g) || []).length;
            
            if (doubleQuotes % 2 !== 0 || singleQuotes % 2 !== 0) {
                issues.push({
                    line: lineNum,
                    severity: 'error',
                    message: 'Unterminated string literal',
                    suggestion: 'Add missing closing quote'
                });
                
                // Fix unterminated strings - insert quote before closing parenthesis
                if (doubleQuotes % 2 !== 0) {
                    const lastParenIndex = line.lastIndexOf(')');
                    if (lastParenIndex > -1) {
                        const fixedLine = line.slice(0, lastParenIndex) + '"' + line.slice(lastParenIndex);
                        fixedCode = fixedCode.replace(line, fixedLine);
                    } else {
                        fixedCode = fixedCode.replace(line, line + '"');
                    }
                } else if (singleQuotes % 2 !== 0) {
                    const lastParenIndex = line.lastIndexOf(')');
                    if (lastParenIndex > -1) {
                        const fixedLine = line.slice(0, lastParenIndex) + "'" + line.slice(lastParenIndex);
                        fixedCode = fixedCode.replace(line, fixedLine);
                    } else {
                        fixedCode = fixedCode.replace(line, line + "'");
                    }
                }
            }
        }
        
        // Check for missing semicolons
        if (trimmedLine && 
            !trimmedLine.endsWith(';') && 
            !trimmedLine.endsWith('{') && 
            !trimmedLine.endsWith('}') && 
            !trimmedLine.startsWith('//') &&
            (trimmedLine.includes('console.') || trimmedLine.includes('='))) {
            issues.push({
                line: lineNum,
                severity: 'warning',
                message: 'Missing semicolon',
                suggestion: 'Add semicolon at end of statement'
            });
            
            // Fix missing semicolons
            fixedCode = fixedCode.replace(line, line + ';');
        }
        
        // Check for var usage
        if (trimmedLine.includes('var ')) {
            issues.push({
                line: lineNum,
                severity: 'warning',
                message: 'Unexpected var, use let or const instead',
                suggestion: 'Use let or const instead of var'
            });
            
            // Fix var to const
            fixedCode = fixedCode.replace(/var /g, 'const ');
        }
    });
    
    return {
        issues,
        fixed_code: fixedCode
    };
}

/**
 * Generates an educational lesson based on code analysis results
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

module.exports = async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log('API called with method:', req.method);
    console.log('Request body:', req.body);

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

        // Analyze the code
        const result = simpleAnalyzeJS({ filename, code });

        // Generate educational lesson
        const lesson = generateLesson({
            issues: result.issues,
            originalCode: code,
            fixedCode: result.fixed_code
        });

        // Return response with lesson included
        res.json({
            issues: result.issues,
            fixed_code: result.fixed_code,
            lesson: lesson
        });

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({
            error: 'Internal server error during code analysis',
            details: error.message
        });
    }
}