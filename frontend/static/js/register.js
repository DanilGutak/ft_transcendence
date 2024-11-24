document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-submit-button');
    registerForm.addEventListener('click', function(event) {
      register();
    });
    const loginForm = document.getElementById('register-login-button');

  
  });



function register() {
    const username = document.getElementById('register-username');
    const password = document.getElementById('register-password');
    const password2 = document.getElementById('register-password2');
    const email = document.getElementById('register-email');
    const errorMessage = document.getElementById('error-message');
    const errorContainer = document.getElementById('error-container');
    const registerButton = document.getElementById('register-submit-button');
    
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
        handleSuccess("Registered successfully");
		// Clear the form
        username.value = '';
        email.value = '';
        password.value = '';
        password2.value = '';
        renderPage('login');
    })
    .catch(error => {
      errorContainer.classList.remove('hidden');
      errorMessage.classList.remove('hidden');
		  errorMessage.innerHTML = '<strong>Register failed:<br>';
	
      for (const [key, value] of Object.entries(error)) {
        let formattedMessage;
        if (key === 'password2') {
          formattedMessage = `Repeated Password: ${value}<br>`;
        } else if (key === 'detail') {
          formattedMessage = `Try again later!<br>`;
        } else {
          // Capitalize the first letter of the key and remove commas from the error message
          let key2 = key.charAt(0).toUpperCase() + key.slice(1);
          formattedMessage = `${key2}: ${value.join(' ').replace(/,/g, ' ')}<br>`;
        }
        errorMessage.innerHTML += formattedMessage;
      }
		
		errorMessage.innerHTML += '</strong>';
    
	});
	
}
