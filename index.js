// Detect which page we are on
const isProductsPage = document.getElementById("products");
const isCartPage = document.getElementById("cartItems");

// LocalStorage helpers
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// ===== PRODUCTS PAGE =====
if (isProductsPage) {
  fetch("https://fakestoreapi.com/products")
    .then(res => res.json())
    .then(products => {
      const container = document.getElementById("products");
      container.innerHTML = products.map(p => `
        <div class="product-card">
          <img src="${p.image}" alt="${p.title}">
          <h3>${p.title}</h3>
          <p>$${p.price}</p>
          <button class="btn green" onclick="addToCart(${p.id}, '${p.title.replace(/'/g,"")}', ${p.price}, '${p.image}')">Add to Cart</button>
        </div>
      `).join('');
    });
}

// Add to cart
function addToCart(id, title, price, image) {
  const cart = getCart();
  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ id, title, price, image, quantity: 1 });
  saveCart(cart);
  window.location.href = "cart.html";
}

// ===== CART PAGE =====
if (isCartPage) {
  const cartContainer = document.getElementById("cartItems");
  const totalPriceEl = document.getElementById("totalPrice");

  function renderCart() {
    const cart = getCart();
    if (cart.length === 0) {
      cartContainer.innerHTML = "<p>Your cart is empty.</p>";
      totalPriceEl.textContent = "Total: $0.00";
      return;
    }

    let total = 0;
    cartContainer.innerHTML = cart.map(item => {
      total += item.price * item.quantity;

      return `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.title}">
          <div class="cart-info">
            <h3>${item.title}</h3>
            <p>$${item.price} × ${item.quantity} = <b>$${(item.price * item.quantity).toFixed(2)}</b></p>
            <div class="qty-buttons">
              <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
              <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
              <button class="btn red" onclick="removeItem(${item.id})">Remove</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    totalPriceEl.textContent = `Total: $${total.toFixed(2)}`;
  }

  renderCart();

  // Change quantity
  window.changeQty = (id, delta) => {
    const cart = getCart();
    const item = cart.find(p => p.id === id);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        const index = cart.indexOf(item);
        cart.splice(index, 1);
      }
      saveCart(cart);
      renderCart();
    }
  };

  // Remove item
  window.removeItem = (id) => {
    let cart = getCart().filter(p => p.id !== id);
    saveCart(cart);
    renderCart();
  };

  // Continue shopping
  document.getElementById("continueShopping").onclick = () => {
    window.location.href = "index.html";
  };

  // Purchase
  document.getElementById("purchaseBtn").onclick = () => {
    alert("Cart purchased successfully!");
    localStorage.removeItem("cart");
    renderCart();
  };
}
