document.addEventListener('DOMContentLoaded', () => {
    const Submit2fa = document.getElementById('2fa-button');
    Submit2fa.addEventListener('click', function(event) {
      verify2fa();
    });
    const Send2fa = document.getElementById('2fa-again-button');
    Send2fa.addEventListener('click', function(event) {
      send2fa();
    });
  });


function verify2fa() {
    const code = document.getElementById('2fa-OTP').value;
    const errorMessage = document.getElementById('error-message');
    const errorContainer = document.getElementById('error-container');
    const successContainer = document.getElementById('success-container');
    const successMessage = document.getElementById('success-message');
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const data = {
        username: username,
        password: password,
        otp: code
    };
    
    fetch('/api/2fa/verify', {
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
        // Handle successful verification here
        errorContainer.classList.add('hidden');
        successContainer.classList.remove('hidden');
        successMessage.innerHTML = '<strong>Verification successful!</strong>';
    })
    .catch(error => {
        errorContainer.classList.remove('hidden');
        if (error['error']) {
            errorMessage.innerHTML = '<strong>Verification failed!' + error['message'] + '</strong>';
        }
        else {
            errorMessage.innerHTML = '<strong>Verification failed! Try again later</strong>';
        }
    });

}