// ======================== PRODUCTS DATA ========================
const products = [
  { id: 1, name: "Shadow Strike", style: "Structured Snapback", price: 49, badge: "BEST SELLER", img: "images/cap1.jpg", color: "#1a1a1a" },
  { id: 2, name: "Polar Drift", style: "Wool Blend Dad Cap", price: 55, badge: "NEW", img: "images/cap2.jpg", color: "#2a2a3a" },
  { id: 3, name: "Ember Run", style: "Mesh Trucker", price: 42, badge: null, img: "images/cap3.jpg", color: "#1c1020" },
  { id: 4, name: "Desert Fox", style: "Washed Cotton 6-Panel", price: 58, badge: "LIMITED", img: "images/cap4.jpg", color: "#1a120a" },
  { id: 5, name: "Night Crew", style: "Corduroy Snapback", price: 62, badge: null, img: "images/cap5.jpg", color: "#0a0a1a" },
  { id: 6, name: "Vapor Form", style: "Technical Strapback", price: 75, badge: "COLLAB", img: "images/cap6.jpg", color: "#0a1a0a" },
];

// ======================== CART ========================
let cart = JSON.parse(localStorage.getItem('vexoCart') || '[]');

function saveCart() {
  localStorage.setItem('vexoCart', JSON.stringify(cart));
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartUI() {
  const count = getCartCount();
  document.querySelectorAll('#cartCount').forEach(el => {
    el.textContent = count;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  });
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  updateCartUI();
  showToast(`${product.name} added to cart!`);
}

// ======================== TOAST ========================
let toastTimeout;
function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast) return;
  toastMsg.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ======================== RENDER PRODUCTS ========================
function renderProducts(container, items) {
  container.innerHTML = '';
  items.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'product-card reveal';
    card.style.transitionDelay = `${i * 0.08}s`;
    card.innerHTML = `
      <div class="pc-img-wrap" style="background:${p.color}">
        <img src="${p.img}" alt="${p.name}" onerror="this.style.display='none'">
        ${p.badge ? `<div class="pc-badge">${p.badge}</div>` : ''}
        <div class="pc-overlay">
          <div class="pc-quick-btn">QUICK ADD</div>
        </div>
      </div>
      <div class="pc-info">
        <div class="pc-name">${p.name}</div>
        <div class="pc-style">${p.style}</div>
        <div class="pc-bottom">
          <div class="pc-price">$${p.price}</div>
          <button class="add-to-cart-btn" data-id="${p.id}" title="Add to cart">+</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // Attach events
  container.querySelectorAll('.add-to-cart-btn, .pc-quick-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.closest('[data-id]')?.dataset.id || btn.closest('.product-card')?.querySelector('.add-to-cart-btn')?.dataset.id);
      if (id) {
        const addBtn = btn.closest('.product-card').querySelector('.add-to-cart-btn');
        addBtn.classList.remove('adding');
        void addBtn.offsetWidth;
        addBtn.classList.add('adding');
        addToCart(id);
      }
    });
  });

  // Trigger reveal
  setTimeout(() => {
    container.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }, 100);
}

// ======================== TIMELINE ========================
let tlIndex = 0;
let tlItems;
let tlTrack;

function initTimeline() {
  tlTrack = document.getElementById('timelineTrack');
  tlItems = tlTrack?.children;
  if (!tlTrack) return;

  const dotsContainer = document.getElementById('tlDots');
  const count = tlItems.length;

  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    dot.className = `tl-dot ${i === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => goToTl(i));
    dotsContainer.appendChild(dot);
  }

  document.getElementById('tlPrev')?.addEventListener('click', () => goToTl(tlIndex - 1));
  document.getElementById('tlNext')?.addEventListener('click', () => goToTl(tlIndex + 1));

  // Touch/drag support
  let startX = 0;
  tlTrack.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
  tlTrack.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goToTl(diff > 0 ? tlIndex + 1 : tlIndex - 1);
  });
}

function goToTl(index) {
  if (!tlItems) return;
  const count = tlItems.length;
  tlIndex = Math.max(0, Math.min(index, count - 1));
  const itemW = tlItems[0].offsetWidth + 40;
  tlTrack.scrollLeft = tlIndex * itemW;

  document.querySelectorAll('.tl-dot').forEach((d, i) => {
    d.classList.toggle('active', i === tlIndex);
  });
}

// ======================== SCROLL REVEAL ========================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

function initReveal() {
  document.querySelectorAll('.reveal, .ps-reveal').forEach(el => observer.observe(el));
}

// ======================== STATS COUNTER ========================
function animateStats() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.target);
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current);
    }, 20);
  });
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateStats();
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

// ======================== NAVBAR ========================
function initNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// ======================== CONTACT FORM ========================
function initContact() {
  document.getElementById('contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Message sent! We\'ll get back to you soon.');
    e.target.reset();
  });
}

// ======================== INIT ========================
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('productsGrid');
  if (grid) renderProducts(grid, products);

  initNavbar();
  initReveal();
  initTimeline();
  initContact();
  updateCartUI();

  // Add reveal to non-product elements
  document.querySelectorAll('.about-header, .store-header, .why-left, .why-right, .contact-left, .contact-right').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });

  const whySection = document.querySelector('.why-stats');
  if (whySection) statsObserver.observe(whySection);
});

// Export for full-collection page
window.vexoProducts = products;
window.vexoCart = { addToCart, getCartCount, updateCartUI, saveCart };
