document.addEventListener('DOMContentLoaded', async () => {
    let oauthRedirected = false;

    //only execute this if oauth_redirected session variable is true

    try {
        const response = await fetch('/api/oauth/redirect-status/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch OAuth redirect status');
        }

        const data = await response.json();
        oauthRedirected = data.oauth_redirected;

    } catch (error) {
        console.error('Error checking OAuth redirect status:', error);
    }
    
    console.log('OAuth Redirected:', oauthRedirected);
    if (oauthRedirected !== true) {
        return;
    }

    //otherwise continue
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
            //localStorage.setItem('loggedIn', 'true');
            //localStorage.setItem('oauthLogin', 'true');
            fetch('https://127.0.0.1:8005/api/oauth/get-oauth-tokens/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => {
                if (!response.ok) {
                    window.opener.postMessage({oauth_success: false}, window.location.origin);
                    throw new Error('Failed to fetch tokens');
                }
                return response.json();
            })
            .then(data => {
                const accessToken = data['access'];
                const refreshToken = data['refresh'];
                //const is_oauth = data['is_oauth'];
        
                if (accessToken && refreshToken) {
                    /*localStorage.setItem('access-token', accessToken);
                    localStorage.setItem('refresh-token', refreshToken);
                    localStorage.setItem('oauthLogin', 'true');
                    successContainer.classList.remove('hidden');
                    successMessage.innerHTML = '<strong>Logged in succesfully!</strong>';
                    checkLogin();
                    loginSuccess();*/

                    //send the tokens + oauth_success variable to the origin window
                    
                    //check if the window.opener is accessible
                    if (!window.opener) {
                        console.error('window.opener is not accessible, closing ...');
                        
                        return;
                    }
                    window.opener.postMessage({access: accessToken, refresh: refreshToken, oauth_success: true}, window.location.origin);
                    //close the popup after 5 seconds
                    

                } else {
                    /*
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
                    */
                    
                    //close the popup and send the oauth_success variable to the origin window
                    window.opener.postMessage({oauth_success: false}, window.location.origin);
                    //close 
                }
            })
        } else if (data.status === 'failure') {
            window.opener.postMessage({oauth_success: false}, window.location.origin);
            //close
        }

        // Clear the flag after handling
        //sessionStorage.removeItem('oauth_redirected');
    } catch (error) {
        console.error('Error checking OAuth status:', error);
    }
});

/*function handleOAuthCallback() {
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

        if (accessToken && refreshToken) {
            localStorage.setItem('access-token', accessToken);
            localStorage.setItem('refresh-token', refreshToken);
            
        
            redirectToHomepage();
        } else {
            alert('OAuth login failed! Missing tokens.');
            redirectToHomepage();
        }
    })
    .catch(error => {
        alert('OAuth login failed! Please try again.');
        redirectToHomepage();
    });
}
*/

/*function redirectToHomepage() {
    console.log("Redirecting to homepage...");

    
    
    window.history.pushState({}, '', '/')
    // Optionally, update your page's content dynamically here
    updateHomepageContent();
    setTimeout(() => {
        window.location.href = '/';
    }, 2000);
}*/