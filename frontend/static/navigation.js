document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');
    const navLinks = document.querySelectorAll('.nav-item.nav-link');

    // Define content for each route
    const pages = {
        '/': '<h1>Home Page</h1><p>Welcome to the Home page.</p>',
        '/profile': '<h1>Profile Page</h1><p>This is your profile.</p>',
        '/game': '<h1>Game Page</h1><p>Enjoy the game!</p>',
        '/logout': '<h1>Logout Page</h1><p>You have been logged out.</p>'
    };

    // Function to update the content based on the path
    function renderPage(path) {
        content.innerHTML = pages[path] || '<h1>404 Not Found</h1><p>Page not found.</p>';
    }

    // Function to handle navigation clicks
    function navigate(event) {
        event.preventDefault();
        const path = event.target.getAttribute('data-path');
        history.pushState({}, '', path);
        renderPage(path);
    }

    // Add event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', navigate);
    });

    // Handle back/forward navigation
    window.addEventListener('popstate', () => {
        renderPage(window.location.pathname);
    });

    // Render the initial page based on the current path
    renderPage(window.location.pathname);
});
