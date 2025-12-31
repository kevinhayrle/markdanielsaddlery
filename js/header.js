(() => {
  const menuBtn = document.querySelector('.menu-wrap');
  const cartBtn = document.querySelector('.cart-wrap');
  const logoWrap = document.querySelector('.logo-wrap');
  const brandCenter = document.querySelector('.brand-center');

  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const header = document.querySelector('.site-header');

  if (!menuBtn || !sidebar || !overlay || !header) {
    console.error('Header elements not found');
    return;
  }

  /* ================= SIDEBAR DIRECTION ================= */

  const setSidebarSide = () => {
    const isScrolled = header.classList.contains('scrolled');

    document.body.classList.remove('sidebar-left', 'sidebar-right');
    document.body.classList.add(isScrolled ? 'sidebar-left' : 'sidebar-right');
  };

  /* ================= OPEN / CLOSE ================= */

  const openSidebar = () => {
    setSidebarSide();
    sidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.classList.add('no-scroll');
  };

  const closeSidebar = () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
  };

  const toggleSidebar = () => {
    sidebar.classList.contains('active') ? closeSidebar() : openSidebar();
  };

  menuBtn.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', closeSidebar);

  /* ================= SCROLL LISTENER ================= */
  // ❗ ONLY change side when sidebar is CLOSED
  window.addEventListener('scroll', () => {
    if (!sidebar.classList.contains('active')) {
      setSidebarSide();
    }
  });

  /* ================= REDIRECTS ================= */

  if (logoWrap) {
    logoWrap.style.cursor = 'pointer';
    logoWrap.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  if (brandCenter) {
    brandCenter.style.cursor = 'pointer';
    brandCenter.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  if (cartBtn) {
    cartBtn.style.cursor = 'pointer';
    cartBtn.addEventListener('click', () => {
      window.location.href = 'cart.html';
    });
  }
})();
