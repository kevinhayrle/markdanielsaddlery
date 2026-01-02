const API = API_BASE;
const token = localStorage.getItem("adminToken");

/* ================= AUTO LOGOUT ================= */
const MAX_SESSION_TIME = 2 * 60 * 60 * 1000;
const loginTime = localStorage.getItem("adminLoginTime");

if (!token || !loginTime || Date.now() - loginTime > MAX_SESSION_TIME) {
  localStorage.clear();
  window.location.href = "admin-login.html";
}

/* ================= GLOBALS ================= */
let draggedItem = null;

/* ================= DRAG & DROP ================= */
document.addEventListener("dragstart", (e) => {
  if (e.target.classList.contains("product")) {
    draggedItem = e.target;
    e.target.classList.add("dragging");
  }
});

document.addEventListener("dragend", (e) => {
  if (e.target.classList.contains("product")) {
    e.target.classList.remove("dragging");
    saveOrder();
  }
});

document.addEventListener("dragover", (e) => {
  e.preventDefault();
  const target = e.target.closest(".product");
  if (!target || target === draggedItem) return;

  const list = document.getElementById("productList");
  list.insertBefore(draggedItem, target);
});

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
          '${p.sortOrder || 0}',
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

/* ================= SAVE ORDER ================= */
async function saveOrder() {
  const items = [...document.querySelectorAll(".product")];

  const payload = items.map((item, index) => ({
    id: item.dataset.id,
    sort_order: index + 1
  }));

  await fetch(`${API}/admin/products/reorder`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
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
      sort_order: Number(document.getElementById("sort_order").value) || 0,
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
  sortOrder,
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
  document.getElementById("sort_order").value = sortOrder || 0;
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

/* ================= INIT ================= */
fetchProducts();
