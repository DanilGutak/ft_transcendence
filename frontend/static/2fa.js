
const errorMessage = document.getElementById('error-message');
const errorContainer = document.getElementById('error-container');
const successContainer = document.getElementById('success-container');
const successMessage = document.getElementById('success-message');



document.addEventListener('DOMContentLoaded', () => {
    const Submit2fa = document.getElementById('2fa-button');
    const Tickbox2fa = document.getElementById('2fa-tickbox');
    const Send2fa = document.getElementById('2fa-again-button');


    Submit2fa.addEventListener('click', function(event) {
      verify2fa();
    });
    Send2fa.addEventListener('click', function(event) {
      send2fa();
    });
    Tickbox2fa.addEventListener('click', function(event) {
      tickbox2fa();
    });
  });


  function tickbox2fa() {
    const checkbox = document.getElementById('2fa-tickbox');
    token = localStorage.getItem('access-token');
    if (checkbox.checked) {
        document.getElementById('2fa').classList.add('hidden');
        fetch('/api/2fa/enable', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
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
            errorMessage.classList.add('hiddeh');
            successContainer.classList.remove('hidden');
            successMessage.innerHTML = '<strong>2FA enabled!</strong>';
            // wait for sec
            setTimeout(() => {
                successContainer.classList.add('hidden');
            }, 2000);
        })
        .catch(error => {
            errorContainer.classList.remove('hidden');
            errorMessage.innerHTML = '<strong>Could not enable 2FA! Try again later</strong>';
            checkbox.checked = false;
        });
    }
    else{
        fetch('/api/2fa/disable', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
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
            errorMessage.classList.add('hiddeh');
            successContainer.classList.remove('hidden');
            successMessage.innerHTML = '<strong>2FA disabled!</strong>';
            // wait for sec
            setTimeout(() => {
                successContainer.classList.add('hidden');
            }, 2000);
        })
        .catch(error => {
            errorContainer.classList.remove('hidden');
            errorMessage.innerHTML = '<strong>Could not disable 2FA! Try again later</strong>';
            checkbox.checked = true;
        });
    }
    
}

function verify2fa() {
    const code = document.getElementById('2fa-OTP').value;
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const container = document.getElementById('2fa');
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
        errorMessage.classList.add('hiddeh');
        successContainer.classList.remove('hidden');
        successMessage.innerHTML = '<strong>Verification successful!</strong>';
        document.getElementById('2fa-tickbox').checked = true;
        localStorage.setItem('access-token', data['access']);
        localStorage.setItem('refresh-token', data['refresh']);
        // wait for sec
        setTimeout(() => {
            loginSuccess();
        }, 2000);
    })
    .catch(error => {
        errorContainer.classList.remove('hidden');
        if (error['error']) {
            errorMessage.innerHTML = '<strong>Verification failed! ' + error['error'] + '</strong>';
        }
        else {
            errorMessage.innerHTML = '<strong>Verification failed! Try again later</strong>';
        }
    });

}


function send2fa()
{
    fetch('/api/2fa/send', {
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
        successMessage.innerHTML = '<strong>Check your mailbox:)</strong>';
    })
    .catch(error => {
        errorContainer.classList.remove('hidden');
        if (error['error']) {
            errorMessage.innerHTML = '<strong>Could not send OTP ' + error['message'] + '</strong>';
        }
        else {
            errorMessage.innerHTML = '<strong>Could not send OTP! Try again later</strong>';
        }
    });
}