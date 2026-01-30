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
  const mainImage = document.getElementById('product-image');
mainImage.src = product.imageUrl;
mainImage.style.cursor = 'zoom-in';
mainImage.onclick = () => openFullscreenImage(mainImage.src);

  document.getElementById('product-name').textContent = product.name;
  document.getElementById('product-description').textContent = product.description;

  const priceEl = document.getElementById('product-price');
  priceEl.innerHTML = product.discountedPrice
    ? `<span class="old-price">$${product.price}</span>
       <span class="new-price">$${product.discountedPrice}</span>`
    : `<span class="new-price">$${product.price}</span>`;

  const extraImages = document.getElementById('extra-images');
  extraImages.innerHTML = '';

  (product.extra_images || []).forEach(url => {
    const img = document.createElement('img');
    img.src = url;
    img.className = 'extra-image';
    img.onclick = () => {
    mainImage.src = url;         
    openFullscreenImage(url);    
};

    extraImages.appendChild(img);
  });

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
      [...sizeContainer.children].forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    };

    sizeContainer.appendChild(btn);
  });

  document.querySelector('.add-to-cart').onclick = async () => {
    if (!selectedSize) {
      sizeError.style.display = 'block';
      return;
    }

    const note = document.getElementById('custom-fit-text')?.value.trim();
    const file = document.getElementById('custom-fit-image')?.files[0];
    const image = await readFileAsBase64(file);

    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    cart.push({
      id: product._id,
      name: product.name,
      price: product.discountedPrice || product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      size: selectedSize,
      quantity: 1,
      customFit: { note: note || null, image }
    });

    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.href = 'cart.html';
  };

const imageInput = document.getElementById('custom-fit-image');
const statusText = document.getElementById('custom-fit-status');

if (imageInput && statusText) {
  imageInput.addEventListener('change', () => {
    statusText.textContent =
      imageInput.files.length > 0 ? 'Image attached ✓' : '';
  });
}

}

function openFullscreenImage(url) {
  const overlay = document.createElement('div');
  overlay.className = 'image-zoom-overlay';

  const img = document.createElement('img');
  img.src = url;
  img.className = 'image-zoomed';

  overlay.appendChild(img);
  document.body.appendChild(overlay);

  overlay.onclick = () => overlay.remove();
}

function readFileAsBase64(file) {
  return new Promise(resolve => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}
