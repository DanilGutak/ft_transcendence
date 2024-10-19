document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-button');
  checkLogin();
  loginForm.addEventListener('click', function(event) {
    event.preventDefault();
    loginForm.disabled = true;
    login();
    setTimeout(() => {
      loginForm.disabled = false;
    }, 2500);

  });
  const registerForm = document.getElementById('register-button');
  registerForm.addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('register').classList.remove('hidden');
    document.getElementById('login').classList.add('hidden');
  });

  const logoutForm = document.getElementById('logout-button');
  logoutForm.addEventListener('click', function(event) {
    logout();
  });

});

let oauthRequestInProgress = false;

function oauthLogin() {
    if (oauthRequestInProgress) {
        return;
    }
    oauthRequestInProgress = true;
    fetch('/api/oauth/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        oauthRequestInProgress = false;
        if (!response.ok) {
            if (response.status === 429) {
                alert('Too many requests. Please wait a moment.');
            }
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data['oauth_url']) {
            // Redirect the user to the OAuth provider's authorization URL
            window.location.href = data['oauth_url'];
        } else {
            // Handle any other responses or errors
            errorContainer.classList.remove('hidden');
            errorMessage.innerHTML = '<strong>OAuth login failed!</strong>';
        }
    })
    .catch(error => {
        oauthRequestInProgress = false;
        errorContainer.classList.remove('hidden');
        errorMessage.innerHTML = '<strong>OAuth login failed! Try again later.</strong>';
    });
}

async function checkLogin() {
  localStorage.setItem('loggedIn', 'false');
  const accessToken = localStorage.getItem('access-token');
  const refreshToken2 = localStorage.getItem('refresh-token');
  if (accessToken) {
    const response = await fetch('/api/loggedin/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${accessToken}`
      }
    });
    if (response.ok) {
      //const data = await response.json();  
      localStorage.setItem('loggedIn', 'true');
      //localStorege.setItem('username', data.username);
      document.getElementById('logged-in').classList.remove('hidden');
      document.getElementById('logged-out').classList.add('hidden');
    }
    else if (response.status === 401) {
      if (refreshToken2) {
        await refreshToken();
        let response = await fetch('/api/loggedin/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${localStorage.getItem('access-token')}`
        }})

        if (response.ok) {
          localStorage.setItem('loggedIn', 'true');
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
  const refreshToken2 = localStorage.getItem('refresh-token');
  const data = {
    refresh: refreshToken2
  };
  
  let response = await fetch('/api/logout/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(data),
  })

  // If unauthorized, attempt to refresh the token and retry logout

  //case of unauthorized
  if (response.status === 401) {
    
    console.log("retrying logout");
    await refreshToken();
    //retry logout
    //print random message
    response = await fetch('/api/logout/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access-token')}` // Use new access token
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      // If token refresh fails, force logout
      handleFailure("Session expired. Please log in again.");
      localStorage.setItem('loggedIn', 'false');
      localStorage.removeItem('access-token');
      localStorage.removeItem('refresh-token');
      document.getElementById('logged-in').classList.add('hidden');
      document.getElementById('logged-out').classList.remove('hidden');
      renderPage('login');
      return;
    } else {
      // If token refresh succeeds, retry logout
      handleSuccess("Logged out successfully");
      localStorage.setItem('loggedIn', 'false');
      localStorage.removeItem('access-token');
      localStorage.removeItem('refresh-token');
      document.getElementById('logged-in').classList.add('hidden');
      document.getElementById('logged-out').classList.remove('hidden');
      renderPage('login');
    }


    //logout();
  }
  //case for other errors except success
  else if (!response.ok) {
    handleFailure("Failed to logout");
    localStorage.setItem('loggedIn', 'false');
    localStorage.removeItem('access-token');
    localStorage.removeItem('refresh-token');
    document.getElementById('logged-in').classList.add('hidden');
    document.getElementById('logged-out').classList.remove('hidden');
    renderPage('login');
  }
  //case for success
  else {
    handleSuccess("Logged out successfully");
    localStorage.setItem('loggedIn', 'false');
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
      localStorage.setItem('loggedIn', 'true');
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
    //loginForm.disabled = false;
    setTimeout(() => {
      errorMessage.innerHTML = '<strong>Login failed! Try again later</strong>';
    }, 2000);
    // Show error message on failed login
    setTimeout(() => {
        errorMessage.classList.add('hidden');
        errorContainer.classList.add('hidden');
    }, 2000); //wait 4 secs then hide it
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

// Handle OAuth2 login