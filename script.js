'use strict';

/* ================================================================
   VEXO — script.js
   Handles: horizontal scroll, hamburger sidebar, cart,
            products render, scroll reveal, stats counter,
            smooth nav, contact form
   ================================================================ */

// ----------------------------------------------------------------
// 1. PRODUCTS DATA
// ----------------------------------------------------------------
const PRODUCTS = [
  { id:1, name:"Shadow Strike", style:"Structured Snapback",    price:49, badge:"BEST SELLER", img:"images/one.jpg",  color:"#0b1c14" },
  { id:2, name:"Polar Drift",   style:"Wool Blend Dad Cap",     price:55, badge:"NEW",         img:"images/two.jpg",  color:"#111"    },
  { id:3, name:"Ember Run",     style:"Mesh Trucker",           price:42, badge:null,           img:"images/tree.jpg",  color:"#0d1a10" },
  { id:4, name:"Desert Fox",    style:"Washed Cotton 6-Panel",  price:58, badge:"LIMITED",     img:"images/for.jpg",  color:"#0b1c14" },
  { id:5, name:"Night Crew",    style:"Corduroy Snapback",      price:62, badge:null,           img:"images/five.jpg",  color:"#111"    },
  { id:6, name:"Vapor Form",    style:"Technical Strapback",    price:75, badge:"COLLAB",      img:"images/six.jpg",  color:"#0d1810" },
];

// ----------------------------------------------------------------
// 2. CART
// ----------------------------------------------------------------
let cart = [];
try { cart = JSON.parse(localStorage.getItem('vexoCart') || '[]'); } catch(e) { cart = []; }

function saveCart() {
  try { localStorage.setItem('vexoCart', JSON.stringify(cart)); } catch(e) {}
}

function cartCount() {
  return cart.reduce((s, i) => s + i.qty, 0);
}

function updateCartBadge() {
  const count = cartCount();
  document.querySelectorAll('#cartCount').forEach(el => {
    el.textContent = count;
    if (count > 0) {
      el.classList.remove('bump');
      void el.offsetWidth;
      el.classList.add('bump');
    }
  });
}

function addToCart(productId) {
  const p = PRODUCTS.find(x => x.id === productId);
  if (!p) return;
  const ex = cart.find(i => i.id === productId);
  ex ? ex.qty++ : cart.push({ ...p, qty: 1 });
  saveCart();
  updateCartBadge();
  toast(`${p.name} added to cart!`);
}

// ----------------------------------------------------------------
// 3. TOAST
// ----------------------------------------------------------------
let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  const msgEl = document.getElementById('toastMsg');
  if (!el) return;
  msgEl.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

// ----------------------------------------------------------------
// 4. RENDER PRODUCTS
// ----------------------------------------------------------------
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  grid.innerHTML = '';

  PRODUCTS.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'product-card reveal';
    card.style.transitionDelay = `${i * 0.07}s`;
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
          <button class="add-to-cart-btn" data-id="${p.id}" aria-label="Add ${p.name} to cart">+</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.add-to-cart-btn, .pc-quick-btn').forEach(btn => {
    btn.addEventListener('click', e => {
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

  // Observe newly rendered cards for reveal
  grid.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
}

// ----------------------------------------------------------------
// 5. SCROLL REVEAL
// ----------------------------------------------------------------
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });

function initReveal() {
  document.querySelectorAll('.ps-reveal, .reveal').forEach(el => revealObs.observe(el));
}

// ----------------------------------------------------------------
// 6. STATS COUNTER
// ----------------------------------------------------------------
let statsFired = false;
function fireStats() {
  if (statsFired) return;
  statsFired = true;
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    let cur = 0;
    const step = target / 55;
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = Math.floor(cur);
      if (cur >= target) clearInterval(t);
    }, 18);
  });
}

const statsObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) fireStats(); });
}, { threshold: 0.35 });

// ----------------------------------------------------------------
// 7. NAVBAR — scroll class + smooth anchor
// ----------------------------------------------------------------
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Smooth scroll for ALL anchor links on the page
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      // Close sidebar if open
      closeSidebar();

      // For the about section, scroll to absolute top of the section
      // so the sticky mechanism starts from zero
      const top = target.getBoundingClientRect().top + window.scrollY;
      const offset = href === '#about' ? 0 : -76;
      window.scrollTo({ top: top + offset, behavior: 'smooth' });
    });
  });
}

// ----------------------------------------------------------------
// 8. HAMBURGER SIDEBAR
// ----------------------------------------------------------------
function initSidebar() {
  const hamburger = document.getElementById('hamburger');
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('sidebarOverlay');
  const closeBtn  = document.getElementById('sidebarClose');
  if (!hamburger || !sidebar) return;

  hamburger.addEventListener('click', () => {
    const isOpen = sidebar.classList.contains('open');
    isOpen ? closeSidebar() : openSidebar();
  });

  overlay?.addEventListener('click', closeSidebar);
  closeBtn?.addEventListener('click', closeSidebar);

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSidebar();
  });
}

function openSidebar() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebarOverlay');
  const hamburger = document.getElementById('hamburger');
  sidebar?.classList.add('open');
  overlay?.classList.add('show');
  hamburger?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebarOverlay');
  const hamburger = document.getElementById('hamburger');
  sidebar?.classList.remove('open');
  overlay?.classList.remove('show');
  hamburger?.classList.remove('open');
  document.body.style.overflow = '';
}

// ----------------------------------------------------------------
// 9. CONTACT FORM
// ----------------------------------------------------------------
function initContact() {
  document.getElementById('contactForm')?.addEventListener('submit', e => {
    e.preventDefault();
    toast("Message sent! We'll be in touch soon.");
    e.target.reset();
  });
}

// ----------------------------------------------------------------
// 10. HORIZONTAL SCROLL — ABOUT SECTION
//
//  Technique: The .about section is 600vh tall. .about-sticky is
//  position:sticky at top:0 with height:100vh.
//  As the user scrolls down through the tall section we compute
//  a progress value 0→1 and translateX the .h-track leftward,
//  creating the illusion of horizontal scrolling.
// ----------------------------------------------------------------
function initHorizontalScroll() {
  const section = document.getElementById('about');
  const track   = document.getElementById('hTrack');
  const bar     = document.getElementById('progressBar');
  const label   = document.getElementById('progressLabel');
  const items   = track ? Array.from(track.querySelectorAll('.hs-item')) : [];

  if (!section || !track || items.length === 0) return;

  const TOTAL = items.length;
  let rafId = null;
  let lastY = -1;

  function update() {
    const scrollY = window.scrollY;
    if (scrollY === lastY) { rafId = null; return; }
    lastY = scrollY;

    // How far through the section (0 = just entered, 1 = leaving)
    const sectionTop = section.offsetTop;
    const sectionH   = section.offsetHeight;
    const viewH      = window.innerHeight;

    const raw      = (scrollY - sectionTop) / (sectionH - viewH);
    const progress = Math.max(0, Math.min(1, raw));

    // Shift the track
    const wrapW     = track.parentElement ? track.parentElement.offsetWidth : window.innerWidth;
    const maxShift  = track.scrollWidth - wrapW;
    const shift     = progress * maxShift;
    track.style.transform = `translateX(${-shift}px)`;

    // Progress bar
    if (bar) bar.style.width = `${(progress * 100).toFixed(1)}%`;

    // Active item
    const activeIdx = Math.round(progress * (TOTAL - 1));
    items.forEach((item, i) => item.classList.toggle('active', i === activeIdx));

    // Counter
    if (label) {
      const n = Math.min(activeIdx + 1, TOTAL);
      label.textContent = `${String(n).padStart(2,'0')} / ${String(TOTAL).padStart(2,'0')}`;
    }

    rafId = null;
  }

  function onScroll() {
    if (rafId) return;
    rafId = requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Force recalc on resize
  window.addEventListener('resize', () => { lastY = -1; update(); }, { passive: true });

  // Initial paint
  update();
}

// ----------------------------------------------------------------
// 11. BOOT
// ----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderProducts();
  initNavbar();
  initSidebar();
  initReveal();
  initContact();
  initHorizontalScroll();

  const statsEl = document.querySelector('.why-stats');
  if (statsEl) statsObs.observe(statsEl);
});