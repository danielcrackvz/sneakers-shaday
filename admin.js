/**
 * ==========================================================================
 * SNEAKERS SHADAY - ADMIN.JS CON CONTROL DE ACCESO Y MÓDULO DE USUARIOS
 * ==========================================================================
 */

// 1. VERIFICACIÓN DE SESIÓN EN LA ENTRADA
let sessionUser = JSON.parse(localStorage.getItem("shaday_current_user"));

// Si no hay sesión iniciada o si el rol es solo cliente, bloqueamos el panel
if (!sessionUser || (sessionUser.rol !== "admin" && sessionUser.rol !== "vendedor")) {
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("adminAuthLock").style.display = "flex";
    document.getElementById("adminMainLayout").style.display = "none";
  });
}

// 2. ESTADO GLOBAL
let dbProducts = JSON.parse(localStorage.getItem("shaday_admin_products")) || [];
let dbPurchases = JSON.parse(localStorage.getItem("shaday_admin_purchases")) || [];
let dbSales = JSON.parse(localStorage.getItem("shaday_admin_sales")) || [];
let dbProviders = JSON.parse(localStorage.getItem("shaday_admin_providers")) || [
  { id: "prov-1", name: "Importaciones Falabella Chile", phone: "+56 9 8492 1102", city: "Santiago / Iquique", brands: "Nike, Jordan, Adidas" },
  { id: "prov-2", name: "Mayorista Kicks Miami", phone: "+1 305 782 9912", city: "Miami - USA", brands: "Jordan Retro, Yeezy" },
  { id: "prov-3", name: "Distribuidora Streetwear Santa Cruz", phone: "+591 75589123", city: "Santa Cruz de la Sierra", brands: "Vans, Converse, Puma" }
];

// Lista de usuarios (incluye por defecto al Dueño y Vendedor de muestra)
let dbUsers = JSON.parse(localStorage.getItem("shaday_users_list")) || [
  { id: "usr-admin-1", nombre: "Dueño de Tienda (Admin)", email: "admin@shaday.com", rol: "admin", fecha: "01/10/2026" },
  { id: "usr-vend-1", nombre: "Jhasmani Vendedor", email: "jhasmani@shaday.com", rol: "vendedor", fecha: "02/10/2026" }
];

let selectedImageDataUrl = "";

document.addEventListener("DOMContentLoaded", () => {
  if (sessionUser && (sessionUser.rol === "admin" || sessionUser.rol === "vendedor")) {
    document.getElementById("adminUserName").textContent = sessionUser.nombre;
    document.getElementById("adminUserRole").textContent = sessionUser.rol === "admin" ? "Dueño de Tienda (Admin)" : "Vendedor";
    seedInitialDataIfEmpty();
    setupNavigation();
    renderAllViews();
  }
});

function seedInitialDataIfEmpty() {
  if (dbProducts.length === 0) {
    dbProducts = [
      { id: "snk-001", nombre: "Air Jordan 4 Retro Tour Yellow", marca: "Jordan", precio: 950, tallas: [39, 40, 41, 42, 43], badge: "Más Vendido", imagen_url: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=700&q=80", descripcion: "Cuero sintético y malla transpirable con unidad Air-Sole." },
      { id: "snk-002", nombre: "Nike Dunk Low Retro Panda", marca: "Nike", precio: 650, tallas: [38, 39, 40, 41], badge: "Drop Exclusivo", imagen_url: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=700&q=80", descripcion: "Clásico blanco y negro más pedido en streetwear." }
    ];
    saveToStorage("shaday_admin_products", dbProducts);
  }
}

function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Navegación
function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  const panes = document.querySelectorAll(".tab-pane");
  const pageTitle = document.getElementById("pageTitle");
  const pageSubtitle = document.getElementById("pageSubtitle");

  const titles = {
    dashboard: { title: "Resumen General", sub: "Métricas y control de stock de Sneakers Shaday" },
    productos: { title: "Gestión de Productos", sub: "Catálogo de calzados, tallas disponibles y precios" },
    compras: { title: "Compras e Ingreso de Lotes", sub: "Control de compras a proveedores y reposición de stock" },
    ventas: { title: "Ventas Concretadas", sub: "Registro de pedidos confirmados con pagos QR y en efectivo" },
    proveedores: { title: "Directorio de Proveedores", sub: "Gestión de distribuidores de calzado urbano" },
    usuarios: { title: "Usuarios y Vendedores", sub: "Gestión de cuentas y permisos del personal de tienda" }
  };

  navItems.forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      navItems.forEach(b => b.classList.remove("active"));
      panes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(`pane-${tab}`).classList.add("active");

      pageTitle.textContent = titles[tab].title;
      pageSubtitle.textContent = titles[tab].sub;
    });
  });

  document.getElementById("productSearchInput").addEventListener("input", (e) => {
    renderProductsTable(e.target.value.trim().toLowerCase());
  });
}

function renderAllViews() {
  renderDashboardKPIs();
  renderProductsTable();
  renderPurchasesTable();
  renderSalesTable();
  renderProvidersGrid();
  renderUsersTable();
  populateDropdowns();
}

// Dashboard KPIs
function renderDashboardKPIs() {
  document.getElementById("kpiTotalProducts").textContent = dbProducts.length;
  document.getElementById("kpiLowStock").textContent = dbProducts.filter(p => p.tallas.length <= 2).length;
  const totalSales = dbSales.reduce((acc, s) => acc + Number(s.price), 0);
  document.getElementById("kpiTotalSales").textContent = `${totalSales.toLocaleString()} Bs.`;
  const totalPurchases = dbPurchases.reduce((acc, p) => acc + Number(p.total), 0);
  document.getElementById("kpiTotalPurchases").textContent = `${totalPurchases.toLocaleString()} Bs.`;

  const dashSalesList = document.getElementById("dashSalesList");
  dashSalesList.innerHTML = dbSales.length === 0 
    ? `<tr><td colspan="4" class="text-center" style="padding:20px; color:var(--text-muted);">Sin ventas registradas</td></tr>`
    : dbSales.slice(-5).reverse().map(s => `
      <tr>
        <td>${s.date}</td>
        <td><strong>${s.productName}</strong></td>
        <td>Talla ${s.size}</td>
        <td><strong style="color:var(--accent-green);">${s.price} Bs.</strong></td>
      </tr>
    `).join("");

  document.getElementById("dashStockList").innerHTML = dbProducts.map(p => `
    <tr>
      <td><strong>${p.nombre}</strong></td>
      <td>${p.marca}</td>
      <td>${p.tallas.length} tallas</td>
      <td><span class="badge-tag ${p.tallas.length <= 2 ? 'badge-danger' : 'badge-success'}">${p.tallas.length <= 2 ? 'Stock Crítico' : 'Disponible'}</span></td>
    </tr>
  `).join("");
}

// Productos
function renderProductsTable(query = "") {
  const tbody = document.getElementById("productsTableBody");
  const filtered = dbProducts.filter(p => p.nombre.toLowerCase().includes(query) || p.marca.toLowerCase().includes(query));
  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td><img src="${p.imagen_url}" class="table-img" /></td>
      <td><strong>${p.nombre}</strong></td>
      <td><span class="badge-tag">${p.marca}</span></td>
      <td><strong>${p.precio} Bs.</strong></td>
      <td>${p.tallas.map(t => `<span class="badge-tag" style="margin-right:2px;">${t}</span>`).join("")}</td>
      <td><span class="badge-tag badge-success">${p.badge || 'Stock'}</span></td>
      <td>
        <button class="btn-icon-danger" onclick="deleteProduct('${p.id}')"><i class="fa-solid fa-trash-can"></i></button>
      </td>
    </tr>
  `).join("");
}

// Manejo de Fotos
function handleImagePreview(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    selectedImageDataUrl = e.target.result;
    document.getElementById("imagePreview").src = selectedImageDataUrl;
    document.getElementById("previewContainer").style.display = "inline-block";
  };
  reader.readAsDataURL(file);
}

function handleUrlImagePreview(url) {
  if (url.trim().startsWith("http")) {
    selectedImageDataUrl = url.trim();
    document.getElementById("imagePreview").src = selectedImageDataUrl;
    document.getElementById("previewContainer").style.display = "inline-block";
  }
}

function removeSelectedImage() {
  selectedImageDataUrl = "";
  document.getElementById("imagePreview").src = "";
  document.getElementById("previewContainer").style.display = "none";
}

function handleSaveProduct(e) {
  e.preventDefault();
  const selectedSizes = [];
  document.querySelectorAll('input[name="pSizes"]:checked').forEach(cb => selectedSizes.push(Number(cb.value)));
  if (selectedSizes.length === 0) return alert("Selecciona al menos una talla");

  const newSneaker = {
    id: `snk-${Date.now().toString().slice(-4)}`,
    nombre: document.getElementById("pName").value.trim(),
    marca: document.getElementById("pBrand").value,
    precio: Number(document.getElementById("pPrice").value),
    tallas: selectedSizes,
    badge: document.getElementById("pBadge").value,
    imagen_url: selectedImageDataUrl || "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=700&q=80",
    descripcion: document.getElementById("pDesc").value.trim()
  };

  dbProducts.unshift(newSneaker);
  saveToStorage("shaday_admin_products", dbProducts);
  alert("Sneaker añadido al catálogo y sincronizado.");
  closeModal("modalProduct");
  renderAllViews();
}

function deleteProduct(id) {
  if (confirm("¿Eliminar este sneaker?")) {
    dbProducts = dbProducts.filter(p => p.id !== id);
    saveToStorage("shaday_admin_products", dbProducts);
    renderAllViews();
  }
}

// Compras
function calcPurchaseTotal() {
  const qty = Number(document.getElementById("purQty").value) || 0;
  const cost = Number(document.getElementById("purCost").value) || 0;
  document.getElementById("purchaseTotalPreview").textContent = `${(qty * cost).toLocaleString()} Bs.`;
}

function handleSavePurchase(e) {
  e.preventDefault();
  const provider = dbProviders.find(p => p.id === document.getElementById("purProvider").value);
  const product = dbProducts.find(p => p.id === document.getElementById("purProduct").value);
  const qty = Number(document.getElementById("purQty").value);
  const cost = Number(document.getElementById("purCost").value);

  dbPurchases.unshift({
    id: `COM-${Date.now().toString().slice(-4)}`,
    date: new Date().toLocaleDateString("es-BO"),
    provider: provider ? provider.name : "Proveedor",
    productName: product ? product.nombre : "Sneaker",
    invoice: document.getElementById("purInvoice").value || "S/N",
    qty: qty,
    total: qty * cost
  });

  saveToStorage("shaday_admin_purchases", dbPurchases);
  alert("Compra registrada.");
  closeModal("modalPurchase");
  renderAllViews();
}

function renderPurchasesTable() {
  document.getElementById("purchasesTableBody").innerHTML = dbPurchases.map(p => `
    <tr>
      <td><strong>${p.id}</strong></td>
      <td>${p.date}</td>
      <td>${p.provider}</td>
      <td><span class="badge-tag">${p.invoice}</span></td>
      <td>${p.qty} pares (${p.productName})</td>
      <td><strong>${p.total} Bs.</strong></td>
      <td><span class="badge-tag badge-success">Ingresado</span></td>
    </tr>
  `).join("");
}

// Ventas
function updateSalePriceAuto() {
  const prod = dbProducts.find(p => p.id === document.getElementById("saleProduct").value);
  if (prod) document.getElementById("salePrice").value = prod.precio;
}

function handleSaveSale(e) {
  e.preventDefault();
  const prod = dbProducts.find(p => p.id === document.getElementById("saleProduct").value);
  dbSales.unshift({
    id: `VTA-${Date.now().toString().slice(-4)}`,
    date: new Date().toLocaleDateString("es-BO"),
    customer: document.getElementById("saleCustomer").value.trim(),
    productName: prod ? prod.nombre : "Sneaker",
    size: document.getElementById("saleSize").value,
    method: document.getElementById("saleMethod").value,
    price: Number(document.getElementById("salePrice").value)
  });

  saveToStorage("shaday_admin_sales", dbSales);
  alert("Venta registrada.");
  closeModal("modalSale");
  renderAllViews();
}

function renderSalesTable() {
  document.getElementById("salesTableBody").innerHTML = dbSales.map(s => `
    <tr>
      <td>${s.date}</td>
      <td><strong>${s.customer}</strong></td>
      <td>${s.productName}</td>
      <td>Talla ${s.size}</td>
      <td><span class="badge-tag badge-success">${s.method}</span></td>
      <td><strong>${s.price} Bs.</strong></td>
    </tr>
  `).join("");
}

// Proveedores
function renderProvidersGrid() {
  document.getElementById("providersGrid").innerHTML = dbProviders.map(prov => `
    <div class="provider-card">
      <h4><i class="fa-solid fa-building"></i> ${prov.name}</h4>
      <p><i class="fa-brands fa-whatsapp"></i> <strong>Contacto:</strong> ${prov.phone}</p>
      <p><i class="fa-solid fa-location-dot"></i> <strong>Origen:</strong> ${prov.city}</p>
      <p><i class="fa-solid fa-tags"></i> <strong>Marcas:</strong> ${prov.brands}</p>
    </div>
  `).join("");
}

function handleSaveProvider(e) {
  e.preventDefault();
  dbProviders.push({
    id: `prov-${Date.now().toString().slice(-4)}`,
    name: document.getElementById("provName").value.trim(),
    phone: document.getElementById("provPhone").value.trim(),
    city: document.getElementById("provCity").value.trim(),
    brands: document.getElementById("provBrands").value.trim() || "Variadas"
  });
  saveToStorage("shaday_admin_providers", dbProviders);
  alert("Proveedor guardado.");
  closeModal("modalProvider");
  renderAllViews();
}

// ================= GESTIÓN DE USUARIOS Y VENDEDORES (NUEVO) =================
function renderUsersTable() {
  const tbody = document.getElementById("usersTableBody");
  tbody.innerHTML = dbUsers.map((u, idx) => `
    <tr>
      <td><strong>${u.nombre}</strong></td>
      <td>${u.email}</td>
      <td><span class="badge-tag ${u.rol === 'admin' ? 'badge-danger' : 'badge-success'}">${u.rol.toUpperCase()}</span></td>
      <td>${u.fecha || 'Reciente'}</td>
      <td><span class="badge-tag badge-success">Activo</span></td>
      <td>
        ${u.email !== "admin@shaday.com" ? `
          <button class="btn-icon-danger" onclick="deleteUser(${idx})" title="Eliminar usuario">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        ` : '<span style="font-size:0.75rem; color:var(--text-muted);">Dueño Principal</span>'}
      </td>
    </tr>
  `).join("");
}

function handleSaveUser(e) {
  e.preventDefault();
  const nombre = document.getElementById("uName").value.trim();
  const email = document.getElementById("uEmail").value.trim().toLowerCase();
  const rol = document.getElementById("uRole").value;
  const password = document.getElementById("uPassword").value;

  if (dbUsers.some(u => u.email === email)) {
    alert("Ya existe un usuario con este correo.");
    return;
  }

  const newUser = {
    id: `usr-${Date.now().toString().slice(-4)}`,
    nombre: nombre,
    email: email,
    rol: rol,
    password: password,
    fecha: new Date().toLocaleDateString("es-BO")
  };

  dbUsers.push(newUser);
  saveToStorage("shaday_users_list", dbUsers);

  alert(`¡Cuenta creada con éxito para ${nombre} con el rol de ${rol.toUpperCase()}! Ahora este vendedor puede iniciar sesión desde el portal.`);
  closeModal("modalUser");
  document.getElementById("userForm").reset();
  renderUsersTable();
}

function deleteUser(index) {
  if (confirm("¿Deseas revocar el acceso a este usuario?")) {
    dbUsers.splice(index, 1);
    saveToStorage("shaday_users_list", dbUsers);
    renderUsersTable();
  }
}

// Dropdowns
function populateDropdowns() {
  document.getElementById("purProvider").innerHTML = dbProviders.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
  const opts = dbProducts.map(p => `<option value="${p.id}">${p.nombre} - ${p.precio} Bs.</option>`).join("");
  document.getElementById("purProduct").innerHTML = opts;
  document.getElementById("saleProduct").innerHTML = opts;
  updateSalePriceAuto();
}

// Modales
window.openNewProductModal = () => document.getElementById("modalProduct").classList.add("active");
window.openNewPurchaseModal = () => { populateDropdowns(); document.getElementById("modalPurchase").classList.add("active"); };
window.openNewSaleModal = () => { populateDropdowns(); document.getElementById("modalSale").classList.add("active"); };
window.openNewProviderModal = () => document.getElementById("modalProvider").classList.add("active");
window.openNewUserModal = () => document.getElementById("modalUser").classList.add("active");
window.closeModal = (id) => document.getElementById(id).classList.remove("active");

window.logoutAdmin = () => {
  if (confirm("¿Cerrar sesión del panel de control?")) {
    localStorage.removeItem("shaday_current_user");
    window.location.href = "index.html";
  }
};