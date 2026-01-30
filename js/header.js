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
  
  window.addEventListener('scroll', () => {
    if (!sidebar.classList.contains('active')) {
      setSidebarSide();
    }
  });

  if (logoWrap) {
    logoWrap.style.cursor = 'pointer';
    logoWrap.addEventListener('click', () => {
      window.location.href = '/';
    });
  }

  if (brandCenter) {
    brandCenter.style.cursor = 'pointer';
    brandCenter.addEventListener('click', () => {
      window.location.href = '/';
    });
  }

  if (cartBtn) {
    cartBtn.style.cursor = 'pointer';
    cartBtn.addEventListener('click', () => {
      window.location.href = '/html/cart.html';
    });
  }
})();

/* ================= ACCOUNT LOGIC ================= */

const accountLink = document.getElementById('account-link');

if (accountLink) {
  accountLink.addEventListener('click', (e) => {
    e.preventDefault();

    const token = localStorage.getItem('authToken');

    if (token) {
      window.location.href = '/html/profile.html';
    } else {
      localStorage.setItem('redirectAfterLogin', '/html/profile.html');
      window.location.href = '/html/login.html';
    }
  });
}
