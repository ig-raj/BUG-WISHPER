// analyzer/eslintAnalyzer.js - ESLint-based code analyzer
const { ESLint } = require('eslint');

/**
 * Analyzes JavaScript code using ESLint and returns issues with auto-fixes
 * 
 * Example usage:
 * const result = await analyzeJS({ 
 *   filename: 'test.js', 
 *   code: 'var x = 5\nconsole.log(x)' 
 * });
 * 
 * Expected output:
 * {
 *   issues: [
 *     { line: 1, severity: 'error', message: 'Unexpected var, use let or const instead.', suggestion: 'Use let or const instead of var' },
 *     { line: 1, severity: 'error', message: 'Missing semicolon.', suggestion: 'Add semicolons at the end of statements' }
 *   ],
 *   fixed_code: 'const x = 5;\nconsole.log(x);\n'
 * }
 * 
 * @param {Object} params - Analysis parameters
 * @param {string} params.filename - The filename for context
 * @param {string} params.code - The JavaScript code to analyze
 * @returns {Object} Analysis result with issues and fixed_code
 */
async function analyzeJS({ filename, code }) {
  try {
    // Pre-process code to fix basic syntax errors
    const preprocessedCode = preProcessSyntaxFixes(code);
    
    // Configure ESLint with recommended rules and auto-fix enabled
    const eslint = new ESLint({
      fix: true,
      baseConfig: {
        env: {
          browser: true,
          node: true,
          es2021: true
        },
        extends: ['eslint:recommended'],
        parserOptions: {
          ecmaVersion: 2021,
          sourceType: 'module'
        },
        rules: {
          // Add more auto-fixable rules
          'semi': ['error', 'always'],
          'quotes': ['error', 'single'],
          'no-var': 'error',
          'prefer-const': 'error',
          'no-trailing-spaces': 'error',
          'eol-last': 'error',
          'no-undef': 'error',
          'no-unused-vars': 'error'
        }
      },
      useEslintrc: false
    });

    // Lint the preprocessed code
    const results = await eslint.lintText(preprocessedCode, { filePath: filename });
    const result = results[0];

    // Extract issues and map to our format
    const issues = result.messages.map(message => ({
      line: message.line,
      severity: message.severity === 2 ? 'error' : 'warning',
      message: message.message,
      suggestion: generateSuggestion(message.ruleId, message.message)
    }));

    // Get fixed code from ESLint auto-fix, fallback to preprocessed code
    let fixed_code = result.output || preprocessedCode;

    // Apply custom fixes for issues ESLint can't auto-fix
    fixed_code = applyCustomFixes(fixed_code, issues);

    return {
      issues,
      fixed_code
    };

  } catch (error) {
    // Handle syntax errors and other parsing failures
    console.error('ESLint analysis failed:', error);
    
    // Try to extract line number from error message if available
    let line = 1;
    const lineMatch = error.message.match(/line (\d+)/i);
    if (lineMatch) {
      line = parseInt(lineMatch[1], 10);
    }

    // Try to apply basic syntax fixes even when ESLint fails
    const attemptedFix = preProcessSyntaxFixes(code);

    return {
      issues: [{
        line: line,
        severity: 'error',
        message: error.message,
        suggestion: getSyntaxErrorSuggestion(error.message)
      }],
      fixed_code: attemptedFix
    };
  }
}

/**
 * Pre-processes code to fix common syntax errors before ESLint analysis
 * @param {string} code - The original code
 * @returns {string} Code with basic syntax fixes applied
 */
function preProcessSyntaxFixes(code) {
  let fixedCode = code;
  
  // Fix unterminated strings
  const lines = fixedCode.split('\n');
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Fix unterminated strings by finding the last unmatched quote
    line = fixUnterminatedStrings(line);
    
    // Fix missing semicolons at end of statements
    const trimmedLine = line.trim();
    if (trimmedLine && 
        !trimmedLine.endsWith(';') && 
        !trimmedLine.endsWith('{') && 
        !trimmedLine.endsWith('}') && 
        !trimmedLine.endsWith(')') &&
        !trimmedLine.startsWith('//') && 
        !trimmedLine.startsWith('/*') && 
        !trimmedLine.includes('function') &&
        !trimmedLine.includes('if') &&
        !trimmedLine.includes('for') &&
        !trimmedLine.includes('while') &&
        !trimmedLine.includes('else')) {
      line = line + ';';
    }
    
    lines[i] = line;
  }
  
  return lines.join('\n');
}

/**
 * Fixes unterminated strings in a single line of code
 * @param {string} line - The line to fix
 * @returns {string} Line with unterminated strings fixed
 */
function fixUnterminatedStrings(line) {
  let result = '';
  let inString = false;
  let stringChar = '';
  let escaped = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }
    
    if (char === '\\' && inString) {
      result += char;
      escaped = true;
      continue;
    }
    
    if ((char === '"' || char === "'") && !inString) {
      // Starting a string
      inString = true;
      stringChar = char;
      result += char;
    } else if (char === stringChar && inString) {
      // Ending a string
      inString = false;
      stringChar = '';
      result += char;
    } else {
      result += char;
    }
  }
  
  // If we're still in a string at the end of the line, we need to be smart about where to close it
  if (inString && stringChar) {
    // Look for common patterns where the string should end
    // For function calls like console.log("text), close before the closing parenthesis
    const lastParenIndex = result.lastIndexOf(')');
    const lastBraceIndex = result.lastIndexOf('}');
    const lastBracketIndex = result.lastIndexOf(']');
    
    // Find the rightmost closing delimiter
    const closingPositions = [lastParenIndex, lastBraceIndex, lastBracketIndex].filter(pos => pos > -1);
    
    if (closingPositions.length > 0) {
      const insertPosition = Math.max(...closingPositions);
      // Insert the closing quote before the delimiter
      result = result.slice(0, insertPosition) + stringChar + result.slice(insertPosition);
    } else {
      // No closing delimiters found, just close at the end
      result += stringChar;
    }
  }
  
  return result;
}

/**
 * Applies custom fixes for issues that ESLint can't auto-fix
 * @param {string} code - The code to fix
 * @param {Array} issues - Array of detected issues
 * @returns {string} Code with custom fixes applied
 */
function applyCustomFixes(code, issues) {
  let fixedCode = code;
  
  // Fix no-undef errors by adding variable declarations
  const undefIssues = issues.filter(issue => issue.message.includes('is not defined'));
  
  for (const issue of undefIssues) {
    // Extract variable name from message like "'total' is not defined"
    const varMatch = issue.message.match(/'([^']+)' is not defined/);
    if (varMatch) {
      const varName = varMatch[1];
      
      // Look for assignment patterns like "varName = value"
      const assignmentRegex = new RegExp(`^(\\s*)(${varName}\\s*=)`, 'gm');
      
      // Replace with let declaration
      fixedCode = fixedCode.replace(assignmentRegex, (match, indent, assignment) => {
        return `${indent}let ${assignment}`;
      });
    }
  }
  
  return fixedCode;
}

/**
 * Generates helpful suggestions based on ESLint rule violations
 * 
 * Example:
 * generateSuggestion('no-var', 'Unexpected var, use let or const instead.')
 * Returns: 'Use let or const instead of var'
 * 
 * @param {string} ruleId - The ESLint rule that was violated
 * @param {string} message - The original ESLint message
 * @returns {string} A helpful one-line suggestion for the developer
 */
function generateSuggestion(ruleId, message) {
  const suggestions = {
    'no-unused-vars': 'Remove unused variables or use them in your code',
    'no-undef': 'Define the variable or import it from a module',
    'no-console': 'Consider using a proper logging library in production',
    'semi': 'Add semicolons at the end of statements',
    'quotes': 'Use consistent quote style for strings',
    'indent': 'Fix indentation to be consistent',
    'no-trailing-spaces': 'Remove extra spaces at the end of lines',
    'eol-last': 'Add a newline at the end of the file',
    'no-multiple-empty-lines': 'Remove extra empty lines',
    'brace-style': 'Use consistent brace style',
    'comma-dangle': 'Remove or add trailing commas consistently',
    'no-var': 'Use let or const instead of var',
    'prefer-const': 'Use const for variables that are never reassigned',
    'no-unreachable': 'Remove code that can never be executed',
    'no-redeclare': 'Avoid redeclaring the same variable',
    'no-duplicate-keys': 'Remove duplicate object keys',
    'no-dupe-args': 'Remove duplicate function parameters',
    'no-func-assign': 'Avoid reassigning function declarations',
    'no-irregular-whitespace': 'Remove irregular whitespace characters',
    'no-obj-calls': 'Do not call global objects as functions',
    'no-sparse-arrays': 'Avoid sparse arrays with empty slots',
    'use-isnan': 'Use isNaN() to check for NaN values',
    'valid-typeof': 'Ensure typeof expressions are compared to valid strings'
  };

  return suggestions[ruleId] || 'Follow ESLint best practices to fix this issue';
}

/**
 * Generates suggestions for syntax errors
 * 
 * Example:
 * getSyntaxErrorSuggestion('Unexpected token }')
 * Returns: 'Check for missing opening brace or extra closing brace'
 * 
 * @param {string} errorMessage - The syntax error message
 * @returns {string} A helpful suggestion for fixing the syntax error
 */
function getSyntaxErrorSuggestion(errorMessage) {
  const lowerMessage = errorMessage.toLowerCase();
  
  if (lowerMessage.includes('unexpected token')) {
    if (lowerMessage.includes('}')) {
      return 'Check for missing opening brace or extra closing brace';
    }
    if (lowerMessage.includes('{')) {
      return 'Check for missing closing brace or unexpected opening brace';
    }
    if (lowerMessage.includes(')')) {
      return 'Check for missing opening parenthesis or extra closing parenthesis';
    }
    if (lowerMessage.includes('(')) {
      return 'Check for missing closing parenthesis or unexpected opening parenthesis';
    }
    if (lowerMessage.includes(']')) {
      return 'Check for missing opening bracket or extra closing bracket';
    }
    if (lowerMessage.includes('[')) {
      return 'Check for missing closing bracket or unexpected opening bracket';
    }
    return 'Check for typos or missing punctuation in your code';
  }
  
  if (lowerMessage.includes('unterminated string')) {
    return 'Missing closing quote for string - automatically added';
  }
  
  if (lowerMessage.includes('unterminated comment')) {
    return 'Add missing closing comment marker */';
  }
  
  if (lowerMessage.includes('invalid character')) {
    return 'Remove or replace invalid characters in your code';
  }
  
  return 'Check for syntax errors like missing brackets, quotes, or semicolons';
}

module.exports = { analyzeJS };