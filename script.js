// ======================== PRODUCTS DATA ========================
const products = [
  { id: 1, name: "Shadow Strike", style: "Structured Snapback", price: 49, badge: "BEST SELLER", img: "images/cap1.jpg", color: "#1a1a1a" },
  { id: 2, name: "Polar Drift",   style: "Wool Blend Dad Cap",  price: 55, badge: "NEW",         img: "images/cap2.jpg", color: "#2a2a3a" },
  { id: 3, name: "Ember Run",     style: "Mesh Trucker",        price: 42, badge: null,           img: "images/cap3.jpg", color: "#1c1020" },
  { id: 4, name: "Desert Fox",    style: "Washed Cotton 6-Panel",price: 58, badge: "LIMITED",    img: "images/cap4.jpg", color: "#1a120a" },
  { id: 5, name: "Night Crew",    style: "Corduroy Snapback",   price: 62, badge: null,           img: "images/cap5.jpg", color: "#0a0a1a" },
  { id: 6, name: "Vapor Form",    style: "Technical Strapback", price: 75, badge: "COLLAB",      img: "images/cap6.jpg", color: "#0a1a0a" },
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
    if (count > 0) el.classList.add('bump');
  });
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const existing = cart.find(i => i.id === productId);
  existing ? existing.qty++ : cart.push({ ...product, qty: 1 });
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
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  grid.innerHTML = '';
  products.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'product-card reveal';
    card.style.transitionDelay = `${i * 0.08}s`;
    card.innerHTML = `
      <div class="pc-img-wrap" style="background:${p.color}">
        <img src="${p.img}" alt="${p.name}" onerror="this.style.display='none'">
        ${p.badge ? `<div class="pc-badge">${p.badge}</div>` : ''}
        <div class="pc-overlay">
          <div class="pc-quick-btn" data-id="${p.id}">QUICK ADD</div>
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
    grid.appendChild(card);
  });

  // Attach add-to-cart events
  grid.querySelectorAll('.add-to-cart-btn, .pc-quick-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const card = btn.closest('.product-card');
      const addBtn = card.querySelector('.add-to-cart-btn');
      addBtn.classList.remove('adding');
      void addBtn.offsetWidth;
      addBtn.classList.add('adding');
      addToCart(id);
    });
  });

  // Observe for reveal animation
  grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

// ======================== SCROLL REVEAL ========================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

function initReveal() {
  document.querySelectorAll('.ps-reveal').forEach(el => revealObserver.observe(el));
  document.querySelectorAll(
    '.store-header, .why-left, .why-right, .contact-left, .contact-right'
  ).forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
}

// ======================== STATS COUNTER ========================
let statsDone = false;
function animateStats() {
  if (statsDone) return;
  statsDone = true;
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.target);
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.floor(current);
    }, 20);
  });
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) animateStats(); });
}, { threshold: 0.4 });

// ======================== NAVBAR ========================
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  // Scroll class
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // Smooth anchor clicks
  nav.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      // For the about section we need to scroll to the START of the section
      // (the browser will hit the sticky correctly)
      const offset = href === '#about' ? 0 : -70;
      const top = target.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// ======================== CONTACT FORM ========================
function initContact() {
  document.getElementById('contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast("Message sent! We'll get back to you soon.");
    e.target.reset();
  });
}

// ========================================================================
//   HORIZONTAL SCROLL — ABOUT SECTION
//   How it works:
//   - The .about section is very tall (600vh set in CSS).
//   - .about-sticky is position:sticky so it stays on screen.
//   - As the user scrolls DOWN through the tall section, we read how far
//     they are through it (0 → 1) and convert that into a translateX
//     value that slides the .about-h-track leftward.
//   - This gives the illusion of horizontal scrolling driven by the
//     normal vertical scroll wheel / trackpad.
// ========================================================================
function initHorizontalScroll() {
  const section   = document.getElementById('about');
  const track     = document.getElementById('hTrack');
  const bar       = document.getElementById('progressBar');
  const label     = document.getElementById('progressLabel');
  const items     = track ? Array.from(track.querySelectorAll('.hs-item')) : [];

  if (!section || !track || items.length === 0) return;

  const TOTAL_ITEMS = items.length;   // 15
  let   rafId       = null;
  let   lastScroll  = -1;

  function update() {
    const scrollY      = window.scrollY;

    // Skip if scroll hasn't changed (saves paint)
    if (scrollY === lastScroll) { rafId = null; return; }
    lastScroll = scrollY;

    const sectionTop    = section.offsetTop;
    const sectionHeight = section.offsetHeight;      // the tall 600vh block
    const viewH         = window.innerHeight;

    // How far the user has scrolled INTO the section (0 = just arrived, 1 = about to leave)
    const rawProgress = (scrollY - sectionTop) / (sectionHeight - viewH);
    const progress    = Math.max(0, Math.min(1, rawProgress));

    // Total pixels we need to shift the track
    // trackScrollWidth = full track width minus the visible area width
    const trackWrap     = track.parentElement;                 // .about-h-track-wrap
    const visibleWidth  = trackWrap ? trackWrap.offsetWidth : window.innerWidth;
    const totalShift    = track.scrollWidth - visibleWidth;

    // Apply the horizontal translation
    const shift = progress * totalShift;
    track.style.transform = `translateX(${-shift}px)`;

    // ---- Progress bar ----
    if (bar)   bar.style.width   = `${(progress * 100).toFixed(1)}%`;

    // ---- Active item highlight ----
    // Which item is roughly in the "spotlight" centre zone?
    const activeIndex = Math.round(progress * (TOTAL_ITEMS - 1));
    items.forEach((item, i) => {
      item.classList.toggle('active', i === activeIndex);
    });

    // ---- Counter label ----
    if (label) {
      const display = Math.min(activeIndex + 1, TOTAL_ITEMS);
      label.textContent = `${String(display).padStart(2,'0')} / ${String(TOTAL_ITEMS).padStart(2,'0')}`;
    }

    rafId = null;
  }

  // Throttle via rAF so we never run more than once per frame
  function onScroll() {
    if (rafId) return;
    rafId = requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Run once immediately to set initial state
  update();

  // Re-calculate on resize (track width may change)
  window.addEventListener('resize', () => {
    lastScroll = -1; // force recalc
    update();
  }, { passive: true });
}

// ======================== INIT ========================
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  renderProducts();
  initNavbar();
  initReveal();
  initContact();
  initHorizontalScroll();

  // Stats counter observer
  const whyStats = document.querySelector('.why-stats');
  if (whyStats) statsObserver.observe(whyStats);
});