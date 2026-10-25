/* ==========================================================================
   THE DAHMER CASE ARCHIVE — HOMEPAGE OVERVIEW EXPANDER
   File: assets/js/expander.js
   Version: 2.0 (Master Design Specification)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const expandBtn = document.querySelector('.expand-toggle-btn');
  const previewBox = document.querySelector('.overview-preview-text');

  if (expandBtn && previewBox) {
    expandBtn.addEventListener('click', () => {
      const isCurrentlyExpanded = previewBox.classList.contains('is-expanded');
      
      if (isCurrentlyExpanded) {
        previewBox.classList.remove('is-expanded');
        expandBtn.innerHTML = 'Expand preview <span aria-hidden="true">↓</span>';
        expandBtn.setAttribute('aria-expanded', 'false');

        // Smoothly scroll back to the top of the feature card if user scrolled past
        const featureCard = previewBox.closest('.feature-card');
        if (featureCard) {
          const rect = featureCard.getBoundingClientRect();
          if (rect.top < 80) {
            featureCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      } else {
        previewBox.classList.add('is-expanded');
        expandBtn.innerHTML = 'Show less <span aria-hidden="true">↑</span>';
        expandBtn.setAttribute('aria-expanded', 'true');
      }
    });
  }
});
