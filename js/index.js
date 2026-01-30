/* ================ PREFETCH PRODUCTS ================= */

if (!sessionStorage.getItem("products_cache")) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  fetch(`${API_BASE}/products`, { signal: controller.signal })
    .then(res => res.json())
    .then(products => {
      sessionStorage.setItem(
        "products_cache",
        JSON.stringify(products)
      );
    })
    .catch(() => {
    })
    .finally(() => {
      clearTimeout(timeout);
    });
}

/* ================ DIMENSION SWITCH ================= */

const heroVideo = document.getElementById('heroVideo');

function isMobileDevice() {
  return (
    window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
    window.innerWidth <= 768
  );
}

function setHeroVideo() {
  const isPhone = isMobileDevice();

  const newSrc = isPhone
    ? '/assets/banner1mobile.mp4'
    : '/assets/banner1.mp4';

  if (heroVideo.dataset.src === newSrc) return;

  heroVideo.dataset.src = newSrc;

  const wasPlaying = !heroVideo.paused;

  heroVideo.src = newSrc;
  heroVideo.load();

  if (wasPlaying) {
    heroVideo.play().catch(() => {});
  }
}

setHeroVideo();
window.addEventListener('resize', setHeroVideo);

/* ================ SLIDES ================= */

document.querySelectorAll('.banner-slider').forEach(slider => {

  const slidesContainer = slider.querySelector('.slides');
  const nextBtn = slider.querySelector('.next');
  const prevBtn = slider.querySelector('.prev');

  let slides = slider.querySelectorAll('.slide');

  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);

  firstClone.classList.add('clone');
  lastClone.classList.add('clone');

  slidesContainer.appendChild(firstClone);
  slidesContainer.insertBefore(lastClone, slides[0]);

  slides = slider.querySelectorAll('.slide');

  let index = 1;
  let autoSlideInterval;

  slidesContainer.style.transform = `translateX(-${index * 100}%)`;
  setVisible();

  function setTransition(enabled = true) {
    slidesContainer.style.transition = enabled
      ? 'transform 1.1s cubic-bezier(0.77, 0, 0.175, 1)'
      : 'none';
  }

  function setVisible() {
    slides.forEach(slide => slide.classList.remove('is-visible'));
    slides[index].classList.add('is-visible');
  }

  function updateSlider() {
    setTransition(true);
    slidesContainer.style.transform = `translateX(-${index * 100}%)`;
    setVisible();
  }

  function nextSlide() {
    if (index >= slides.length - 1) return;
    index++;
    updateSlider();
    resetAutoSlide();
  }

  function prevSlide() {
    if (index <= 0) return;
    index--;
    updateSlider();
    resetAutoSlide();
  }

  slidesContainer.addEventListener('transitionend', () => {
    if (slides[index].classList.contains('clone')) {
      setTransition(false);
      index = index === slides.length - 1 ? 1 : slides.length - 2;
      slidesContainer.style.transform = `translateX(-${index * 100}%)`;
      setVisible();
    }
  });

  function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 5000);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
  }

  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);

  let startX = 0;

  slidesContainer.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  slidesContainer.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (diff > 80) nextSlide();
    if (diff < -80) prevSlide();
  });

  startAutoSlide();
});

/* ================ POP UPS ================= */

document.addEventListener("DOMContentLoaded", () => {
  const toast = document.getElementById("sp-toast");
  if (!toast) return;

  const REDIRECT_URL = "/html/home.html";

  const notifications = [
    { name: "Alex", city: "Sydney", product: "Racing Boots" },
    { name: "Rahul", city: "Bangalore", product: "galloping Boots" },
    { name: "Emma", city: "London", product: "Breeze Boots" },
    { name: "Daniel", city: "Toronto", product: "Jockey Boots" },
    { name: "Aarav", city: "Mumbai", product: "Racing Boots" },
    { name: "Eva", city: "Sydney", product: "Racing Boots" },
    { name: "Dhruv", city: "Delhi", product: "galloping Boots" },
    { name: "Watson", city: "Texas", product: "Breeze Boots" },
    { name: "Kim Joon", city: "Seoul", product: "Jockey Boots" },
    { name: "Beatrix", city: "Rio de Janeiro", product: "Racing Boots" },
    { name: "Louis", city: "Paris", product: "Racing Boots" },
    { name: "Anton", city: "Melbourne", product: "galloping Boots" },
    { name: "Sherly", city: "Venice", product: "Breeze Boots" },
    { name: "Kevin", city: "Berlin", product: "Jockey Boots" },
    { name: "Jonas", city: "Denmark", product: "Racing Boots" }
  ];

  let isClosedManually = false;

  const FIRST_DELAY = 5000;
  const INTERVAL = 20000;
  const AUTO_HIDE = 15000;

  function showToast() {
    if (isClosedManually) {
      isClosedManually = false;
      return;
    }

    const item =
      notifications[Math.floor(Math.random() * notifications.length)];

    toast.innerHTML = `
      <span>${item.name} from ${item.city} has ordered ${item.product} <br>Order yours now!</br></span>
      <span class="sp-close">&times;</span>
    `;

    toast.classList.remove("sp-hidden");
    toast.classList.add("sp-show");

    setTimeout(() => {
      toast.classList.remove("sp-show");
      toast.classList.add("sp-hidden");
    }, AUTO_HIDE);
  }

  toast.addEventListener("click", (e) => {
    if (e.target.classList.contains("sp-close")) {
      isClosedManually = true;
      toast.classList.remove("sp-show");
      toast.classList.add("sp-hidden");
      return;
    }
    window.location.href = REDIRECT_URL;
  });

  setTimeout(() => {
    showToast();
    setInterval(showToast, INTERVAL);
  }, FIRST_DELAY);
});
