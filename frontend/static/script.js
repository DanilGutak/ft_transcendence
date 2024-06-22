document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginButton');
  loginForm.addEventListener('click', function(event) {
    Login();
  });

});


function Login() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const errorMessage = document.getElementById('error-message');
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
    console.log(data);
    errorMessage.classList.add('hidden'); // Hide error message on successful login
})
.catch(error => {
    errorMessage.classList.remove('hidden'); // Show error message on failed login
});
}
// press on the "Login" button in the login form


