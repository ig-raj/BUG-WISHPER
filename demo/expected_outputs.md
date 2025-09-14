# Demo Expected Outputs

This document describes the expected analysis results for each demo file when processed by Bug Whisperer.

## missingVar.js

**Expected Issues:** ESLint should detect `no-undef` error for the undeclared `total` variable on line 2.

**Expected Fixed Code:** The analyzer should suggest declaring the variable with `let total = 0;` or `const total = 0;` to fix the ReferenceError.

**Expected Lesson:** Should explain that undeclared variables cause runtime errors and recommend always declaring variables with `let`, `const`, or `var`.

## wrongEquality.js

**Expected Issues:** ESLint should detect `eqeqeq` warnings for using `==` instead of `===` on lines 3 and 7, which can cause unexpected type coercion bugs.

**Expected Fixed Code:** The analyzer should replace `==` with `===` to enforce strict equality comparisons without type coercion.

**Expected Lesson:** Should explain that `===` prevents type coercion bugs and is safer than `==` for most comparisons.

## asyncAwaitError.js

**Expected Issues:** ESLint may detect issues related to Promise handling, though this specific pattern (missing `await`) might not be caught by basic ESLint rules without additional async/await plugins.

**Expected Fixed Code:** Should add `await` keywords before `fetch()` call and `fetchUserData()` call to properly handle Promises.

**Expected Lesson:** Should explain that async functions return Promises and require `await` to properly handle asynchronous operations.

---

**Note:** The actual ESLint rules enabled in Bug Whisperer may vary. Some issues (like missing `await`) require specific ESLint plugins or rules that may not be included in the basic `eslint:recommended` configuration.