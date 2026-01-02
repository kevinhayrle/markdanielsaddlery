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
    ? 'assets/banner1mobile.mp4'
    : 'assets/banner1.mp4';

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

const slider = document.querySelector('.banner-slider');
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
