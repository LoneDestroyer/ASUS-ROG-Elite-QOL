// ==UserScript==
// @name        ASUS ROG Elite QOL
// @description Toggle wallpapers and Unavailable (Complete, Sold Out, Locked) cards
// @author      Lone Destroyer
// @license     MIT
// @match       https://rog.asus.com/*/elite*
// @icon        https://rog.asus.com/rog/nuxtStatic/img/favicon.ico
// @version     1.0
// @namespace   https://github.com/LoneDestroyer
// @downloadURL https://github.com/LoneDestroyer/ASUS-ROG-Elite-QOL/raw/refs/heads/main/ASUS-ROG-Elite-QOL.user.js
// @updateURL   https://github.com/LoneDestroyer/ASUS-ROG-Elite-QOL/raw/refs/heads/main/ASUS-ROG-Elite-QOL.user.js
// ==/UserScript==

(function() {
    'use strict';
    const STORAGE_KEY = 'asusRogEliteQOLState';

    const defaultPreferences = {
        hideWallpapers: true,
        showUnavailable: true,
        showCompleted: true,
        showSoldOut: true,
        showLocked: true,
    };

    // Load preferences from localStorage, fallback to defaults
    const userPreferences = Object.assign({}, defaultPreferences, JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'));
    const savePreferences = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(userPreferences));

    // Toggles for settings panel
    const toggleOptions = [
        { key: 'hideWallpapers', label: 'Wallpapers' },
        {
            key: 'showUnavailable', label: 'Unavailable', children: [
                { key: 'showCompleted', label: 'Completed' },
                { key: 'showSoldOut', label: 'Sold Out' },
                { key: 'showLocked', label: 'Locked' }
            ]
        }
    ];

    // Creates settings panel with checkboxes
    function createSettingsPanel() {
        const panel = document.createElement('div');
        panel.style = `
            position:fixed;top:10px;left:10px;z-index:9999;background:#181a1b;
            padding:10px;border-radius:12px;box-shadow:0 2px 6px rgba(0,0,0,0.2);font-family:Arial,sans-serif;
            font-size:14px;display:flex;flex-direction:column;gap:5px;`.replace(/\s+/g, '');
        // Header
        panel.innerHTML = `<span style="
            font-weight:bold;font-size:13px;color:#fff;background:#c20013;
            padding:3px 0;border-radius:6px 6px 0 0;letter-spacing:1.5px;
            text-align:center;margin:0 -10px 0 -10px;">HIDE</span>`;

        // Store refs for checkboxes incase of page updates
        const refs = {};
        toggleOptions.forEach(({ key, label, children }) => {
            addCheckbox(panel, key, label, refs, children);
            if (children) {
                // Indent child checkboxes visually
                const subCheckboxGroup = document.createElement('div');
                subCheckboxGroup.style = 'display:flex;flex-direction:column;gap:4px;margin-left:24px;';
                children.forEach(childOption => addCheckbox(subCheckboxGroup, childOption.key, childOption.label, refs));
                panel.appendChild(subCheckboxGroup);
            }
        });
        document.body.appendChild(panel);

        // Create checkbox + label
        function addCheckbox(parent, key, label, refs, children) {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = userPreferences[key];
            refs[key] = checkbox;

            // Descriptions on hover
            let description = '';
            switch (key) {
                case 'hideWallpapers':
                    description = 'Hides Wallpaper Rewards';
                    break;
                case 'showUnavailable':
                    description = 'Hides anything containing a cover, this will include Completed, Sold Out and Locked cards';
                    break;
                case 'showCompleted':
                    description = 'Hides Completed Activities - some do not get marked as complete by ASUS :(';
                    break;
                case 'showSoldOut':
                    description = 'Hides Sold Out Rewards';
                    break;
                case 'showLocked':
                    description = 'Hides Locked Rewards';
                    break;
                default:
                    description = label;
            }
            checkbox.title = description;

            const checkboxLabel = document.createElement('label');
            checkboxLabel.style = 'display:flex;align-items:center;gap:4px;';
            checkboxLabel.append(checkbox, document.createTextNode(label));
            checkboxLabel.title = description;
            parent.appendChild(checkboxLabel);

            // Changes "Unavailable" & childs checkboxes when toggled
            checkbox.onchange = () => {
                userPreferences[key] = checkbox.checked;
                // If parent is toggled, update children
                if (key === 'showUnavailable' && children) {
                    children.forEach(c => {
                        userPreferences[c.key] = checkbox.checked;
                        refs[c.key].checked = checkbox.checked;
                    });
                }
                // If child is untoggled, untoggle parent
                if (['showCompleted', 'showSoldOut', 'showLocked'].includes(key)) {
                    if (![userPreferences.showCompleted, userPreferences.showSoldOut, userPreferences.showLocked].every(Boolean)) {
                        userPreferences.showUnavailable = false;
                        refs.showUnavailable.checked = false;
                    }
                }
                savePreferences();
                hideCards();
            };
        }
    }

    // Returns true if a card should be hidden - based on preferences and card content
    function shouldHideCard(cardTitle, cardStatus, userPreferences) {
        if (userPreferences.hideWallpapers && cardTitle.includes('wallpaper')) return true;
        if (cardStatus.includes('complete') && userPreferences.showCompleted) return true;
        if (cardStatus.includes('sold out') && userPreferences.showSoldOut) return true;
        if (cardStatus.includes('locked') && userPreferences.showLocked) return true;
        return false;
    }

    // Hides / Shows cards based on user preference
    function hideCards() {
        document.querySelectorAll('.PassPortCard__passPortCard__2N9Fz').forEach(card => {
            const cardTitle = card.querySelector('.PassPortCard__title__2Izls')?.textContent.toLowerCase() || '';
            const cardStatus = card.querySelector('.PassPortCard__cover__1C8of .PassPortCard__status__1r8Ov p.PassPortCard__text__1De4n')?.textContent.toLowerCase() || '';
            if (shouldHideCard(cardTitle, cardStatus, userPreferences)) {
                card.style.display = 'none';
            } else {
                card.style.display = '';
            }
        });
    }

    // Observer
    new MutationObserver(hideCards).observe(document.body, { childList: true, subtree: true });

    // Initialize panel and hide cards
    createSettingsPanel();
    hideCards();
})();