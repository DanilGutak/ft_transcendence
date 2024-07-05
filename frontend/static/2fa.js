
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
        Submit2fa.disabled = true;
        setTimeout(() => {
            Submit2fa.disabled = false;
        }, 20000);
    });
    Send2fa.addEventListener('click', function(event) {
      send2fa();
      Send2fa.disabled = true;
        setTimeout(() => {
            Send2fa.disabled = false;
        }, 20000);
    });
    Tickbox2fa.addEventListener('click', function(event) {
      tickbox2fa();
      Tickbox2fa.disabled = true;
      setTimeout(() => {
        Tickbox2fa.disabled = false;
    }, 2000);
    });
  });


  async function refreshToken() {
    const refreshToken = localStorage.getItem('refresh-token');
    const response = await fetch('/api/token/refresh', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
        throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    localStorage.setItem('access-token', data.access);
    localStorage.setItem('refresh-token', data.refresh);
}

async function tickbox2fa() {
    const checkbox = document.getElementById('2fa-tickbox');
    let token = localStorage.getItem('access-token');

    try {
        if (checkbox.checked) {
            document.getElementById('2fa').classList.add('hidden');
            await make2faRequest('/api/2fa/enable', token, '2FA enabled!');
        } else {
            await make2faRequest('/api/2fa/disable', token, '2FA disabled!');
        }
    } catch (error) {
        console.error(error);
    }
}

async function make2faRequest(url, token, successMessageText) {
    let response = await fetch(url, { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
    });

    if (response.status === 401) {
        await refreshToken();
        token = localStorage.getItem('access-token');
        response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
        });
    }

    if (!response.ok) {
        const err = await response.json();
        throw err;
    }

    const data = await response.json();
    handleSuccess(successMessageText);
}

function handleSuccess(message) {
    const successContainer = document.getElementById('success-container');
    const successMessage = document.getElementById('success-message');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');

    errorContainer.classList.add('hidden');
    errorMessage.classList.add('hidden');
    successContainer.classList.remove('hidden');
    successMessage.innerHTML = `<strong>${message}</strong>`;

    setTimeout(() => {
        successContainer.classList.add('hidden');
    }, 2000);
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