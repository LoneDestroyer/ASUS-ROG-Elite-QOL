// ==UserScript==
// @name         ASUS ROG Elite QOL
// @description  Quality of life changes
// @author      Lone Destroyer
// @license     MIT
// @match       https://rog.asus.com/*/elite
// @icon        https://rog.asus.com/favicon.ico
// @version     0.1
// @namespace https://github.com/LoneDestroyer
// ==/UserScript==
// This script hides elements that contain the word "wallpaper" in their title on the ASUS ROG Elite page.
(function() {
    'use strict';

    // Function to check and hide elements that contain the text "wallpaper"
    function hideWallpaperElements() {
        const cards = document.querySelectorAll('.PassPortCard__passPortCard__2N9Fz');

        cards.forEach(card => {
            const title = card.querySelector('.PassPortCard__title__2Izls');
            if (title && title.textContent.toLowerCase().includes('wallpaper')) {
                card.style.display = 'none'; // Hide the element
                console.log(`Hidden element: "${title.textContent.trim()}" containing the word "wallpaper"`); // Log the title of the hidden element
            }
        });
    }

    // Set up a MutationObserver to monitor the DOM for changes
    const observer = new MutationObserver(() => {
        // Run the function once when the elements are added to the DOM
        hideWallpaperElements();
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Optionally, call the function immediately in case elements are already loaded
    hideWallpaperElements();

})();
