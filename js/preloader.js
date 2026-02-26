document.addEventListener('DOMContentLoaded', () => {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  setTimeout(() => {
    preloader.style.opacity = '0';
    preloader.style.pointerEvents = 'none';

    setTimeout(() => {
      preloader.remove();
    }, 600);
  }, 1200);
});