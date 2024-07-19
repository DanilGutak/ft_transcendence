
function hideAllPages() {
    const pages = document.getElementsByClassName('page');
    for (let i = 0; i < pages.length; i++) {
        pages[i].classList.add('hidden');
    }
}

function renderPage(path) {
    if (localStorage.getItem('loggedIn') === 'true') {
        if (path === 'login' || path === 'register' || path === '2fa') {
            path = '';
        }
    }
    else {
        if (path === 'game') {
            path = '';
        }
    }
    hideAllPages();
    if (path === null || path === '') {
        document.getElementById('home').classList.remove('hidden');
    }
    else {
        document.getElementById(path).classList.remove('hidden');
    }
}

// Function to handle navigation clicks
function navigate(event) {
    event.preventDefault();
    const path = event.target.getAttribute('data-path');
    history.pushState({ path }, null, window.location.origin);
    renderPage(path);
}

document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-item.nav-link');

    // Define content for each route

    // Function to update the content based on the path
    

    // Add event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', navigate);
    });

    // Handle back/forward navigation
    window.addEventListener('popstate', (event) => {
        const path = event.state ? event.state.path : '';
        renderPage(path);
    });
});
