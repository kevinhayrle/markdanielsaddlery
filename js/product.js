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
    .catch(err => console.error('Error fetching product:', err));
});

function hydrateProduct(product) {

  document.getElementById('product-image').src = product.imageUrl;
  document.getElementById('product-name').textContent = product.name;
  document.getElementById('product-description').textContent = product.description;

  const priceEl = document.getElementById('product-price');

  if (product.discountedPrice) {
    priceEl.innerHTML = `
      <span class="old-price">$${Number(product.price).toLocaleString()}</span>
      <span class="new-price">$${Number(product.discountedPrice).toLocaleString()}</span>
    `;
  } else {
    priceEl.innerHTML = `
      <span class="new-price">$${Number(product.price).toLocaleString()}</span>
    `;
  }

  const extraImagesContainer = document.getElementById('extra-images');
  extraImagesContainer.innerHTML = '';

  if (Array.isArray(product.extra_images)) {
    product.extra_images.forEach(url => {
      const img = document.createElement('img');
      img.src = url;
      img.className = 'extra-image';
      img.onclick = () => openFullscreenImage(url);
      extraImagesContainer.appendChild(img);
    });
  }

  const sizeContainer = document.getElementById('size-options');
  const sizeError = document.getElementById('size-error');
  let selectedSize = null;

  sizeContainer.innerHTML = '';
  sizeError.style.display = 'none';

  (product.sizes || []).forEach(size => {
    const btn = document.createElement('button');
    btn.className = 'size-btn';
    btn.textContent = size;

    btn.onclick = () => {
      selectedSize = size;
      sizeError.style.display = 'none';

      [...sizeContainer.children].forEach(b =>
        b.classList.remove('active')
      );
      btn.classList.add('active');
    };

    sizeContainer.appendChild(btn);
  });

  const addToCartBtn = document.querySelector('.add-to-cart');

  addToCartBtn.onclick = () => {
    if (!selectedSize) {
      sizeError.style.display = 'block';
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    cart.push({
      id: product._id,
      name: product.name,
      price: product.discountedPrice || product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      size: selectedSize,
      quantity: 1
    });

    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.href = 'cart.html';
  };
}

function openFullscreenImage(url) {
  const overlay = document.createElement('div');

  Object.assign(overlay.style, {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  });

  const img = document.createElement('img');
  img.src = url;
  img.style.maxWidth = '90%';
  img.style.maxHeight = '90%';
  img.style.borderRadius = '8px';

  overlay.onclick = () => document.body.removeChild(overlay);

  overlay.appendChild(img);
  document.body.appendChild(overlay);
}
