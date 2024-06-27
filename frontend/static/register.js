document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-submit-button');
    registerForm.addEventListener('click', function(event) {
      register();
    });
    const loginForm = document.getElementById('register-login-button');
    loginForm.addEventListener('click', function(event) {
      document.getElementById('register').classList.add('hidden');
      document.getElementById('login').classList.remove('hidden');
    });

  
  });



function register() {

    const username = document.getElementById('register-username');
    const password = document.getElementById('register-password');
    const password2 = document.getElementById('register-password2');
    const email = document.getElementById('register-email');
    const errorMessage = document.getElementById('error-message-register');
    const errorContainer = document.getElementById('error-container-register');
    const successContainer = document.getElementById('success-container-register');
    const data = {
      username: username.value,
      email: email.value,
      password: password.value,
      password2: password2.value
    };
  
    fetch('/api/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw err;
            });
        }
        return response.json();
    })
    .then(data => {
        // Handle successful registration here
        successContainer.classList.remove('hidden');
        errorContainer.classList.add('hidden');
        username.value = '';
        email.value = '';
        password.value = '';
        password2.value = '';
         // Hide error message on successful registration
    })
    .catch(error => {
        errorContainer.classList.remove('hidden');
        errorMessage.innerHTML = '<strong>Register failed:<br>';
        for (const [key, value] of Object.entries(error)) {
            if (key === 'password2') {
                errorMessage.innerHTML += `Repeated Password: ${value}<br>`;
            }
            else if (key === 'detail') {
                errorMessage.innerHTML += `Try again later!<br>`;
            }
            else
            {
                key2 = key.charAt(0).toUpperCase() + key.slice(1);
                // remove commas from the error message
                errorMessage.innerHTML += `${key2}: ${value.join(' ').replace(/,/g, ' ')}<br>`;
            }


        }
        errorMessage.innerHTML += '</strong>';
        
        // Assuming error is an object with field-specific messages
        

    });
}
