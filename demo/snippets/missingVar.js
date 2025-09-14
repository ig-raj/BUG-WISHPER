// demo/snippets/missingVar.js - ReferenceError due to undeclared variable
function calculateTotal(items) {
  total = 0;  // Missing declaration - will cause ReferenceError
  
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  
  return total;
}

// This will throw ReferenceError: total is not defined
const result = calculateTotal([
  { price: 10 },
  { price: 20 },
  { price: 15 }
]);

console.log(result);