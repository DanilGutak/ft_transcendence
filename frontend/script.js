// script.js

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    
    // Create request body as JSON
    var data = {
      username: username,
      password: password
    };
  
    // Make POST request using fetch API
    fetch('http://localhost:8080/api/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any additional headers if needed
      },
      body: JSON.stringify(data),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json(); // Parse JSON response
    })
    .then(data => {
      console.log('Login successful:', data);
      // Handle successful login response (e.g., redirect to dashboard)
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
      // Handle error (e.g., display error message to user)
    });
  });
  