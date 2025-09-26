// test-analyzer.js - Test the analyzer with unterminated string
const { analyzeJS } = require('./analyzer/eslintAnalyzer');

async function testAnalyzer() {
  try {
    const testCode = 'console.log("hel)';
    console.log('Testing code:', testCode);
    
    const result = await analyzeJS({ 
      filename: 'test.js', 
      code: testCode 
    });
    
    console.log('\n--- Analysis Result ---');
    console.log('Issues found:', result.issues.length);
    console.log('Fixed code:', result.fixed_code);
    console.log('Expected: console.log("hel");');
    
    if (result.issues.length > 0) {
      console.log('\nIssues:');
      result.issues.forEach((issue, index) => {
        console.log(`${index + 1}. Line ${issue.line}: ${issue.message}`);
        console.log(`   Suggestion: ${issue.suggestion}`);
      });
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAnalyzer();