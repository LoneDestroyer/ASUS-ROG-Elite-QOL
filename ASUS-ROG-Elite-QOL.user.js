// ==UserScript==
// @name        ASUS ROG Elite QOL
// @description Quality of life changes
// @author      Lone Destroyer
// @license     MIT
// @match       https://rog.asus.com/*/elite*
// @icon        https://rog.asus.com/rog/nuxtStatic/img/favicon.ico
// @version     0.2
// @namespace   https://github.com/LoneDestroyer
// @downloadURL https://github.com/LoneDestroyer/ASUS-ROG-Elite-QOL/raw/refs/heads/main/ASUS-ROG-Elite-QOL.user.js
// @updateURL   https://github.com/LoneDestroyer/ASUS-ROG-Elite-QOL/raw/refs/heads/main/ASUS-ROG-Elite-QOL.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Hides cards with title containing "wallpaper" or if it has already been completed
    function hideCards() {
        const cards = document.querySelectorAll('.PassPortCard__passPortCard__2N9Fz');
        cards.forEach(card => {
            const title = card.querySelector('.PassPortCard__title__2Izls');
            const completed = card.querySelector('.PassPortCard__cover__1C8of');

            // Hide if title contains "wallpaper"
            if (title && title.textContent.toLowerCase().includes('wallpaper')) {
                card.style.display = 'none';
                console.log(`Hidden: "${title.textContent.trim()}" (WALLPAPER)`);
            }

            // Hide if the class "PassPortCard__cover__1C8of" is present (COMPLETED)
            if (completed) {
                card.style.display = 'none';
                console.log(`Hidden: "${title.textContent.trim()}" (COMPLETED)`);
            }
        });
    }

    // Set up a MutationObserver to monitor the DOM for changes
    const observer = new MutationObserver(hideCards);
    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
    hideCards();
})();