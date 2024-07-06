document.addEventListener('DOMContentLoaded', () => {
  checkLogin();
  const loginForm = document.getElementById('login-button');
  loginForm.addEventListener('click', function(event) {
    login();
  });
  const registerForm = document.getElementById('register-button');
  registerForm.addEventListener('click', function(event) {
    document.getElementById('register').classList.remove('hidden');
    document.getElementById('login').classList.add('hidden');
  });

  const logoutForm = document.getElementById('logout-button');
  logoutForm.addEventListener('click', function(event) {
    logout();
  });

});

async function checkLogin() {
  const accessToken = localStorage.getItem('access-token');
  const refreshToken = localStorage.getItem('refresh-token');
  if (accessToken) {
    const response = await fetch('/api/loggedin/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${accessToken}`
      }
    });
    if (response.ok) {
      document.getElementById('logged-in').classList.remove('hidden');
      document.getElementById('logged-out').classList.add('hidden');
    }
    else if (response.status === 401) {
      if (refreshToken) {
        await refreshToken();
        let response = await fetch('/api/loggedin', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'athorization': `Bearer ${localStorage.getItem('access-token')}`
      }})

        if (response.ok) {
          document.getElementById('logged-in').classList.remove('hidden');
          document.getElementById('logged-out').classList.add('hidden');
      }
      else {
        document.getElementById('logged-in').classList.add('hidden');
        document.getElementById('logged-out').classList.remove('hidden');
        localStorage.removeItem('access-token');
        localStorage.removeItem('refresh-token');
      }
    }
      else {
      document.getElementById('logged-in').classList.add('hidden');
      document.getElementById('logged-out').classList.remove('hidden');
      }
    
  }
  }
}

async function logout() {
  const accessToken = localStorage.getItem('access-token');
  const refreshToken = localStorage.getItem('refresh-token');
  const data = {
    refresh: refreshToken
  };
  let response = await fetch('/api/logout/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(data),
  })
  if (response.status === 401) {
    await refreshToken();
    accessToken = localStorage.getItem('access-token');
    logout();
  }
  else if (!response.ok) {
    handleFailure("Failed to logout");
  }
  else {
  handleSuccess("Logged out successfully");
  localStorage.removeItem('access-token');
  localStorage.removeItem('refresh-token');
  document.getElementById('logged-in').classList.add('hidden');
  document.getElementById('logged-out').classList.remove('hidden');
  renderPage('login');
  }
}
function login() { 
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const errorMessage = document.getElementById('error-message');
  const errorContainer = document.getElementById('error-container');
  const successMessage = document.getElementById('success-message');
  const successContainer = document.getElementById('success-container');
  const container = document.getElementById('login');
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
    else
    {
      successContainer.classList.remove('hidden');
      successMessage.innerHTML = '<strong>Logged in succesfully!</strong>';
      document.getElementById('login-username').value = '';
      document.getElementById('login-password').value = '';
      localStorage.setItem('access-token', data['access']);
      localStorage.setItem('refresh-token', data['refresh']);
      setTimeout(() => {
        loginSuccess();
      }, 2000);

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
function loginSuccess() {
  document.getElementById('error-container').classList.add('hidden');
  document.getElementById('success-container').classList.add('hidden');
  document.getElementById('logged-in').classList.remove('hidden');
  document.getElementById('logged-out').classList.add('hidden');
  renderPage('game');
}
