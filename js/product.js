document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) {
    console.error('No product ID found');
    return;
  }

  const cached = sessionStorage.getItem('products_cache');

  if (cached) {
    const products = JSON.parse(cached);
    const product = products.find(p => p._id === productId);
    if (product) {
      hydrateProduct(product);
      return;
    }
  }

  fetch(`${API_BASE}/products/${productId}`)
    .then(res => res.json())
    .then(product => hydrateProduct(product))
    .catch(err => console.error(err));
});

function hydrateProduct(product) {
  /* ================= MAIN IMAGE ================= */

  const mainImage = document.getElementById('product-image');
  mainImage.src = product.imageUrl;
  mainImage.style.cursor = 'zoom-in';
  mainImage.addEventListener('click', () =>
    openFullscreenImage(mainImage.src)
  );

  document.getElementById('product-name').textContent = product.name;
  document.getElementById('product-description').textContent = product.description;

  /* ================= PRICE ================= */

  const priceEl = document.getElementById('product-price');
  priceEl.innerHTML = product.discountedPrice
    ? `<span class="old-price">$${product.price}</span>
       <span class="new-price">$${product.discountedPrice}</span>`
    : `<span class="new-price">$${product.price}</span>`;

  /* ================= EXTRA IMAGES ================= */

  const extraImages = document.getElementById('extra-images');
  extraImages.innerHTML = '';

  (product.extra_images || []).forEach(url => {
    const img = document.createElement('img');
    img.src = url;
    img.className = 'extra-image';

    img.addEventListener('click', () => {
      mainImage.src = url;
      openFullscreenImage(url);
    });

    extraImages.appendChild(img);
  });

  /* ================= SIZES ================= */

  const sizeContainer = document.getElementById('size-options');
  const sizeError = document.getElementById('size-error');
  let selectedSize = null;

  sizeContainer.innerHTML = '';
  sizeError.style.display = 'none';

  (product.sizes || []).forEach(size => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'size-btn';
    btn.textContent = size;

    btn.addEventListener('click', () => {
      selectedSize = size;
      sizeError.style.display = 'none';
      [...sizeContainer.children].forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });

    sizeContainer.appendChild(btn);
  });

  /* ================= ADD TO CART (SAFARI SAFE) ================= */
const addToCartBtn = document.querySelector('.add-to-cart');

addToCartBtn.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (!selectedSize) {
    sizeError.style.display = 'block';
    return;
  }

  const note = document.getElementById('custom-fit-text')?.value.trim();
  const file = document.getElementById('custom-fit-image')?.files[0];

  const proceed = (imageBase64 = null) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    cart.push({
      id: product._id,
      name: product.name,
      price: product.discountedPrice || product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      size: selectedSize,
      quantity: 1,
      customFit: {
        note: note || null,
        image: imageBase64
      }
    });

    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.href = 'cart.html';
  };

  // 🔹 If no image → proceed immediately
  if (!file) {
    proceed(null);
    return;
  }

  // 🔹 Read image FIRST, then navigate
  const reader = new FileReader();
  reader.onload = () => {
    proceed(reader.result);
  };
  reader.onerror = () => {
    console.warn('Image read failed, proceeding without image');
    proceed(null);
  };
  reader.readAsDataURL(file);
});

  /* ================= IMAGE STATUS UI ================= */

  const imageInput = document.getElementById('custom-fit-image');
  const statusText = document.getElementById('custom-fit-status');

  if (imageInput && statusText) {
    imageInput.addEventListener('change', () => {
      statusText.textContent =
        imageInput.files.length > 0 ? 'Image attached ✓' : '';
    });
  }
}

/* ================= FULLSCREEN IMAGE ================= */

function openFullscreenImage(url) {
  const existing = document.querySelector('.image-zoom-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'image-zoom-overlay';

  const img = document.createElement('img');
  img.src = url;
  img.className = 'image-zoomed';

  overlay.appendChild(img);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', () => overlay.remove());

  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', escHandler);
    }
  });
}


