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

function openOAuthPopup(oauthUrl) {
  
  const popup = window.open(oauthUrl, 'oauthPopup', 'width=600,height=700,popup=true');
  if (!popup) {
    console.error('Popup blocked. Please enable popups for this site.');
    alert('Popup blocked by your browser. Please allow popups for this site.');
    return;
  }
  console.log("POPUUUUUP", popup);
  window.addEventListener('message', function handleOAuthMessage(event) {
      if (event.origin !== window.location.origin) {
          console.warn('Received message from unknown origin:', event.origin);
          return;
      }
      const { access, refresh, oauth_success } = event.data;

      if (oauth_success) {
          localStorage.setItem('access-token', access);
          localStorage.setItem('refresh-token', refresh);
          localStorage.setItem('oauthLogin', 'true');
          localStorage.setItem('loggedIn', 'true');

          successContainer.classList.remove('hidden');
          
          checkLogin();
          loginSuccess();
          popup.close();
      } else {
        //----- case for failed oauth ----
        errorContainer.classList.remove('hidden');
        errorMessage.classList.remove('hidden');
        //loginForm.disabled = false;
        setTimeout(() => {
        errorMessage.innerHTML = '<strong>OAUTH Login failed! Try again later</strong>';
        }, 2000);
        // Show error message on failed login
        setTimeout(() => {
            errorMessage.classList.add('hidden');
            errorContainer.classList.add('hidden');
        }, 2000); //wait 4 secs then hide it

        popup.close();
        // ----- end -------
      }

      if (popup) popup.close();
      window.removeEventListener('message', handleOAuthMessage);
  });
}


function oauthLogin() {
  if (oauthRequestInProgress) {
      return;
  }
  oauthRequestInProgress = true;

  fetch('/api/oauth/', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
  })
      .then(response => {
          oauthRequestInProgress = false;
          if (!response.ok) {
              if (response.status === 429) {
                  alert('Too many requests. Please wait a moment.');
                  //popup.close();
              }
              if (response.status === 401) {
                  //popup.close();
                  return;
              }
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .then(data => {
          if (data['oauth_url']) {
              // Open the popup for OAuth flow
              openOAuthPopup(data['oauth_url']);
          } else {
              alert('OAuth login failed!');
              //popup.close();
          }
      })
      .catch(error => {
          oauthRequestInProgress = false;
          alert('Error initiating OAuth');
          //popup.close();
      });
}

/*
function oauthLogin() {
    if (oauthRequestInProgress) {
        return;
    }
    oauthRequestInProgress = true;
    let apiResponse = fetch('/api/oauth/', { // this fetch call ends up in urls.py at the matching endpoint, meaning it triggers OAuthLoginView.as_view()
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => {
        oauthRequestInProgress = false;
        if (!response.ok) {
            if (response.status === 429) {
                alert('Too many requests. Please wait a moment.');
            }
            if (response.status === 401) {
              // changeHTMLToReflectNoAuth()
              // return
            }
            throw new Error('Network response was not ok');
        }
        return response.json();
    }).then(data => {
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
*/

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
      if (localStorage.getItem('oauthLogin') === 'true')
      {
          document.getElementById('2fa-tickbox').disabled = true;
      }
      
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
      reset_local_storage();
      renderPage('login');
      return;
    } else {
      // If token refresh succeeds, retry logout
      handleSuccess("Logged out successfully");
      reset_local_storage();
      renderPage('login');
    }
  }
  //case for other errors except success
  else if (!response.ok) {
    handleFailure("Failed to logout");
    reset_local_storage();
    renderPage('login');
  }
  //case for success
  else {
    handleSuccess("Logged out successfully");
    reset_local_storage();
    renderPage('login');
  }
}

function reset_local_storage() {
  localStorage.setItem('loggedIn', 'false');
  localStorage.removeItem('access-token');
  localStorage.removeItem('refresh-token');
  if (localStorage.getItem('oauthLogin')) {
    localStorage.removeItem('oauthLogin');
  }
  document.getElementById('2fa-tickbox').disabled = false;
  document.getElementById('logged-in').classList.add('hidden');
  document.getElementById('logged-out').classList.remove('hidden');
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
