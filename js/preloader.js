document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("preloader");
  if (!loader) return;

  const MAX_WAIT = 5000;
  let loaderHidden = false;

  function hidePreloader() {
    if (loaderHidden) return;
    loaderHidden = true;

    loader.style.opacity = "0";

    setTimeout(() => {
      loader.remove();
    }, 600);
  }

  window.addEventListener("load", hidePreloader);
  setTimeout(hidePreloader, MAX_WAIT);
});