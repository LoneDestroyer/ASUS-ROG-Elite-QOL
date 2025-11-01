// ==UserScript==
// @name        ASUS ROG Elite QOL
// @description Toggle wallpapers and Unavailable (Complete, Sold Out, Locked) cards
// @author      Lone Destroyer
// @license     MIT
// @match       https://rog.asus.com/*/elite*
// @icon        https://rog.asus.com/rog/nuxtStatic/img/favicon.ico
// @version     1.0.3
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
        if (!document.getElementById('asus-rog-qol-styles')) {
            const style = document.createElement('style');
            style.id = 'asus-rog-qol-styles';
            style.textContent = `
                .elite-qol-panel {position:fixed;top:10px;left:10px;z-index:9999;background:#181a1b;border-radius:12px;box-shadow:0 2px 6px rgba(0,0,0,0.2);font-family:roboto,sans-serif;font-size:15px;display:flex;flex-direction:column;width:150px;}
                .elite-qol-header-btn {position:relative;overflow:hidden;border-radius:8px 8px 0 0;background:#e30017;font-family:tradegothicltpro,sans-serif;padding-top:5px;display:flex;align-items:center;justify-content:center;}
                .elite-qol-header-hover {position:absolute;top:0;left:0;width:100%;height:100%;background:#c20013;opacity:0;cursor:pointer;transition:opacity 0.2s;z-index:1;}
                .elite-qol-header-btn:hover .elite-qol-header-hover,.elite-qol-header-btn:focus .elite-qol-header-hover {opacity:1;}
                .elite-qol-header-btn span {font-weight:bold;font-size:16px;color:#fff;letter-spacing:1.5px;z-index:2;position:relative;}
                .elite-qol-content {padding:10px;display:flex;flex-direction:column;;}
                .elite-qol-label {display:flex;align-items:center;gap:4px;}
                .elite-qol-label-group {display:flex;flex-direction:column;margin-left:24px;}`;
            document.head.appendChild(style);
        }
        const panel = document.createElement('div');
        panel.className = 'elite-qol-panel';

        // Header button
        const headerBtn = document.createElement('div');
        headerBtn.setAttribute('role', 'button');
        headerBtn.setAttribute('tabindex', '0');
        headerBtn.className = 'elite-qol-header-btn';
        headerBtn.setAttribute('aria-expanded', 'true');

        const headerSpan = document.createElement('span');
        headerSpan.textContent = 'HIDE';
        headerBtn.appendChild(headerSpan);

        // Add hover effect div
        const hoverDiv = document.createElement('div');
        hoverDiv.className = 'elite-qol-header-hover';
        headerBtn.appendChild(hoverDiv);

        // Panel Content container
        const content = document.createElement('div');
        content.className = 'elite-qol-content';

        // Store refs for checkboxes incase of page updates
        const refs = {};
        let expanded = true;

        toggleOptions.forEach(({ key, label, children }) => {
            addCheckbox(content, key, label, refs, children);
            if (children) {
                // Indent child checkboxes visually
                const subCheckboxGroup = document.createElement('div');
                subCheckboxGroup.className = 'elite-qol-label-group';
                children.forEach(childOption => addCheckbox(subCheckboxGroup, childOption.key, childOption.label, refs));
                content.appendChild(subCheckboxGroup);
            }
        });

        headerBtn.onclick = () => {
            expanded = !expanded;
            content.style.display = expanded ? 'flex' : 'none';
            headerBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            headerBtn.blur(); // Remove focus from button after click to hide hover effect
        };
        headerBtn.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                headerBtn.onclick();
                e.preventDefault();
            }
        };
        panel.appendChild(headerBtn);
        panel.appendChild(content);
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
            checkboxLabel.className = 'elite-qol-label';
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

    // Compact term lists and matcher
    const MH_MONSTERS=['zinogre','deviljho','cologne'],
          WALLPAPER_TERMS=['wallpaper','rog x evangelion|eva-02|3840x2160'],
          STATUS_MAP=[[ 'showCompleted',['complete','zakończ'] ],[ 'showSoldOut',['sold out','wyprzedane'] ],[ 'showLocked',['locked','zablokowano'] ]];

    const matchAny=(s,terms)=>terms.some(t=>s.includes(t));

    // Returns true if a card should be hidden - based on preferences and card content
    function shouldHideCard(cardTitle, cardStatus, userPreferences){
        return (
            userPreferences.hideWallpapers &&
            (matchAny(cardTitle,WALLPAPER_TERMS) || (cardTitle.includes('monster hunter now') && matchAny(cardTitle,MH_MONSTERS)))
        ) || STATUS_MAP.some(([pref,terms])=>userPreferences[pref] && matchAny(cardStatus,terms));
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