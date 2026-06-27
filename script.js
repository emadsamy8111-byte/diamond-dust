'use strict';

/* ============================================================
   ALAM AL-ATOUR — Main JavaScript
   Cart, Filters, Animations, Slider, Timer, Interactions
   ============================================================ */

// ─── DOM REFERENCES ─────────────────────────────────────────
const navbar        = document.getElementById('navbar');
const hamburger     = document.getElementById('hamburger');
const navLinks      = document.getElementById('navLinks');
const cartBtn       = document.getElementById('cartBtn');
const cartCount     = document.getElementById('cartCount');
const cartSidebar   = document.getElementById('cartSidebar');
const cartOverlay   = document.getElementById('cartOverlay');
const cartClose     = document.getElementById('cartClose');
const cartItemsEl   = document.getElementById('cartItems');
const cartEmpty     = document.getElementById('cartEmpty');
const cartFooter    = document.getElementById('cartFooter');
const cartTotal     = document.getElementById('cartTotal');
const checkoutBtn   = document.getElementById('checkoutBtn');
const modalOverlay  = document.getElementById('modalOverlay');
const productModal  = document.getElementById('productModal');
const modalClose    = document.getElementById('modalClose');
const modalContent  = document.getElementById('modalContent');
const toast         = document.getElementById('toast');
const contactForm   = document.getElementById('contactForm');
const formSuccess   = document.getElementById('formSuccess');
const copyCodeBtn   = document.getElementById('copyCodeBtn');
const filterBtns    = document.querySelectorAll('.filter-btn');
const productsGrid  = document.getElementById('productsGrid');
const prevBtn       = document.getElementById('prevBtn');
const nextBtn       = document.getElementById('nextBtn');
const sliderDots    = document.getElementById('sliderDots');
const testimonialTrack = document.getElementById('testimonialTrack');
const newsletterBtn = document.getElementById('newsletterBtn');

// ─── CART STATE ──────────────────────────────────────────────
let cart = JSON.parse(localStorage.getItem('atourCart') || '[]');

// ─── NAVBAR SCROLL ───────────────────────────────────────────
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  highlightNavLink();
});

function highlightNavLink() {
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === '#' + current);
  });
}

// ─── HAMBURGER MENU ──────────────────────────────────────────
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.addEventListener('click', () => {
  hamburger.classList.remove('open');
  navLinks.classList.remove('open');
});

// ─── HERO PARTICLES ──────────────────────────────────────────
(function createParticles() {
  const container = document.getElementById('particles');
  const count = 40;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      bottom: -10px;
      width: ${2 + Math.random() * 4}px;
      height: ${2 + Math.random() * 4}px;
      animation-duration: ${6 + Math.random() * 12}s;
      animation-delay: ${Math.random() * 10}s;
      opacity: ${0.2 + Math.random() * 0.6};
    `;
    container.appendChild(p);
  }
})();

// ─── COUNTER ANIMATION ───────────────────────────────────────
function animateCounters() {
  document.querySelectorAll('.stat-num[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString('ar-EG');
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString('ar-EG');
    }
    requestAnimationFrame(step);
  });
}

// ─── SCROLL REVEAL ───────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(
  '.product-card, .feature-item, .about-feat, .testimonial-card, .contact-item, .footer-brand, .footer-links, .footer-newsletter'
).forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// Hero stats counter trigger
const heroObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    animateCounters();
    heroObserver.disconnect();
  }
}, { threshold: 0.3 });
const heroStats = document.querySelector('.hero-stats');
if (heroStats) heroObserver.observe(heroStats);

// ─── PRODUCT FILTER ──────────────────────────────────────────
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.product-card').forEach(card => {
      if (filter === 'all') {
        card.classList.remove('hidden');
      } else if (filter === 'bestselling') {
        card.dataset.bestselling === '1' ? card.classList.remove('hidden') : card.classList.add('hidden');
      } else {
        const cats = card.dataset.category || '';
        cats.includes(filter) ? card.classList.remove('hidden') : card.classList.add('hidden');
      }
    });
  });
});

// ─── CART FUNCTIONS ──────────────────────────────────────────
function saveCart() {
  localStorage.setItem('atourCart', JSON.stringify(cart));
}

let ddProductsCache = [];

function renderCart() {
  // Clear existing items (keep empty msg)
  const existing = cartItemsEl.querySelectorAll('.cart-item');
  existing.forEach(e => e.remove());

  if (cart.length === 0) {
    cartEmpty.style.display = 'flex';
    cartFooter.style.display = 'none';
    cartCount.classList.remove('visible');
    return;
  }

  cartEmpty.style.display = 'none';
  cartFooter.style.display = 'block';

  let total = 0;
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

    cart.forEach(item => {
      const prod = ddProductsCache.find(p => p.id === item.pid || p.id === item.id);
      if (!prod) return;
      const size = item.size || 50;
      const price = parseFloat({30: prod.price_30, 50: prod.price_50, 100: prod.price_100}[size]) || parseFloat(prod.price) || 0;
    total += price * item.qty;
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.dataset.cartId = item.key;
    el.innerHTML = `
      <img src="${prod.image_bottle || prod.img || 'images/product1.png'}" alt="${prod.name}" class="cart-item-img" />
      <div class="cart-item-info">
        <div class="cart-item-name">${prod.name} <span style="color:#c9a84c;font-size:0.8rem;">(${item.size} مل)</span></div>
        <div class="cart-item-price">${(price * item.qty).toLocaleString('ar-EG')} جنيه</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${item.key}', -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.key}', 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.key}')">✕</button>
    `;
    cartItemsEl.appendChild(el);
  });

  cartTotal.textContent = total.toLocaleString('ar-EG') + ' جنيه';
  cartCount.textContent = totalItems;
  cartCount.classList.toggle('visible', totalItems > 0);
}

window.changeQty = function(key, delta) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(key);
  else { saveCart(); renderCart(); }
};

window.removeFromCart = function(key) {
  cart = cart.filter(i => i.key !== key);
  saveCart();
  renderCart();
  showToast('تم حذف المنتج من العربة 🗑️');
};

function addToCart(id, sizeMl) {
  sizeMl = sizeMl || 50;
  const key = id + '-' + sizeMl;
  const existing = cart.find(i => i.key === key);
  if (existing) existing.qty++;
  else cart.push({ key, pid: id, size: sizeMl, id, qty: 1 });
  saveCart();
  renderCart();
  showToast('✦ تمت الإضافة إلى العربة!');

  // Button feedback
  const btn = document.getElementById(`add-cart-${id}`);
  if (btn) {
    btn.classList.add('added');
    btn.innerHTML = '✓';
    setTimeout(() => {
      btn.classList.remove('added');
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`;
    }, 1500);
  }
}

// Attach add-to-cart listeners
document.querySelectorAll('.btn-add-cart').forEach(btn => {
  btn.addEventListener('click', () => addToCart(parseInt(btn.dataset.id)));
});

// Cart open/close
cartBtn.addEventListener('click', () => {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
});
const closeCart = () => {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
};
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

checkoutBtn.addEventListener('click', () => {
  showToast('🎉 جاري الانتقال لإتمام الشراء...');
  setTimeout(closeCart, 1200);
});

const cartShopLink = document.getElementById('cart-shop-link');
if (cartShopLink) cartShopLink.addEventListener('click', closeCart);

// ─── QUICK VIEW MODAL ────────────────────────────────────────
document.querySelectorAll('.quick-view-btn').forEach(btn => {
  btn.addEventListener('click', () => openModal(parseInt(btn.dataset.id)));
});

// ─── MODAL CLOSE ─────────────────────────────────────────────
const closeModal = () => {
  modalOverlay?.classList.remove('open');
  productModal?.classList.remove('open');
  document.body.style.overflow = '';
};
modalClose?.addEventListener('click', closeModal);
modalOverlay?.addEventListener('click', closeModal);

// ─── TOAST ───────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ─── PROMO COUNTDOWN TIMER ───────────────────────────────────
(function startTimer() {
  let total = 12 * 3600; // 12 hours
  const saved = localStorage.getItem('promoEndTime');
  let endTime;
  if (saved) {
    endTime = parseInt(saved);
  } else {
    endTime = Date.now() + total * 1000;
    localStorage.setItem('promoEndTime', endTime);
  }

  function tick() {
    const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    const fmt = n => String(n).padStart(2, '0');
    document.getElementById('timerHours').textContent = fmt(h);
    document.getElementById('timerMins').textContent  = fmt(m);
    document.getElementById('timerSecs').textContent  = fmt(s);
    if (remaining > 0) setTimeout(tick, 1000);
    else {
      localStorage.removeItem('promoEndTime');
      startTimer();
    }
  }
  tick();
})();

// ─── COPY PROMO CODE ─────────────────────────────────────────
copyCodeBtn.addEventListener('click', () => {
  navigator.clipboard.writeText('ALAM25').then(() => {
    showToast('✅ تم نسخ كود الخصم: ALAM25');
    copyCodeBtn.textContent = 'تم النسخ ✓';
    setTimeout(() => { copyCodeBtn.textContent = 'انسخ الكود'; }, 2000);
  }).catch(() => {
    showToast('الكود: ALAM25 — انسخه يدوياً');
  });
});

// Also copy on code text click
document.getElementById('promoCode').addEventListener('click', () => copyCodeBtn.click());

// ─── TESTIMONIALS SLIDER ─────────────────────────────────────
(function initSlider() {
  const cards = testimonialTrack.querySelectorAll('.testimonial-card');
  const total = cards.length;
  let current = 0;
  let autoTimer;

  // Build dots
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.dataset.index = i;
    dot.addEventListener('click', () => goTo(i));
    sliderDots.appendChild(dot);
  }

  function goTo(index) {
    current = (index + total) % total;
    testimonialTrack.style.transform = `translateX(${current * (100 / total)}%)`;
    // Update dots
    sliderDots.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
    resetAuto();
  }

  // Calculate correct translateX based on card widths
  function updateSlide() {
    const cardW = cards[0].offsetWidth + 28; // gap
    testimonialTrack.style.transform = `translateX(${current * cardW}px)`;
    sliderDots.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  prevBtn.addEventListener('click', () => { current = (current - 1 + total) % total; updateSlide(); resetAuto(); });
  nextBtn.addEventListener('click', () => { current = (current + 1) % total; updateSlide(); resetAuto(); });

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => { current = (current + 1) % total; updateSlide(); }, 5000);
  }
  resetAuto();
  window.addEventListener('resize', updateSlide);
})();

// ─── CONTACT FORM ────────────────────────────────────────────
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = document.getElementById('submitContactBtn');
  btn.textContent = '⏳ جاري الإرسال...';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'أرسل رسالتك ✦';
    btn.disabled = false;
    formSuccess.style.display = 'block';
    contactForm.reset();
    showToast('✅ تم إرسال رسالتك بنجاح!');
    setTimeout(() => { formSuccess.style.display = 'none'; }, 5000);
  }, 1800);
});

// ─── NEWSLETTER ──────────────────────────────────────────────
newsletterBtn.addEventListener('click', () => {
  const input = document.getElementById('newsletterEmail');
  if (!input.value || !input.value.includes('@')) {
    showToast('⚠️ يرجى إدخال بريد إلكتروني صحيح');
    return;
  }
  showToast('✅ تم الاشتراك في النشرة البريدية!');
  input.value = '';
});

// ─── SMOOTH ANCHOR SCROLL ────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ─── DIAMOND DUST API INTEGRATION ────────────────────────────
const DD_API = '';
let ddToken = localStorage.getItem('dd_token') || '';
let ddUser = JSON.parse(localStorage.getItem('dd_user') || '{}');
let ddLocalMode = false;

// Local JSON database (works without server, stores in localStorage)
window.__dbKey = 'dd_data';
const ddDB = {
  _key: 'dd_data',
  _tables: ['users','oils','materials','products','orders','orderItems','ledger','settings','purchaseOrders'],
  init() {
    let data = JSON.parse(localStorage.getItem(this._key) || '{}');
    let changed = false;
    // Force re-seed if version changed
    if (data._v !== 5) { data = {}; changed = true; }
    this._tables.forEach(t => { if (!data[t]) { data[t] = []; changed = true; } });
    if (!data._v) { data._v = 5; changed = true; }
    // Seed admin user
    if (!data.users.find(u => u.username === 'admin')) {
      data.users.push({ id: 1, username: 'admin', password: 'admin123', name: 'Admin', role: 'admin', created_at: new Date().toISOString() });
      changed = true;
    }
    // Seed sample customer with opening balance
    if (!data.users.find(u => u.role === 'customer')) {
      data.users.push({ id:2, username:'cust_1781906932001', password:'', name:'حسين سامى', phone:'01000666776', role:'customer', credit_limit:500, is_credit_enabled:true, created_at: new Date().toISOString() });
      data.ledger.push({ id:1, user_id:2, order_id:null, debit:450, credit:0, note:'مديونية ابتدائية', type:'opening', created_at: new Date().toISOString() });
      changed = true;
    }
    // Seed materials
    if (data.materials.length === 0) {
      data.materials.push(
        { id:1, type:'bottle', name:'زجاجة 30 مل', size:'30', stock:100, unit:'piece', company:'', supplier:'', purchase_price:3000, created_at: new Date().toISOString() },
        { id:2, type:'bottle', name:'زجاجة 50 مل', size:'50', stock:100, unit:'piece', company:'', supplier:'', purchase_price:4000, created_at: new Date().toISOString() },
        { id:3, type:'bottle', name:'زجاجة 100 مل', size:'100', stock:100, unit:'piece', company:'', supplier:'', purchase_price:6000, created_at: new Date().toISOString() },
        { id:4, type:'sticker', name:'استيكر عام', stock:100, unit:'piece', company:'', supplier:'', purchase_price:300, created_at: new Date().toISOString() },
        { id:5, type:'alcohol', name:'كحول عطري', stock:5000, unit:'ml', company:'', supplier:'', purchase_price:150, created_at: new Date().toISOString() }
      );
      changed = true;
    }
    // Seed oils & products
    if (data.oils.length === 0) {
      const seedOils = [
        { id:1, name:'عود ماركوجا', name_en:'Oud Maracuja', price:8, stock_ml:200, concentration:30, gender:'men', company:'Maison Crivelli', supplier:'', image_bottle:'product-imgs/oud-maracuja.jpg', image_note:'product-imgs/-Oud-Maracuj-Maison-Crivelli--perfume-card.jpg', created_at: new Date().toISOString() },
        { id:2, name:'هيبسكس ماهجاد', name_en:'Hibiscus Mahajad', price:9, stock_ml:200, concentration:30, gender:'women', company:'Maison Crivelli', supplier:'', image_bottle:'product-imgs/hibiscus-mahajad.jpg', image_note:'product-imgs/-Hibiscus-Mahaj-d-Maison-Crivelli--perfume-card.jpg', created_at: new Date().toISOString() },
        { id:3, name:'قصة امبريال', name_en:'Imperial Valley', price:5, stock_ml:300, concentration:30, gender:'men', company:'Gissah', supplier:'', image_bottle:'product-imgs/imperial-valley.jpg', image_note:'product-imgs/-Imperial-Valley-Gissah--perfume-card.jpg', created_at: new Date().toISOString() },
        { id:4, name:'خمرة قهوه', name_en:'Khamrah Qahwa', price:6, stock_ml:250, concentration:30, gender:'women', company:'Lattafa', supplier:'', image_bottle:'product-imgs/khamrah-qahwa.jpg', image_note:'product-imgs/-Khamrah-Qahwa-Lattafa-Perfumes--perfume-card.jpg', created_at: new Date().toISOString() },
        { id:5, name:'سيلفر سنت', name_en:'Silver Scent', price:3, stock_ml:300, concentration:25, gender:'men', company:'Jacques Bogart', supplier:'', image_bottle:'product-imgs/silver-scent.jpg', image_note:'product-imgs/-Silver-Scent-Jacques-Bogart--perfume-card.jpg', created_at: new Date().toISOString() },
        { id:6, name:'جوتشي بلاك', name_en:'Gucci Guilty Black', price:10, stock_ml:200, concentration:30, gender:'men', company:'Gucci', supplier:'', image_bottle:'product-imgs/gucci-black.jpg', image_note:'product-imgs/-Gucci-Guilty-Black-Pour-Homme-Gucci--perfume-card.jpg', created_at: new Date().toISOString() },
        { id:7, name:'جوتشي ابسولو', name_en:'Gucci Guilty Absolu', price:11, stock_ml:200, concentration:30, gender:'women', company:'Gucci', supplier:'', image_bottle:'product-imgs/gucci-absolu.jpg', image_note:'product-imgs/-Gucci-Guilty-Absolute-Gucci--perfume-card.jpg', created_at: new Date().toISOString() },
        { id:9, name:'استرونجر وز يو', name_en:'Stronger With You Absolutely', price:8, stock_ml:200, concentration:30, gender:'men', company:'جولدن مان', supplier:'الشركسى', image_bottle:'product-imgs/stronger-you.jpg', image_note:'product-imgs/-Emporio-Armani-Stronger-With-You-Absolutely-Giorgio-Armani--perfume-card.jpg', created_at: new Date().toISOString() },
        { id:10, name:'لو براديس جاردن', name_en:'Le Beau Paradise Garden', price:10, stock_ml:200, concentration:30, gender:'men', company:'جولدن مان', supplier:'الشركسيى', image_bottle:'product-imgs/le-beau.jpg', image_note:'product-imgs/-Le-Beau-Paradise-Garden-Jean-Paul-Gaultier--perfume-card.jpg', created_at: new Date().toISOString() },
        { id:11, name:'9 pm احمر', name_en:'9PM-Rebel-Afnan', price:5, stock_ml:200, concentration:30, gender:'men', company:'اروماتك', supplier:'مطاوع', image_bottle:'product-imgs/9pm-rebel.jpg', image_note:'product-imgs/9-PM-Rebel-Afnan-for-women-and-men-perfume-card.jpg', created_at: new Date().toISOString() },
        { id:12, name:'بوس امبريال', name_en:'Bois-Imprial-Essentia', price:7, stock_ml:200, concentration:30, gender:'men', company:'جولدن مان', supplier:'الشركسى', image_bottle:'product-imgs/bois-imperial.jpg', image_note:'product-imgs/-Bois-Imp-rial-Essential-Parfums--perfume-card.jpg', created_at: new Date().toISOString() },
        { id:13, name:'ديفندر تونى ايومى', name_en:'Deified Tony Iommi', price:12, stock_ml:200, concentration:30, gender:'men', company:'جولدن مان', supplier:'الشركسى', image_bottle:'product-imgs/deified-tony-iommi.jpg', image_note:'product-imgs/-Deified-Tony-Iommi-Parfum-Xerjoff--perfume-card.jpg', created_at: new Date().toISOString() },
        { id:14, name:'خمرة واحة', name_en:'Khamrah Waha Lattafa', price:6, stock_ml:200, concentration:30, gender:'men', company:'ساجا', supplier:'تاج العطور', image_bottle:'product-imgs/khamrah-waha.jpg', image_note:'product-imgs/-Khamrah-Waha-Lattafa-Perfumes--perfume-card.jpg', created_at: new Date().toISOString() }
      ];
      seedOils.forEach(o => data.oils.push(o));
      const seedProds = [
        { id:1, oil_id:1, name:'عود ماركوجا', name_en:'Oud Maracuja', image_bottle:'product-imgs/oud-maracuja.jpg', price_30:200, price_50:300, price_100:500, price:300, stock:50, sizes:'30,50,100', is_active:1, gender:'men', is_bestselling:1, created_at: new Date().toISOString() },
        { id:2, oil_id:2, name:'هيبسكس ماهجاد', name_en:'Hibiscus Mahajad', image_bottle:'product-imgs/hibiscus-mahajad.jpg', price_30:200, price_50:300, price_100:500, price:300, stock:50, sizes:'30,50,100', is_active:1, gender:'women', is_bestselling:1, created_at: new Date().toISOString() },
        { id:3, oil_id:3, name:'قصة امبريال', name_en:'Imperial Valley', image_bottle:'product-imgs/imperial-valley.jpg', price_30:200, price_50:300, price_100:500, price:300, stock:50, sizes:'30,50,100', is_active:1, gender:'men', is_bestselling:1, created_at: new Date().toISOString() },
        { id:4, oil_id:4, name:'خمرة قهوه', name_en:'Khamrah Qahwa', image_bottle:'product-imgs/khamrah-qahwa.jpg', price_30:200, price_50:300, price_100:500, price:300, stock:50, sizes:'30,50,100', is_active:1, gender:'women', is_bestselling:0, created_at: new Date().toISOString() },
        { id:5, oil_id:5, name:'سيلفر سنت', name_en:'Silver Scent', image_bottle:'product-imgs/silver-scent.jpg', price_30:200, price_50:300, price_100:500, price:300, stock:50, sizes:'30,50,100', is_active:1, gender:'men', is_bestselling:0, created_at: new Date().toISOString() },
        { id:6, oil_id:6, name:'جوتشي بلاك', name_en:'Gucci Guilty Black', image_bottle:'product-imgs/gucci-black.jpg', price_30:200, price_50:300, price_100:500, price:300, stock:50, sizes:'30,50,100', is_active:1, gender:'men', is_bestselling:0, created_at: new Date().toISOString() },
        { id:7, oil_id:7, name:'جوتشي ابسولو', name_en:'Gucci Guilty Absolu', image_bottle:'product-imgs/gucci-absolu.jpg', price_30:200, price_50:300, price_100:500, price:300, stock:50, sizes:'30,50,100', is_active:1, gender:'women', is_bestselling:0, created_at: new Date().toISOString() },
        { id:9, oil_id:9, name:'استرونجر وز يو', name_en:'Stronger With You Absolutely', image_bottle:'product-imgs/stronger-you.jpg', price_30:0, price_50:0, price_100:0, price:0, stock:0, sizes:'30,50,100', is_active:1, gender:'men', is_bestselling:0, created_at: new Date().toISOString() },
        { id:10, oil_id:10, name:'لو براديس جاردن', name_en:'Le Beau Paradise Garden', image_bottle:'product-imgs/le-beau.jpg', price_30:0, price_50:0, price_100:0, price:0, stock:0, sizes:'30,50,100', is_active:1, gender:'men', is_bestselling:0, created_at: new Date().toISOString() },
        { id:11, oil_id:11, name:'9 pm احمر', name_en:'9PM-Rebel-Afnan', image_bottle:'product-imgs/9pm-rebel.jpg', price_30:0, price_50:0, price_100:0, price:0, stock:0, sizes:'30,50,100', is_active:1, gender:'men', is_bestselling:0, created_at: new Date().toISOString() },
        { id:12, oil_id:12, name:'بوس امبريال', name_en:'Bois-Imprial-Essentia', image_bottle:'product-imgs/bois-imperial.jpg', price_30:0, price_50:0, price_100:0, price:0, stock:0, sizes:'30,50,100', is_active:1, gender:'men', is_bestselling:0, created_at: new Date().toISOString() },
        { id:13, oil_id:13, name:'ديفندر تونى ايومى', name_en:'Deified Tony Iommi', image_bottle:'product-imgs/deified-tony-iommi.jpg', price_30:0, price_50:0, price_100:0, price:0, stock:0, sizes:'30,50,100', is_active:1, gender:'men', is_bestselling:0, created_at: new Date().toISOString() },
        { id:14, oil_id:14, name:'خمرة واحة', name_en:'Khamrah Waha Lattafa', image_bottle:'product-imgs/khamrah-waha.jpg', price_30:0, price_50:0, price_100:0, price:0, stock:0, sizes:'30,50,100', is_active:1, gender:'men', is_bestselling:0, created_at: new Date().toISOString() }
      ];
      seedProds.forEach(p => data.products.push(p));
      data.settings = [
        { id:1, key:'wa_number', value:'' },
        { id:2, key:'wa_enabled', value:'0' },
        { id:3, key:'contact_phone', value:'+201000553703' },
        { id:4, key:'contact_email', value:'emadsamy8111@gmail.com' }
      ];
      changed = true;
    }
    if (changed) localStorage.setItem(this._key, JSON.stringify(data));
    return data;
  },
  save(data) {
    try { localStorage.setItem(this._key, JSON.stringify(data)); }
    catch(e) { console.error('localStorage quota exceeded'); throw e; }
  },
  table(name) {
    const data = JSON.parse(localStorage.getItem(this._key) || '{}');
    if (!data[name]) data[name] = [];
    return {
      all: () => data[name],
      find: (q) => data[name].filter(r => Object.entries(q).every(([k,v]) => r[k] === v)),
      findOne: (q) => data[name].find(r => Object.entries(q).every(([k,v]) => r[k] === v)),
      findById: (id) => data[name].find(r => r.id === id),
      where: (fn) => data[name].filter(fn),
      count: (q) => q ? data[name].filter(r => Object.entries(q).every(([k,v]) => r[k] === v)).length : data[name].length,
      insert: (row) => {
        const ids = data[name].map(r => r.id).filter(x => x);
        const id = ids.length ? Math.max(...ids) + 1 : 1;
        const entry = { id, ...row, created_at: new Date().toISOString() };
        data[name].push(entry);
        ddDB.save(data);
        return entry;
      },
      updateById: (id, updates) => {
        const idx = data[name].findIndex(r => r.id === id);
        if (idx >= 0) { Object.assign(data[name][idx], updates); ddDB.save(data); return true; }
        return false;
      },
      removeById: (id) => {
        const idx = data[name].findIndex(r => r.id === id);
        if (idx >= 0) { data[name].splice(idx, 1); ddDB.save(data); return true; }
        return false;
      }
    };
  }
};

// Initialize local DB once
ddDB.init();

// Check for updates from GitHub (only in local mode)
(function checkUpdate() {
  if (window.location.protocol !== 'file:') return;
  const localVer = parseInt(localStorage.getItem('dd_version') || '0');
  fetch('https://emadsamy8111.github.io/diamond-dust/version.json', { cache: 'no-cache' })
    .then(r => r.json())
    .then(v => {
      if (v.version > localVer) {
        localStorage.setItem('dd_version', String(v.version));
        const banner = document.createElement('div');
        banner.id = 'updateBanner';
        banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#4ecdc4;color:#1a1200;text-align:center;padding:12px 20px;font-family:\'Cairo\',sans-serif;font-size:0.95rem;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;';
        banner.innerHTML = `🔄 توجد نسخة محدثة! <a href="https://github.com/emadsamy8111/diamond-dust" target="_blank" style="color:#1a1200;font-weight:bold;">عرض التحديثات</a> أو شغّل ملف <code style="background:#1a120022;padding:2px 8px;border-radius:4px;">تحديث من GitHub.bat</code> <button onclick="this.parentElement.remove()" style="background:#1a1200;color:#4ecdc4;border:none;border-radius:6px;padding:4px 14px;cursor:pointer;font-family:inherit;">✕</button>`;
        document.body.prepend(banner);
      }
    })
    .catch(() => {});
})();

// Local API handler (mimics server endpoints)
function ddLocalApi(method, path, body) {
  const p = path.replace(/^\/+|\/+$/g,'').split('/');
  const table = (name) => ddDB.table(name);
  const isGet = method === 'GET' || !method;
  const id = parseInt(p[p.length-1]);
  const data = JSON.parse(localStorage.getItem(ddDB._key) || '{}');

  // Auth
  if (path === '/images') {
    return Promise.resolve([]);
  }
  if (path === '/auth/login' && method === 'POST') {
    const u = table('users').findOne({ username: body.username }) || table('users').findOne({ phone: body.username });
    if (u && u.password === body.password) {
      const user = { id: u.id, name: u.name, role: u.role, username: u.username };
      return Promise.resolve({ token: 'local-' + u.id, user });
    }
    return Promise.resolve({ error: 'رقم الهاتف أو كلمة المرور خطأ' });
  }
  if (path === '/auth/me') {
    const u = table('users').findById(ddToken === 'local-1' ? 1 : 0);
    return u ? Promise.resolve({ id: u.id, name: u.name, role: u.role, username: u.username }) : Promise.resolve({ error: 'Unauthorized' });
  }

  // Dashboard
  if (path === '/admin/dashboard') {
    const orders = table('orders').all();
    const today = new Date().toISOString().slice(0,10);
    const todayOrders = orders.filter(o => o.created_at && o.created_at.slice(0,10) === today);
    const oilsCost = table('oils').all().reduce((s, o) => s + (parseFloat(o.purchase_price)||0), 0);
    const matsCost = table('materials').all().reduce((s, m) => s + (parseFloat(m.purchase_price)||0), 0);
    return Promise.resolve({
      totalOrders: orders.length, todayOrders: todayOrders.length,
      totalRevenue: orders.reduce((s,o) => s + (o.total || 0), 0),
      todayRevenue: todayOrders.reduce((s,o) => s + (o.total || 0), 0),
      totalCustomers: table('users').count({ role: 'customer' }),
      totalOils: table('oils').count(),
      lowStockOils: table('oils').where(o => (o.stock_ml||0) < 100).length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      inventoryCost: oilsCost + matsCost,
      recentOrders: orders.filter(o => o.status !== 'cancelled').sort((a,b) => b.id - a.id).slice(0,10)
    });
  }

  // Admin sales
  if (path === '/admin/sales') {
    const orders = table('orders').all().sort((a,b) => b.id - a.id).map(o => {
      const customer = table('users').findById(o.user_id);
      const items = table('orderItems').find({ order_id: o.id }).map(item => {
        const prod = table('products').findById(item.product_id);
        const oil = prod ? table('oils').findById(prod.oil_id) : null;
        return { ...item, oil_name: oil?.name || null };
      });
      const summary = items.map(i => `${i.qty} عبوة ${i.size_ml} مللي - ${i.oil_name || '?'} ${((i.price||0)*i.qty).toLocaleString()} جم`).join('\n');
      return { ...o, customer_name: customer?.name || null, items_summary: summary, items };
    });
    return Promise.resolve(orders);
  }

  // Admin settings
  if (path === '/admin/settings') {
    if (isGet) {
      const s = table('settings').all();
      const obj = {};
      s.forEach(x => obj[x.key] = x.value);
      return Promise.resolve(obj);
    }
    if (method === 'PUT') {
      const existing = table('settings').findOne({ key: body.key });
      if (existing) table('settings').updateById(existing.id, { value: String(body.value) });
      else table('settings').insert({ key: body.key, value: String(body.value) });
      return Promise.resolve({ message: 'تم الحفظ' });
    }
  }

  // Export / Import
  if (path === '/admin/export') {
    const full = localStorage.getItem(window.__dbKey || 'ddDB');
    return Promise.resolve({ data: full });
  }
  if (path === '/admin/import') {
    try {
      const parsed = JSON.parse(body.data);
      localStorage.setItem(window.__dbKey || 'ddDB', body.data);
      return Promise.resolve({ message: '✅ تم الاستيراد بنجاح، سيتم إعادة التحميل', ok: true });
    } catch(e) {
      return Promise.resolve({ message: '❌ فشل الاستيراد: الملف غير صالح', ok: false });
    }
  }

  // Oils
  if (path.startsWith('/inventory/oils')) {
    if (isGet && isNaN(id)) return Promise.resolve(table('oils').all().sort((a,b) => b.id - a.id));
    if (isGet && id) return Promise.resolve(table('oils').findById(id) || { error: 'الزيت غير موجود' });
    if (method === 'POST') {
      const gender = body.gender || 'men';
      const oil = table('oils').insert({
        name: body.name, name_en: body.name_en || null, company: body.company || null, supplier: body.supplier || null, gender,
        purchase_price: parseFloat(body.purchase_price || 0),
        concentration: parseFloat(body.concentration), stock_ml: parseFloat(body.stock_ml || 0),
        image_note: body.image_note || null, image_bottle: body.image_bottle || null
      });
      table('products').insert({ oil_id: oil.id, name: `عطر ${body.name}`, name_en: body.name_en || null, price: 300, price_30: 200, price_50: 300, price_100: 500, stock: 0, sizes: '30,50,100', is_active: 1, gender });
      return Promise.resolve({ id: oil.id, message: 'تم إضافة الزيت بنجاح وتم إنشاء المنتج تلقائياً' });
    }
    if (method === 'PUT' && id) {
      const updates = {};
      if (body.name !== undefined) updates.name = body.name;
      if (body.name_en !== undefined) updates.name_en = body.name_en;
      if (body.company !== undefined) updates.company = body.company;
      if (body.supplier !== undefined) updates.supplier = body.supplier;
      if (body.gender !== undefined) updates.gender = body.gender;
      if (body.purchase_price !== undefined) updates.purchase_price = parseFloat(body.purchase_price);
      if (body.concentration !== undefined) updates.concentration = parseFloat(body.concentration);
      if (body.stock_ml !== undefined) updates.stock_ml = parseFloat(body.stock_ml);
      if (body.image_note !== undefined) updates.image_note = body.image_note;
      if (body.image_bottle !== undefined) updates.image_bottle = body.image_bottle;
      table('oils').updateById(id, updates);
      // Sync changes to linked product
      const prod = table('products').findOne({ oil_id: id });
      if (prod) {
        const prodUpdates = {};
        if (body.name_en !== undefined) prodUpdates.name_en = body.name_en;
        if (body.name !== undefined) prodUpdates.name = `عطر ${body.name}`;
        if (body.gender !== undefined) prodUpdates.gender = body.gender;
        if (Object.keys(prodUpdates).length) table('products').updateById(prod.id, prodUpdates);
      }
      return Promise.resolve({ message: 'تم تحديث الزيت بنجاح' });
    }
    if (method === 'DELETE' && id) {
      table('oils').removeById(id);
      table('products').where(p => p.oil_id === id).forEach(p => table('products').removeById(p.id));
      return Promise.resolve({ message: 'تم حذف الزيت والمنتج المرتبط به' });
    }
  }

  // Materials
  if (path.startsWith('/inventory/materials')) {
    if (isGet && isNaN(id)) {
      const all = table('materials').all();
      return Promise.resolve(all.sort((a,b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name)));
    }
    if (method === 'POST') {
      table('materials').insert({
        type: body.type, name: body.name, company: body.company || null, supplier: body.supplier || null,
        purchase_price: parseFloat(body.purchase_price || 0),
        size: body.size || null, stock: parseInt(body.stock || 0), unit: body.unit || 'piece'
      });
      return Promise.resolve({ message: 'تم إضافة المادة' });
    }
    if (method === 'PUT' && id) {
      const updates = {};
      if (body.type !== undefined) updates.type = body.type;
      if (body.name !== undefined) updates.name = body.name;
      if (body.company !== undefined) updates.company = body.company;
      if (body.supplier !== undefined) updates.supplier = body.supplier;
      if (body.purchase_price !== undefined) updates.purchase_price = parseFloat(body.purchase_price);
      if (body.size !== undefined) updates.size = body.size;
      if (body.stock !== undefined) updates.stock = parseInt(body.stock);
      if (body.unit !== undefined) updates.unit = body.unit;
      table('materials').updateById(id, updates);
      return Promise.resolve({ message: 'تم التحديث' });
    }
    if (method === 'DELETE' && id) {
      table('materials').removeById(id);
      return Promise.resolve({ message: 'تم حذف المادة' });
    }
  }

  // Inventory summary
  if (path === '/inventory/summary') {
    const oilsT = table('oils');
    const matsT = table('materials');
    return Promise.resolve({
      oils: oilsT.count(), products: table('products').where(p => p.is_active).length,
      lowStock: oilsT.where(o => o.stock_ml < 100).length,
      bottles: matsT.where(m => m.type === 'bottle').reduce((s,m) => s + (m.stock||0), 0),
      stickers: matsT.where(m => m.type === 'sticker').reduce((s,m) => s + (m.stock||0), 0),
      alcohol: matsT.where(m => m.type === 'alcohol').reduce((s,m) => s + (m.stock||0), 0)
    });
  }

  // Products
  const fixImg = (v) => v && !v.startsWith('/uploads/') ? v : null;

window.previewFile = function(input, imgId) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = document.getElementById(imgId);
    if (img) img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};
  if (path === '/products' && isGet) {
    const oilsT = table('oils');
    return Promise.resolve(table('products').all().map(p => {
      const oil = oilsT.findById(p.oil_id) || {};
      return { ...p, name_en: p.name_en || oil.name_en || null, image_bottle: fixImg(oil.image_bottle), image_note: fixImg(oil.image_note), oil_name: oil.name || null, gender: oil.gender === 'unisex' ? 'men' : (oil.gender || p.gender || 'men'), is_bestselling: p.is_bestselling ? 1 : 0 };
    }));
  }
  if (path.match(/^\/products\/\d+$/) && isGet) {
    const prod = table('products').findById(id);
    const oil = prod ? table('oils').findById(prod.oil_id) : null;
    return Promise.resolve(prod ? { ...prod, image_bottle: fixImg(oil?.image_bottle), image_note: fixImg(oil?.image_note), oil_name: oil ? oil.name : null, is_bestselling: prod.is_bestselling ? 1 : 0 } : { error: 'غير موجود' });
  }
  if (path.match(/^\/products\/\d+$/) && method === 'PUT' && id) {
    table('products').updateById(id, body);
    return Promise.resolve({ message: 'تم الحفظ' });
  }

  // Customers
  if (path === '/users' && isGet) {
    return Promise.resolve(table('users').all());
  }
  if (path === '/customers' && isGet) {
    const allUsers = table('users').all();
    const orderUserIds = table('orders').all().map(o => o.user_id).filter(Boolean);
    return Promise.resolve(allUsers.filter(u => u.role === 'customer' || orderUserIds.includes(u.id)));
  }
  if (path === '/customers' && method === 'POST') {
    if (table('users').findOne({ name: body.name })) return Promise.resolve({ error: 'عميل بنفس الاسم موجود بالفعل' });
    const u = table('users').insert({ username: body.phone || 'cust_' + Date.now(), password: body.password || '', name: body.name, phone: body.phone || '', role: 'customer', credit_limit: parseFloat(body.credit_limit||0), is_credit_enabled: parseFloat(body.credit_limit||0) > 0 });
    if (parseFloat(body.opening_balance||0) > 0) {
      table('ledger').insert({ user_id: u.id, order_id: null, debit: parseFloat(body.opening_balance), credit: 0, note: 'مديونية ابتدائية', type: 'opening', created_at: new Date().toISOString() });
    }
    return Promise.resolve({ id: u.id, message: 'تم إضافة العميل' });
  }
  const custMatch = path.match(/^\/customers\/(\d+)$/);
  if (custMatch) {
    const cid = parseInt(custMatch[1]);
    if (isGet) {
      const u = table('users').findById(cid);
      if (!u) return Promise.resolve({ error: 'غير موجود' });
      const orders = table('orders').find({ user_id: cid });
      const totalPurchases = orders.reduce((s, o) => s + (o.total || 0), 0);
      const totalPaid = orders.reduce((s, o) => s + (o.paid || 0), 0);
      const openingDebit = table('ledger').find({ user_id: cid, type: 'opening' }).reduce((s, l) => s + (l.debit||0), 0);
      return Promise.resolve({ ...u, total_purchases: totalPurchases + openingDebit, total_paid: totalPaid, balance: totalPurchases + openingDebit - totalPaid, opening_balance: openingDebit });
    }
    if (method === 'PUT') {
      const updates = {};
      if (body.credit_limit !== undefined) updates.credit_limit = parseFloat(body.credit_limit);
      if (body.is_credit_enabled !== undefined) updates.is_credit_enabled = body.is_credit_enabled;
      if (body.password !== undefined) updates.password = body.password;
      if (body.phone !== undefined) updates.phone = body.phone;
      if (body.name !== undefined) updates.name = body.name;
      table('users').updateById(cid, updates);
      return Promise.resolve({ message: 'تم التحديث' });
    }
    if (method === 'DELETE') {
      table('ledger').find({ user_id: cid }).forEach(l => table('ledger').removeById(l.id));
      table('users').removeById(cid);
      return Promise.resolve({ message: 'تم حذف العميل' });
    }
  }
  const ledgerMatch = path.match(/^\/customers\/(\d+)\/ledger$/);
  if (ledgerMatch) {
    const cid = parseInt(ledgerMatch[1]);
    return Promise.resolve(table('ledger').find({ user_id: cid }).sort((a,b) => b.id - a.id).map(l => {
      const order = table('orders').findById(l.order_id);
      return { ...l, order_no: order ? order.order_no : null };
    }));
  }

  // Orders
  if (path === '/orders' && isGet) {
    const oilsT = table('oils');
    const usersT = table('users');
    return Promise.resolve(table('orders').all().sort((a,b) => b.id - a.id).map(o => ({
      ...o, customer_name: (usersT.findById(o.user_id) || {}).name || null,
      items: table('orderItems').find({ order_id: o.id }).map(item => ({
        ...item, oil_name: (oilsT.findById((table('products').findById(item.product_id) || {}).oil_id) || {}).name || null
      }))
    })));
  }
  if (path === '/orders' && method === 'POST') {
    const oilsT = table('oils');
    const matsT = table('materials');
    const ordItems = [];
    let total = 0;
    for (const item of body.items) {
      const prod = table('products').findById(item.product_id);
      if (!prod) return Promise.resolve({ error: 'منتج غير موجود' });
      const oil = oilsT.findById(prod.oil_id);
      if (oil) {
        const oilUsed = item.size_ml * (oil.concentration / 100);
        const alcoholUsed = item.size_ml - oilUsed;
        if ((oil.stock_ml || 0) < oilUsed * item.qty) return Promise.resolve({ error: `المخزون غير كافٍ من زيت ${oil.name}` });
        oilsT.updateById(oil.id, { stock_ml: (oil.stock_ml || 0) - oilUsed * item.qty });
        // Deduct alcohol
        const alc = matsT.findOne({ type: 'alcohol' });
        if (alc && alc.stock >= alcoholUsed * item.qty) matsT.updateById(alc.id, { stock: alc.stock - alcoholUsed * item.qty });
        // Deduct bottle & sticker
        const bottle = matsT.findOne({ type: 'bottle', size: String(item.size_ml) });
        if (bottle && bottle.stock >= item.qty) matsT.updateById(bottle.id, { stock: bottle.stock - item.qty });
        const sticker = matsT.findOne({ type: 'sticker' });
        if (sticker && sticker.stock >= item.qty) matsT.updateById(sticker.id, { stock: sticker.stock - item.qty });
      }
      const sizePrice = parseFloat({30: prod.price_30, 50: prod.price_50, 100: prod.price_100}[item.size_ml]) || parseFloat(prod.price) || 0;
      const itemTotal = sizePrice * item.qty;
      total += itemTotal;
      ordItems.push({ product_id: item.product_id, size_ml: item.size_ml, qty: item.qty, unit_price: sizePrice });
    }
    // Determine customer: if customer_name provided (admin flow), find or create
    let uid = ddUser?.id;
    if (body.customer_name) {
      let cust = table('users').findOne({ name: body.customer_name, role: 'customer' });
      if (!cust) {
        cust = table('users').insert({ username: 'cust_' + Date.now(), password: '', name: body.customer_name, phone: body.customer_phone || '', role: 'customer', credit_limit: 0, is_credit_enabled: false });
      }
      uid = cust.id;
    }
    if (!uid) return Promise.resolve({ error: 'يجب تسجيل الدخول أو تحديد اسم العميل' });
    const user = table('users').findById(uid);
    if (body.payment_type === 'credit' && user) {
      const outstanding = table('ledger').find({ user_id: user.id }).reduce((s, l) => s + (l.debit||0) - (l.credit||0), 0);
      if ((user.credit_limit || 0) < outstanding + total) return Promise.resolve({ error: 'تجاوز الحد الائتماني' });
    }
    const order = table('orders').insert({
      user_id: uid, total, status: body.payment_type === 'credit' ? 'pending' : 'confirmed',
      payment_type: body.payment_type || 'cash', order_no: 'DD-' + Date.now().toString(36).toUpperCase()
    });
    ordItems.forEach(item => table('orderItems').insert({ order_id: order.id, ...item }));
    if (body.payment_type === 'credit' && user) {
      table('orders').updateById(order.id, { remaining: total });
      table('ledger').insert({ user_id: user.id, order_id: order.id, debit: total, credit: 0, note: 'مشتريات آجل', type: 'order' });
    }
    const itemsSummary = ordItems.map(item => {
      const prod = table('products').findById(item.product_id);
      const oil = prod ? table('oils').findById(prod.oil_id) : null;
      const itemTotal = (item.price || 0) * item.qty;
      return `${item.qty} عبوة ${item.size_ml} مللي - ${oil?.name || 'منتج'} ${itemTotal.toLocaleString()} جم`;
    }).join('\n');
    return Promise.resolve({ order: { ...order, items_summary: itemsSummary }, items_summary: itemsSummary, message: 'تم الطلب بنجاح' });
  }
  const ordMatch = path.match(/^\/orders\/(\d+)$/);
  if (ordMatch) {
    const oid = parseInt(ordMatch[1]);
    if (isGet) {
      const o = table('orders').findById(oid);
      return Promise.resolve(o ? {
        ...o, customer_name: (table('users').findById(o.user_id) || {}).name,
        items: table('orderItems').find({ order_id: o.id }).map(item => {
          const prod = table('products').findById(item.product_id);
          const oil = prod ? table('oils').findById(prod.oil_id) : null;
          return { ...item, oil_name: oil?.name || null };
        })
      } : { error: 'غير موجود' });
    }
    if (method === 'PUT') {
      table('orders').updateById(oid, body);
      // If marking as delivered, create invoice ledger entry (skip if already exists)
      if (body.status === 'delivered') {
        const o = table('orders').findById(oid);
        if (o && !table('ledger').find({ user_id: o.user_id, order_id: o.id }).filter(l => l.note && l.note.includes('فاتورة')).length) {
          table('ledger').insert({ user_id: o.user_id, order_id: o.id, debit: o.total, credit: 0, note: `فاتورة ${o.order_no}`, type: 'order' });
        }
      }
      // If cancelling, clean up ledger entries
      if (body.status === 'cancelled') {
        table('ledger').find({ order_id: oid }).forEach(l => table('ledger').removeById(l.id));
      }
      return Promise.resolve({ message: 'تم التحديث' });
    }
  }
  if (path.match(/^\/orders\/(\d+)\/pay$/)) {
    const oid = parseInt(path.match(/^\/orders\/(\d+)\/pay$/)[1]);
    const o = table('orders').findById(oid);
    if (!o) return Promise.resolve({ error: 'غير موجود' });
    const payAmount = parseFloat(body.amount);
    if (isNaN(payAmount) || payAmount <= 0) return Promise.resolve({ error: 'مبلغ غير صحيح' });
    const newPaid = (o.paid || 0) + payAmount;
    const newRemaining = Math.max(0, o.total - newPaid);
    const update = { paid: newPaid, remaining: newRemaining };
    if (newRemaining <= 0 && o.status !== 'delivered') update.status = 'paid';
    table('orders').updateById(oid, update);
    const method = body.method || 'cash';
    const methodNames = { cash: 'نقدي', transfer: 'تحويل' };
    table('ledger').insert({ user_id: o.user_id, order_id: o.id, debit: 0, credit: payAmount, note: `دفعة (${methodNames[method] || method})`, type: 'payment', method: method, created_at: new Date().toISOString() });
    return Promise.resolve({ message: 'تم تسجيل الدفعة', remaining: newRemaining });
  }

  // Delete order (reverse inventory + remove ledger)
  const delMatch = path.match(/^\/orders\/(\d+)\/delete$/);
  if (delMatch) {
    const oid = parseInt(delMatch[1]);
    const o = table('orders').findById(oid);
    if (!o) return Promise.resolve({ error: 'غير موجود' });
    const oilsT = table('oils');
    const matsT = table('materials');
    const orderItems = table('orderItems').find({ order_id: oid });
    for (const item of orderItems) {
      const prod = table('products').findById(item.product_id);
      if (!prod) continue;
      const oil = oilsT.findById(prod.oil_id);
      if (oil) {
        const oilUsed = item.size_ml * (oil.concentration / 100);
        const alcoholUsed = item.size_ml - oilUsed;
        oilsT.updateById(oil.id, { stock_ml: (oil.stock_ml || 0) + oilUsed * item.qty });
        const alc = matsT.findOne({ type: 'alcohol' });
        if (alc) matsT.updateById(alc.id, { stock: (alc.stock || 0) + alcoholUsed * item.qty });
        const bottle = matsT.findOne({ type: 'bottle', size: String(item.size_ml) });
        if (bottle) matsT.updateById(bottle.id, { stock: (bottle.stock || 0) + item.qty });
        const sticker = matsT.findOne({ type: 'sticker' });
        if (sticker) matsT.updateById(sticker.id, { stock: (sticker.stock || 0) + item.qty });
      }
    }
    // Remove ledger entries
    table('ledger').find({ order_id: oid }).forEach(l => table('ledger').removeById(l.id));
    // Remove order items
    orderItems.forEach(item => table('orderItems').removeById(item.id));
    // Remove order
    table('orders').removeById(oid);
    return Promise.resolve({ message: 'تم حذف الطلب' });
  }

  // Additions (Warehouse Addition Slips)
  function ensureItemAuto(type, name) {
    name = name.trim();
    if (type === 'oil') {
      var ex = table('oils').findOne({ name: name }) || table('oils').all().find(function(o) { return o.name && o.name.trim() === name; });
      if (ex) return ex;
      adminToast('⚠️ تم إنشاء زيت جديد "' + name + '" لأنه غير موجود');
      return table('oils').insert({ name: name, name_en: null, company: null, supplier: null, gender: 'men', purchase_price: 0, concentration: 0, stock_ml: 1 });
    }
    var ex = table('materials').findOne({ name: name, type: type }) || table('materials').all().find(function(m) { return m.type === type && m.name && m.name.trim() === name; });
    if (ex) return ex;
    return table('materials').insert({ type: type, name: name, company: null, supplier: null, purchase_price: 0, size: typeHasSize(type) ? '30' : null, stock: 1, unit: 'piece' });
  }
  if (path === '/purchases' && isGet) {
    return Promise.resolve(table('purchaseOrders').all());
  }
  if (path === '/purchases' && method === 'POST') {
    var items = body.items || [];
    if (!items.length) return Promise.resolve({ error: 'يجب إضافة أصناف' });
    // تعديل مباشر على localStorage
    var dbAll = JSON.parse(localStorage.getItem('dd_data') || '{}');
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (item.type === 'oil') {
        var oilIdx = dbAll.oils.findIndex(function(o) { return o.name && o.name.trim() === item.name.trim(); });
        if (oilIdx === -1) {
          dbAll.oils.push({ id: dbAll.oils.length ? Math.max.apply(null, dbAll.oils.map(function(x) { return x.id; })) + 1 : 1, name: item.name.trim(), name_en: null, company: null, supplier: null, gender: 'men', purchase_price: 0, concentration: 0, stock_ml: 1, image_bottle: null, image_note: null, created_at: new Date().toISOString() });
          oilIdx = dbAll.oils.length - 1;
          adminToast('⚠️ تم إنشاء زيت جديد "' + item.name.trim() + '"');
        }
        item.item_id = dbAll.oils[oilIdx].id;
        dbAll.oils[oilIdx].stock_ml = (parseFloat(dbAll.oils[oilIdx].stock_ml)||0) + parseFloat(item.qty||0);
        dbAll.oils[oilIdx].purchase_price = (parseFloat(dbAll.oils[oilIdx].purchase_price)||0) + (parseFloat(item.price||0));
      } else {
        var matIdx = dbAll.materials.findIndex(function(m) { return m.type === item.type && m.name && m.name.trim() === item.name.trim(); });
        if (matIdx === -1) {
          dbAll.materials.push({ id: dbAll.materials.length ? Math.max.apply(null, dbAll.materials.map(function(x) { return x.id; })) + 1 : 1, type: item.type, name: item.name.trim(), company: null, supplier: null, purchase_price: 0, size: typeHasSize(item.type) ? '30' : null, stock: 1, unit: 'piece', created_at: new Date().toISOString() });
          matIdx = dbAll.materials.length - 1;
        }
        item.item_id = dbAll.materials[matIdx].id;
        dbAll.materials[matIdx].stock = (parseFloat(dbAll.materials[matIdx].stock)||0) + parseFloat(item.qty||0);
        dbAll.materials[matIdx].purchase_price = (parseFloat(dbAll.materials[matIdx].purchase_price)||0) + (parseFloat(item.price||0));
      }
    }
    if (!dbAll.purchaseOrders) dbAll.purchaseOrders = [];
    var newId = dbAll.purchaseOrders.length ? Math.max.apply(null, dbAll.purchaseOrders.map(function(x) { return x.id; })) + 1 : 1;
    dbAll.purchaseOrders.push({
      id: newId, supplier: body.supplier || '', date: body.date || new Date().toISOString().slice(0,10),
      items: items.map(function(i) { return { type: i.type, item_id: i.item_id, name: i.name, qty: i.qty, price: i.price || 0 }; }),
      status: 'added', total: items.reduce(function(s, i) { return s + (i.price || 0); }, 0),
      created_at: new Date().toISOString()
    });
    localStorage.setItem('dd_data', JSON.stringify(dbAll));
    return Promise.resolve({ message: '✅ تمت إضافة الأصناف للمخزون', order: { id: newId } });
  }
  if (path === '/purchases' && method === 'DELETE') {
    return Promise.resolve({ error: 'يرجى تحديد رقم الإذن' });
  }
  var purchDelMatch = path.match(/^\/purchases\/(\d+)$/);
  if (purchDelMatch && method === 'DELETE') {
    var pid2 = parseInt(purchDelMatch[1]);
    var order2 = table('purchaseOrders').findById(pid2);
    if (!order2) return Promise.resolve({ error: 'غير موجود' });
    var items2 = order2.items || [];
    for (var j = 0; j < items2.length; j++) {
      var it = items2[j];
      if (it.type === 'oil') {
        var oil2 = table('oils').findById(it.item_id);
        if (oil2) table('oils').updateById(oil2.id, { stock_ml: Math.max(0, (oil2.stock_ml || 0) - it.qty) });
      } else {
        var mat2 = table('materials').findById(it.item_id);
        if (mat2) table('materials').updateById(mat2.id, { stock: Math.max(0, (mat2.stock || 0) - it.qty) });
      }
    }
    table('purchaseOrders').removeById(pid2);
    return Promise.resolve({ message: '✅ تم حذف الإذن وعكس الكميات' });
  }
  var purchPutMatch = path.match(/^\/purchases\/(\d+)$/);
  if (purchPutMatch && method === 'PUT') {
    var pidPut = parseInt(purchPutMatch[1]);
    var oldOrder = table('purchaseOrders').findById(pidPut);
    if (!oldOrder) return Promise.resolve({ error: 'غير موجود' });
    var oldItems = oldOrder.items || [];
    // Reverse old quantities
    for (var pi = 0; pi < oldItems.length; pi++) {
      var oi = oldItems[pi];
      if (oi.type === 'oil') {
        var oo = table('oils').findById(oi.item_id);
        if (oo) table('oils').updateById(oo.id, { stock_ml: Math.max(0, (oo.stock_ml || 0) - oi.qty) });
      } else {
        var om = table('materials').findById(oi.item_id);
        if (om) table('materials').updateById(om.id, { stock: Math.max(0, (om.stock || 0) - oi.qty) });
      }
    }
    // Apply new quantities
    var newItems = body.items || [];
    for (var pj = 0; pj < newItems.length; pj++) {
      var ni = newItems[pj];
      if (ni.type === 'oil') {
        var no = ensureItemAuto('oil', ni.name);
        ni.item_id = no.id;
        table('oils').updateById(no.id, { stock_ml: (no.stock_ml || 0) + ni.qty, purchase_price: (parseFloat(no.purchase_price)||0) + (ni.price || 0) });
      } else {
        var nm = ensureItemAuto(ni.type, ni.name);
        ni.item_id = nm.id;
        table('materials').updateById(nm.id, { stock: (nm.stock || 0) + ni.qty, purchase_price: (parseFloat(nm.purchase_price)||0) + (ni.price || 0) });
      }
    }
    table('purchaseOrders').updateById(pidPut, {
      supplier: body.supplier || '',
      date: body.date || oldOrder.date,
      items: newItems.map(function(x) { return { type: x.type, item_id: x.item_id, name: x.name, qty: x.qty, price: x.price || 0 }; }),
      total: newItems.reduce(function(s, x) { return s + (x.price || 0); }, 0)
    });
    return Promise.resolve({ message: '✅ تم تعديل الإذن وعكس الكميات' });
  }
  var purchMatch = path.match(/^\/purchases\/(\d+)$/);
  if (purchMatch && isGet) {
    var pid = parseInt(purchMatch[1]);
    return Promise.resolve(table('purchaseOrders').findById(pid) || { error: 'غير موجود' });
  }

  // Register
  if (path === '/auth/register' && method === 'POST') {
    if (table('users').findOne({ username: body.username })) return Promise.resolve({ error: 'رقم الهاتف مستخدم بالفعل' });
    const existing = table('users').findOne({ name: body.name, password: '' });
    if (existing) {
      table('users').updateById(existing.id, { username: body.username, password: body.password, phone: body.phone || existing.phone });
      return Promise.resolve({ token: 'local-' + existing.id, user: { id: existing.id, name: existing.name, role: 'customer', username: body.username } });
    }
    const u = table('users').insert({ username: body.username, password: body.password, name: body.name, phone: body.phone || '', role: 'customer', credit_limit: 0, is_credit_enabled: false });
    return Promise.resolve({ token: 'local-' + u.id, user: { id: u.id, name: u.name, role: 'customer', username: u.username } });
  }

  // Customer register (for store - no auth needed)
  if (path.startsWith('/auth/register')) {
    if (table('users').findOne({ username: body.username })) return Promise.resolve({ error: 'رقم الهاتف مستخدم بالفعل' });
    const existing = table('users').findOne({ name: body.name, password: '' });
    if (existing) {
      table('users').updateById(existing.id, { username: body.username, password: body.password, phone: body.phone || existing.phone });
      return Promise.resolve({ token: 'local-' + existing.id, user: { id: existing.id, name: existing.name, role: 'customer', username: body.username } });
    }
    const u = table('users').insert({ username: body.username, password: body.password, name: body.name, phone: body.phone || '', role: 'customer', credit_limit: 0, is_credit_enabled: false });
    return Promise.resolve({ token: 'local-' + u.id, user: { id: u.id, name: u.name, role: 'customer', username: u.username } });
  }

  return Promise.reject(new Error('Unknown endpoint: ' + path));
}

// ddApi: tries real server first, falls back to local DB
function fdToObj(fd) {
  const o = {};
  fd.forEach((v, k) => { if (typeof v === 'string') o[k] = v; });
  return o;
}

function previewFile(input, imgId) {
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = document.getElementById(imgId);
    if (img) img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function fdToObjAsync(fd) {
  return new Promise(resolve => {
    const o = {};
    const promises = [];
    fd.forEach((v, k) => {
      if (typeof v === 'string') o[k] = v;
      else if (v instanceof File) {
        promises.push(new Promise(res => {
          const r = new FileReader();
          r.onload = () => {
            const img = new Image();
            img.onload = () => {
              const maxW = 400, maxH = 400;
              let w = img.width, h = img.height;
              if (w > maxW || h > maxH) {
                const ratio = Math.min(maxW / w, maxH / h);
                w = Math.round(w * ratio); h = Math.round(h * ratio);
              }
              const c = document.createElement('canvas');
              c.width = w; c.height = h;
              const ctx = c.getContext('2d');
              ctx.drawImage(img, 0, 0, w, h);
              o[k] = c.toDataURL('image/jpeg', 0.6);
              res();
            };
            img.onerror = () => { o[k] = r.result; res(); };
            img.src = r.result;
          };
          r.readAsDataURL(v);
        }));
      }
    });
    Promise.all(promises).then(() => resolve(o));
  });
}

function ddApi(path, opts = {}) {
  opts.headers = { ...opts.headers, 'Authorization': 'Bearer ' + ddToken };
  const isLocal = ddLocalMode || window.location.protocol === 'file:' || window.location.hostname.includes('github.io');
  if (isLocal && opts.body instanceof FormData) {
    return fdToObjAsync(opts.body).then(obj => ddLocalApi(opts.method || 'GET', path, obj));
  }
  if (isLocal) {
    const parseBody = (b) => { try { return JSON.parse(b); } catch(e) { return b || {}; } };
    return ddLocalApi(opts.method || 'GET', path, parseBody(opts.body));
  }
  if (!(opts.body instanceof FormData)) opts.headers['Content-Type'] = 'application/json';
  if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) opts.body = JSON.stringify(opts.body);
  return fetch(DD_API + '/api' + path, opts).then(r => r.json()).catch(() => {
    ddLocalMode = true;
    if (opts.body instanceof FormData) {
      return fdToObjAsync(opts.body).then(obj => ddLocalApi(opts.method || 'GET', path, obj));
    }
    const pb = (b) => { try { return JSON.parse(b); } catch(e) { return b || {}; } };
    return ddLocalApi(opts.method || 'GET', path, pb(opts.body));
  });
}

function adminToast(msg) {
  const t = document.getElementById('adminToast');
  if (t) { t.textContent = msg; t.style.display = 'block'; setTimeout(() => t.style.display = 'none', 2500); }
}

function adminModal(html) {
  document.getElementById('adminModal').innerHTML = html;
  document.getElementById('adminModal').style.display = 'block';
  document.getElementById('adminModalOverlay').style.display = 'block';
  document.getElementById('adminModalOverlay').onclick = () => { document.getElementById('adminModal').style.display = 'none'; document.getElementById('adminModalOverlay').style.display = 'none'; };
}

function closeAdminModal() {
  document.getElementById('adminModal').style.display = 'none';
  document.getElementById('adminModalOverlay').style.display = 'none';
}

// ─── Load products from API ───
function loadDDProducts() {
  ddApi('/products').then(apiProducts => {
    if (apiProducts && apiProducts.length > 0) {
      ddProductsCache = apiProducts;
      const productsGrid = document.getElementById('productsGrid');
      if (productsGrid) {
        productsGrid.innerHTML = apiProducts.map(p => {
          // Strip /uploads/ paths in local mode
      const pImg = (ddLocalMode || window.location.protocol === 'file:' || window.location.hostname.includes('github.io')) && p.image_bottle && p.image_bottle.startsWith('/uploads/') ? null : p.image_bottle;
       const imgSrc = pImg || '';
          const g = p.gender || 'men';
          const catMap = { men: 'رجالي', women: 'نسائي' };
          const catText = catMap[g] || catMap[g === 'unisex' ? 'men' : g] || 'رجالي';
          return `
            <div class="product-card" data-category="${g}" data-bestselling="${p.is_bestselling ? 1 : 0}" data-id="${p.id}">
              <div class="product-img-wrap">
                ${imgSrc ? `<img src="${imgSrc}" alt="${p.name}" class="product-img" loading="lazy"/>` : `<div style="width:100%;height:200px;background:#1a1510;display:flex;align-items:center;justify-content:center;color:#c9a84c;font-size:3rem;">🧴</div>`}
                <div class="product-overlay">
                  <button class="quick-view-btn" data-id="${p.id}">عرض سريع</button>
                </div>
              </div>
              <div class="product-info">
                <div class="product-category">${catText}</div>
                <h3 class="product-name">${p.name}</h3>
                ${p.name_en ? `<div class="product-name-en">${p.name_en}</div>` : ''}
                ${parseFloat(p.price_50) ? `<div class="product-price">${parseFloat(p.price_50).toLocaleString()} جنيه</div>` : ''}
              </div>
            </div>`;
        }).join('');
        // Add-to-cart defaults to 50ml
        document.querySelectorAll('.btn-add-cart').forEach(btn => {
          btn.addEventListener('click', () => addToCart(parseInt(btn.dataset.id), parseInt(btn.dataset.size)));
        });
        document.querySelectorAll('.quick-view-btn').forEach(btn => {
          btn.addEventListener('click', () => openModal(parseInt(btn.dataset.id)));
        });
      }
    }
  });
}

// ─── Checkout via API ───
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (cart.length === 0) { showToast('⚠️ العربة فارغة'); return; }
    if (!ddToken) { showToast('⚠️ يرجى تسجيل الدخول أولاً'); openDDLogin(); return; }
    const items = cart.map(item => ({ product_id: item.pid || item.id, size_ml: item.size || 50, qty: item.qty }));
    const result = await ddApi('/orders', { method: 'POST', body: { items, payment_type: 'cash' } });
    if (result.error) { showToast('❌ ' + result.error); return; }
    cart = []; localStorage.removeItem('atourCart'); renderCart();
    showToast('✅ تم الطلب! رقم: ' + result.order?.order_no);
    // Notify admin on WhatsApp
    if (result.order) {
      const itemsSummary = result.items_summary || items.map(i => {
        const prod = ddProductsCache.find(p => p.id === i.product_id);
        const price = {30: prod?.price_30, 50: prod?.price_50, 100: prod?.price_100}[i.size_ml] || prod?.price || 0;
        return `${i.qty} عبوة ${i.size_ml} مللي - ${prod?.oil_name || 'منتج'} ${(price * i.qty).toLocaleString()} جم`;
      }).join('\n');
      const totalAmt = result.order.total || items.reduce((s, i) => {
        const prod = ddProductsCache.find(p => p.id === i.product_id);
        const price = {30: prod?.price_30, 50: prod?.price_50, 100: prod?.price_100}[i.size_ml] || prod?.price || 0;
        return s + price * i.qty;
      }, 0);
      window.notifyAdminOrder(result.order.order_no, ddUser.name, itemsSummary, totalAmt, 'cash', ddUser.phone || '');
    }
    setTimeout(closeCart, 1500);
  });
}

// ─── Login / Register ───
window.openDDLogin = function() {
  const existing = document.getElementById('ddLoginModal');
  if (existing) existing.remove();
  const div = document.createElement('div'); div.id = 'ddLoginModal';
  div.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;';
  div.innerHTML = `
    <div style="background:#1a1510;border:1px solid #2a2218;border-radius:16px;padding:32px;width:360px;max-width:90vw;text-align:center;">
      <h3 style="color:#c9a84c;margin-bottom:8px;">🔐 تسجيل الدخول</h3>
      <p style="color:#998e7a;font-size:0.85rem;margin-bottom:20px;">سجل دخولك للمتجر أو لوحة التحكم</p>
    <input id="ddLoginUser" placeholder="رقم الهاتف" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;margin-bottom:10px;font-family:inherit;">
    <input id="ddLoginPass" type="password" placeholder="كلمة المرور" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;margin-bottom:16px;font-family:inherit;">
    <button onclick="ddLogin()" style="width:100%;padding:12px;background:#c9a84c;border:none;border-radius:8px;color:#0a0806;font-weight:700;cursor:pointer;font-family:inherit;">تسجيل الدخول</button>
    <p id="ddLoginError" style="color:#dc3545;margin-top:10px;font-size:0.85rem;"></p>
    <div style="display:flex;justify-content:space-between;margin-top:10px;">
      <a href="#" onclick="openDDRegister();return false;" style="color:#c9a84c;font-size:0.8rem;">إنشاء حساب</a>
      <a href="#" onclick="ddForgotPass();return false;" style="color:#998e7a;font-size:0.8rem;">نسيت كلمة المرور؟</a>
    </div>
      <button onclick="this.closest('#ddLoginModal').remove()" style="margin-top:8px;background:none;border:none;color:#998e7a;cursor:pointer;font-family:inherit;">✕ إلغاء</button>
    </div>`;
  document.body.appendChild(div);
}

window.ddLogin = async function() {
  const phone = document.getElementById('ddLoginUser').value;
  const password = document.getElementById('ddLoginPass').value;
  const result = await ddApi('/auth/login', { method: 'POST', body: { username: phone, password } });
  if (result.error) { document.getElementById('ddLoginError').textContent = result.error; return; }
  ddToken = result.token; ddUser = result.user;
  localStorage.setItem('dd_token', ddToken); localStorage.setItem('dd_user', JSON.stringify(ddUser));
  document.getElementById('ddLoginModal').remove();
  showToast('✅ مرحباً ' + result.user.name);
  updateDDAuthUI();
  if (ddUser.role === 'admin') { const ap = document.getElementById('adminPanel'); if (ap) { ap.style.display = 'block'; adminShow('dashboard'); ap.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }
};

window.openDDRegister = function() {
  const modal = document.getElementById('ddLoginModal');
  if (modal) modal.querySelector('div').innerHTML = `
    <h3 style="color:#c9a84c;margin-bottom:8px;">📝 إنشاء حساب جديد</h3>
    <p style="color:#998e7a;font-size:0.85rem;margin-bottom:20px;">أنشئ حسابك لتتمكن من الشراء</p>
    <input id="ddRegName" placeholder="الاسم كاملاً" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;margin-bottom:10px;font-family:inherit;">
    <input id="ddRegPhone" placeholder="رقم الهاتف (للدخول)" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;margin-bottom:10px;font-family:inherit;">
    <input id="ddRegPass" type="password" placeholder="كلمة المرور" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;margin-bottom:16px;font-family:inherit;">
    <button onclick="ddRegister()" style="width:100%;padding:12px;background:#c9a84c;border:none;border-radius:8px;color:#0a0806;font-weight:700;cursor:pointer;font-family:inherit;">إنشاء حساب</button>
    <p id="ddRegError" style="color:#dc3545;margin-top:10px;font-size:0.85rem;"></p>
    <p style="margin-top:12px;font-size:0.8rem;color:#998e7a;">لديك حساب بالفعل؟ <a href="#" onclick="openDDLogin();return false;" style="color:#c9a84c;">تسجيل دخول</a></p>
  `;
}

window.ddRegister = async function() {
  const data = { name: document.getElementById('ddRegName').value, phone: document.getElementById('ddRegPhone').value, password: document.getElementById('ddRegPass').value, username: document.getElementById('ddRegPhone').value };
  if (!data.name || !data.phone || !data.password) { document.getElementById('ddRegError').textContent = '⚠️ يرجى ملء جميع الحقول'; return; }
  const result = await ddApi('/auth/register', { method: 'POST', body: data });
  if (result.error) { document.getElementById('ddRegError').textContent = result.error; return; }
  ddToken = result.token; ddUser = result.user;
  localStorage.setItem('dd_token', ddToken); localStorage.setItem('dd_user', JSON.stringify(ddUser));
  document.getElementById('ddLoginModal').remove();
  showToast('✅ تم إنشاء الحساب! مرحباً ' + result.user.name);
  updateDDAuthUI();
  // Welcome WhatsApp
  const phone = data.phone.replace(/^0/, '+2');
  const msg = `🖤 *DIAMOND DUST* 🖤\n\nمرحباً ${data.name}،\nشكراً لاختيارك DIAMOND DUST.\nحسابك جاهز! يمكنك الآن تصفح المنتجات وتسوق عطرك المفضل.\n\nنتمنى لك تجربة تسوق رائعة ✨`;
  window.open('https://wa.me/' + encodeURIComponent(phone) + '?text=' + encodeURIComponent(msg), '_blank');
};

window.ddForgotPass = async function() {
  const phone = document.getElementById('ddLoginUser')?.value;
  if (!phone) { showToast('⚠️ أدخل رقم الهاتف أولاً'); return; }
  const users = await ddApi('/users', { method: 'GET' });
  const user = (users || []).find(u => u.username === phone || u.phone === phone);
  if (!user) { showToast('⚠️ لا يوجد حساب بهذا الرقم'); return; }
  const msg = `🖤 *DIAMOND DUST* 🖤\n\nمرحباً ${user.name}،\nكلمة المرور الخاصة بك هي:\n\`${user.password}\`\n\nيمكنك تغيير كلمة المرور من لوحة تحكم العميل بعد تسجيل الدخول.`;
  window.open('https://wa.me/' + encodeURIComponent(phone.replace(/^0/, '+2')) + '?text=' + encodeURIComponent(msg), '_blank');
  showToast('✅ تم إرسال كلمة المرور إلى واتساب');
};

function updateDDAuthUI() {
  const btn = document.getElementById('ddAuthBtn');
  if (!btn) return;
  if (ddToken && ddUser) {
    btn.textContent = '👤 ' + (ddUser.name || ddUser.username);
    btn.onclick = () => { if (confirm('تسجيل الخروج؟')) { ddToken = ''; ddUser = {}; localStorage.removeItem('dd_token'); localStorage.removeItem('dd_user'); updateDDAuthUI(); document.getElementById('adminPanel').style.display = 'none'; showToast('تم تسجيل الخروج'); } };
  } else {
    btn.textContent = '🔐 دخول';
    btn.onclick = openDDLogin;
  }
}

// ─── Quick view modal with API ───
window.openModal = function(id) {
  ddApi('/products/' + id).then(p => {
    if (p && !p.error) {
      const mc = document.getElementById('modalContent');
      if (!mc) return;
      const g = p.gender || 'men';
       const catMap = { men: 'رجالي', women: 'نسائي' };
       const catText = catMap[g] || catMap[g === 'unisex' ? 'men' : g] || 'رجالي';
       const getP = (s) => parseFloat({30: p.price_30, 50: p.price_50, 100: p.price_100}[s]) || parseFloat(p.price) || 0;
      const pImg = (ddLocalMode || window.location.protocol === 'file:' || window.location.hostname.includes('github.io')) && p.image_bottle && p.image_bottle.startsWith('/uploads/') ? null : p.image_bottle;
       const imgSrc = pImg || p.img || '';
        const noteImg = (ddLocalMode || window.location.protocol === 'file:' || window.location.hostname.includes('github.io')) && p.image_note && p.image_note.startsWith('/uploads/') ? null : p.image_note;
        const mainImg = imgSrc || noteImg;
       mc.innerHTML = (mainImg ? `<img src="${mainImg}" alt="${p.name}" class="modal-img" />` : `<div style="width:100%;height:300px;background:#1a1510;display:flex;align-items:center;justify-content:center;color:#c9a84c;font-size:5rem;">🧴</div>`) + `
          <div class="modal-details">
           <div class="product-category">${catText}</div>
           <h3 class="product-name">${p.name}</h3>
           <p class="product-desc">${p.oil_name || ''}</p>
           <div class="modal-price"><span class="price-current" id="mprice-${p.id}">${getP(50) ? getP(50).toLocaleString() + ' جنيه' : 'سيتم تحديد السعر'}</span></div>
           <div style="display:flex;gap:6px;margin:12px 0;">
             ${[30,50,100].map(s => `<button class="modal-size-btn" data-size="${s}" data-price="${getP(s)}" style="padding:6px 16px;border:1px solid ${s===50?'#c9a84c':'#2a2218'};border-radius:6px;background:#0a0806;color:#e8e0d0;cursor:pointer;font-family:inherit;">${s} مل<br><span style="font-size:0.7rem;color:#c9a84c;">${getP(s) ? getP(s).toLocaleString()+' ج' : ''}</span></button>`).join('')}
           </div>
           <button class="btn-primary modal-add-cart" data-id="${p.id}" data-size="50">أضف إلى العربة 🛒</button>
         </div>`;
      mc.querySelectorAll('.modal-size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          mc.querySelectorAll('.modal-size-btn').forEach(b => b.style.borderColor = '#2a2218');
          btn.style.borderColor = '#c9a84c';
          mc.querySelector('.modal-add-cart').dataset.size = btn.dataset.size;
          const mPrice = document.getElementById('mprice-' + p.id);
          if (mPrice) {
            const pr = parseFloat(btn.dataset.price) || 0;
            mPrice.textContent = pr ? pr.toLocaleString() + ' جنيه' : 'سيتم تحديد السعر';
          }
        });
      });
      mc.querySelector('.modal-add-cart')?.addEventListener('click', (e) => addToCart(parseInt(e.currentTarget.dataset.id), parseInt(e.currentTarget.dataset.size)));
      document.getElementById('modalOverlay')?.classList.add('open');
      document.getElementById('productModal')?.classList.add('open');
      document.body.style.overflow = 'hidden';
    } else showToast('⚠️ المنتج غير متوفر');
  });
};

// ════════════════════════════════════════════════════════════════
// ADMIN PANEL
// ════════════════════════════════════════════════════════════════

window.adminShow = function(page) {
  const panel = document.getElementById('adminPanel');
  if (!panel) return;
  panel.style.display = 'block';
  const c = document.getElementById('adminContent');
  const titles = { dashboard: '📊 لوحة التحكم', inventory: '🧪 المخزون', products: '🧴 المنتجات', customers: '👥 العملاء', orders: '📦 طلبات العملاء', purchases: '📋 إذون إضافة المخازن', sales: '📈 المبيعات', settings: '⚙️ الإعدادات' };
  document.getElementById('adminTitle').textContent = titles[page] || 'لوحة التحكم';
  c.innerHTML = '<div style="text-align:center;padding:40px;color:#998e7a;">⏳ جاري التحميل...</div>';
  const loaders = { dashboard: loadAdminDashboard, inventory: loadAdminInventory, products: loadAdminProducts, customers: loadAdminCustomers, orders: loadAdminOrders, purchases: loadAdminAdditions, sales: loadAdminSales, settings: loadAdminSettings };
  if (loaders[page]) loaders[page]();
};

window.adminLogout = function() {
  ddToken = ''; ddUser = {}; localStorage.removeItem('dd_token'); localStorage.removeItem('dd_user');
  document.getElementById('adminPanel').style.display = 'none';
  updateDDAuthUI(); showToast('تم تسجيل الخروج');
};

// ── Admin: Dashboard ──
function loadAdminDashboard() {
  ddApi('/admin/dashboard').then(d => {
    document.getElementById('adminContent').innerHTML = `
      <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
        <button class="btn-gold" onclick="adminExportData()">📤 تصدير البيانات</button>
        <button class="btn-gold" onclick="document.getElementById('importFileInputDashboard').click()" style="background:#4ecdc4;color:#1a1200;">📥 استيراد بيانات</button>
        <input type="file" id="importFileInputDashboard" accept=".json" style="display:none" onchange="adminImportData(this)">
      </div>
      <div class="admin-stats">
        <div class="admin-stat"><div class="num">${d.totalOrders}</div><div class="label">إجمالي الطلبات</div><div class="sub">اليوم: ${d.todayOrders}</div></div>
        <div class="admin-stat"><div class="num">${d.totalRevenue.toLocaleString()}</div><div class="label">إجمالي الإيرادات</div><div class="sub">اليوم: ${d.todayRevenue.toLocaleString()}</div></div>
        <div class="admin-stat"><div class="num">${(d.inventoryCost||0).toLocaleString()}</div><div class="label">تكلفة المخزون</div></div>
        <div class="admin-stat"><div class="num">${d.totalCustomers}</div><div class="label">العملاء</div></div>
        <div class="admin-stat"><div class="num">${d.totalOils}</div><div class="label">الزيوت</div><div class="sub">منخفض: ${d.lowStockOils}</div></div>
        <div class="admin-stat"><div class="num">${d.pendingOrders}</div><div class="label">طلبات معلقة</div></div>
      </div>
      <div class="admin-card"><h3>🕐 آخر الطلبات</h3>
        ${d.recentOrders?.length ? '<table class="admin-table"><tr><th>الفاتورة</th><th>العميل</th><th>الإجمالي</th><th>النوع</th><th>التاريخ</th></tr>' + d.recentOrders.map(o => `<tr><td>${o.order_no}</td><td>${o.customer_name || '-'}</td><td>${o.total}</td><td><span class="badge ${o.payment_type === 'credit' ? 'badge-warning' : 'badge-success'}">${o.payment_type === 'credit' ? 'آجل' : 'نقدي'}</span></td><td>${new Date(o.created_at).toLocaleString('ar-EG')}</td></tr>`).join('') + '</table>' : '<div class="admin-empty">لا توجد طلبات</div>'}
      </div>`;
  });
}

// ── Admin: Inventory ──
function loadAdminInventory() {
  const c = document.getElementById('adminContent');
  c.innerHTML = `<div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
    <button class="btn-gold" onclick="adminAddOil()">➕ إضافة زيت</button>
    <button class="btn-gold" onclick="adminAddMaterial()">➕ إضافة مادة خام</button>
  </div><div class="admin-card"><h3>🛢️ الزيوت العطرية</h3><div id="adminOils"></div></div>
  <div class="admin-card"><h3>📦 المواد الخام</h3><div id="adminMats"></div></div>`;
  ddApi('/inventory/oils').then(oils => {
    document.getElementById('adminOils').innerHTML = oils.length ? '<table class="admin-table"><tr><th>الاسم</th><th>الشركة</th><th>التاجر</th><th>متوسط السعر</th><th>إجمالي التكلفة</th><th>نسبة التشغيل</th><th>المخزون</th><th>إجراءات</th></tr>' + oils.map(o => {
      var avgPrice = o.stock_ml ? ((o.purchase_price||0) / o.stock_ml).toFixed(2) : '0';
      var totalPrice = (o.purchase_price||0).toLocaleString();
      return '<tr><td>' + o.name + '</td><td>' + (o.company || '-') + '</td><td>' + (o.supplier || '-') + '</td><td style="color:#c9a84c;">' + avgPrice + ' جم/مل</td><td>' + totalPrice + ' جم</td><td>' + o.concentration + '%</td><td><span class="badge ' + ((o.stock_ml||0) < 100 ? 'badge-danger' : 'badge-success') + '">' + (o.stock_ml||0) + ' ml</span></td><td><button class="btn-gold btn-sm" onclick="adminEditOil(' + o.id + ')">✏️</button> <button class="btn-gold btn-sm" onclick="adminDeleteOil(' + o.id + ')" style="background:#dc3545;color:white;">🗑️</button></td></tr>';
    }).join('') + '</table>' : '<div class="admin-empty">لا توجد زيوت</div>';
  });
  ddApi('/inventory/materials').then(mats => {
    document.getElementById('adminMats').innerHTML = mats.length ? '<table class="admin-table"><tr><th>النوع</th><th>الاسم</th><th>الشركة</th><th>التاجر</th><th>متوسط السعر</th><th>إجمالي التكلفة</th><th>الحجم</th><th>المخزون</th><th>إجراءات</th></tr>' + mats.map(m => {
      var isAlc = m.type === 'alcohol' || m.type === 'كحول';
      var stk = parseFloat(m.stock) || 1;
      var tot = parseFloat(m.purchase_price) || 0;
      var avgPrice = isAlc ? (tot / stk).toFixed(4) : (tot / stk).toFixed(2);
      var unitLabel = isAlc ? 'مل' : 'قطعة';
      return `<tr><td><span class="badge badge-gold">${getMatTypeDisplay(m.type)}</span></td><td>${m.name}</td><td>${m.company || '-'}</td><td>${m.supplier || '-'}</td><td style="color:#c9a84c;">${avgPrice} /${unitLabel}</td><td>${tot.toLocaleString()} جم</td><td>${m.size || '-'}</td><td>${m.stock} ${m.unit}</td><td><button class="btn-gold btn-sm" onclick="adminEditMaterial(${m.id})">✏️</button> <button class="btn-gold btn-sm" onclick="adminDeleteMaterial(${m.id})" style="background:#dc3545;color:white;">🗑️</button></td></tr>`;
    }).join('') + '</table>' : '<div class="admin-empty">لا توجد مواد</div>';
  });
}

// ─── Helper: get unique companies & suppliers ───
function getOilSuggestions() {
  var hiddenCompanies = JSON.parse(localStorage.getItem('dd_hidden_companies') || '[]');
  var hiddenSuppliers = JSON.parse(localStorage.getItem('dd_hidden_suppliers') || '[]');
  return ddApi('/inventory/oils').then(oils => {
    return {
      companies: [...new Set(oils.map(o => o.company).filter(Boolean))].filter(c => !hiddenCompanies.includes(c)),
      suppliers: [...new Set(oils.map(o => o.supplier).filter(Boolean))].filter(s => !hiddenSuppliers.includes(s))
    };
  });
}
// ─── Helper: custom suggestion dropdown with inline ✕ delete ───
function showSuggestionDropdown(inputId, suggestId, type) {
  var dropdown = document.getElementById(suggestId);
  if (!dropdown) return;
  getOilSuggestions().then(function(sugg) {
    var items = type === 'company' ? sugg.companies : sugg.suppliers;
    dropdown.innerHTML = items.map(function(item) {
      var safe = item.replace(/'/g, "\\'");
      return '<div style="display:flex;align-items:center;padding:5px 10px;cursor:default;border-bottom:1px solid #1a1410;white-space:nowrap;font-size:0.75rem;" ' +
        'onmousedown="event.preventDefault();document.getElementById(\'' + inputId + '\').value=\'' + safe + '\';hideSuggestionDropdown(\'' + suggestId + '\')">' +
        '<span style="flex:1;color:#e8e0d0;cursor:pointer;">' + item + '</span>' +
        '<span style="cursor:pointer;color:#dc3545;font-size:0.75rem;padding:2px 6px;" ' +
        'onmousedown="event.stopPropagation();event.preventDefault();removeSuggestion(\'' + type + '\',\'' + safe + '\',\'' + suggestId + '\',\'' + inputId + '\')">✕</span></div>';
    }).join('');
    dropdown.style.display = 'block';
  });
}

// ─── Helper: material type suggestion dropdown (like supplier) ───
function getMatTypeSuggestions() {
  var hiddenTypes = JSON.parse(localStorage.getItem('dd_hidden_mat_types') || '[]');
  return ddApi('/inventory/materials').then(function(mats) {
    var set = {};
    // Default common types
    ['زجاج','استيكر','كحول','تعتيق','ألومنيوم','زجاجة'].forEach(function(t) { set[t] = 1; });
    // Plus existing types from DB
    mats.forEach(function(m) { if (m.type) set[m.type] = 1; });
    return Object.keys(set).filter(function(t) { return !hiddenTypes.includes(t); }).sort();
  });
}
function showMatTypeDropdown(inputId, suggestId) {
  var dropdown = document.getElementById(suggestId);
  if (!dropdown) return;
  getMatTypeSuggestions().then(function(items) {
    dropdown.innerHTML = items.map(function(item) {
      var safe = item.replace(/'/g, "\\'");
      return '<div style="display:flex;align-items:center;padding:5px 10px;cursor:default;border-bottom:1px solid #1a1410;white-space:nowrap;font-size:0.75rem;" ' +
        'onmousedown="event.preventDefault();document.getElementById(\'' + inputId + '\').value=\'' + safe + '\';document.getElementById(\'' + inputId + '\').oninput();hideSuggestionDropdown(\'' + suggestId + '\')">' +
        '<span style="flex:1;color:#e8e0d0;cursor:pointer;">' + item + '</span>' +
        '<span style="cursor:pointer;color:#dc3545;font-size:0.75rem;padding:2px 6px;" ' +
        'onmousedown="event.stopPropagation();event.preventDefault();removeMatType(\'' + safe + '\',\'' + suggestId + '\',\'' + inputId + '\')">✕</span></div>';
    }).join('');
    dropdown.style.display = 'block';
  });
}
function removeMatType(value, suggestId, inputId) {
  var list = JSON.parse(localStorage.getItem('dd_hidden_mat_types') || '[]');
  if (!list.includes(value)) list.push(value);
  localStorage.setItem('dd_hidden_mat_types', JSON.stringify(list));
  showMatTypeDropdown(inputId, suggestId);
}
function hideSuggestionDropdown(suggestId) {
  var d = document.getElementById(suggestId);
  if (d) d.style.display = 'none';
}
function removeSuggestion(type, value, suggestId, inputId) {
  var key = type === 'company' ? 'dd_hidden_companies' : 'dd_hidden_suppliers';
  var list = JSON.parse(localStorage.getItem(key) || '[]');
  if (!list.includes(value)) list.push(value);
  localStorage.setItem(key, JSON.stringify(list));
  showManagePopup(inputId, suggestId, type);
}
function showManagePopup(inputId, suggestId, type) {
  var d = document.getElementById(suggestId);
  if (!d) return;
  getOilSuggestions().then(function(sugg) {
    var items = type === 'company' ? sugg.companies : sugg.suppliers;
    if (!items.length) { d.style.display = 'none'; return; }
    d.innerHTML = items.map(function(item) {
      var safe = item.replace(/'/g, "\\'");
      return '<div style="display:flex;align-items:center;padding:5px 10px;cursor:default;border-bottom:1px solid #1a1410;white-space:nowrap;font-size:0.75rem;">' +
        '<span style="flex:1;color:#e8e0d0;">' + item + '</span>' +
        '<span style="cursor:pointer;color:#dc3545;font-size:0.75rem;padding:2px 6px;" ' +
        'onmousedown="event.stopPropagation();event.preventDefault();removeSuggestion(\'' + type + '\',\'' + safe + '\',\'' + suggestId + '\',\'' + inputId + '\')">\u2715</span></div>';
    }).join('');
    d.style.display = 'block';
  });
}

// ─── Helper: dropdown field with suggestion popup ───
function dropdownField(label, id, value, type) {
  var suggestId = id + '-suggest';
  return '<div style="display:flex;align-items:flex-start;gap:6px;"><div class="admin-form-group" style="flex:1;margin:0;position:relative;"><label>' + label +
    ' <span onclick="showManagePopup(\'' + id + '\',\'' + suggestId + '\',\'' + type + '\')" style="cursor:pointer;color:#dc3545;font-size:0.75rem;margin-right:4px;" title="حذف اسم من القائمة">\u2715</span></label>' +
    '<input type="text" id="' + id + '" value="' + (value || '') + '" autocomplete="off" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;font-size:0.75rem;" ' +
    'onfocus="showSuggestionDropdown(\'' + id + '\',\'' + suggestId + '\',\'' + type + '\')" onblur="hideSuggestionDropdown(\'' + suggestId + '\')">' +
    '<div id="' + suggestId + '" style="display:none;position:absolute;top:100%;left:0;right:0;z-index:100;background:#0a0806;border:1px solid #2a2218;border-top:none;border-radius:0 0 8px 8px;max-height:180px;overflow-y:auto;"></div></div>' +
    '<button type="button" onmousedown="event.preventDefault()" onclick="showSuggestionDropdown(\'' + id + '\',\'' + suggestId + '\',\'' + type + '\')" style="background:none;border:1px solid #2a2218;color:#c9a84c;border-radius:6px 0 0 6px;cursor:pointer;padding:6px 10px;font-size:0.85rem;margin-top:16px;" title="القائمة">\u25BC</button>' +
    '<button type="button" onmousedown="event.preventDefault()" onclick="document.getElementById(\'' + id + '\').value=\'\'" style="background:none;border:1px solid #333;color:#666;border-radius:0 6px 6px 0;cursor:pointer;padding:6px 10px;font-size:0.85rem;margin-top:16px;border-left:none;" title="مسح الخانة">\u2715</button></div>';
}

window.adminAddOil = function() {
  adminModal('<button onclick="closeAdminModal()" style="float:left;cursor:pointer;color:#998e7a;font-size:1.2rem;background:none;border:none;">\u2715</button>' +
      '<h2 style="color:#c9a84c;margin-bottom:16px;">➕ إضافة زيت عطري</h2>' +
      '<form id="adminOilForm">' +
        '<div class="admin-form-group"><label>الاسم (عربي) *</label><input type="text" id="aoName" required style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>' +
        '<div class="admin-form-group"><label>الاسم (English)</label><input type="text" id="aoNameEn" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
          dropdownField('الشركة', 'aoCompany', '', 'company') +
          dropdownField('التاجر', 'aoSupplier', '', 'supplier') +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
          '<div class="admin-form-group"><label>سعر المللى</label><input type="number" id="aoPricePerMl" step="any" value="0" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>' +
          '<div class="admin-form-group"><label>الكمية (مل)</label><input type="number" id="aoQtyMl" value="0" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
          '<div class="admin-form-group"><label>نسبة التشغيل (%) *</label><input type="number" id="aoConc" step="0.1" value="" required style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>' +
          '<div class="admin-form-group"><label>التصنيف *</label><select id="aoGender" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"><option value="men">رجالي</option><option value="women">نسائي</option></select></div>' +
        '</div>' +
        '<div class="admin-form-group"><label>صورة الزجاجة (للمتجر)</label>' +
          '<input type="file" id="aoImgBottle" accept="image/*" onchange="previewFile(this,\'aoPreviewBottle\')" style="width:100%;padding:8px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;">' +
          '<img id="aoPreviewBottle" src="images/product1.png" style="max-width:80px;height:auto;margin-top:6px;border-radius:6px;display:block;">' +
        '</div>' +
        '<div class="admin-form-group"><label>صورة النوتات</label>' +
          '<input type="file" id="aoImgNote" accept="image/*" onchange="previewFile(this,\'aoPreviewNote\')" style="width:100%;padding:8px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;">' +
          '<img id="aoPreviewNote" src="images/product1.png" style="max-width:80px;height:auto;margin-top:6px;border-radius:6px;display:block;">' +
        '</div>' +
        '<button type="submit" class="btn-gold" style="margin-top:8px;">💾 حفظ</button>' +
      '</form>');
    document.getElementById('adminOilForm').onsubmit = e => {
      e.preventDefault();
      const pricePerMl = parseFloat(document.getElementById('aoPricePerMl').value) || 0;
      const qtyMl = parseFloat(document.getElementById('aoQtyMl').value) || 0;
      const bFile = document.getElementById('aoImgBottle').files[0];
      const nFile = document.getElementById('aoImgNote').files[0];
      const hasFiles = bFile || nFile;
      const data = {
        name: document.getElementById('aoName').value,
        name_en: document.getElementById('aoNameEn').value,
        company: document.getElementById('aoCompany').value,
        supplier: document.getElementById('aoSupplier').value,
        gender: document.getElementById('aoGender').value,
        purchase_price: String(pricePerMl * qtyMl),
        concentration: document.getElementById('aoConc').value,
        stock_ml: String(qtyMl)
      };
      const body = hasFiles ? new FormData() : { ...data, image_bottle: null, image_note: null };
      if (hasFiles) {
        Object.entries(data).forEach(([k,v]) => body.append(k, v));
        if (bFile) body.append('image_bottle', bFile);
        if (nFile) body.append('image_note', nFile);
      }
      ddApi('/inventory/oils', { method: 'POST', body }).then(data => { if (data.error) { adminToast('❌ ' + data.error); return; } adminToast('✅ ' + data.message); closeAdminModal(); adminShow('inventory'); loadDDProducts(); });
    };
};

window.adminEditOil = function(id) {
  Promise.all([ddApi('/inventory/oils/' + id), ddApi('/products')]).then(([o, prods]) => {
    const prod = prods.find(p => p.oil_id === id) || {};
    const isLocal = ddLocalMode || window.location.protocol === 'file:' || window.location.hostname.includes('github.io');
    const curBottle = o.image_bottle ? (o.image_bottle.startsWith('/uploads/') ? (isLocal ? null : o.image_bottle) : o.image_bottle) : null;
    const curNote = o.image_note ? (o.image_note.startsWith('/uploads/') ? (isLocal ? null : o.image_note) : o.image_note) : null;
    adminModal(`<button onclick="closeAdminModal()" style="float:left;cursor:pointer;color:#998e7a;font-size:1.2rem;background:none;border:none;">✕</button>
      <h2 style="color:#c9a84c;margin-bottom:16px;">✏️ تعديل الزيت: ${o.name}</h2>
      <form id="adminOilEditForm">
        <div class="admin-form-group"><label>الاسم (عربي) *</label><input type="text" id="eaoName" value="${o.name}" required style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>
        <div class="admin-form-group"><label>الاسم (English)</label><input type="text" id="eaoNameEn" value="${o.name_en || ''}" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          ${dropdownField('الشركة', 'eaoCompany', o.company || '', 'company')}
          ${dropdownField('التاجر', 'eaoSupplier', o.supplier || '', 'supplier')}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="admin-form-group"><label>سعر المللى</label><input type="number" id="eaoPricePerMl" step="any" value="${o.stock_ml ? ((o.purchase_price||0)/(o.stock_ml||1)).toFixed(2) : 0}" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>
          <div class="admin-form-group"><label>الكمية (مل)</label><input type="number" id="eaoQtyMl" value="${o.stock_ml||0}" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="admin-form-group"><label>نسبة التشغيل (%)</label><input type="number" id="eaoConc" step="0.1" value="${o.concentration ?? ''}" required style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>
          <div class="admin-form-group"><label>التصنيف</label><select id="eaoGender" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"><option value="men" ${o.gender === 'men' || o.gender === 'unisex' ? 'selected' : ''}>رجالي</option><option value="women" ${o.gender === 'women' ? 'selected' : ''}>نسائي</option></select></div>
        </div>
        <div class="admin-form-group">
          <label>صورة الزجاجة (للمتجر)</label>
          <input type="file" id="eaoImgBottle" accept="image/*" onchange="previewFile(this,'eaoPreviewBottle')" style="width:100%;padding:8px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;">
          <img id="eaoPreviewBottle" src="${curBottle || 'images/product1.png'}" style="max-width:80px;height:auto;margin-top:6px;border-radius:6px;display:block;">
        </div>
        <div class="admin-form-group">
          <label>صورة النوتات</label>
          <input type="file" id="eaoImgNote" accept="image/*" onchange="previewFile(this,'eaoPreviewNote')" style="width:100%;padding:8px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;">
          <img id="eaoPreviewNote" src="${curNote || 'images/product1.png'}" style="max-width:80px;height:auto;margin-top:6px;border-radius:6px;display:block;">
        </div>
        <button type="submit" class="btn-gold" style="margin-top:8px;">💾 حفظ التعديلات</button>
      </form>`);
    document.getElementById('adminOilEditForm').addEventListener('submit', async e => {
      e.preventDefault();
      try {
      const pricePerMl = parseFloat(document.getElementById('eaoPricePerMl').value) || 0;
      const qtyMl = parseFloat(document.getElementById('eaoQtyMl').value) || 0;
      const bFile = document.getElementById('eaoImgBottle').files[0];
      const nFile = document.getElementById('eaoImgNote').files[0];
      const hasFiles = bFile || nFile;
      const data = {
        name: document.getElementById('eaoName').value,
        name_en: document.getElementById('eaoNameEn').value,
        company: document.getElementById('eaoCompany').value,
        supplier: document.getElementById('eaoSupplier').value,
        gender: document.getElementById('eaoGender').value,
        purchase_price: String(pricePerMl * qtyMl),
        concentration: document.getElementById('eaoConc').value,
        stock_ml: String(qtyMl)
      };
      const body = hasFiles ? new FormData() : data;
      if (hasFiles) {
        Object.entries(data).forEach(([k,v]) => body.append(k, v));
        if (bFile) body.append('image_bottle', bFile);
        if (nFile) body.append('image_note', nFile);
      }
      const result = await ddApi('/inventory/oils/' + id, { method: 'PUT', body });
      if (result.error) { adminToast('❌ ' + result.error); return; }
      adminToast('✅ تم التحديث'); closeAdminModal(); adminShow('inventory'); loadDDProducts();
      } catch(err) { adminToast('❌ حدث خطأ: ' + err.message); }
    });
  });
};

window.adminDeleteOil = function(id) {
  if (!confirm('⚠️ تأكيد حذف الزيت والمنتج المرتبط به؟')) return;
  ddApi('/inventory/oils/' + id, { method: 'DELETE' }).then(d => { adminToast('✅ ' + d.message); adminShow('inventory'); loadDDProducts(); });
};

window.adminAddMaterial = function() {
  var suggestId = 'amType-suggest';
  adminModal('<button onclick="closeAdminModal()" style="float:left;cursor:pointer;color:#998e7a;font-size:1.2rem;background:none;border:none;">\u2715</button>' +
    '<h2 style="color:#c9a84c;margin-bottom:16px;">➕ إضافة مادة خام</h2>' +
    '<form id="adminMatForm">' +
      '<div class="admin-form-group" style="position:relative;"><label>النوع</label>' +
        '<input type="text" id="amType" autocomplete="off" placeholder="اختر أو اكتب نوع جديد" oninput="updateMatFields()" onfocus="showMatTypeDropdown(\'amType\',\'' + suggestId + '\')" onblur="hideSuggestionDropdown(\'' + suggestId + '\')" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;">' +
        '<div id="' + suggestId + '" style="display:none;position:absolute;top:100%;left:0;right:0;z-index:100;background:#0a0806;border:1px solid #2a2218;border-top:none;border-radius:0 0 8px 8px;max-height:180px;overflow-y:auto;"></div>' +
        '<button type="button" onmousedown="event.preventDefault()" onclick="showMatTypeDropdown(\'amType\',\'' + suggestId + '\')" style="position:absolute;left:0;top:22px;background:none;border:1px solid #2a2218;color:#c9a84c;border-radius:0 6px 6px 0;cursor:pointer;padding:6px 10px;font-size:0.85rem;" title="القائمة">▼</button>' +
        '<button type="button" onmousedown="event.preventDefault()" onclick="document.getElementById(\'amType\').value=\'\';updateMatFields()" style="position:absolute;left:36px;top:22px;background:none;border:1px solid #333;color:#666;border-radius:6px 0 0 6px;cursor:pointer;padding:6px 10px;font-size:0.85rem;border-left:none;" title="مسح">✕</button>' +
      '</div>' +
      '<div class="admin-form-group"><label>الاسم *</label><input type="text" id="amName" required style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
        '<div class="admin-form-group"><label>الشركة</label><input type="text" id="amCompany" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>' +
        '<div class="admin-form-group"><label>التاجر</label><input type="text" id="amSupplier" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
        '<div class="admin-form-group"><label id="amPriceLabel">سعر الوحدة</label><input type="number" id="amPrice" value="0" step="any" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>' +
        '<div class="admin-form-group"><label id="amSizeLabel">السعة (مل)</label><input type="text" id="amSize" placeholder="30" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>' +
      '</div>' +
      '<div class="admin-form-group"><label id="amQtyLabel">العدد</label><input type="number" id="amStock" value="0" step="any" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>' +
      '<button type="submit" class="btn-gold" style="margin-top:8px;">💾 حفظ</button>' +
    '</form>');
  window.updateMatFields = function() {
    var t = (document.getElementById('amType').value || '').toLowerCase().trim();
    var isAlc = t === 'كحول' || t === 'alcohol';
    document.getElementById('amPriceLabel').textContent = isAlc ? 'سعر اللتر' : 'سعر الوحدة';
    document.getElementById('amQtyLabel').textContent = isAlc ? 'الكمية (لتر)' : 'العدد';
  };
  updateMatFields();
  document.getElementById('adminMatForm').onsubmit = function(e) {
    e.preventDefault();
    var t = (document.getElementById('amType').value || '').trim();
    var tLow = t.toLowerCase().trim();
    var unitPrice = parseFloat(document.getElementById('amPrice').value) || 0;
    var qty = parseFloat(document.getElementById('amStock').value) || 0;
    var size = document.getElementById('amSize').value || null;
    if (tLow === 'كحول' || tLow === 'alcohol') { qty = qty * 1000; }
    var total = unitPrice * qty;
    ddApi('/inventory/materials', { method: 'POST', body: {
      type: t,
      name: document.getElementById('amName').value,
      company: document.getElementById('amCompany').value,
      supplier: document.getElementById('amSupplier').value,
      purchase_price: total,
      size: size,
      stock: qty
    } }).then(function(d) { adminToast('\u2705 \u062A\u0645\u062A \u0627\u0644\u0625\u0636\u0627\u0641\u0629'); closeAdminModal(); adminShow('inventory'); });
  };
};

window.adminEditMaterial = function(id) {
  ddApi('/inventory/materials').then(all => {
    const m = all.find(x => x.id === id);
    if (!m) return adminToast('❌ المادة غير موجودة');
    const isAlcohol = m.type === 'alcohol' || m.type === 'كحول';
    const stk = parseFloat(m.stock) || 1;
    const displayPrice = isAlcohol ? ((parseFloat(m.purchase_price)||0) / stk * 1000).toFixed(2) : ((parseFloat(m.purchase_price)||0) / stk).toFixed(2);
    const displayQty = isAlcohol ? (stk / 1000) : m.stock;
    const priceLabel = isAlcohol ? 'سعر اللتر' : 'سعر الوحدة';
    const qtyLabel = isAlcohol ? 'الكمية (لتر)' : 'العدد';
    var editSuggestId = 'emType-suggest';
    adminModal('<button onclick="closeAdminModal()" style="float:left;cursor:pointer;color:#998e7a;font-size:1.2rem;background:none;border:none;">\u2715</button>' +
      '<h2 style="color:#c9a84c;margin-bottom:16px;">\u270F\uFE0F \u062A\u0639\u062F\u064A\u0644: ' + m.name + '</h2>' +
      '<form id="adminMatEditForm">' +
        '<div class="admin-form-group" style="position:relative;"><label>\u0627\u0644\u0646\u0648\u0639</label>' +
          '<input type="text" id="emType" autocomplete="off" value="' + m.type + '" oninput="updateEditMatFields()" onfocus="showMatTypeDropdown(\'emType\',\'' + editSuggestId + '\')" onblur="hideSuggestionDropdown(\'' + editSuggestId + '\')" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;">' +
          '<div id="' + editSuggestId + '" style="display:none;position:absolute;top:100%;left:0;right:0;z-index:100;background:#0a0806;border:1px solid #2a2218;border-top:none;border-radius:0 0 8px 8px;max-height:180px;overflow-y:auto;"></div>' +
          '<button type="button" onmousedown="event.preventDefault()" onclick="showMatTypeDropdown(\'emType\',\'' + editSuggestId + '\')" style="position:absolute;left:0;top:22px;background:none;border:1px solid #2a2218;color:#c9a84c;border-radius:0 6px 6px 0;cursor:pointer;padding:6px 10px;font-size:0.85rem;" title="القائمة">▼</button>' +
          '<button type="button" onmousedown="event.preventDefault()" onclick="document.getElementById(\'emType\').value=\'\';updateEditMatFields()" style="position:absolute;left:36px;top:22px;background:none;border:1px solid #333;color:#666;border-radius:6px 0 0 6px;cursor:pointer;padding:6px 10px;font-size:0.85rem;border-left:none;" title="مسح">✕</button>' +
        '</div>' +
        '<div class="admin-form-group"><label>\u0627\u0644\u0627\u0633\u0645 *</label><input type="text" id="emName" value="' + m.name + '" required style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
          '<div class="admin-form-group"><label>\u0627\u0644\u0634\u0631\u0643\u0629</label><input type="text" id="emCompany" value="' + (m.company || '') + '" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>' +
          '<div class="admin-form-group"><label>\u0627\u0644\u062A\u0627\u062C\u0631</label><input type="text" id="emSupplier" value="' + (m.supplier || '') + '" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
          '<div class="admin-form-group"><label id="emPriceLabel">' + priceLabel + '</label><input type="number" id="emPrice" value="' + displayPrice + '" step="any" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>' +
          '<div class="admin-form-group"><label id="emSizeLabel">\u0627\u0644\u0633\u0639\u0629 (\u0645\u0644)</label><input type="text" id="emSize" value="' + (m.size || '') + '" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>' +
        '</div>' +
        '<div class="admin-form-group"><label id="emQtyLabel">' + qtyLabel + '</label><input type="number" id="emStock" value="' + displayQty + '" step="any" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>' +
        '<button type="submit" class="btn-gold" style="margin-top:8px;">💾 حفظ التعديلات</button>' +
      '</form>');
    window.updateEditMatFields = function() {
      var t = (document.getElementById('emType').value || '').toLowerCase().trim();
      var isAlc = t === 'كحول' || t === 'alcohol';
      document.getElementById('emPriceLabel').textContent = isAlc ? 'سعر اللتر' : 'سعر الوحدة';
      document.getElementById('emQtyLabel').textContent = isAlc ? 'الكمية (لتر)' : 'العدد';
    };
    document.getElementById('adminMatEditForm').onsubmit = function(e) {
      e.preventDefault();
      var t = (document.getElementById('emType').value || '').trim();
      var tLow = t.toLowerCase().trim();
      var unitPrice = parseFloat(document.getElementById('emPrice').value) || 0;
      var qty = parseFloat(document.getElementById('emStock').value) || 0;
      var size = document.getElementById('emSize').value || null;
      if (tLow === 'كحول' || tLow === 'alcohol') { qty = qty * 1000; }
      var total = unitPrice * qty;
      ddApi('/inventory/materials/' + id, { method: 'PUT', body: {
        type: t,
        name: document.getElementById('emName').value,
        company: document.getElementById('emCompany').value,
        supplier: document.getElementById('emSupplier').value,
        purchase_price: total,
        size: size,
        stock: qty
      } }).then(function(d) { adminToast('\u2705 \u062A\u0645 \u0627\u0644\u062A\u062D\u062F\u064A\u062B'); closeAdminModal(); adminShow('inventory'); });
    };
  });
};

window.adminDeleteMaterial = function(id) {
  if (!confirm('⚠️ تأكيد حذف المادة؟')) return;
  ddApi('/inventory/materials/' + id, { method: 'DELETE' }).then(d => { adminToast('✅ ' + d.message); adminShow('inventory'); });
};

// ── Admin: Products ──
function loadAdminProducts() {
  ddApi('/products').then(products => {
    document.getElementById('adminContent').innerHTML = `<div class="admin-card"><h3>🧴 المنتجات (مولدة تلقائياً من الزيوت)</h3>
      <div style="display:flex;flex-direction:column;gap:8px;">
      ${products.length ? products.map(p =>
          `<div class="admin-prod-card" onclick="adminShowProductCost(${p.id})" style="cursor:pointer;">
            <div class="admin-prod-header">
              <span class="admin-prod-name" style="font-size:1.2rem;font-weight:700;">${p.name}</span>
              <div style="display:flex;align-items:center;gap:10px;margin-right:auto;">
                <div style="display:flex;align-items:center;gap:4px;">
                  <span style="font-size:0.75rem;color:#998e7a;">الأكثر مبيعاً</span>
                  <label class="admin-toggle bestselling" onclick="event.stopPropagation();">
                    <input type="checkbox" ${p.is_bestselling ? 'checked' : ''} onchange="adminToggleBestselling(${p.id}, this.checked)">
                    <span class="slider"></span>
                  </label>
                </div>
                <div style="display:flex;align-items:center;gap:4px;">
                  <span style="font-size:0.75rem;color:#998e7a;">نشط</span>
                  <label class="admin-toggle" onclick="event.stopPropagation();">
                    <input type="checkbox" ${p.is_active ? 'checked' : ''} onchange="adminToggleProduct(${p.id}, this.checked)">
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>`
      ).join('') : '<div class="admin-empty">أضف زيت عطري لينتج منتج تلقائياً</div>'}
      </div>
    </div>`;
  });
}

window.adminShowProductCost = function(id) {
  Promise.all([ddApi('/products/' + id), ddApi('/inventory/oils'), ddApi('/inventory/materials')]).then(([p, oils, mats]) => {
    if (!p || p.error) return adminToast('❌ المنتج غير موجود');
    const oil = oils.find(o => o.id === p.oil_id);
    const sizes = [30, 50, 100];
    const sizeLabels = { 30: '٣٠ مل', 50: '٥٠ مل', 100: '١٠٠ مل' };
    const prices = {30: parseFloat(p.price_30)||0, 50: parseFloat(p.price_50)||0, 100: parseFloat(p.price_100)||0};

    const calcBreakdown = (size) => {
      if (!oil) return { oilCost: 0, alcCost: 0, bottleCost: 0, stickerCost: 0, total: 0 };
      const oilRate = (parseFloat(oil.purchase_price) || 0) / (parseFloat(oil.stock_ml) || 1);
      const oilUsed = size * (parseFloat(oil.concentration) / 100);
      const alcoholUsed = size - oilUsed;
      const alcMat = mats.find(m => m.type === 'alcohol');
      const alcRate = alcMat ? (parseFloat(alcMat.purchase_price) || 0) / 1000 : 0;
      const bottleMat = mats.find(m => m.type === 'bottle' && parseInt(m.size) === size);
      const bottleCost = bottleMat ? (parseFloat(bottleMat.purchase_price) || 0) / (parseFloat(bottleMat.stock) || 1) : 0;
      const stickerMat = mats.find(m => m.type === 'sticker');
      const stickerCost = stickerMat ? (parseFloat(stickerMat.purchase_price) || 0) / (parseFloat(stickerMat.stock) || 1) : 0;
      return {
        oilCost: oilUsed * oilRate,
        alcCost: alcoholUsed * alcRate,
        bottleCost,
        stickerCost,
        total: oilUsed * oilRate + alcoholUsed * alcRate + bottleCost + stickerCost
      };
    };

    adminModal(`<button onclick="closeAdminModal()" style="float:left;cursor:pointer;color:#998e7a;font-size:1.2rem;background:none;border:none;">✕</button>
      <h2 style="color:#c9a84c;margin-bottom:4px;">🧴 ${p.name}</h2>
      ${p.oil_name ? `<div style="color:#998e7a;font-size:0.85rem;margin-bottom:12px;">${p.oil_name}</div>` : ''}
      <div class="admin-prod-sizes">
        ${sizes.map(s => {
          const bd = calcBreakdown(s);
          const pr = prices[s];
          const profit = pr - bd.total;
          return `<div class="admin-prod-size">
            <div class="admin-prod-size-title">${sizeLabels[s]}</div>
            <div class="admin-prod-cost-row"><span>زيت</span><span>${bd.oilCost.toFixed(1)} ج</span></div>
            <div class="admin-prod-cost-row"><span>كحول</span><span>${bd.alcCost.toFixed(1)} ج</span></div>
            <div class="admin-prod-cost-row"><span>زجاجة</span><span>${bd.bottleCost.toFixed(1)} ج</span></div>
            <div class="admin-prod-cost-row"><span>استيكر</span><span>${bd.stickerCost.toFixed(1)} ج</span></div>
            <div class="admin-prod-cost-row admin-prod-total"><span>📥 التكلفة</span><span>${bd.total.toFixed(1)} ج</span></div>
            <div class="admin-prod-price-row"><span>💰 سعر البيع</span><input type="number" id="ap-${p.id}-${s}" value="${pr}" class="admin-input"></div>
            ${pr > 0 ? `<div class="admin-prod-profit" style="color:${profit >= 0 ? '#4ecdc4' : '#ff6b6b'};">الربح: ${profit.toFixed(1)} ج (${(profit/pr*100).toFixed(1)}%)</div>` : ''}
          </div>`;
        }).join('')}
        <button class="btn-gold" onclick="adminSavePrice(${p.id})" style="margin-top:12px;width:100%;">💾 حفظ الأسعار</button>
      </div>`);
  });
};

window.adminSavePrice = function(id) {
  const p30 = parseFloat(document.getElementById('ap-' + id + '-30')?.value) || 0;
  const p50 = parseFloat(document.getElementById('ap-' + id + '-50')?.value) || 0;
  const p100 = parseFloat(document.getElementById('ap-' + id + '-100')?.value) || 0;
  ddApi('/products/' + id, { method: 'PUT', body: { price_30: p30, price_50: p50, price_100: p100, price: p50 } }).then(d => adminToast('✅ تم حفظ الأسعار'));
};

window.adminToggleProduct = function(id, active) {
  ddApi('/products/' + id, { method: 'PUT', body: { is_active: active ? 1 : 0 } }).then(d => { adminToast(active ? '✅ تم تفعيل المنتج' : '✅ تم إيقاف المنتج'); loadDDProducts(); });
};

window.adminToggleBestselling = function(id, val) {
  ddApi('/products/' + id, { method: 'PUT', body: { is_bestselling: val ? 1 : 0 } }).then(d => { adminToast(val ? '⭐ تمت إضافته للأكثر مبيعاً' : 'تم إزالته من الأكثر مبيعاً'); loadDDProducts(); });
};

// ── Admin: Customers ──
function loadAdminCustomers() {
  ddApi('/customers').then(customers => {
    Promise.all(customers.map(c => ddApi('/customers/' + c.id))).then(extended => {
      document.getElementById('adminContent').innerHTML = `<div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
        <button class="btn-gold" onclick="adminAddCustomer()">➕ إضافة عميل</button>
      </div><div class="admin-card"><h3>👥 العملاء</h3>
        ${customers.length ? '<table class="admin-table"><tr><th>الاسم</th><th>الهاتف</th><th>كلمة المرور</th><th>المشتريات</th><th>المدفوع</th><th>الرصيد</th><th>الحد الائتماني</th><th>آجل</th><th></th></tr>' + customers.map((c, i) => {
          const ex = extended[i] || c;
          return `<tr><td>${c.name}</td><td><input type="text" id="nph-${c.id}" value="${c.phone || ''}" class="admin-input" style="width:120px;"></td><td><input type="text" id="npw-${c.id}" value="${c.password && c.password !== '****' ? c.password.replace(/'/g, "\\'") : ''}" class="admin-input" style="width:100px;" placeholder="****"></td><td>${(ex.total_purchases||0).toLocaleString()}</td><td>${(ex.total_paid||0).toLocaleString()}</td><td style="color:${(ex.balance||0) > 0 ? '#c9a84c' : '#4ecdc4'};font-weight:700;">${(ex.balance||0).toLocaleString()}</td><td><input type="number" id="cl-${c.id}" value="${c.credit_limit}" class="admin-input" style="width:70px;"></td><td><label class="admin-toggle"><input type="checkbox" ${c.is_credit_enabled ? 'checked' : ''} onchange="adminToggleCredit(${c.id}, this.checked)"><span class="slider"></span></label></td><td><div style="display:flex;gap:4px;flex-wrap:wrap;"><button class="btn-gold btn-sm" onclick="adminSaveCL(${c.id})">حفظ</button> <button class="btn-gold btn-sm" onclick="adminViewLedger(${c.id})" style="background:transparent;border:1px solid #2a2218;color:#e8e0d0;">كشف</button> <button class="btn-gold btn-sm" onclick="adminRecordPayment(${c.id})" style="background:#4ecdc4;color:#1a1200;">💰 سداد</button> <button class="btn-gold btn-sm" onclick="adminDeleteCustomer(${c.id})" style="background:#ff4444;color:white;">🗑️ إلغاء</button></div></td></tr>`;
        }).join('') + '</table>' : '<div class="admin-empty">لا يوجد عملاء</div>'}
      </div>`;
    });
  });
}

window.adminAddCustomer = function() {
  adminModal(`<button onclick="closeAdminModal()" style="float:left;cursor:pointer;color:#998e7a;font-size:1.2rem;background:none;border:none;">✕</button>
    <h2 style="color:#c9a84c;margin-bottom:16px;">➕ إضافة عميل</h2>
    <form id="adminAddCustomerForm">
      <div class="admin-form-group"><label>الاسم *</label><input type="text" id="acName" required style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div class="admin-form-group"><label>الهاتف</label><input type="text" id="acPhone" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>
        <div class="admin-form-group"><label>كلمة المرور</label><input type="text" id="acPass" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div class="admin-form-group"><label>الحد الائتماني</label><input type="number" id="acLimit" value="0" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>
        <div class="admin-form-group"><label>مديونية ابتدائية (اختياري)</label><input type="number" id="acDebt" value="0" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>
      </div>
      <button type="submit" class="btn-gold" style="margin-top:8px;">💾 حفظ</button>
    </form>`);
  document.getElementById('adminAddCustomerForm').onsubmit = e => {
    e.preventDefault();
    const name = document.getElementById('acName').value;
    const phone = document.getElementById('acPhone').value;
    const password = document.getElementById('acPass').value;
    const limit = parseFloat(document.getElementById('acLimit').value) || 0;
    const debt = parseFloat(document.getElementById('acDebt').value) || 0;
    ddApi('/customers', { method: 'POST', body: { name, phone, password, credit_limit: limit, opening_balance: debt } }).then(d => {
      if (d.error) { adminToast('❌ ' + d.error); return; }
      adminToast('✅ تم إضافة العميل' + (debt ? ` برصيد ${debt}` : ''));
      closeAdminModal();
      adminShow('customers');
  });
}
};

window.adminSendLedgerWA = async function(customerId) {
  const c = await ddApi('/customers/' + customerId);
  const ledger = await ddApi('/customers/' + customerId + '/ledger');
  if (!c || !ledger.length) { adminToast('⚠️ لا توجد معاملات'); return; }
  const methodNames = { cash: 'نقدي', transfer: 'تحويل' };
  const lines = [...ledger].reverse().map(l => {
    const date = new Date(l.created_at).toLocaleString('ar-EG');
    const desc = l.type === 'order' ? `فاتورة ${l.order_no || ''}` : l.note || '';
    let typeStr;
    if (l.type === 'payment') typeStr = methodNames[l.method] || l.method || 'نقدي';
    else if (l.type === 'opening') typeStr = 'مديونية ابتدائية';
    else typeStr = 'آجل';
    const sDebit = l.debit || (l.amount > 0 ? l.amount : 0);
    const sCredit = l.credit || (l.amount < 0 ? Math.abs(l.amount) : 0);
    const debitStr = sDebit > 0 ? sDebit.toLocaleString() : '-';
    const creditStr = sCredit > 0 ? sCredit.toLocaleString() : '-';
    return `${date} | ${desc} | فواتير: ${debitStr} | سداد: ${creditStr} | ${typeStr}`;
  }).join('\n');
  let msg = `📋 كشف حساب - ${c.name}\n\n`;
  if (c.phone) msg += `الهاتف: ${c.phone}\n`;
  msg += `إجمالي المشتريات: ${(c.total_purchases||0).toLocaleString()} ج.م\nإجمالي المدفوع: ${(c.total_paid||0).toLocaleString()} ج.م\nالرصيد الحالي: ${(c.balance||0).toLocaleString()} ج.م\n\nالمعاملات:\n${lines}`;
  if (!c.phone) { adminToast('⚠️ العميل ليس لديه رقم هاتف'); return; }
  // Preview before sending
  const previewId = 'ledgerWAPreview_' + customerId;
  adminModal(`<button onclick="closeAdminModal()" style="float:left;cursor:pointer;color:#998e7a;font-size:1.2rem;background:none;border:none;">✕</button>
    <h2 style="color:#c9a84c;margin-bottom:8px;">📋 معاينة كشف الحساب</h2>
    <p style="color:#998e7a;font-size:0.85rem;margin-bottom:12px;">العميل: ${c.name} | ${c.phone}</p>
    <textarea id="${previewId}" readonly style="width:100%;height:280px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;padding:12px;font-family:monospace;font-size:0.75rem;resize:vertical;direction:ltr;text-align:left;">${msg}</textarea>
    <div style="display:flex;gap:8px;margin-top:12px;">
      <button id="sendLedgerBtn" class="btn-gold" style="flex:1;background:#25D366;color:#1a1200;">📤 إرسال</button>
      <button onclick="closeAdminModal()" style="flex:1;padding:12px;background:#1a1410;border:1px solid #2a2218;border-radius:8px;color:#998e7a;cursor:pointer;font-family:inherit;">إلغاء</button>
    </div>`);
  document.getElementById('sendLedgerBtn').onclick = function() {
    const text = document.getElementById(previewId).value;
    closeAdminModal();
    window.sendWhatsApp(c.phone, text);
  };
};

window.adminToggleCredit = function(id, val) { ddApi('/customers/' + id, { method: 'PUT', body: { is_credit_enabled: val } }); };
window.adminSaveCL = function(id) {
  const data = { credit_limit: parseFloat(document.getElementById('cl-' + id).value) };
  const pwEl = document.getElementById('npw-' + id);
  const phEl = document.getElementById('nph-' + id);
  if (pwEl) data.password = pwEl.value;
  if (phEl) data.phone = phEl.value;
  ddApi('/customers/' + id, { method: 'PUT', body: data }).then(d => adminToast('✅ تم التحديث'));
};

window.adminRecordPayment = function(customerId) {
  adminViewLedger(customerId);
  setTimeout(() => document.getElementById('ledgerPayAmt')?.focus(), 200);
};

window.adminDeleteCustomer = async function(customerId) {
  if (!confirm('هل أنت متأكد من إلغاء هذا العميل؟ سيتم حذف جميع طلباته وحركاته المالية.')) return;
  const orders = await ddApi('/orders');
  const custOrders = orders.filter(o => (o.customer_id || o.user_id) === customerId);
  for (const o of custOrders) {
    await ddApi('/orders/' + o.id + '/delete', { method: 'POST' });
  }
  await ddApi('/customers/' + customerId, { method: 'DELETE' });
  adminToast('✅ تم إلغاء العميل');
  adminLoadCustomers();
};

window.adminViewLedger = function(customerId, showBack = true) {
  ddApi('/customers/' + customerId).then(c => {
    ddApi('/customers/' + customerId + '/ledger').then(ledger => {
      const methodNames = { cash: 'نقدي', transfer: 'تحويل' };
      let html = `<button onclick="closeAdminModal()" style="float:left;cursor:pointer;color:#998e7a;font-size:1.2rem;background:none;border:none;">✕</button>
        <h2 style="color:#c9a84c;margin-bottom:8px;">📋 كشف حساب: ${c.name}</h2>
        <div class="admin-stats" style="margin-bottom:12px;">
          <div class="admin-stat" style="padding:12px;"><div class="num" style="font-size:1.2rem;">${(c.total_purchases||0).toLocaleString()}</div><div class="label">المشتريات</div></div>
          <div class="admin-stat" style="padding:12px;"><div class="num" style="font-size:1.2rem;">${(c.total_paid||0).toLocaleString()}</div><div class="label">المدفوع</div></div>
          <div class="admin-stat" style="padding:12px;"><div class="num" style="font-size:1.2rem;color:${(c.balance||0) > 0 ? '#c9a84c' : '#4ecdc4'};">${(c.balance||0).toLocaleString()}</div><div class="label">الرصيد</div></div>
        </div>`;
      if (ledger.length) {
        html += '<table class="admin-table" style="font-size:0.8rem;"><tr><th>التاريخ</th><th>البيان</th><th>مدين</th><th>دائن</th><th>الرصيد</th></tr>';
        let bal = 0;
        [...ledger].reverse().forEach(l => {
          const debit = l.debit || (l.amount > 0 ? l.amount : 0);
          const credit = l.credit || (l.amount < 0 ? Math.abs(l.amount) : 0);
          bal += debit - credit;
          const desc = l.type === 'order' ? `فاتورة ${l.order_no || ''}` : l.note || 'دفعة';
          html += `<tr>
            <td>${new Date(l.created_at).toLocaleString('ar-EG')}</td>
            <td style="color:#998e7a;">${desc}</td>
            <td style="color:#ff6b6b;">${debit ? debit.toLocaleString() : ''}</td>
            <td style="color:#4ecdc4;">${credit ? credit.toLocaleString() : ''}</td>
            <td style="color:#c9a84c;font-weight:700;">${bal.toLocaleString()}</td>
          </tr>`;
        });
        html += '</table>';
        html += `<button class="btn-gold" onclick="adminSendLedgerWA(${customerId})" style="margin-top:8px;background:transparent;border:1px solid #25D366;color:#25D366;">📱 إرسال كشف الحساب واتساب</button>`;
      } else html += '<div class="admin-empty">لا توجد حركات</div>';
      // Payment form
      if ((c.balance||0) > 0) {
        html += `<div style="margin-top:16px;padding:16px;background:#0a0806;border-radius:12px;border:1px solid #2a2218;">
          <h3 style="color:#c9a84c;margin-bottom:8px;">💰 تسجيل دفعة</h3>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            <input type="number" id="ledgerPayAmt" placeholder="المبلغ" style="flex:1;min-width:100px;padding:10px 14px;background:#1a1410;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;">
            <select id="ledgerPayMethod" style="padding:10px 14px;background:#1a1410;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;">
              <option value="cash">نقدي</option>
              <option value="transfer">تحويل</option>
            </select>
            <button class="btn-gold" onclick="adminLedgerPay(${customerId})">💾 تسجيل</button>
          </div>
        </div>`;
      }
      adminModal(html);
    });
  });
};

window.adminLedgerPay = async function(customerId) {
  const amt = parseFloat(document.getElementById('ledgerPayAmt')?.value);
  if (!amt || amt <= 0) { adminToast('⚠️ أدخل مبلغ'); return; }
  const method = document.getElementById('ledgerPayMethod')?.value || 'cash';
  const orders = await ddApi('/orders');
  const custOrders = orders.filter(o => (o.customer_id || o.user_id) === customerId && (o.remaining || o.total - (o.paid||0)) > 0);
  if (!custOrders.length) { adminToast('⚠️ لا توجد فواتير مستحقة'); return; }
  let remaining = amt;
  const methodNames = { cash: 'نقدي', transfer: 'تحويل' };
  for (const o of custOrders) {
    if (remaining <= 0) break;
    const owe = o.remaining || (o.total - (o.paid||0));
    const payAmt = Math.min(remaining, owe);
    if (payAmt <= 0) continue;
    await ddApi('/orders/' + o.id + '/pay', { method: 'POST', body: { amount: payAmt, method } });
    remaining -= payAmt;
  }
  adminToast(`✅ تم تسجيل ${amt.toLocaleString()} عن طريق ${methodNames[method] || method}`);
  adminViewLedger(customerId);
};

// ── Admin: Orders ──
window.adminNewOrder = function() {
  const prods = ddProductsCache || [];
  const sizes = [30, 50, 100];
  let itemRows = 1;
  const rowHtml = (idx) => `<div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;align-items:end;" class="po-row">
    <div style="flex:2;min-width:120px;"><select class="ao-prod" style="width:100%;padding:8px;background:#0a0806;border:1px solid #2a2218;border-radius:6px;color:#e8e0d0;font-family:inherit;">${prods.map(p => `<option value="${p.id}">${p.name} (${p.name_en || ''})</option>`).join('')}</select></div>
    <div style="flex:1;min-width:70px;"><select class="ao-size" style="width:100%;padding:8px;background:#0a0806;border:1px solid #2a2218;border-radius:6px;color:#e8e0d0;font-family:inherit;">${sizes.map(s => `<option value="${s}">${s} مل</option>`).join('')}</select></div>
    <div style="flex:1;min-width:60px;"><input type="number" class="ao-qty" value="1" min="1" style="width:100%;padding:8px;background:#0a0806;border:1px solid #2a2218;border-radius:6px;color:#e8e0d0;font-family:inherit;"></div>
  </div>`;
  let itemsHtml = rowHtml(0);
  adminModal(`<button onclick="closeAdminModal()" style="float:left;cursor:pointer;color:#998e7a;font-size:1.2rem;background:none;border:none;">✕</button>
    <h2 style="color:#c9a84c;margin-bottom:16px;">➕ طلب جديد</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
      <div class="admin-form-group"><label>اسم العميل *</label><input type="text" id="aoCustName" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>
      <div class="admin-form-group"><label>رقم الهاتف</label><input type="text" id="aoCustPhone" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>
    </div>
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:8px;margin-bottom:4px;font-size:0.85rem;color:#998e7a;"><span>المنتج</span><span>الحجم</span><span>الكمية</span></div>
    <div id="aoItems">${itemsHtml}</div>
    <button type="button" onclick="var d=document.getElementById('aoItems');d.insertAdjacentHTML('beforeend','${rowHtml(itemRows++).replace(/'/g, "\\'")}')" style="padding:8px 16px;background:transparent;border:1px dashed #2a2218;border-radius:8px;color:#998e7a;cursor:pointer;margin-bottom:12px;">➕ إضافة صنف</button>
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
      <select id="aoPayType" style="padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;">
        <option value="cash">نقدي</option><option value="transfer">تحويل</option><option value="credit">آجل</option>
      </select>
    </div>
    <button class="btn-gold" onclick="adminCreateOrder()" style="width:100%;">💾 إنشاء الطلب</button>`);
};

window.adminCreateOrder = async function() {
  const name = document.getElementById('aoCustName').value;
  if (!name) { adminToast('⚠️ أدخل اسم العميل'); return; }
  const phone = document.getElementById('aoCustPhone').value;
  const payType = document.getElementById('aoPayType').value;
  const rows = document.querySelectorAll('#aoItems .po-row');
  const items = [];
  for (const row of rows) {
    const pid = parseInt(row.querySelector('.ao-prod').value);
    const size = parseInt(row.querySelector('.ao-size').value);
    const qty = parseInt(row.querySelector('.ao-qty').value) || 1;
    if (!pid) continue;
    items.push({ product_id: pid, size_ml: size, qty });
  }
  if (!items.length) { adminToast('⚠️ أضف صنف واحد على الأقل'); return; }
  const result = await ddApi('/orders', { method: 'POST', body: { items, payment_type: payType, customer_name: name, customer_phone: phone } });
  if (result.error) { adminToast('❌ ' + result.error); return; }
  adminToast('✅ تم إنشاء الطلب');
  closeAdminModal(); adminShow('orders');
};
function loadAdminOrders() {
  ddApi('/orders').then(orders => {
    const pending = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
    const delivered = orders.filter(o => o.status === 'delivered');
    function orderTable(list, emptyMsg, showActions) {
      if (!list.length) return '<div class="admin-empty">' + emptyMsg + '</div>';
      let html = '<table class="admin-table"><tr><th>الفاتورة</th><th>العميل</th><th>الإجمالي</th><th>المدفوع</th><th>المتبقي</th><th>النوع</th><th></th></tr>';
      list.forEach(o => {
        const methodMap = { cash: 'نقدي', transfer: 'تحويل', credit: 'آجل' };
        const badgeCls = o.payment_type === 'credit' ? 'badge-warning' : 'badge-success';
        const badgeTxt = methodMap[o.payment_type] || o.payment_type || 'نقدي';
        let actions = '<button class="btn-gold btn-sm" onclick="adminViewOrder(' + o.id + ')">عرض</button>';
        if (showActions) {
          actions += '<button class="btn-gold btn-sm" onclick="adminEditOrder(' + o.id + ')" style="background:transparent;border:1px solid #2a2218;">✏️</button>';
          actions += '<button class="btn-gold btn-sm" onclick="adminCancelOrder(' + o.id + ')" style="background:#dc3545;color:white;">❌</button>';
        }
        html += '<tr><td>' + o.order_no + '</td><td>' + (o.customer_name || '-') + '</td><td>' + o.total + '</td><td>' + (o.paid||0) + '</td><td>' + (o.remaining||0) + '</td><td><span class="badge ' + badgeCls + '">' + badgeTxt + '</span></td><td style="display:flex;gap:4px;">' + actions + '</td></tr>';
      });
      html += '</table>';
      return html;
    }
    document.getElementById('adminContent').innerHTML = `<div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;"><button class="btn-gold" onclick="adminNewOrder()">➕ طلب جديد</button></div><div class="admin-card"><h3>📦 طلبات معلقة</h3>${orderTable(pending, 'لا توجد طلبات معلقة', true)}</div>${delivered.length ? '<div class="admin-card"><h3>✅ الطلبات المنفذة</h3>' + orderTable(delivered, '', true) + '</div>' : ''}`;
  });
}

window.adminViewOrder = function(id) {
  ddApi('/orders/' + id).then(o => {
    const methodMap = { cash: 'نقدي', transfer: 'تحويل', credit: 'آجل' };
    const pmtMethod = methodMap[o.payment_type] || o.payment_type || 'نقدي';
    let html = `<button onclick="closeAdminModal()" style="float:left;cursor:pointer;color:#998e7a;font-size:1.2rem;background:none;border:none;">✕</button>
      <h2 style="color:#c9a84c;">📄 ${o.order_no}</h2>
      <p style="margin-bottom:12px;font-size:0.95rem;"><strong>العميل:</strong> ${o.customer_name || '-'} | <strong>طريقة السداد:</strong> ${pmtMethod} | <strong>الحالة:</strong> ${o.status === 'delivered' ? 'تم التسليم' : o.status === 'cancelled' ? 'ملغي' : 'قيد التنفيذ'}</p>`;
    if (o.items?.length) {
      html += '<table class="admin-table" style="font-size:0.85rem;"><tr><th>المنتج</th><th>سعة العبوة</th><th>الكمية</th><th>سعر العبوة</th><th>الإجمالي</th></tr>';
      o.items.forEach(i => { const itemTotal = ((i.unit_price || i.price || 0) * i.qty); html += `<tr><td>${i.oil_name}</td><td>${i.size_ml} مل</td><td>${i.qty}</td><td>${(i.unit_price || i.price || 0).toLocaleString()} ج</td><td>${itemTotal.toLocaleString()} ج</td></tr>`; });
      html += '</table>';
    }
    html += `<div style="margin-top:12px;font-size:0.9rem;background:#0f0b08;padding:10px;border-radius:8px;border:1px solid #2a2218;"><strong>الإجمالي:</strong> ${o.total} | <strong>المدفوع:</strong> ${o.paid||0} | <strong>المتبقي:</strong> ${o.remaining||0} | <strong>طريقة السداد:</strong> ${pmtMethod}</div>`;
    html += `<div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap;">`;
    if (o.status !== 'delivered' && o.status !== 'cancelled') {
      html += `<div style="width:100%;background:#0f0b08;border:1px solid #2a2218;border-radius:8px;padding:12px;margin-bottom:8px;">
        <h3 style="color:#c9a84c;margin-bottom:8px;font-size:0.9rem;">💰 تسجيل السداد مع التسليم</h3>
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
          <input type="number" id="payAmt" value="${o.remaining||o.total}" placeholder="مبلغ السداد" style="flex:1;min-width:80px;padding:8px 12px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;">
          <select id="payMethod" onchange="if(this.value==='credit')document.getElementById('payAmt').value=0" style="padding:8px 12px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;">
            <option value="cash">نقدي</option><option value="transfer">تحويل</option><option value="credit">آجل</option>
          </select>
          <button class="btn-gold" onclick="adminMarkDelivered(${o.id})" style="background:#4ecdc4;color:#1a1200;">✅ تأكيد التسليم</button>
        </div>
      </div>`;
    }
    html += `<button class="btn-gold btn-sm" onclick="adminSendInvoice(${o.id})" style="background:transparent;border:1px solid #25D366;color:#25D366;">📱 إرسال فاتورة للعميل</button>`;
    if (o.remaining > 0) {
      html += `<div style="margin-top:8px;width:100%;"><h3 style="color:#c9a84c;margin-bottom:8px;font-size:0.9rem;">💰 تسجيل دفعة إضافية</h3>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          <input type="number" id="payAmt2" placeholder="المبلغ" style="flex:1;min-width:100px;padding:8px 12px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;">
          <select id="payMethod2" style="padding:8px 12px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;">
            <option value="cash">نقدي</option><option value="transfer">تحويل</option><option value="credit">آجل</option>
          </select>
          <button class="btn-gold" onclick="adminRecordPay(${o.id})">💾 تسجيل</button>
        </div></div>`;
    }
    html += `</div>`;
    adminModal(html);
  });
};

window.adminRecordPay = async function(id) {
  const amt = document.getElementById('payAmt2')?.value || document.getElementById('payAmt')?.value;
  const method = document.getElementById('payMethod2')?.value || document.getElementById('payMethod')?.value || 'cash';
  if (!amt || amt <= 0) { adminToast('⚠️ أدخل مبلغ'); return; }
  const d = await ddApi('/orders/' + id + '/pay', { method: 'POST', body: { amount: parseFloat(amt), method } });
  if (d.error) { adminToast('❌ ' + d.error); return; }
  adminToast('✅ تم تسجيل الدفعة, المتبقي: ' + d.remaining);
  // Notify customer after payment
  const o = await ddApi('/orders/' + id);
  if (o && d.remaining <= 0) {
    const customer = await ddApi('/customers/' + (o.customer_id || o.user_id));
    if (customer && customer.phone) {
      const items = o.items || [];
      const itemsSummary = items.map(i => {
        const itemTotal = (i.price || i.unit_price || 0) * i.qty;
        return `${i.qty} عبوة ${i.size_ml} مللي - ${i.oil_name || 'منتج'} ${itemTotal.toLocaleString()} جم`;
      }).join('\n');
      window.notifyCustomerInvoice(o.order_no, customer.name, customer.phone, itemsSummary, o.total, o.payment_type, 0, customer.balance || 0);
    }
  }
  closeAdminModal(); adminShow('orders');
};

// ── Admin: Sales ──
function loadAdminSales() {
  Promise.all([ddApi('/admin/sales'), ddApi('/inventory/oils'), ddApi('/inventory/materials')]).then(([orders, oils, mats]) => {
    const calcItemCost = (item) => {
      const oil = oils.find(o => o.name === item.oil_name);
      const oilRate = oil ? (parseFloat(oil.purchase_price)||0) / (parseFloat(oil.stock_ml)||1) : 0;
      const oilUsed = item.size_ml * (parseFloat(oil?.concentration || 0) / 100);
      const alcRate = mats.find(m => m.type === 'alcohol') ? (parseFloat(mats.find(m => m.type === 'alcohol').purchase_price)||0) / 1000 : 0;
      const bottleCost = mats.find(m => m.type === 'bottle' && parseInt(m.size) === item.size_ml) ? (parseFloat(mats.find(m => m.type === 'bottle' && parseInt(m.size) === item.size_ml).purchase_price)||0) / (parseFloat(mats.find(m => m.type === 'bottle' && parseInt(m.size) === item.size_ml).stock)||1) : 0;
      const stickerCost = mats.find(m => m.type === 'sticker') ? (parseFloat(mats.find(m => m.type === 'sticker').purchase_price)||0) / (parseFloat(mats.find(m => m.type === 'sticker').stock)||1) : 0;
      const alcoholUsed = item.size_ml - oilUsed;
      return oilUsed * oilRate + alcoholUsed * alcRate + bottleCost + stickerCost;
    };
    const enriched = orders.map(o => {
      const itemsCost = (o.items || []).reduce((s, i) => s + calcItemCost(i) * i.qty, 0);
      const profit = (o.total || 0) - itemsCost;
      const margin = o.total > 0 ? (profit / o.total * 100) : 0;
      return { ...o, itemsCost: itemsCost, profit: profit, margin: margin };
    });
    const totalRevenue = enriched.reduce((s, o) => s + (o.total || 0), 0);
    const totalCost = enriched.reduce((s, o) => s + o.itemsCost, 0);
    const totalProfit = enriched.reduce((s, o) => s + o.profit, 0);
    const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;
    document.getElementById('adminContent').innerHTML = `
      <div class="admin-stats">
        <div class="admin-stat"><div class="num">${totalRevenue.toLocaleString()}</div><div class="label">إجمالي الإيرادات</div></div>
        <div class="admin-stat"><div class="num">${totalCost.toLocaleString()}</div><div class="label">إجمالي التكاليف</div></div>
        <div class="admin-stat"><div class="num">${totalProfit.toLocaleString()}</div><div class="label" style="color:#4ecdc4;">إجمالي الأرباح</div></div>
        <div class="admin-stat"><div class="num">${overallMargin.toFixed(1)}%</div><div class="label">نسبة الربح</div></div>
      </div>
      <div class="admin-card"><h3>📈 تفاصيل الأرباح</h3>
        ${enriched.length ? '<table class="admin-table"><tr><th>الفاتورة</th><th>العميل</th><th>الإيراد</th><th>التكلفة</th><th>الربح</th><th>%</th><th>النوع</th><th>التاريخ</th><th></th></tr>' + enriched.map(o => `<tr>
          <td>${o.order_no || o.id}</td>
          <td>${o.customer_name || '-'}</td>
          <td>${(o.total||0).toLocaleString()}</td>
          <td style="color:#ff6b6b;">${o.itemsCost.toFixed(0)}</td>
          <td style="color:${o.profit >= 0 ? '#4ecdc4' : '#ff6b6b'};font-weight:700;">${o.profit.toFixed(0)}</td>
          <td style="color:#c9a84c;">${o.margin.toFixed(1)}%</td>
          <td><span class="badge ${o.payment_type === 'credit' ? 'badge-warning' : 'badge-success'}">${o.payment_type === 'credit' ? 'آجل' : 'نقدي'}</span></td>
          <td>${new Date(o.created_at).toLocaleString('ar-EG')}</td>
          <td><button class="btn-gold btn-sm" onclick="adminDeleteOrder(${o.id})" style="background:#dc3545;color:white;font-size:0.75rem;">🗑️</button></td>
        </tr>`).join('') + '</table>' : '<div class="admin-empty">لا توجد مبيعات</div>'}
      </div>`;
  });
}

// ── Admin: Settings ──
function loadAdminSettings() {
  ddApi('/admin/settings').then(s => {
    document.getElementById('adminContent').innerHTML = `<div class="admin-card"><h3>⚙️ الإعدادات</h3>
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span>تفعيل إشعارات الواتساب</span>
          <label class="admin-toggle"><input type="checkbox" ${s.whatsapp_enabled === 'true' ? 'checked' : ''} onchange="adminSaveSetting('whatsapp_enabled', this.checked)"><span class="slider"></span></label>
        </div>
        <div class="admin-form-group"><label>رقم الواتساب (لإشعارات الأدمن)</label>
          <input type="text" id="adminWaNum" value="${s.whatsapp_number || ''}" onchange="adminSaveSetting('whatsapp_number', this.value)" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;" placeholder="201000000000">
        </div>
      </div>
    </div>`;
  });
}

window.adminExportData = function() {
  ddApi('/admin/export').then(r => {
    const blob = new Blob([r.data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'diamond-dust-backup-' + new Date().toISOString().slice(0,10) + '.json';
    a.click();
    adminToast('✅ تم تصدير البيانات بنجاح');
  });
};

window.adminImportData = function(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const data = e.target.result;
    ddApi('/admin/import', { method: 'POST', body: { data } }).then(r => {
      if (r.ok) {
        adminToast(r.message);
        setTimeout(() => location.reload(), 1500);
      } else {
        adminToast(r.message);
      }
    });
  };
  reader.readAsText(file);
  input.value = '';
};

window.adminSaveSetting = function(key, val) {
  ddApi('/admin/settings', { method: 'PUT', body: { key, value: String(val) } }).then(d => adminToast('✅ تم الحفظ'));
};

// ── Admin: Addition Slips (إذون إضافة المخازن) ──
function loadAdminAdditions() {
  ddApi('/purchases').then(orders => {
    // ترتيب تصاعدي: الأصغر رقم فوق
    orders.sort(function(a,b) { return a.id - b.id; });
    var html = '<div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;">' +
      '<button class="btn-gold" onclick="adminAddAddition()">📋 إذن إضافة جديد</button>' +
    '</div><div class="admin-card"><h3>📋 إذون إضافة المخازن</h3>';
    if (orders.length) {
      html += '<table class="admin-table"><tr><th>#</th><th>التاريخ</th><th>المورد</th><th>الأصناف</th><th>الإجمالي</th><th></th></tr>';
      for (var oi = 0; oi < orders.length; oi++) {
        var o = orders[oi];
        var itemsSummary = o.items.map(function(i) { return (i.name || '?') + ' x' + i.qty; }).join(', ');
        html += '<tr><td style="color:#c9a84c;font-weight:700;">' + o.id + '</td><td>' + (o.date || new Date(o.created_at).toLocaleString('ar-EG')) + '</td><td>' + (o.supplier || '-') + '</td><td style="font-size:0.75rem;color:#998e7a;">' + itemsSummary + '</td><td>' + (o.total||0).toLocaleString() + '</td><td><button class="btn-gold btn-sm" onclick="adminEditAddition(' + o.id + ')">✏️</button> <button class="btn-gold btn-sm" onclick="adminDeleteAddition(' + o.id + ')" style="background:#dc3545;color:white;">🗑️</button></td></tr>';
      }
      html += '</table>';
    } else {
      html += '<div class="admin-empty">لا توجد إذون إضافة</div>';
    }
    html += '</div>';
    document.getElementById('adminContent').innerHTML = html;
  });
}

window.adminAddAddition = function() {
  Promise.all([ddApi('/inventory/oils'), ddApi('/inventory/materials')]).then(function(r) {
    var oils = r[0], mats = r[1];
    var today = new Date().toISOString().slice(0,10);
    adminModal('<button onclick="closeAdminModal()" style="float:left;cursor:pointer;color:#998e7a;font-size:1.2rem;background:none;border:none;">\u2715</button>' +
      '<h2 style="color:#c9a84c;margin-bottom:16px;">📋 إذن إضافة جديد</h2>' +
      '<form id="addForm">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
          '<div class="admin-form-group"><label>التاريخ</label><input type="date" id="adDate" value="' + today + '" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>' +
          '<div class="admin-form-group"><label>المورد</label><input type="text" id="adSupplier" list="adSupplierList" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"><datalist id="adSupplierList">' + getAllSuppliers(oils, mats).map(function(s) { return '<option value="' + s + '">'; }).join('') + '</datalist></div>' +
        '</div>' +
        '<h3 style="color:#c9a84c;font-size:0.9rem;margin-bottom:8px;margin-top:8px;">الأصناف المضافة</h3>' +
        '<div id="adItems">' +
          buildAdRow(oils, mats) +
        '</div>' +
        '<button type="button" onclick="adminAddAdRow()" style="padding:8px 16px;background:transparent;border:1px dashed #2a2218;border-radius:8px;color:#998e7a;cursor:pointer;margin-bottom:12px;">➕ إضافة صنف</button>' +
        '<button type="submit" class="btn-gold" style="display:block;width:100%;">💾 حفظ الإذن</button>' +
      '</form>');
    document.getElementById('addForm').onsubmit = function(e) {
      e.preventDefault();
      var rows = document.querySelectorAll('#adItems .ad-row');
      var items = [];
      for (var i = 0; i < rows.length; i++) {
        var sel = rows[i].querySelector('.ad-type');
        var type = sel.value;
        var name = '';
        if (type === 'oil') {
          name = (rows[i].querySelector('.ad-name-select').value || '').trim();
        } else {
          name = (rows[i].querySelector('.ad-name').value || '').trim();
        }
        var qty = parseFloat(rows[i].querySelector('.ad-qty').value) || 0;
        var pricePerUnit = parseFloat(rows[i].querySelector('.ad-price').value) || 0;
        var price = type === 'oil' ? qty * pricePerUnit : pricePerUnit;
        if (type && name && qty > 0) items.push({ type: type, name: name, qty: qty, price: price });
      }
      if (!items.length) { adminToast('⚠️ أضف صنف واحد على الأقل'); return; }
      ddApi('/purchases', { method: 'POST', body: { supplier: document.getElementById('adSupplier').value, date: document.getElementById('adDate').value, items: items } }).then(function(d) {
        if (d.error) { adminToast('❌ ' + d.error); return; }
        adminToast('✅ تمت إضافة الأصناف للمخزون');
        closeAdminModal();
        setTimeout(function() { location.reload(); }, 300);
      });
    };
  });
};

function getAllSuppliers(oils, mats) {
  var set = {};
  oils.forEach(function(o) { if (o.supplier) set[o.supplier] = 1; });
  mats.forEach(function(m) { if (m.supplier) set[m.supplier] = 1; });
  return Object.keys(set);
}

function getMatTypeDisplay(type) {
  var m = { bottle: '🧴 زجاجة', sticker: '🏷️ استيكر', alcohol: '🧪 كحول', glass: '🫙 زجاج', alu: '🥫 ألومنيوم', aged: '🏺 زجاج تعتيق' };
  return m[type] || ('📦 ' + type);
}
function typeHasSize(t) {
  return ['bottle','glass','alu','aged','زجاجة','زجاج','ألومنيوم','الومنيوم','تعتيق'].includes(t);
}
var _adOils = [], _adMats = [], _adRowIdx = 0;

function buildAdRow(oils, mats) {
  _adOils = oils; _adMats = mats;
  var idx = _adRowIdx++;
  var dlId = 'adNameList' + idx;
  var oilOpts = oils.map(function(o) { return '<option value="' + o.name + '">' + o.name + ' (' + (o.stock_ml||0) + 'ml)</option>'; }).join('');
  // Build dynamic type options from existing materials
  var matTypeMap = {};
  mats.forEach(function(m) { if (!matTypeMap[m.type]) matTypeMap[m.type] = []; matTypeMap[m.type].push(m); });
  var typeOptsHtml = '<option value="oil" data-opts="' + oilOpts.replace(/"/g,'&quot;') + '">🧪 زيت</option>';
  Object.keys(matTypeMap).forEach(function(t) {
    var opts = matTypeMap[t].map(function(m) { return '<option value="' + m.name + '">' + m.name + ' (' + (m.stock||0) + ')</option>'; }).join('');
    typeOptsHtml += '<option value="' + t + '" data-opts="' + opts.replace(/"/g,'&quot;') + '">' + getMatTypeDisplay(t) + '</option>';
  });
  return '<div class="ad-row" style="display:grid;grid-template-columns:120px 1fr 80px 100px 36px;gap:6px;margin-bottom:6px;align-items:end;">' +
    '<div class="admin-form-group"><label>النوع</label><select class="ad-type" data-dl="' + dlId + '" style="width:100%;padding:8px;background:#0a0806;border:1px solid #2a2218;border-radius:6px;color:#e8e0d0;font-family:inherit;" onchange="adminAdTypeChange(this)"><option value="">اختر</option>' + typeOptsHtml + '</select></div>' +
    '<div class="admin-form-group"><label>الاسم</label><select class="ad-name-select" style="display:none;width:100%;padding:8px;background:#0a0806;border:1px solid #2a2218;border-radius:6px;color:#e8e0d0;font-family:inherit;"><option value="">اختر الزيت</option>' + oilOpts + '</select><input type="text" class="ad-name" list="' + dlId + '" placeholder="اختر النوع أولاً" style="width:100%;padding:8px;background:#0a0806;border:1px solid #2a2218;border-radius:6px;color:#e8e0d0;font-family:inherit;"><datalist id="' + dlId + '"></datalist></div>' +
    '<div class="admin-form-group"><label class="ad-qty-label">الكمية</label><input type="number" class="ad-qty" value="1" style="width:100%;padding:8px;background:#0a0806;border:1px solid #2a2218;border-radius:6px;color:#e8e0d0;font-family:inherit;"></div>' +
    '<div class="admin-form-group"><label class="ad-price-label">السعر</label><input type="number" step="any" class="ad-price" value="0" style="width:100%;padding:8px;background:#0a0806;border:1px solid #2a2218;border-radius:6px;color:#e8e0d0;font-family:inherit;"></div>' +
    '<button type="button" onclick="this.closest(\'.ad-row\').remove()" style="padding:8px;background:#dc3545;border:none;border-radius:6px;color:white;cursor:pointer;">✕</button>' +
  '</div>';
}

window.adminAdTypeChange = function(sel) {
  var opt = sel.options[sel.selectedIndex];
  var opts = opt && opt.dataset ? (opt.dataset.opts || '') : '';
  var dlId = sel.dataset.dl || '';
  var row = sel.closest('.ad-row');
  var nameInput = row ? row.querySelector('.ad-name') : null;
  var nameSelect = row ? row.querySelector('.ad-name-select') : null;
  if (sel.value === 'oil') {
    if (nameSelect) { nameSelect.style.display = ''; }
    if (nameInput) { nameInput.style.display = 'none'; }
  } else {
    if (nameSelect) { nameSelect.style.display = 'none'; }
    if (nameInput) { nameInput.style.display = ''; }
    if (nameInput) {
      if (opt && opt.value) {
        nameInput.placeholder = 'اختر من القائمة أو اكتب جديد';
        nameInput.removeAttribute('readonly');
      } else {
        nameInput.placeholder = 'اختر النوع أولاً';
      }
    }
  }
  var dl = dlId ? document.getElementById(dlId) : null;
  if (dl) dl.innerHTML = opts;
  if (row) {
    var qtyLabel = row.querySelector('.ad-qty-label');
    var priceLabel = row.querySelector('.ad-price-label');
    if (qtyLabel) qtyLabel.textContent = sel.value === 'oil' ? 'الكمية (مل)' : 'الكمية';
    if (priceLabel) priceLabel.textContent = sel.value === 'oil' ? 'سعر المللي' : 'السعر';
  }
};

window.adminAddAdRow = function() {
  var oils = _adOils, mats = _adMats;
  document.getElementById('adItems').insertAdjacentHTML('beforeend', buildAdRow(oils, mats));
};

window.adminEditAddition = function(id) {
  ddApi('/purchases/' + id).then(function(order) {
    if (!order || order.error) { adminToast('❌ الطلب غير موجود'); return; }
    Promise.all([ddApi('/inventory/oils'), ddApi('/inventory/materials')]).then(function(r) {
      var oils = r[0], mats = r[1];
      var today = new Date().toISOString().slice(0,10);
      adminModal('<button onclick="closeAdminModal()" style="float:left;cursor:pointer;color:#998e7a;font-size:1.2rem;background:none;border:none;">\u2715</button>' +
        '<h2 style="color:#c9a84c;margin-bottom:16px;">✏️ تعديل إذن الإضافة #' + id + '</h2>' +
        '<form id="editAddForm">' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
            '<div class="admin-form-group"><label>التاريخ</label><input type="date" id="eadDate" value="' + (order.date || today) + '" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"></div>' +
            '<div class="admin-form-group"><label>المورد</label><input type="text" id="eadSupplier" value="' + (order.supplier || '').replace(/"/g,'&quot;') + '" list="eadSupplierList" style="width:100%;padding:10px 14px;background:#0a0806;border:1px solid #2a2218;border-radius:8px;color:#e8e0d0;font-family:inherit;"><datalist id="eadSupplierList">' + getAllSuppliers(oils, mats).map(function(s) { return '<option value="' + s + '">'; }).join('') + '</datalist></div>' +
          '</div>' +
          '<h3 style="color:#c9a84c;font-size:0.9rem;margin-bottom:8px;margin-top:8px;">الأصناف المضافة</h3>' +
          '<div id="eadItems">' +
            (order.items || []).map(function(item, idx) {
              var dlId = 'eadNameList' + idx;
              var oilEditOpts = oils.map(function(o) { return '<option value="' + o.name + '" ' + (o.name === item.name ? 'selected' : '') + '>' + o.name + ' (' + (o.stock_ml||0) + 'ml)</option>'; }).join('');
              // Build dynamic type options for edit
              var editMatTypeMap = {};
              mats.forEach(function(m) { if (!editMatTypeMap[m.type]) editMatTypeMap[m.type] = []; editMatTypeMap[m.type].push(m); });
              var editTypeOpts = '<option value="oil" data-opts="' + oilEditOpts.replace(/"/g,'&quot;') + '">🧪 زيت</option>';
              Object.keys(editMatTypeMap).forEach(function(t) {
                var opts = editMatTypeMap[t].map(function(m) { return '<option value="' + m.name + '">' + m.name + ' (' + (m.stock||0) + ')</option>'; }).join('');
                var sel = item.type === t ? 'selected' : '';
                editTypeOpts += '<option value="' + t + '" ' + sel + ' data-opts="' + opts.replace(/"/g,'&quot;') + '">' + getMatTypeDisplay(t) + '</option>';
              });
              return '<div class="ad-row" style="display:grid;grid-template-columns:120px 1fr 80px 100px 36px;gap:6px;margin-bottom:6px;align-items:end;">' +
                '<div class="admin-form-group"><label>النوع</label><select class="ad-type" data-dl="' + dlId + '" style="width:100%;padding:8px;background:#0a0806;border:1px solid #2a2218;border-radius:6px;color:#e8e0d0;font-family:inherit;" onchange="adminAdTypeChange(this)">' +
                  '<option value="">اختر</option>' + editTypeOpts +
                '</select></div>' +
                '<div class="admin-form-group"><label>الاسم</label><select class="ad-name-select" style="display:none;width:100%;padding:8px;background:#0a0806;border:1px solid #2a2218;border-radius:6px;color:#e8e0d0;font-family:inherit;">' + oilEditOpts + '</select><input type="text" class="ad-name" value="' + (item.name || '').replace(/"/g,'&quot;') + '" list="' + dlId + '" style="width:100%;padding:8px;background:#0a0806;border:1px solid #2a2218;border-radius:6px;color:#e8e0d0;font-family:inherit;"><datalist id="' + dlId + '"></datalist></div>' +
                '<div class="admin-form-group"><label class="ad-qty-label">الكمية</label><input type="number" class="ad-qty" value="' + (item.qty || 1) + '" style="width:100%;padding:8px;background:#0a0806;border:1px solid #2a2218;border-radius:6px;color:#e8e0d0;font-family:inherit;"></div>' +
                '<div class="admin-form-group"><label class="ad-price-label">السعر</label><input type="number" step="any" class="ad-price" value="' + (item.type === 'oil' && item.qty ? (item.price / item.qty).toFixed(2) : (item.price || 0)) + '" style="width:100%;padding:8px;background:#0a0806;border:1px solid #2a2218;border-radius:6px;color:#e8e0d0;font-family:inherit;"></div>' +
                '<button type="button" onclick="this.closest(\'.ad-row\').remove()" style="padding:8px;background:#dc3545;border:none;border-radius:6px;color:white;cursor:pointer;">✕</button>' +
              '</div>';
            }).join('') +
          '</div>' +
          '<button type="button" onclick="adminAddAdRowEdit()" style="padding:8px 16px;background:transparent;border:1px dashed #2a2218;border-radius:8px;color:#998e7a;cursor:pointer;margin-bottom:12px;">➕ إضافة صنف</button>' +
          '<button type="submit" class="btn-gold" style="display:block;width:100%;">💾 حفظ التعديلات</button>' +
        '</form>');
      // Initialize labels for pre-selected types
      setTimeout(function() {
        document.querySelectorAll('#eadItems .ad-type').forEach(function(s) { if (s.value) s.onchange(s); });
      }, 0);
      document.getElementById('editAddForm').onsubmit = function(e) {
        e.preventDefault();
        var rows = document.querySelectorAll('#eadItems .ad-row');
        var items = [];
        for (var i = 0; i < rows.length; i++) {
          var sel = rows[i].querySelector('.ad-type');
          var type = sel.value;
          var name = '';
          if (type === 'oil') {
            name = (rows[i].querySelector('.ad-name-select').value || '').trim();
          } else {
            name = (rows[i].querySelector('.ad-name').value || '').trim();
          }
          var qty = parseFloat(rows[i].querySelector('.ad-qty').value) || 0;
          var pricePerUnit = parseFloat(rows[i].querySelector('.ad-price').value) || 0;
          var price = type === 'oil' ? qty * pricePerUnit : pricePerUnit;
          if (type && name && qty > 0) items.push({ type: type, name: name, qty: qty, price: price });
        }
        if (!items.length) { adminToast('⚠️ أضف صنف واحد على الأقل'); return; }
        ddApi('/purchases/' + id, { method: 'PUT', body: { supplier: document.getElementById('eadSupplier').value, date: document.getElementById('eadDate').value, items: items } }).then(function(d) {
          if (d.error) { adminToast('❌ ' + d.error); return; }
          adminToast('✅ تم التعديل وعكس الكميات');
          closeAdminModal();
          setTimeout(function() { location.reload(); }, 300);
        });
      };
    });
  });
};

window.adminAddAdRowEdit = function() {
  var oils = _adOils, mats = _adMats;
  var container = document.getElementById('eadItems');
  if (container) container.insertAdjacentHTML('beforeend', buildAdRow(oils, mats));
};

window.adminDeleteAddition = function(id) {
  if (!confirm('⚠️ تأكيد حذف إذن الإضافة #' + id + '؟\nسيتم عكس الكميات المضافة من المخزون.')) return;
  ddApi('/purchases/' + id, { method: 'DELETE' }).then(function(d) {
    if (d.error) { adminToast('❌ ' + d.error); return; }
    adminToast('✅ ' + d.message);
    adminShow('purchases');
    adminShow('inventory');
  });
};

// ── WhatsApp ──
window.sendWhatsApp = function(phone, message) {
  if (!phone) return;
  window.open(`https://wa.me/${phone.replace(/^\+/, '')}?text=${encodeURIComponent(message)}`, '_blank');
};

window.notifyAdminOrder = function(orderNo, customerName, itemsSummary, total, paymentType, customerPhone) {
  ddApi('/admin/settings').then(s => {
    if (s.whatsapp_enabled !== 'true') return;
    const adminPhone = s.whatsapp_number;
    if (!adminPhone) return;
    const payText = paymentType === 'credit' ? 'آجل' : 'نقدي';
    const date = new Date().toLocaleDateString('ar-EG');
    let msg = `🛒 طلب جديد - Diamond Dust\n\nالفاتورة: ${orderNo}\nالعميل: ${customerName}\nالتاريخ: ${date}\n\nالمنتجات:\n${itemsSummary}\n\nالإجمالي: ${total} ج.م\nطريقة الدفع: ${payText}`;
    if (customerPhone) msg += `\nرقم العميل: ${customerPhone}`;
    sendWhatsApp(adminPhone, msg);
  });
};

window.notifyCustomerInvoice = function(orderNo, customerName, customerPhone, itemsSummary, total, paymentType, remaining, totalBalance) {
  const payText = paymentType === 'credit' ? 'آجل' : 'نقدي';
  let msg = `🧾 فاتورة شراء - Diamond Dust\n\nالفاتورة: ${orderNo}\nالعميل: ${customerName}\nالتاريخ: ${new Date().toLocaleDateString('ar-EG')}\n\nالمنتجات:\n${itemsSummary}\n\nالإجمالي: ${total} ج.م\nطريقة الدفع: ${payText}`;
  if (paymentType === 'credit' && remaining > 0) {
    msg += `\nالمتبقي: ${remaining} ج.م`;
  }
  if (totalBalance > total) {
    msg += `\n⚠️ إجمالي المديونية: ${totalBalance} ج.م`;
  }
  sendWhatsApp(customerPhone, msg);
};

window.adminSendInvoice = async function(orderId) {
  const o = await ddApi('/orders/' + orderId);
  if (!o || o.error) { adminToast('❌ لا يمكن تحميل الطلب'); return; }
  const customer = await ddApi('/customers/' + (o.customer_id || o.user_id));
  if (!customer || !customer.phone) { adminToast('⚠️ العميل ليس لديه رقم هاتف'); return; }
  const items = o.items || [];
  const itemsSummary = items.map(i => {
    const itemTotal = (i.price || i.unit_price || 0) * i.qty;
    return `${i.qty} عبوة ${i.size_ml} مللي - ${i.oil_name || 'منتج'} ${itemTotal.toLocaleString()} جم`;
  }).join('\n');
  notifyCustomerInvoice(o.order_no, customer.name, customer.phone, itemsSummary, o.total, o.payment_type, o.remaining || 0, customer.balance || 0);
  adminToast('✅ تم فتح الواتساب لإرسال الفاتورة');
};

window.adminMarkDelivered = async function(orderId) {
  const method = document.getElementById('payMethod')?.value || 'cash';
  const amt = method === 'credit' ? 0 : (parseFloat(document.getElementById('payAmt')?.value) || 0);
  const o = await ddApi('/orders/' + orderId);
  if (!o || o.error) { adminToast('❌ لا يمكن تحميل الطلب'); return; }
  await ddApi('/orders/' + orderId, { method: 'PUT', body: { status: 'delivered' } });
  // Record payment if amount > 0
  if (amt > 0) {
    const payResult = await ddApi('/orders/' + orderId + '/pay', { method: 'POST', body: { amount: amt, method } });
    if (payResult && payResult.error) { adminToast('⚠️ تم التسليم لكن فشل تسجيل الدفعة: ' + payResult.error); }
  }
  const customer = await ddApi('/customers/' + (o.customer_id || o.user_id));
  if (customer && customer.phone) {
    const items = o.items || [];
    const itemsSummary = items.map(i => {
      const itemTotal = (i.price || i.unit_price || 0) * i.qty;
      return `${i.qty} عبوة ${i.size_ml} مللي - ${i.oil_name || 'منتج'} ${itemTotal.toLocaleString()} جم`;
    }).join('\n');
    notifyCustomerInvoice(o.order_no, customer.name, customer.phone, itemsSummary, o.total, o.payment_type, Math.max(0, o.total - amt), customer.balance || 0);
  }
  adminToast('✅ تم تأكيد التسليم وتسجيل المعاملة');
  closeAdminModal(); adminShow('orders');
};

window.adminCancelOrder = async function(id) {
  if (!confirm('⚠️ هل أنت متأكد من إلغاء هذا الطلب؟ سيتم عكس المخزون وحذف المعاملات.')) return;
  const result = await ddApi('/orders/' + id + '/delete', { method: 'POST' });
  if (result.error) { adminToast('❌ ' + result.error); return; }
  adminToast('✅ تم إلغاء الطلب وعكس المخزون');
  adminShow('orders');
};

window.adminDeleteOrder = async function(id) {
  if (!confirm('⚠️ هل أنت متأكد من حذف هذا الطلب؟ سيتم عكس المخزون.')) return;
  const result = await ddApi('/orders/' + id + '/delete', { method: 'POST' });
  if (result.error) { adminToast('❌ ' + result.error); return; }
  adminToast('✅ تم حذف الطلب وعكس المخزون');
  adminShow('sales');
};

window.adminEditOrder = function(id) {
  ddApi('/orders/' + id).then(o => {
    adminModal(`<button onclick="closeAdminModal()" style="float:left;cursor:pointer;color:#998e7a;font-size:1.2rem;background:none;border:none;">✕</button>
      <h2 style="color:#c9a84c;margin-bottom:12px;">✏️ تعديل الطلب ${o.order_no}</h2>
      <p style="color:#998e7a;font-size:0.85rem;">العميل: ${o.customer_name || '-'} | الإجمالي: ${o.total}</p>
      ${o.items?.length ? `<table class="admin-table" style="font-size:0.8rem;"><tr><th>المنتج</th><th>الحجم</th><th>الكمية</th><th>سعر الوحدة</th></tr>${o.items.map(i => `<tr><td>${i.oil_name}</td><td>${i.size_ml} مل</td><td>${i.qty}</td><td>${i.unit_price||0}</td></tr>`).join('')}</table>` : ''}
      <div style="margin-top:12px;color:#998e7a;font-size:0.8rem;">لتعديل الطلب، قم بإلغائه وأنشئ طلباً جديداً</div>`);
  });
};

// ─── INIT ────────────────────────────────────────────────────
renderCart();
loadDDProducts();
updateDDAuthUI();
// Admin panel opens only on manual login
// Ensure login button works (backup for onclick)
const loginBtn = document.getElementById('ddAuthBtn');
if (loginBtn) loginBtn.addEventListener('click', window.openDDLogin);
