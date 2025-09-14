// demo/snippets/asyncAwaitError.js - missing await inside async causing unhandled promise bug
async function fetchUserData(userId) {
  const response = fetch(`/api/users/${userId}`);  // Missing await!
  const data = response.json();  // This will fail - response is a Promise
  
  return data;
}

async function processUser(userId) {
  try {
    const userData = fetchUserData(userId);  // Missing await here too!
    console.log(userData.name);  // Will log [object Promise] instead of name
    
    return userData;
  } catch (error) {
    console.error("Error:", error);
  }
}

// This will not work as expected due to missing await keywords
processUser("123");