const API = API_BASE;
const token = localStorage.getItem("adminToken");

/* ================= AUTO LOGOUT ================= */

const MAX_SESSION_TIME = 2 * 60 * 60 * 1000;
const loginTime = localStorage.getItem("adminLoginTime");

if (!token || !loginTime || Date.now() - loginTime > MAX_SESSION_TIME) {
  localStorage.clear();
  window.location.href = "admin-login.html";
}

/* ================= FETCH PRODUCTS ================= */

async function fetchProducts() {
  const res = await fetch(`${API}/admin/products`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  const list = document.getElementById("productList");
  list.innerHTML = "";

  data.forEach((p) => {
    const div = document.createElement("div");
    div.className = "product";
    div.draggable = true;
    div.dataset.id = p._id;

    div.innerHTML = `
      <div>
        <b>${p.name}</b><br>
        ${
          p.discountedPrice
            ? `<s>$${p.price}</s> $${p.discountedPrice}`
            : `$${p.price}`
        }
      </div>
      <div>
        <button class="edit-btn" onclick="editProduct(
          '${p._id}',
          '${p.name}',
          '${p.price}',
          '${p.discountedPrice || ""}',
          '${p.category || ""}',
          '${p.imageUrl || ""}',
          '${p.description || ""}',
          '${p.sizes || ""}',
          '${p.extra_images || ""}'
        )">Edit</button>
        <button class="delete-btn" onclick="deleteProduct('${p._id}')">
          Delete
        </button>
      </div>
    `;

    list.appendChild(div);
  });
}

/* ================= ADD / UPDATE PRODUCT ================= */

document
  .getElementById("productForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      name: document.getElementById("name").value,
      price: Number(document.getElementById("price").value),
      discounted_price:
        document.getElementById("discounted_price").value || null,
      category: document.getElementById("category").value,
      description: document.getElementById("description").value,
      image_url: document.getElementById("image").value,
      sizes: document.getElementById("sizes").value,
      extra_images: document.getElementById("extraImages").value
        ? document
            .getElementById("extraImages")
            .value.split(",")
            .map((s) => s.trim())
        : []
    };

    const id = document.getElementById("editingId").value;

    const url = id
      ? `${API}/admin/products/${id}`
      : `${API}/admin/products`;

    const method = id ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    document.getElementById("productForm").reset();
    document.getElementById("editingId").value = "";
    fetchProducts();
  });

/* ================= EDIT PRODUCT ================= */

function editProduct(
  id,
  name,
  price,
  discountedPrice,
  category,
  imageUrl,
  description,
  sizes,
  extraImages
) {
  document.getElementById("editingId").value = id;
  document.getElementById("name").value = name || "";
  document.getElementById("price").value = price || "";
  document.getElementById("discounted_price").value =
    discountedPrice || "";
  document.getElementById("category").value = category || "";
  document.getElementById("description").value = description || "";
  document.getElementById("image").value = imageUrl || "";

  document.getElementById("sizes").value = sizes
    ? sizes.toString()
    : "";

  document.getElementById("extraImages").value = extraImages
    ? extraImages.toString()
    : "";
}

/* ================= DELETE PRODUCT ================= */

async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;

  await fetch(`${API}/admin/products/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  fetchProducts();
}

/* ================= LOGOUT ================= */

function logout() {
  localStorage.clear();
  window.location.href = "admin-login.html";
}

fetchProducts();

/* ================= COUPON MANAGEMENT ================= */

document
  .getElementById("couponForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      coupon_code: document.getElementById("coupon_code").value.trim(),
      discount_type: document.getElementById("discount_type").value,
      discount_value: Number(
        document.getElementById("discount_value").value
      ),
      min_cart_value: Number(
        document.getElementById("min_cart_value").value
      ) || 0,
      max_discount: document.getElementById("max_discount").value
        ? Number(document.getElementById("max_discount").value)
        : null,
      expiry_date: document.getElementById("expiry_date").value
    };

    if (!payload.coupon_code || !payload.discount_value || !payload.expiry_date) {
      alert("Coupon code, discount value and expiry date are required");
      return;
    }

    const res = await fetch(`${API}/admin/coupons/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to add coupon");
      return;
    }

    document.getElementById("couponForm").reset();
    fetchCoupons();
  });

/* ================= FETCH COUPONS ================= */

async function fetchCoupons() {
  const res = await fetch(`${API}/admin/coupons`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const coupons = await res.json();
  const list = document.getElementById("couponList");
  list.innerHTML = "";

  coupons.forEach((c) => {
    const div = document.createElement("div");
    div.className = "coupon-item";

    div.innerHTML = `
      <div>
        <b>${c.couponCode}</b><br>
        ${c.discountType === "percentage"
          ? `${c.discountValue}% OFF`
          : `₹${c.discountValue} OFF`}
      </div>
      <button onclick="deleteCoupon('${c._id}')">Delete</button>
    `;

    list.appendChild(div);
  });
}

/* ================= DELETE COUPON ================= */

async function deleteCoupon(id) {
  if (!confirm("Delete this coupon?")) return;

  await fetch(`${API}/admin/coupons/delete/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  fetchCoupons();
}

fetchCoupons();

