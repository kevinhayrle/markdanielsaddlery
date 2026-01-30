/* ================= GLOBAL STATE ================= */

let uploadedImageUrl = null;
let isUploading = false;

/* ================= DOM READY ================= */

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) {
    console.error('No product ID found');
    return;
  }

  fetch(`${API_BASE}/products/${productId}`)
    .then(res => res.json())
    .then(product => hydrateProduct(product))
    .catch(err => console.error(err));
});

/* ================= HYDRATE PRODUCT ================= */

function hydrateProduct(product) {

  /* ---------- MAIN IMAGE ---------- */

  const mainImage = document.getElementById('product-image');
  mainImage.src = product.imageUrl;
  mainImage.style.cursor = 'zoom-in';

  mainImage.addEventListener('click', () => {
    openFullscreenImage(mainImage.src);
  });

  document.getElementById('product-name').textContent = product.name;
  document.getElementById('product-description').textContent = product.description;

  /* ---------- PRICE ---------- */

  const priceEl = document.getElementById('product-price');
  priceEl.innerHTML = product.discountedPrice
    ? `<span class="old-price">₹${product.price}</span>
       <span class="new-price">₹${product.discountedPrice}</span>`
    : `<span class="new-price">₹${product.price}</span>`;

  /* ---------- EXTRA IMAGES ---------- */

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

  /* ---------- SIZE SELECTION (MANDATORY) ---------- */

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

  /* ---------- CUSTOM FIT IMAGE (OPTIONAL) ---------- */

  const imageInput = document.getElementById('custom-fit-image');
  const statusText = document.getElementById('custom-fit-status');
  const loader = document.getElementById('upload-loader');

  if (imageInput) {
    imageInput.addEventListener('change', async () => {
      const file = imageInput.files[0];
      if (!file) return;

      isUploading = true;
      loader.style.display = 'block';
      statusText.textContent = '';

      try {
        uploadedImageUrl = await uploadToCloudinary(file);
        statusText.textContent = 'Image uploaded ✓';
      } catch (err) {
        console.error(err);
        statusText.textContent = 'Image upload failed';
        uploadedImageUrl = null;
      }

      isUploading = false;
      loader.style.display = 'none';
    });
  }

  /* ---------- ADD TO CART ---------- */

  const addToCartBtn = document.querySelector('.add-to-cart');

  addToCartBtn.addEventListener('click', (e) => {
    e.preventDefault();

    if (!selectedSize) {
      sizeError.style.display = 'block';
      return;
    }

    if (isUploading) {
      alert('Please wait for image upload to finish');
      return;
    }

    const note = document.getElementById('custom-fit-text')?.value.trim();
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
        image: uploadedImageUrl || null
      }
    });

    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.href = 'cart.html';
  });
}

/* ================= CLOUDINARY UPLOAD ================= */

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'markdanielsaddlery');

  const res = await fetch(
    'https://api.cloudinary.com/v1_1/dl79csna5/image/upload',
    {
      method: 'POST',
      body: formData
    }
  );

  const data = await res.json();
  return data.secure_url;
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
