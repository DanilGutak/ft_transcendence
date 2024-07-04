
function hideAllPages() {
    const pages = document.getElementsByClassName('page');
    for (let i = 0; i < pages.length; i++) {
        pages[i].classList.add('hidden');
    }
}

function renderPage(path) {
    hideAllPages();
    document.getElementById(path).classList.remove('hidden');
}

// Function to handle navigation clicks
function navigate(event) {
    event.preventDefault();
    const path = event.target.getAttribute('data-path');
    history.pushState(null, null, window.location.origin + "/"+path);
    renderPage(path);
}

document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');
    const navLinks = document.querySelectorAll('.nav-item.nav-link');

    // Define content for each route

    // Function to update the content based on the path
    

    // Add event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', navigate);
    });

    // Handle back/forward navigation
    window.addEventListener('popstate', () => {
        renderPage(window.location.pathname);
    });

    // Render the initial page based on the current path
});
