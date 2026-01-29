document.addEventListener('DOMContentLoaded', () => {

  /* ================= PRELOADER SKIP ================= */

  const cached = sessionStorage.getItem('products_cache');
  const preloader = document.getElementById('preloader');

  if (cached && preloader) {
    preloader.style.display = 'none';
  }

  /* ================= OBSERVER ================= */

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  /* ================= RENDER FUNCTION ================= */

  function createProductCard(product) {
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

    observer.observe(card);
    return card;
  }

  /* ================= CATEGORY RENDER ================= */

  function renderProductsByCategory(products) {
    products.forEach(product => {
      if (!product.category) return;

      const container = document.getElementById(
        `${product.category}-products`
      );

      if (!container) return;

      const card = createProductCard(product);
      container.appendChild(card);
    });
  }

/* ================= CACHE FALLBACK RENDER ================= */

const cachedProducts = sessionStorage.getItem('products_cache');

if (cachedProducts) {
  try {
    const products = JSON.parse(cachedProducts);

    document.querySelectorAll('.product-grid').forEach(grid => {
      grid.innerHTML = '';
    });

    renderProductsByCategory(products);
  } catch (e) {
    console.warn('Cached products corrupted');
  }
}


function fetchProductsWithRetry(retries = 3) {
  fetch(`${API_BASE}/products`)
    .then(res => {
      if (!res.ok) throw new Error('Bad response');
      return res.json();
    })
    .then(products => {
      if (!Array.isArray(products)) return;

      document.querySelectorAll('.product-grid').forEach(grid => {
        grid.innerHTML = '';
      });

      renderProductsByCategory(products);

      sessionStorage.setItem(
        'products_cache',
        JSON.stringify(products)
      );
    })
    .catch(err => {
      if (retries > 0) {
        console.warn('Backend waking up… retrying');
        setTimeout(() => fetchProductsWithRetry(retries - 1), 3000);
      } else {
        console.error('Product fetch failed permanently:', err);
      }
    });
}

fetchProductsWithRetry();

});
