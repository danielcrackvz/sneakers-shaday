/**
 * ==========================================================================
 * SNEAKERS SHADAY - APP.JS CON SUPABASE AUTH & GESTIÓN DE SESIÓN
 * ==========================================================================
 */

const SUPABASE_URL = 'https://obzyazdmnzxtwjnxkhkk.supabase.co';       // Pega tu Project URL de Supabase si la tienes
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ienlhemRtbnp4dHdqbnhraGtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MzUzNTMsImV4cCI6MjEwNjMxMTM1M30.yEFpKmFw93CErHtQidD0zMbCbfiEgQ6m0HMWZqJ00QA";  // Pega tu anon key si la tienes

const STORE_CONFIG = {
  storeName: "Sneakers Shaday",
  whatsappNumber: "59175512345",
  currency: "Bs."
};

// Respaldo de productos
const fallbackSneakers = [
  { id: 'snk-001', nombre: 'Air Jordan 4 Retro Tour Yellow', marca: 'Jordan', precio: 950, tallas: [39,40,41,42,43], badge: 'Más Vendido', imagen_url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=700&q=80', descripcion: 'Silueta icónica con acabado en cuero sintético y malla transpirable.' },
  { id: 'snk-002', nombre: 'Air Jordan 1 Retro Low OG Last Dance', marca: 'Jordan', precio: 780, tallas: [38,39,40,41,42], badge: 'Tendencia', imagen_url: 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&w=700&q=80', descripcion: 'Perfil bajo con mezcla de tonos negros, blancos y rojos legendarios.' },
  { id: 'snk-003', nombre: 'Nike Dunk Low Retro Panda', marca: 'Nike', precio: 650, tallas: [38,39,40,41,42,43], badge: 'Drop Exclusivo', imagen_url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=700&q=80', descripcion: 'El par streetwear más popular en blanco y negro.' },
  { id: 'snk-004', nombre: 'Adidas Forum Low Classic White', marca: 'Adidas', precio: 590, tallas: [38,39,40,41,42], badge: 'Clásico', imagen_url: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=700&q=80', descripcion: 'Inspirada en el basketball de los años 80.' },
  { id: 'snk-005', nombre: 'New Balance 550 White Green', marca: 'New Balance', precio: 720, tallas: [39,40,41,42,43], badge: 'Retro Trend', imagen_url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=700&q=80', descripcion: 'El regreso de un clásico vintage de 1989.' }
];

let allSneakers = [];
let selectedCategory = "todos";
let selectedSizeFilter = "";
let currentSearchTerm = "";
let currentSortOrder = "default";
let selectedModalProduct = null;
let selectedModalSize = null;
let shoppingCart = JSON.parse(localStorage.getItem("shaday_cart")) || [];

// ================= ESTADO DE SESIÓN =================
let currentUser = JSON.parse(localStorage.getItem("shaday_current_user")) || null;

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  initStore();
  renderAuthHeader();
});

async function initStore() {
  // 1. Cargar productos creados por el admin si existen
  const adminCustom = JSON.parse(localStorage.getItem("shaday_admin_products"));
  if (adminCustom && adminCustom.length > 0) {
    allSneakers = adminCustom;
  } else {
    allSneakers = fallbackSneakers;
  }

  // 2. Conexión Supabase opcional
  if (SUPABASE_URL.startsWith("https://") && window.supabase) {
    try {
      const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data, error } = await supabase.from('productos').select('*');
      if (!error && data && data.length > 0) {
        allSneakers = data;
        document.getElementById("dbStatusBadge").innerHTML = `<i class="fa-solid fa-circle-check" style="color:#4ade80;"></i> Supabase Conectado`;
      }
    } catch (e) {
      document.getElementById("dbStatusBadge").innerHTML = `<i class="fa-solid fa-server"></i> Modo Local Activo`;
    }
  } else {
    document.getElementById("dbStatusBadge").innerHTML = `<i class="fa-solid fa-server"></i> Modo Local Activo`;
  }

  renderProducts();
  updateCartBadge();
  setupEventListeners();
}

// ================= SISTEMA DE LOGIN Y REGISTRO =================
function renderAuthHeader() {
  const container = document.getElementById("authHeaderContainer");
  if (!container) return;

  if (currentUser) {
    const isAdmin = currentUser.rol === "admin" || currentUser.rol === "vendedor";
    container.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        ${isAdmin ? `
          <a href="admin.html" class="nav-btn" style="background:var(--accent-green); color:white;">
            <i class="fa-solid fa-gauge-high"></i> Panel Admin
          </a>
        ` : ''}
        <button class="nav-btn" onclick="handleLogout()" title="Cerrar sesión">
          <i class="fa-solid fa-arrow-right-from-bracket"></i> Salir (${currentUser.nombre.split(" ")[0]})
        </button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <button class="nav-btn" onclick="openAuthModal()">
        <i class="fa-solid fa-user"></i> Iniciar Sesión
      </button>
    `;
  }
}

window.openAuthModal = () => document.getElementById("authModal").classList.add("active");
window.closeAuthModal = () => document.getElementById("authModal").classList.remove("active");

window.switchAuthTab = function(tab) {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const tabLogin = document.getElementById("tabLoginBtn");
  const tabReg = document.getElementById("tabRegisterBtn");

  if (tab === 'login') {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    tabLogin.classList.add("active");
    tabReg.classList.remove("active");
  } else {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    tabReg.classList.add("active");
    tabLogin.classList.remove("active");
  }
};

window.handleLogin = async function(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  // 1. Caso Dueño Maestro por defecto
  if (email === "admin@shaday.com" && password === "admin123") {
    currentUser = {
      id: "usr-admin-master",
      nombre: "Administrador Shaday",
      email: email,
      rol: "admin"
    };
    saveUserSession(currentUser);
    alert("¡Bienvenido, Dueño de Sneakers Shaday! Redirigiendo a tu panel de control...");
    window.location.href = "admin.html";
    return;
  }

  // 2. Comprobar usuarios registrados localmente
  const registeredUsers = JSON.parse(localStorage.getItem("shaday_users_list")) || [];
  const found = registeredUsers.find(u => u.email === email && u.password === password);

  if (found) {
    currentUser = { id: found.id, nombre: found.nombre, email: found.email, rol: found.rol };
    saveUserSession(currentUser);
    alert(`¡Hola de nuevo, ${found.nombre}!`);
    closeAuthModal();
    renderAuthHeader();
    if (found.rol === "admin" || found.rol === "vendedor") {
      window.location.href = "admin.html";
    }
    return;
  }

  // 3. Intento vía Supabase Auth
  if (SUPABASE_URL.startsWith("https://") && window.supabase) {
    try {
      const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data.user) {
        currentUser = {
          id: data.user.id,
          nombre: data.user.user_metadata?.nombre || data.user.email.split("@")[0],
          email: data.user.email,
          rol: data.user.user_metadata?.rol || "cliente"
        };
        saveUserSession(currentUser);
        alert(`Sesión iniciada correctamente.`);
        closeAuthModal();
        renderAuthHeader();
        if (currentUser.rol === "admin") window.location.href = "admin.html";
        return;
      }
    } catch (err) {
      console.warn("Error Supabase Auth:", err);
    }
  }

  alert("Credenciales incorrectas. Para ingresar como administrador usa:\nCorreo: admin@shaday.com\nContraseña: admin123");
};

window.handleRegister = async function(e) {
  e.preventDefault();
  const nombre = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim().toLowerCase();
  const password = document.getElementById("regPassword").value;

  const newUser = {
    id: `usr-${Date.now().toString().slice(-4)}`,
    nombre: nombre,
    email: email,
    password: password,
    rol: "cliente",
    fecha: new Date().toLocaleDateString("es-BO")
  };

  // Guardar en lista de usuarios
  let usersList = JSON.parse(localStorage.getItem("shaday_users_list")) || [];
  if (usersList.some(u => u.email === email)) {
    alert("Ya existe una cuenta registrada con este correo electrónico.");
    return;
  }

  usersList.push(newUser);
  localStorage.setItem("shaday_users_list", JSON.stringify(usersList));

  // Iniciar sesión de inmediato
  currentUser = { id: newUser.id, nombre: newUser.nombre, email: newUser.email, rol: newUser.rol };
  saveUserSession(currentUser);

  alert(`¡Cuenta creada con éxito! Bienvenido a Sneakers Shaday, ${nombre}.`);
  closeAuthModal();
  renderAuthHeader();
};

function saveUserSession(user) {
  localStorage.setItem("shaday_current_user", JSON.stringify(user));
}

window.handleLogout = function() {
  if (confirm("¿Deseas cerrar tu sesión?")) {
    localStorage.removeItem("shaday_current_user");
    currentUser = null;
    renderAuthHeader();
    alert("Sesión finalizada.");
  }
};

// ================= RENDERIZACIÓN DE PRODUCTOS Y FILTROS =================
function renderProducts() {
  const productsGrid = document.getElementById("productsGrid");
  const resultsCount = document.getElementById("resultsCount");

  let filtered = allSneakers.filter(item => {
    const matchesCategory = (selectedCategory === "todos") || 
      (item.marca.toLowerCase() === selectedCategory.toLowerCase());

    const query = currentSearchTerm.toLowerCase();
    const matchesSearch = item.nombre.toLowerCase().includes(query) || 
                          item.marca.toLowerCase().includes(query);

    const tallasArray = Array.isArray(item.tallas) ? item.tallas : [];
    const matchesSize = (selectedSizeFilter === "") || tallasArray.includes(parseInt(selectedSizeFilter));

    return matchesCategory && matchesSearch && matchesSize;
  });

  if (currentSortOrder === "price-asc") filtered.sort((a, b) => a.precio - b.precio);
  else if (currentSortOrder === "price-desc") filtered.sort((a, b) => b.precio - a.precio);

  resultsCount.textContent = `Mostrando ${filtered.length} modelos`;

  if (filtered.length === 0) {
    productsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <i class="fa-solid fa-shoe-prints" style="font-size: 2.8rem; margin-bottom: 14px; display: block; opacity: 0.5;"></i>
        <h3>No se encontraron resultados</h3>
      </div>
    `;
    return;
  }

  productsGrid.innerHTML = filtered.map(item => {
    const tallasArray = Array.isArray(item.tallas) ? item.tallas : [];
    return `
      <article class="product-card">
        <span class="product-badge">${item.badge || 'Stock'}</span>
        <div class="card-img-box" onclick="openProductModal('${item.id}')">
          <img src="${item.imagen_url}" alt="${item.nombre}" loading="lazy" />
        </div>
        <div class="card-info">
          <span class="brand-label">${item.marca}</span>
          <h3 class="product-title" onclick="openProductModal('${item.id}')">${item.nombre}</h3>
          
          <div class="sizes-preview">
            ${tallasArray.slice(0, 5).map(s => `<span class="size-mini-tag">T:${s}</span>`).join("")}
          </div>

          <div class="card-bottom">
            <div class="price-box">
              <span class="price-label">Precio</span>
              <span class="product-price">${item.precio} ${STORE_CONFIG.currency}</span>
            </div>
            <div class="card-actions">
              <button class="btn-card-details" onclick="openProductModal('${item.id}')" title="Ver detalles">
                <i class="fa-solid fa-eye"></i>
              </button>
              <button class="btn-card-add" onclick="quickAddToCart('${item.id}')" title="Agregar al carrito">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function setupEventListeners() {
  document.getElementById("searchInput").addEventListener("input", (e) => {
    currentSearchTerm = e.target.value.trim();
    renderProducts();
  });

  document.querySelectorAll(".pill").forEach(pill => {
    pill.addEventListener("click", () => {
      if (pill.dataset.category) {
        document.querySelectorAll(".category-pills .pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        selectedCategory = pill.dataset.category;
        renderProducts();
      }
    });
  });

  document.getElementById("sizeFilter").addEventListener("change", (e) => {
    selectedSizeFilter = e.target.value;
    renderProducts();
  });

  document.getElementById("sortFilter").addEventListener("change", (e) => {
    currentSortOrder = e.target.value;
    renderProducts();
  });

  document.getElementById("closeModal").addEventListener("click", closeProductModal);
  document.getElementById("cartBtn").addEventListener("click", openCart);
  document.getElementById("closeCart").addEventListener("click", closeCart);
  document.getElementById("cartOverlay").addEventListener("click", closeCart);
  document.getElementById("clearCartBtn").addEventListener("click", clearCart);
  document.getElementById("checkoutBtn").addEventListener("click", checkoutWhatsAppCart);
}

// Modal y Carrito
window.openProductModal = function(productId) {
  const product = allSneakers.find(p => p.id === productId);
  if (!product) return;

  selectedModalProduct = product;
  const tallasArray = Array.isArray(product.tallas) ? product.tallas : [];
  selectedModalSize = tallasArray[0] || 40;

  document.getElementById("modalProductDetails").innerHTML = `
    <div class="modal-grid">
      <div class="modal-img-col">
        <img src="${product.imagen_url}" alt="${product.nombre}" />
      </div>
      <div class="modal-info-col">
        <span class="modal-brand">${product.marca}</span>
        <h2 class="modal-title">${product.nombre}</h2>
        <div class="modal-price">${product.precio} ${STORE_CONFIG.currency}</div>
        <p class="modal-desc">${product.descripcion || 'Calzado urbano exclusivo de máxima calidad.'}</p>

        <div class="size-selector-title">
          <span>Selecciona tu Talla:</span>
        </div>

        <div class="modal-sizes-grid">
          ${tallasArray.map((size, idx) => `
            <button class="size-btn ${idx === 0 ? 'selected' : ''}" onclick="selectModalSize(${size}, this)">
              ${size}
            </button>
          `).join("")}
        </div>

        <div class="modal-actions">
          <button class="btn-modal-whatsapp" onclick="orderSingleProductWhatsApp()">
            <i class="fa-brands fa-whatsapp"></i> Pedir este Par por WhatsApp
          </button>
          <button class="btn-modal-cart" onclick="addModalProductToCart()">
            <i class="fa-solid fa-bag-shopping"></i> Añadir al Carrito
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("productModal").classList.add("active");
};

window.selectModalSize = (size, btn) => {
  selectedModalSize = size;
  document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
};

function closeProductModal() {
  document.getElementById("productModal").classList.remove("active");
}

window.orderSingleProductWhatsApp = function() {
  if (!selectedModalProduct || !selectedModalSize) return;
  const msg = `¡Hola *${STORE_CONFIG.storeName}*! 👋👟\n` +
    `Vi este modelo en su web y quiero comprarlo:\n\n` +
    `📌 *Modelo:* ${selectedModalProduct.nombre}\n` +
    `🏷️️ *Marca:* ${selectedModalProduct.marca}\n` +
    `📏 *Talla:* ${selectedModalSize}\n` +
    `💰 *Precio:* ${selectedModalProduct.precio} ${STORE_CONFIG.currency}\n\n` +
    `¿Me confirman disponibilidad y el código QR para transferir? ¡Gracias!`;
  window.open(`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank");
};

window.quickAddToCart = (id) => {
  const prod = allSneakers.find(p => p.id === id);
  if (prod) addToCartLogic(prod, prod.tallas[0] || 40);
};

window.addModalProductToCart = () => {
  if (selectedModalProduct) {
    addToCartLogic(selectedModalProduct, selectedModalSize);
    closeProductModal();
    openCart();
  }
};

function addToCartLogic(product, size) {
  const existing = shoppingCart.find(i => i.id === product.id && i.size === size);
  if (existing) existing.qty += 1;
  else shoppingCart.push({ id: product.id, name: product.nombre, price: product.precio, image: product.imagen_url, size, qty: 1 });
  localStorage.setItem("shaday_cart", JSON.stringify(shoppingCart));
  updateCartBadge();
}

function updateCartBadge() {
  document.getElementById("cartCount").textContent = shoppingCart.reduce((a, c) => a + c.qty, 0);
}

function openCart() {
  renderCartDrawer();
  document.getElementById("cartOverlay").classList.add("active");
  document.getElementById("cartDrawer").classList.add("active");
}

function closeCart() {
  document.getElementById("cartOverlay").classList.remove("active");
  document.getElementById("cartDrawer").classList.remove("active");
}

function renderCartDrawer() {
  const list = document.getElementById("cartItemsList");
  let total = 0;
  if (shoppingCart.length === 0) {
    list.innerHTML = `<div class="cart-empty-msg"><i class="fa-solid fa-cart-arrow-down"></i><p>Carrito vacío</p></div>`;
    document.getElementById("cartTotalPrice").textContent = "0 Bs.";
    return;
  }
  list.innerHTML = shoppingCart.map((item, idx) => {
    const sub = item.price * item.qty;
    total += sub;
    return `
      <div class="cart-item">
        <img src="${item.image}" class="cart-item-img" />
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>Talla ${item.size} x ${item.qty}</p>
          <strong>${sub} Bs.</strong>
        </div>
        <button class="cart-item-remove" onclick="removeCart(${idx})">&times;</button>
      </div>
    `;
  }).join("");
  document.getElementById("cartTotalPrice").textContent = `${total} Bs.`;
}

window.removeCart = (idx) => {
  shoppingCart.splice(idx, 1);
  localStorage.setItem("shaday_cart", JSON.stringify(shoppingCart));
  updateCartBadge();
  renderCartDrawer();
};

function clearCart() {
  shoppingCart = [];
  localStorage.setItem("shaday_cart", JSON.stringify(shoppingCart));
  updateCartBadge();
  renderCartDrawer();
}

function checkoutWhatsAppCart() {
  if (shoppingCart.length === 0) return;
  let text = "";
  let total = 0;
  shoppingCart.forEach((it, i) => {
    const s = it.price * it.qty;
    total += s;
    text += `${i+1}. *${it.name}* (Talla: ${it.size}) x ${it.qty} = ${s} Bs.\n`;
  });
  const msg = `¡Hola *${STORE_CONFIG.storeName}*! 🛒\nQuiero realizar este pedido:\n\n${text}\n💵 *TOTAL:* ${total} Bs.\n\nPor favor me envían el QR para pagar.`;
  window.open(`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank");
}