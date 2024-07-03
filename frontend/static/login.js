document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-button');
  loginForm.addEventListener('click', function(event) {
    login();
  });
  const registerForm = document.getElementById('register-button');
  registerForm.addEventListener('click', function(event) {
    document.getElementById('register').classList.remove('hidden');
    document.getElementById('login').classList.add('hidden');
  });

});


function login() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const errorMessage = document.getElementById('error-message');
  const errorContainer = document.getElementById('error-container');
  const data = {
    username: username,
    password: password
  };

  fetch('/api/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
})
.then(data => {
    // Handle successful login here
    errorContainer.classList.add('hidden'); // Hide error message on successful login
    if (data['message'] === 'Two factor authentication required') {
        document.getElementById('login').classList.add('hidden');
        document.getElementById('2fa').classList.remove('hidden');
        data = {
            username: username,
            password: password
        };
        fetch('/api/2fa/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
    }
})
.catch(error => {
    errorContainer.classList.remove('hidden');
    errorMessage.classList.remove('hidden');
    errorMessage.innerHTML = '<strong>Login failed! Try again later</strong>';
    // Show error message on failed login
});
}
// press on the "Login" button in the login form


