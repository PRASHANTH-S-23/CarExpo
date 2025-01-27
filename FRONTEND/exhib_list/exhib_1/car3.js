document.addEventListener("DOMContentLoaded", function() {
    // Handle thumbnail image clicks
    const thumbnails = document.querySelectorAll('.thumbnail img');
    const mainImage = document.querySelector('.relative img');

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            const newImageUrl = thumbnail.getAttribute('data-url');
            // Update the main image's src with the thumbnail's data-url
            mainImage.src = `https://example.com/images/${newImageUrl}`; // replace with actual image URLs
        });
    });

    // Handle car listing "like" button clicks (heart icon)
    const likeButtons = document.querySelectorAll('.fa-heart');
    likeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentLikes = parseInt(button.textContent, 10) || 0;
            button.textContent = currentLikes + 1;
        });
    });
});
// Handle navigation
document.querySelectorAll('.thumbnail').forEach(item => {
    item.addEventListener('click', (event) => {
        const page = event.target.closest('a').dataset.page;
        window.history.pushState({ page }, '', page + '.html');
        loadPageContent(page);
    });
});

// Handle back navigation
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.page) {
        loadPageContent(event.state.page);
    }
});

// Load new content dynamically
function loadPageContent(page) {
    document.getElementById('content').innerHTML = `<p>Loading ${page}...</p>`;
    setTimeout(() => {
        document.getElementById('content').innerHTML = `<h1>${page} content loaded!</h1>`;
    }, 1000); // Simulate content loading
}

// Handle back button
document.getElementById('backButton').addEventListener('click', () => {
    window.history.back();
});
