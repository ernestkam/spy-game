// Viewport height management
function setViewportHeight() {
    // Get the actual viewport height without mobile chrome UI
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // Set the content height that accounts for footer and mobile UI
    const contentHeight = window.innerHeight - (document.querySelector('.game-footer')?.offsetHeight || 0);
    document.documentElement.style.setProperty('--content-height', `${contentHeight}px`);
}

// Initial set
setViewportHeight();

// Update on resize and orientation change
['resize', 'orientationchange'].forEach(event => {
    window.addEventListener(event, () => {
        // Add small delay for iOS and Chrome mobile
        setTimeout(setViewportHeight, 100);
    });
}); 