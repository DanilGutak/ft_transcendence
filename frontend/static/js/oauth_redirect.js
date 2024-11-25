document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const oauthRedirected = urlParams.get('oauth_redirected');
    if (oauthRedirected) {
        // Store the flag in sessionStorage for subsequent checks
        //sessionStorage.setItem('oauth_redirected', 'true');

        // Clear the query parameter from the URL
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
    
    //console.log(sessionStorage.getItem('oauth_redirected') === 'true');
    // Proceed only if the flag exists in sessionStorage
    if (!oauthRedirected) {
        return;
    }

    try {
        const response = await fetch('/api/oauth/status/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch OAuth status');
        }

        const data = await response.json();
        if (data.status === 'success') {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('oauthLogin', 'true');
            fetch('https://127.0.0.1:8005/api/oauth/get-oauth-tokens/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch tokens');
                }
                return response.json();
            })
            .then(data => {
                const accessToken = data['access'];
                const refreshToken = data['refresh'];
                //const is_oauth = data['is_oauth'];
        
                if (accessToken && refreshToken) {
                    localStorage.setItem('access-token', accessToken);
                    localStorage.setItem('refresh-token', refreshToken);
                    //localStorage.setItem('oauthLogin', 'true');
                    successContainer.classList.remove('hidden');
                    successMessage.innerHTML = '<strong>Logged in succesfully!</strong>';
                    checkLogin();
                    loginSuccess();
                } else {
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
                    //alert('OAuth login failed! Missing tokens.');
                    //redirectToHomepage();
                }
            })
        } else if (data.status === 'failure') {
            alert('OAuth login failed! Please try again.');
        }

        // Clear the flag after handling
        //sessionStorage.removeItem('oauth_redirected');
    } catch (error) {
        alert('OAuth login failed! Please try again.');
    }
});