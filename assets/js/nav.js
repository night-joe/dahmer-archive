/* ==========================================================================
   THE DAHMER CASE ARCHIVE — NAVIGATION CONTROLLER
   File: assets/js/nav.js
   Version: 2.0 (Master Design Specification)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navContainer = document.querySelector('.site-nav');
  const navItems = document.querySelectorAll('.nav-item');
  const navLinks = document.querySelectorAll('.nav-link');

  // --- 1. Mobile Menu Toggle ---
  if (toggleBtn && navContainer) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navContainer.classList.toggle('is-open');
      toggleBtn.setAttribute('aria-expanded', isOpen.toString());
      
      const toggleText = toggleBtn.querySelector('.toggle-text');
      const toggleIcon = toggleBtn.querySelector('.toggle-icon');
      if (toggleText) toggleText.textContent = isOpen ? 'CLOSE' : 'MENU';
      if (toggleIcon) toggleIcon.textContent = isOpen ? '✕' : '☰';
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navContainer.classList.contains('is-open') && 
          !navContainer.contains(e.target) && 
          !toggleBtn.contains(e.target)) {
        navContainer.classList.remove('is-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        const toggleText = toggleBtn.querySelector('.toggle-text');
        const toggleIcon = toggleBtn.querySelector('.toggle-icon');
        if (toggleText) toggleText.textContent = 'MENU';
        if (toggleIcon) toggleIcon.textContent = '☰';
      }
    });
  }

  // --- 2. Mobile Dropdown Accordion Toggle ---
  navItems.forEach(item => {
    const dropdown = item.querySelector('.dropdown-menu');
    const link = item.querySelector('.nav-link');
    const arrow = item.querySelector('.arrow-icon');

    if (dropdown && link) {
      // In mobile view (<= 860px), clicking the arrow toggles the dropdown accordion
      if (arrow) {
        arrow.addEventListener('click', (e) => {
          if (window.innerWidth <= 860) {
            e.preventDefault();
            e.stopPropagation();
            item.classList.toggle('is-open');
          }
        });
      }

      // Keyboard support: open on focus, close on focus loss
      link.addEventListener('focus', () => {
        if (window.innerWidth > 860) {
          dropdown.style.display = 'block';
          dropdown.style.opacity = '1';
          dropdown.style.pointerEvents = 'auto';
        }
      });

      item.addEventListener('focusout', (e) => {
        if (window.innerWidth > 860 && !item.contains(e.relatedTarget)) {
          dropdown.style.display = '';
          dropdown.style.opacity = '';
          dropdown.style.pointerEvents = '';
        }
      });
    }
  });

  // --- 3. Keyboard Escape Key to Close Menus ---
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Close desktop open dropdowns
      navItems.forEach(item => {
        const dropdown = item.querySelector('.dropdown-menu');
        if (dropdown) {
          dropdown.style.display = '';
          dropdown.style.opacity = '';
          dropdown.style.pointerEvents = '';
        }
        item.classList.remove('is-open');
      });

      // Close mobile drawer
      if (navContainer && navContainer.classList.contains('is-open')) {
        navContainer.classList.remove('is-open');
        if (toggleBtn) {
          toggleBtn.setAttribute('aria-expanded', 'false');
          const toggleText = toggleBtn.querySelector('.toggle-text');
          const toggleIcon = toggleBtn.querySelector('.toggle-icon');
          if (toggleText) toggleText.textContent = 'MENU';
          if (toggleIcon) toggleIcon.textContent = '☰';
          toggleBtn.focus();
        }
      }
    }
  });

  // --- 4. Active Link & Parent Section Highlighting ---
  function setActiveNavigation() {
    const pathname = window.location.pathname;
    let currentFilename = pathname.substring(pathname.lastIndexOf('/') + 1).toLowerCase();
    
    // Normalize root paths
    if (!currentFilename || currentFilename === '') {
      currentFilename = 'index.html';
    }

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      const hrefFile = href.split('#')[0].split('?')[0].toLowerCase();
      const parentItem = link.closest('.nav-item');

      // Check if primary link matches
      if (hrefFile === currentFilename || 
          (currentFilename === 'index.html' && (hrefFile === '' || hrefFile === './' || hrefFile === 'index.html'))) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }

      // Check dropdown links within this parent item
      if (parentItem) {
        const dropdownLinks = parentItem.querySelectorAll('.dropdown-item a');
        dropdownLinks.forEach(subLink => {
          const subHref = subLink.getAttribute('href');
          if (!subHref) return;
          const subHrefFile = subHref.split('#')[0].split('?')[0].toLowerCase();

          if (subHrefFile === currentFilename && currentFilename !== 'index.html') {
            link.classList.add('active');
            subLink.classList.add('active');
          }
        });
      }
    });
  }

  setActiveNavigation();
});
