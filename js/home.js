document.addEventListener('DOMContentLoaded', () => {
  const productContainer = document.getElementById('product-container');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  fetch(`${API_BASE}/products`)
    .then(res => res.json())
    .then(products => {
      products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        card.innerHTML = `
          <img src="${product.imageUrl}" class="product-image">
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

        productContainer.appendChild(card);
        observer.observe(card);

        card.querySelector('.product-image').onclick = () => {
          window.location.href = `product.html?id=${product._id}`;
        };

        card.querySelector('.add-to-cart').onclick = () => {
          alert("Please select size before adding to cart");
          window.location.href = `product.html?id=${product._id}`;
        };
      });
    });
});

