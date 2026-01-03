document.addEventListener('DOMContentLoaded', () => {

  /* ================= PRELOADER SKIP ================= */

  const cached = sessionStorage.getItem('products_cache');
  const preloader = document.getElementById('preloader');

  if (cached && preloader) {
    preloader.style.display = 'none';
  }

  /* ================= OBSERVER ================= */

  const productContainer = document.getElementById('product-container');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  function renderProducts(products) {
    const fragment = document.createDocumentFragment();

    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';

      card.innerHTML = `
        <img src="${product.imageUrl}" class="product-image" loading="lazy">
        <div class="product-info">
          <div class="product-name">${product.name}</div>
          <div class="product-price">
            ${
              product.discountedPrice
                ? `<span class="old-price">$${product.price}</span>
                   <span class="new-price">$${product.discountedPrice}</span>`
                : `<span class="new-price">$${product.price}</span>`
            }
          </div>
        </div>
        <button class="add-to-cart">ADD TO CART</button>
      `;

      card.querySelector('.product-image').onclick = () => {
        window.location.href = `product.html?id=${product._id}`;
      };

      card.querySelector('.add-to-cart').onclick = () => {
        alert("Please select size before adding to cart");
        window.location.href = `product.html?id=${product._id}`;
      };

      fragment.appendChild(card);
      observer.observe(card);
    });

    productContainer.appendChild(fragment);
  }

  /* ================= CACHE FIRST ================= */

  if (cached) {
    renderProducts(JSON.parse(cached));
  } else {
    fetch(`${API_BASE}/products`)
      .then(res => res.json())
      .then(products => {
        renderProducts(products);
        sessionStorage.setItem(
          'products_cache',
          JSON.stringify(products)
        );
      })
      .catch(err => {
        console.error('Product fetch failed:', err);
      });
  }
});
