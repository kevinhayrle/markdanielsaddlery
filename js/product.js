document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  /* PRODUCT DETAILS */
  fetch(`${API_BASE}/products/${productId}`)
    .then(res => res.json())
    .then(product => {

      document.getElementById('product-image').src = product.image_url;
      document.getElementById('product-name').textContent = product.name;
      document.getElementById('product-description').textContent = product.description;

      const priceEl = document.getElementById('product-price');

      if (product.discounted_price) {
        priceEl.innerHTML = `
          <span class="old-price">$${parseFloat(product.price).toLocaleString()}</span>
          <span class="new-price">$${parseFloat(product.discounted_price).toLocaleString()}</span>
        `;
      } else {
        priceEl.innerHTML = `
          <span class="new-price">$${parseFloat(product.price).toLocaleString()}</span>
        `;
      }

      /* EXTRA IMAGES */
      const extraImagesContainer = document.getElementById('extra-images');
      if (Array.isArray(product.extra_images)) {
        product.extra_images.forEach(url => {
          const img = document.createElement('img');
          img.src = url;
          img.classList.add('extra-image');
          img.addEventListener('click', () => openFullscreenImage(url));
          extraImagesContainer.appendChild(img);
        });
      }

      /* SIZES */
      const sizeSelect = document.getElementById("sizeSelect");
      (product.sizes || []).forEach(size => {
        const option = document.createElement("option");
        option.value = size;
        option.textContent = size;
        sizeSelect.appendChild(option);
      });

      /* ADD TO CART */
      document.querySelector('.add-to-cart').addEventListener('click', () => {
        const selectedSize = sizeSelect.value;
        if (!selectedSize) {
          alert("Please select a size before adding to cart.");
          return;
        }

        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const finalPrice = product.discounted_price || product.price;

        cart.push({
          id: product.id,
          name: product.name,
          price: finalPrice,
          image_url: product.image_url,
          category: product.category,
          size: selectedSize,
          quantity: 1
        });

        localStorage.setItem('cart', JSON.stringify(cart));
        window.location.href = 'cart.html';
      });

    })
    .catch(err => console.error("Error fetching product:", err));

  /* CATEGORIES */
  fetch(`${API_BASE}/products/categories`)
    .then(res => res.json())
    .then(categories => {
      const list = document.getElementById("category-list");
      list.innerHTML = '';
      categories.forEach(cat => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `category.html?cat=${encodeURIComponent(cat)}`;
        a.textContent = cat.toUpperCase();
        li.appendChild(a);
        list.appendChild(li);
      });
    });

  /* SIDEBAR */
  const hamburger = document.getElementById('hamburger-product');
  const sidebar = document.getElementById('sidebar-product');

  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && e.target !== hamburger) {
      sidebar.classList.remove('active');
    }
  });
});

/* FULLSCREEN IMAGE (UNCHANGED) */
function openFullscreenImage(url) {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0,0,0,0.9)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = 1000;

  const img = document.createElement('img');
  img.src = url;
  img.style.maxWidth = '90%';
  img.style.maxHeight = '90%';
  img.style.border = '2px solid white';
  img.style.borderRadius = '8px';

  overlay.onclick = () => document.body.removeChild(overlay);

  overlay.appendChild(img);
  document.body.appendChild(overlay);
}
