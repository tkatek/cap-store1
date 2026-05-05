// cart.js

// ======================= WHATSAPP NUMBER =======================
// CHANGE THIS TO YOUR WHATSAPP BUSINESS NUMBER (with country code, no + or spaces)
const WHATSAPP_NUMBER = '212600000000'; // Example: Morocco number — change this!
// ==============================================================

let cart = JSON.parse(localStorage.getItem('vexoCart') || '[]');

function saveCart() {
  localStorage.setItem('vexoCart', JSON.stringify(cart));
}

function getCartCount() {
  return cart.reduce((s, i) => s + i.qty, 0);
}

function getTotal() {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function updateCartUI() {
  const count = getCartCount();
  document.querySelectorAll('#cartCount').forEach(el => {
    el.textContent = count;
  });
}

// ===================== RENDER CART ITEMS =====================
function renderCart() {
  const list = document.getElementById('cartItems');
  const empty = document.getElementById('cartEmpty');
  const summaryLines = document.getElementById('summaryLines');
  const totalPriceEl = document.getElementById('totalPrice');
  const itemCountLabel = document.getElementById('itemCountLabel');
  const checkoutBtn = document.getElementById('checkoutBtn');

  if (!list) return;

  updateCartUI();

  if (cart.length === 0) {
    list.style.display = 'none';
    empty.classList.add('show');
    if (checkoutBtn) checkoutBtn.disabled = true;
    if (summaryLines) summaryLines.innerHTML = '<div style="color:var(--text-muted);font-size:13px;text-align:center;padding:10px 0;">No items yet</div>';
    if (totalPriceEl) totalPriceEl.textContent = '$0';
    if (itemCountLabel) itemCountLabel.textContent = '0 items';
    return;
  }

  empty.classList.remove('show');
  list.style.display = 'flex';
  if (checkoutBtn) checkoutBtn.disabled = false;

  const totalItems = getCartCount();
  if (itemCountLabel) itemCountLabel.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;

  list.innerHTML = '';
  cart.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.style.animationDelay = `${idx * 0.06}s`;
    el.dataset.id = item.id;
    el.innerHTML = `
      <div class="ci-img" style="background:${item.color || '#1a1a2e'}">
        <img src="${item.img}" alt="${item.name}" onerror="this.style.display='none'">
      </div>
      <div class="ci-details">
        <div class="ci-name">${item.name}</div>
        <div class="ci-style">${item.style}</div>
        <div class="ci-qty">
          <button class="qty-btn minus-btn" data-id="${item.id}">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn plus-btn" data-id="${item.id}">+</button>
        </div>
      </div>
      <div class="ci-right">
        <div class="ci-price">$${(item.price * item.qty)}</div>
        <button class="ci-remove" data-id="${item.id}">REMOVE ×</button>
      </div>
    `;
    list.appendChild(el);
  });

  // Events
  list.querySelectorAll('.plus-btn').forEach(btn => {
    btn.addEventListener('click', () => changeQty(parseInt(btn.dataset.id), 1));
  });
  list.querySelectorAll('.minus-btn').forEach(btn => {
    btn.addEventListener('click', () => changeQty(parseInt(btn.dataset.id), -1));
  });
  list.querySelectorAll('.ci-remove').forEach(btn => {
    btn.addEventListener('click', () => removeItem(parseInt(btn.dataset.id)));
  });

  // Summary
  if (summaryLines) {
    summaryLines.innerHTML = cart.map(i => `
      <div class="summary-line">
        <span class="sl-name">${i.name} ×${i.qty}</span>
        <span class="sl-price">$${i.price * i.qty}</span>
      </div>
    `).join('');
  }

  if (totalPriceEl) {
    const total = getTotal();
    totalPriceEl.textContent = `$${total}`;
    // Animate
    totalPriceEl.style.animation = 'none';
    void totalPriceEl.offsetWidth;
    totalPriceEl.style.animation = 'priceUpdate 0.4s ease';
  }
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeItem(id);
    return;
  }
  saveCart();
  renderCart();
}

function removeItem(id) {
  const el = document.querySelector(`.cart-item[data-id="${id}"]`);
  if (el) {
    el.classList.add('removing');
    setTimeout(() => {
      cart = cart.filter(i => i.id !== id);
      saveCart();
      renderCart();
    }, 380);
  } else {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCart();
  }
}

// ===================== WHATSAPP CHECKOUT =====================
function buildWhatsAppMessage(form) {
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const phone = document.getElementById('whatsappNumber').value.trim();
  const email = document.getElementById('email').value.trim();
  const address = document.getElementById('address').value.trim();
  const notes = document.getElementById('notes').value.trim();

  const itemsList = cart.map(i => `  • ${i.name} (${i.style}) ×${i.qty} — $${i.price * i.qty}`).join('\n');
  const total = getTotal();

  const msg = `🧢 *NEW VEXO ORDER*

👤 *Customer:* ${firstName} ${lastName}
📱 *WhatsApp:* ${phone}${email ? `\n📧 *Email:* ${email}` : ''}
📍 *Address:* ${address}${notes ? `\n📝 *Notes:* ${notes}` : ''}

─────────────────────
🛒 *ORDER DETAILS:*
${itemsList}
─────────────────────
💰 *TOTAL: $${total}*

Thank you for shopping with VEXO! 🔥`;

  return encodeURIComponent(msg);
}

document.getElementById('checkoutForm')?.addEventListener('submit', (e) => {
  e.preventDefault();

  if (cart.length === 0) {
    showToast('Your cart is empty!');
    return;
  }

  const btn = document.getElementById('checkoutBtn');
  btn.textContent = 'Opening WhatsApp...';
  btn.disabled = true;

  const msg = buildWhatsAppMessage();
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;

  setTimeout(() => {
    window.open(url, '_blank');
    btn.innerHTML = `<span class="whatsapp-icon">📱</span> ORDER VIA WHATSAPP`;
    btn.disabled = false;
  }, 800);
});

// ===================== TOAST =====================
let toastTimeout;
function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', () => {
  renderCart();

  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 50));
});
