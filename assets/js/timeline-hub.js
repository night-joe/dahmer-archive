/* ==========================================================================
   THE DAHMER CASE ARCHIVE — TIMELINE HUB & ANCHOR NAVIGATOR
   File: assets/js/timeline-hub.js
   Version: 2.0 (Master Design Specification)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  function highlightTarget() {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;

    try {
      const targetId = decodeURIComponent(hash.substring(1));
      const targetElement = document.getElementById(targetId) || document.querySelector(hash);

      if (targetElement) {
        // Scroll target into view with appropriate offset
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add visual pulse indicator
        targetElement.classList.add('highlight-pulse');
        setTimeout(() => {
          targetElement.classList.remove('highlight-pulse');
        }, 2500);
      }
    } catch (err) {
      // Gracefully handle malformed selectors or query exceptions
      console.warn('Timeline target selector error:', err);
    }
  }

  // Check on initial load
  if (window.location.hash) {
    // Delay slightly to ensure layout and fonts are fully settled
    setTimeout(highlightTarget, 100);
  }

  // Listen for hash changes
  window.addEventListener('hashchange', highlightTarget);
});
