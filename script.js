document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement; // Target the <html> element for data-theme attribute

    // Function to apply the theme
    function applyTheme(theme) {
        if (theme === 'dark') {
            htmlElement.setAttribute('data-theme', 'dark');
            if (themeToggle) { // Check if the element exists before trying to modify it
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>'; // Moon icon for dark mode
            }
        } else {
            htmlElement.setAttribute('data-theme', 'light');
            if (themeToggle) { // Check if the element exists
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; // Sun icon for light mode
            }
        }
    }

    // Function to get the current preferred theme (prioritizes device setting)
    function getPreferredTheme() {
        // Check if user has manually set a preference
        const savedTheme = localStorage.getItem('theme');
        
        // If no saved preference, use system preference
        if (!savedTheme) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        return savedTheme;
    }

    // Function to detect system theme changes and apply automatically
    function handleSystemThemeChange(e) {
        // Only auto-update if user hasn't manually overridden
        const hasManualPreference = localStorage.getItem('theme');
        
        if (!hasManualPreference) {
            const systemTheme = e.matches ? 'dark' : 'light';
            applyTheme(systemTheme);
            console.log(`System theme changed to: ${systemTheme}`);
        }
    }

    // Initialize theme on page load (follows device preference by default)
    const initialTheme = getPreferredTheme();
    applyTheme(initialTheme);
    console.log(`Initial theme applied: ${initialTheme}`);

    // Listen for changes in system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    // Toggle button functionality (allows manual override)
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme); // Save user's explicit choice
            console.log(`Manual theme change to: ${newTheme}`);
        });
    }

    // Optional: Add a reset button functionality to go back to system preference
    const resetThemeButton = document.getElementById('reset-theme'); // Add this button if needed
    if (resetThemeButton) {
        resetThemeButton.addEventListener('click', () => {
            localStorage.removeItem('theme'); // Remove manual preference
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            applyTheme(systemTheme);
            console.log(`Theme reset to system preference: ${systemTheme}`);
        });
    }

    // Update current year in footer (This part is independent and should work regardless)
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Search Bar Functionality (Modified for "Find on Page") ---
    const searchInput = document.getElementById('search');
    const searchButton = document.querySelector('.rightNav .btn-sm');

    // Function to remove previous highlights
    function removeHighlights() {
        const highlightedElements = document.querySelectorAll('mark.highlight');
        highlightedElements.forEach(el => {
            const parent = el.parentNode;
            parent.replaceChild(document.createTextNode(el.textContent), el);
            parent.normalize(); // Merges adjacent text nodes
        });
    }

    function performSearch() {
        const query = searchInput.value.trim();
        removeHighlights(); // Always remove previous highlights before a new search

        if (query) { // This condition checks if the search query is NOT empty
            console.log('Searching for:', query);
            const bodyText = document.body;
            const walk = document.createTreeWalker(bodyText, NodeFilter.SHOW_TEXT, null, false);
            let node;
            let foundCount = 0;

            while ((node = walk.nextNode())) {
                const text = node.nodeValue;
                // Exclude text within script, style, and already highlighted elements to prevent issues
                if (node.parentNode.nodeName === 'SCRIPT' ||
                    node.parentNode.nodeName === 'STYLE' ||
                    node.parentNode.classList.contains('highlight')) {
                    continue;
                }

                const regex = new RegExp(query, 'gi'); // 'g' for global, 'i' for case-insensitive
                let match;
                let lastIndex = 0;
                const fragment = document.createDocumentFragment();

                while ((match = regex.exec(text)) !== null) {
                    foundCount++;
                    // Add text before the match
                    fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));

                    // Create highlight element
                    const mark = document.createElement('mark');
                    mark.className = 'highlight'; // Add a class for styling
                    mark.textContent = match[0];
                    fragment.appendChild(mark);

                    lastIndex = regex.lastIndex;
                }

                // Add remaining text after the last match
                fragment.appendChild(document.createTextNode(text.substring(lastIndex)));

                if (foundCount > 0) {
                    node.parentNode.replaceChild(fragment, node);
                }
            }

            if (foundCount === 0) {
                alert(`No occurrences of "${query}" found.`);
            } else {
                alert(`Found ${foundCount} occurrences of "${query}".`);
            }

            // Optional: Scroll to the first highlighted element
            const firstHighlight = document.querySelector('mark.highlight');
            if (firstHighlight) {
                firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

        } else {
            // This is the line that generates the "Please enter a search term." alert.
            alert('Please enter a search term to find on the page.');
        }
    }

    // Add event listener for the search button click
    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }

    // Add event listener for "Enter" key press in the search input
    if (searchInput) {
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent default form submission if any
                performSearch();
            }
        });
    }
});
