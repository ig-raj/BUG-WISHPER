// test-preprocess.js - Test just the preprocessing function
const fs = require('fs');

// Read the analyzer file and extract the preprocessing function
const analyzerCode = fs.readFileSync('./analyzer/eslintAnalyzer.js', 'utf8');

// Extract the preProcessSyntaxFixes function
const funcStart = analyzerCode.indexOf('function preProcessSyntaxFixes(code) {');
const funcEnd = analyzerCode.indexOf('\n}\n', funcStart) + 2;
const funcCode = analyzerCode.substring(funcStart, funcEnd);

// Create a test version
eval(funcCode);

// Test it
const testCode = 'console.log("hel)';
console.log('Input:', testCode);
const result = preProcessSyntaxFixes(testCode);
console.log('Output:', result);
console.log('Expected: console.log("hel");');