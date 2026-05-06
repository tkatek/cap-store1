// collection.js
const allProducts = [
  { id: 1, name: "Shadow Strike", style: "Structured Snapback", price: 49, badge: "BEST SELLER", img: "images/one.jpg", color: "#1a1a1a", category: "snapback" },
  { id: 2, name: "Polar Drift", style: "Wool Blend Dad Cap", price: 55, badge: "NEW", img: "images/cap2.jpg", color: "#2a2a3a", category: "dad" },
  { id: 3, name: "Ember Run", style: "Mesh Trucker", price: 42, badge: null, img: "images/cap3.jpg", color: "#1c1020", category: "trucker" },
  { id: 4, name: "Desert Fox", style: "Washed Cotton 6-Panel", price: 58, badge: "LIMITED", img: "images/cap4.jpg", color: "#1a120a", category: "limited" },
  { id: 5, name: "Night Crew", style: "Corduroy Snapback", price: 62, badge: null, img: "images/cap5.jpg", color: "#0a0a1a", category: "snapback" },
  { id: 6, name: "Vapor Form", style: "Technical Strapback", price: 75, badge: "COLLAB", img: "images/cap6.jpg", color: "#0a1a0a", category: "limited" },
  { id: 7, name: "Stone Cold", style: "Washed Snapback", price: 45, badge: null, img: "images/cap7.jpg", color: "#1a1a18", category: "snapback" },
  { id: 8, name: "Clay Route", style: "Unstructured Dad Cap", price: 52, badge: null, img: "images/cap8.jpg", color: "#1a1208", category: "dad" },
  { id: 9, name: "Foam Shore", style: "Vintage Trucker", price: 38, badge: "SALE", img: "images/cap9.jpg", color: "#081218", category: "trucker" },
  { id: 10, name: "Pitch Black", style: "All-Over Snapback", price: 85, badge: "LIMITED", img: "images/cap10.jpg", color: "#080810", category: "limited" },
  { id: 11, name: "Cream Dream", style: "Corduroy Dad Cap", price: 59, badge: null, img: "images/cap11.jpg", color: "#1a1510", category: "dad" },
  { id: 12, name: "Circuit Board", style: "Tech Mesh Trucker", price: 68, badge: "NEW", img: "images/cap12.jpg", color: "#0a180a", category: "trucker" },
];

// Cart
let cart = JSON.parse(localStorage.getItem('vexoCart') || '[]');

function saveCart() { localStorage.setItem('vexoCart', JSON.stringify(cart)); }

function getCartCount() { return cart.reduce((s, i) => s + i.qty, 0); }

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
  const p = allProducts.find(x => x.id === productId);
  if (!p) return;
  const ex = cart.find(i => i.id === productId);
  ex ? ex.qty++ : cart.push({ ...p, qty: 1 });
  saveCart();
  updateCartUI();
  showToast(`${p.name} added!`);
}

let toastTimeout;
function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

// Render
let currentFilter = 'all';
let currentSort = 'default';

function getFilteredSorted() {
  let items = currentFilter === 'all' ? [...allProducts] : allProducts.filter(p => p.category === currentFilter);
  if (currentSort === 'price-asc') items.sort((a, b) => a.price - b.price);
  else if (currentSort === 'price-desc') items.sort((a, b) => b.price - a.price);
  else if (currentSort === 'name') items.sort((a, b) => a.name.localeCompare(b.name));
  return items;
}

function renderGrid() {
  const grid = document.getElementById('collectionGrid');
  const items = getFilteredSorted();
  
  grid.innerHTML = '';
  document.getElementById('countLabel').textContent = items.length;

  items.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${i * 0.05}s`;
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

  // Events
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
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderGrid();
  });
});

// Sort
document.getElementById('sortSelect')?.addEventListener('change', (e) => {
  currentSort = e.target.value;
  renderGrid();
});

// Init
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  renderGrid();

  // Navbar scroll
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 50));
});
