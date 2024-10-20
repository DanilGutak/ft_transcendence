window.onload = function() {
    if (window.location.pathname === '/oauth-redirect/') {
        handleOAuthCallback();
    }
    if (localStorage.getItem('oauthLogin') === 'true')
    {
        document.getElementById('2fa-tickbox').disabled = true;
    }

};
function handleOAuthCallback() {
    fetch('https://127.0.0.1:8005/api/oauth/get-oauth-tokens/', {  // Login container's endpoint
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch tokens');
        }
        return response.json();  // Parse the token data
    })
    .then(data => {
        const accessToken = data['access'];
        const refreshToken = data['refresh'];

        if (accessToken && refreshToken) {
            localStorage.setItem('access-token', accessToken);
            localStorage.setItem('refresh-token', refreshToken);
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('oauthLogin', 'true');
        
            redirectToHomepage();
        } else {
            alert('OAuth login failed! Missing tokens.');
            redirectToHomepage();
        }
    })
    .catch(error => {
        alert('OAuth login failed! Please try again.');
        console.log('OAuth callback page');
        redirectToHomepage();
    });
}
function redirectToHomepage() {
    setTimeout(() => {
        window.location.href = '/';
    }, 2000);
}