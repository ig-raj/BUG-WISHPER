// demo/snippets/wrongEquality.js - using == where === is preferred and causes logical bug
function validateUser(user) {
  // Using == instead of === causes type coercion bugs
  if (user.id == "123") {  // Will match both string "123" and number 123
    return "admin";
  }
  
  if (user.active == true) {  // Will match "true", 1, etc.
    return "user";
  }
  
  return "guest";
}

// These comparisons will behave unexpectedly due to type coercion
const user1 = { id: 123, active: "true" };  // Should be number and boolean
const user2 = { id: "123", active: 1 };     // Mixed types cause confusion

console.log(validateUser(user1));  // Returns "admin" unexpectedly
console.log(validateUser(user2));  // Returns "user" unexpectedly