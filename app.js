/**
 * ==========================================================================
 * SNEAKERS SHADAY - INTEGRACIÓN DIRECTA CON SUPABASE Y WHATSAPP
 * Especialidad: Sistemas Informáticos - BTH
 * ==========================================================================
 */

// ==========================================================================
// 1. CONFIGURACIÓN: PEGA TUS CREDENCIALES DE SUPABASE AQUÍ
// ==========================================================================
const SUPABASE_URL = 'https://obzyazdmnzxtwjnxkhkk.supabase.co';
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ienlhemRtbnp4dHdqbnhraGtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MzUzNTMsImV4cCI6MjEwNjMxMTM1M30.yEFpKmFw93CErHtQidD0zMbCbfiEgQ6m0HMWZqJ00QA";

// Configuración general de la tienda
const STORE_CONFIG = {
  storeName: "Sneakers Shaday",
  whatsappNumber: "59169576123", // Reemplazar con el número boliviano (ej: 5917XXXXXXXX)
  currency: "Bs."
};

// ==========================================================================
// 2. RESPALDO LOCAL DE LOS 30 PRODUCTOS (Por si no hay internet o mientras configuras Supabase)
// ==========================================================================
const fallbackSneakers = [
  { id: 'snk-001', nombre: 'Air Jordan 4 Retro Tour Yellow', marca: 'Jordan', precio: 950, tallas: [39,40,41,42,43], badge: 'Más Vendido', imagen_url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=700&q=80', descripcion: 'Silueta icónica con acabado en cuero sintético y malla transpirable. Amortiguación Air-Sole encapsulada.' },
  { id: 'snk-002', nombre: 'Air Jordan 1 Retro Low OG Last Dance', marca: 'Jordan', precio: 780, tallas: [38,39,40,41,42], badge: 'Tendencia', imagen_url: 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&w=700&q=80', descripcion: 'Perfil bajo con mezcla de tonos negros, blancos y rojos legendarios. Suela de goma resistente al asfalto.' },
  { id: 'snk-003', nombre: 'Nike Dunk Low Retro Panda', marca: 'Nike', precio: 650, tallas: [38,39,40,41,42,43], badge: 'Drop Exclusivo', imagen_url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=700&q=80', descripcion: 'El par streetwear más popular. Contraste blanco y negro limpio que combina con cualquier estilo casual.' },
  { id: 'snk-004', nombre: 'Nike Air Bakin Varsity Royal', marca: 'Nike', precio: 890, tallas: [40,41,42,43], badge: 'Exclusivo', imagen_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80', descripcion: 'Líneas fluidas y cámara de aire visible en azul eléctrico. Estilo retro basket para destacar en la calle.' },
  { id: 'snk-005', nombre: 'Adidas Forum Low Classic White', marca: 'Adidas', precio: 590, tallas: [38,39,40,41,42], badge: 'Clásico', imagen_url: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=700&q=80', descripcion: 'Inspirada en el basketball de los años 80, equipada con correa en el tobillo y cuero suave.' },
  { id: 'snk-006', nombre: 'Adidas Yeezy Boost 350 V2 Onyx', marca: 'Adidas', precio: 1100, tallas: [39,40,41,42], badge: 'Premium', imagen_url: 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=700&q=80', descripcion: 'Tecnología Primeknit con entresuela traslúcida que envuelve el revolucionario sistema BOOST.' },
  { id: 'snk-007', nombre: 'New Balance 550 White Green', marca: 'New Balance', precio: 720, tallas: [39,40,41,42,43], badge: 'Retro Trend', imagen_url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=700&q=80', descripcion: 'El regreso de un clásico de 1989. Estética vintage, detalles perforados y logotipo N en verde bosque.' },
  { id: 'snk-008', nombre: 'Air Jordan 9 Retro Space Jam', marca: 'Jordan', precio: 1050, tallas: [40,41,42,43], badge: 'Colección', imagen_url: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=700&q=80', descripcion: 'Edición conmemorativa con grabado multilingüe en la suela y soporte dinámico de tobillo.' },
  { id: 'snk-009', nombre: 'Nike Air Force 1 07 Triple White', marca: 'Nike', precio: 620, tallas: [37,38,39,40,41,42,43,44], badge: 'Básico Esencial', imagen_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=700&q=80', descripcion: 'El clásico en blanco impoluto. Cuero resistente con costuras reforzadas y amortiguación Nike Air.' },
  { id: 'snk-010', nombre: 'Nike SB Dunk Low Pro Wheat', marca: 'Nike', precio: 790, tallas: [39,40,41,42], badge: 'Skate Culture', imagen_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=700&q=80', descripcion: 'Gamuza marrón premium con suela de goma antiadherente diseñada para patinar y vestir.' },
  { id: 'snk-011', nombre: 'Air Jordan 1 High Travis Mocha Custom', marca: 'Jordan', precio: 1250, tallas: [40,41,42,43], badge: 'Ultra Hype', imagen_url: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=700&q=80', descripcion: 'Detalle de Swoosh invertido y tonos café mocha con gamuza suave de alta calidad.' },
  { id: 'snk-012', nombre: 'Adidas Samba OG Cloud White', marca: 'Adidas', precio: 680, tallas: [38,39,40,41,42,43], badge: 'Top Ventas', imagen_url: 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=700&q=80', descripcion: 'Puntera en T de ante con suela de caramelo flexible. La silueta más viral de las redes.' },
  { id: 'snk-013', nombre: 'Adidas Gazelle Indoor Bold Blue', marca: 'Adidas', precio: 640, tallas: [38,39,40,41,42], badge: 'Vintage', imagen_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=700&q=80', descripcion: 'Gamuza azul cobalto vibrante con las tres franjas en blanco y suela clásica translúcida.' },
  { id: 'snk-014', nombre: 'New Balance 2002R Protection Pack Rain Cloud', marca: 'New Balance', precio: 890, tallas: [40,41,42,43], badge: 'Destacado', imagen_url: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=700&q=80', descripcion: 'Efecto deconstruido con capas de ante grisáceo y entresuela N-ergy con amortiguación premium.' },
  { id: 'snk-015', nombre: 'New Balance 9060 Sea Salt Cherry Blossom', marca: 'New Balance', precio: 920, tallas: [38,39,40,41,42], badge: 'Futurista', imagen_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=700&q=80', descripcion: 'Diseño audaz con cápsulas escultóricas y tecnología de absorción de impactos ABZORB.' },
  { id: 'snk-016', nombre: 'Nike Air Max 1 86 Big Bubble', marca: 'Nike', precio: 820, tallas: [39,40,41,42,43], badge: 'Edición Especial', imagen_url: 'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?auto=format&fit=crop&w=700&q=80', descripcion: 'Recreación exacta del lanzamiento original de 1986 con la recámara de aire ampliada.' },
  { id: 'snk-017', nombre: 'Air Jordan 3 Retro White Cement Reimagined', marca: 'Jordan', precio: 1150, tallas: [40,41,42,43,44], badge: 'Colección', imagen_url: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=700&q=80', descripcion: 'Estampado Elephant Print original, cuero granulado y logotipo vintage Nike Air en el talón.' },
  { id: 'snk-018', nombre: 'Air Jordan 11 Retro Jubilee 25th', marca: 'Jordan', precio: 1200, tallas: [40,41,42,43], badge: 'Edición Limitada', imagen_url: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=700&q=80', descripcion: 'Charol negro brillante de corte alto con fibra de carbono real en la placa media.' },
  { id: 'snk-019', nombre: 'Adidas Campus 00s Core Black', marca: 'Adidas', precio: 610, tallas: [37,38,39,40,41,42], badge: 'Streetwear', imagen_url: 'https://images.unsplash.com/photo-1520256862855-398228c41684?auto=format&fit=crop&w=700&q=80', descripcion: 'Estilo skate de los años 2000 con lengüeta acolchada y cordones extra anchos.' },
  { id: 'snk-020', nombre: 'Vans Old Skool Classic Black White', marca: 'Vans', precio: 450, tallas: [37,38,39,40,41,42,43], badge: 'Clásico Skater', imagen_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=700&q=80', descripcion: 'Lona resistente combinada con ante y suela waffle de goma vulcanizada duradera.' },
  { id: 'snk-021', nombre: 'Vans Sk8-Hi Pro Black White', marca: 'Vans', precio: 490, tallas: [38,39,40,41,42], badge: 'Caña Alta', imagen_url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=700&q=80', descripcion: 'Bota acolchada con refuerzo en la puntera para mayor soporte y resistencia al uso continuo.' },
  { id: 'snk-022', nombre: 'Converse Chuck 70 High Vintage Black', marca: 'Converse', precio: 480, tallas: [37,38,39,40,41,42,43], badge: 'Económico', imagen_url: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=700&q=80', descripcion: 'Lona premium de 12 oz, costuras vintage y plantilla OrthoLite acolchada.' },
  { id: 'snk-023', nombre: 'Puma Suede Classic XXI Negro', marca: 'Puma', precio: 470, tallas: [38,39,40,41,42], badge: 'Urbano Retro', imagen_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=700&q=80', descripcion: 'Gamuza auténtica, raya Formstrip distintiva y diseño clásico vigente desde 1968.' },
  { id: 'snk-024', nombre: 'Puma Slipstream Bball Heritage', marca: 'Puma', precio: 540, tallas: [39,40,41,42,43], badge: 'Novedad', imagen_url: 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=700&q=80', descripcion: 'Reinvención del calzado de baloncesto con inserciones geométricas de cuero y ante.' },
  { id: 'snk-025', nombre: 'Air Jordan 1 Mid Chicago Toe', marca: 'Jordan', precio: 850, tallas: [39,40,41,42,43], badge: 'Popular', imagen_url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=700&q=80', descripcion: 'Colores icónicos Chicago Bulls en corte medio para uso diario con gran estilo.' },
  { id: 'snk-026', nombre: 'Nike Cortez Classic Leather White Gym Red', marca: 'Nike', precio: 560, tallas: [38,39,40,41,42], badge: 'Vintage Run', imagen_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=700&q=80', descripcion: 'Diseño liviano de perfil bajo con entresuela de EVA acolchada y estilo retro.' },
  { id: 'snk-027', nombre: 'ASICS GEL-Kayano 14 Metallic Silver', marca: 'ASICS', precio: 860, tallas: [39,40,41,42,43], badge: 'Tendencia Y2K', imagen_url: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=700&q=80', descripcion: 'Estética plateada running de los 2000 con amortiguación GEL y máxima transpirabilidad.' },
  { id: 'snk-028', nombre: 'New Balance 1906R Castlerock', marca: 'New Balance', precio: 880, tallas: [40,41,42,43], badge: 'Tech Runner', imagen_url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=700&q=80', descripcion: 'Estructura técnica con soporte de arco N-lock y absorción superior en cada pisada.' },
  { id: 'snk-029', nombre: 'Adidas Superstar 82 Core White Black', marca: 'Adidas', precio: 580, tallas: [38,39,40,41,42,43], badge: 'Leyenda Urbana', imagen_url: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=700&q=80', descripcion: 'Puntera de concha clásica con tres franjas dentadas en negro. Estilo hip hop incombustible.' },
  { id: 'snk-030', nombre: 'Air Jordan 5 Retro Fire Red Silver Tongue', marca: 'Jordan', precio: 1100, tallas: [40,41,42,43,44], badge: 'Colección', imagen_url: 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=700&q=80', descripcion: 'Lengüeta reflectante 3M y suela con dientes de tiburón inspirados en aviones de combate.' }
];

// ==========================================================================
// 3. ESTADO GLOBAL
// ==========================================================================
let allSneakers = [];
let selectedCategory = "todos";
let selectedSizeFilter = "";
let currentSearchTerm = "";
let currentSortOrder = "default";
let selectedModalProduct = null;
let selectedModalSize = null;

let shoppingCart = JSON.parse(localStorage.getItem("shaday_cart")) || [];

// Elementos del DOM
const productsGrid = document.getElementById("productsGrid");
const resultsCount = document.getElementById("resultsCount");
const searchInput = document.getElementById("searchInput");
const categoryPills = document.querySelectorAll(".pill");
const sizeFilter = document.getElementById("sizeFilter");
const sortFilter = document.getElementById("sortFilter");
const dbStatusBadge = document.getElementById("dbStatusBadge");

// Modal Elements
const productModal = document.getElementById("productModal");
const closeModalBtn = document.getElementById("closeModal");
const modalDetailsContainer = document.getElementById("modalProductDetails");

// Cart Elements
const cartBtn = document.getElementById("cartBtn");
const closeCartBtn = document.getElementById("closeCart");
const cartOverlay = document.getElementById("cartOverlay");
const cartDrawer = document.getElementById("cartDrawer");
const cartItemsList = document.getElementById("cartItemsList");
const cartCountBadge = document.getElementById("cartCount");
const cartTotalPrice = document.getElementById("cartTotalPrice");
const checkoutBtn = document.getElementById("checkoutBtn");
const clearCartBtn = document.getElementById("clearCartBtn");

// ==========================================================================
// 4. CONEXIÓN Y CARGA DESDE SUPABASE
// ==========================================================================
async function initStore() {
  const isConfigured = SUPABASE_URL.startsWith("https://") && SUPABASE_ANON_KEY.length > 20;

  if (isConfigured && window.supabase) {
    try {
      dbStatusBadge.innerHTML = `<i class="fa-solid fa-cloud-arrow-down"></i> Conectando a Supabase...`;
      const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      // Consulta directa a la tabla productos
      const { data, error } = await supabaseClient
        .from('productos')
        .select('*')
        .order('precio', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        allSneakers = data;
        dbStatusBadge.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #4ade80;"></i> Supabase PostgreSQL Conectado (${data.length} pares)`;
      } else {
        throw new Error("No hay productos cargados en la tabla.");
      }
    } catch (err) {
      console.warn("Aviso de Supabase:", err.message);
      dbStatusBadge.innerHTML = `<i class="fa-solid fa-server"></i> Modo Local (${fallbackSneakers.length} pares)`;
      allSneakers = fallbackSneakers;
    }
  } else {
    // Si aún no se colocaron las claves de Supabase
    dbStatusBadge.innerHTML = `<i class="fa-solid fa-shield-halved"></i> Modo Local Activo (${fallbackSneakers.length} pares)`;
    allSneakers = fallbackSneakers;
  }

  renderProducts();
  updateCartBadge();
  setupEventListeners();
}

// ==========================================================================
// 5. RENDERIZACIÓN DE PRODUCTOS
// ==========================================================================
function renderProducts() {
  let filtered = allSneakers.filter(item => {
    const matchesCategory = (selectedCategory === "todos") || 
      (item.marca.toLowerCase() === selectedCategory.toLowerCase());

    const query = currentSearchTerm.toLowerCase();
    const matchesSearch = item.nombre.toLowerCase().includes(query) || 
                          item.marca.toLowerCase().includes(query);

    // Normalizar tallas (por si vienen de array en Postgres o string)
    const tallasArray = Array.isArray(item.tallas) ? item.tallas : JSON.parse(item.tallas || "[]");
    const matchesSize = (selectedSizeFilter === "") || tallasArray.includes(parseInt(selectedSizeFilter));

    return matchesCategory && matchesSearch && matchesSize;
  });

  // Ordenar
  if (currentSortOrder === "price-asc") {
    filtered.sort((a, b) => a.precio - b.precio);
  } else if (currentSortOrder === "price-desc") {
    filtered.sort((a, b) => b.precio - a.precio);
  }

  resultsCount.textContent = `Mostrando ${filtered.length} modelos`;

  if (filtered.length === 0) {
    productsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <i class="fa-solid fa-shoe-prints" style="font-size: 2.8rem; margin-bottom: 14px; display: block; opacity: 0.5;"></i>
        <h3>No se encontraron resultados</h3>
        <p>Prueba buscando con otra marca o eliminando los filtros aplicados.</p>
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
            ${tallasArray.length > 5 ? `<span class="size-mini-tag">+${tallasArray.length - 5}</span>` : ''}
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

// ==========================================================================
// 6. EVENTOS Y FILTROS
// ==========================================================================
function setupEventListeners() {
  searchInput.addEventListener("input", (e) => {
    currentSearchTerm = e.target.value.trim();
    renderProducts();
  });

  categoryPills.forEach(pill => {
    pill.addEventListener("click", () => {
      categoryPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      selectedCategory = pill.dataset.category;
      renderProducts();
    });
  });

  sizeFilter.addEventListener("change", (e) => {
    selectedSizeFilter = e.target.value;
    renderProducts();
  });

  sortFilter.addEventListener("change", (e) => {
    currentSortOrder = e.target.value;
    renderProducts();
  });

  closeModalBtn.addEventListener("click", closeProductModal);
  productModal.addEventListener("click", (e) => {
    if (e.target === productModal) closeProductModal();
  });

  cartBtn.addEventListener("click", openCart);
  closeCartBtn.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  clearCartBtn.addEventListener("click", clearCart);
  checkoutBtn.addEventListener("click", checkoutWhatsAppCart);
}

// ==========================================================================
// 7. MODAL DETALLE DE PRODUCTO
// ==========================================================================
window.openProductModal = function(productId) {
  const product = allSneakers.find(p => p.id === productId);
  if (!product) return;

  selectedModalProduct = product;
  const tallasArray = Array.isArray(product.tallas) ? product.tallas : [];
  selectedModalSize = tallasArray[0] || 40;

  modalDetailsContainer.innerHTML = `
    <div class="modal-grid">
      <div class="modal-img-col">
        <img src="${product.imagen_url}" alt="${product.nombre}" />
      </div>
      <div class="modal-info-col">
        <span class="modal-brand">${product.marca} - Streetwear</span>
        <h2 class="modal-title">${product.nombre}</h2>
        <div class="modal-price">${product.precio} ${STORE_CONFIG.currency}</div>
        <p class="modal-desc">${product.descripcion}</p>

        <div class="size-selector-title">
          <span>Selecciona tu Talla:</span>
          <span style="color: var(--accent-green); font-size: 0.82rem;"><i class="fa-solid fa-check"></i> Stock Disponible</span>
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
            <i class="fa-solid fa-bag-shopping"></i> Añadir a mi Carrito
          </button>
        </div>
      </div>
    </div>
  `;

  productModal.classList.add("active");
};

window.selectModalSize = function(size, btnElement) {
  selectedModalSize = size;
  document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("selected"));
  btnElement.classList.add("selected");
};

function closeProductModal() {
  productModal.classList.remove("active");
  selectedModalProduct = null;
  selectedModalSize = null;
}

// ==========================================================================
// 8. PEDIDO DIRECTO POR WHATSAPP (1 PAR)
// ==========================================================================
window.orderSingleProductWhatsApp = function() {
  if (!selectedModalProduct || !selectedModalSize) return;

  const msg = `¡Hola *${STORE_CONFIG.storeName}*! 👋👟\n` +
    `Vi este modelo en su catálogo web y me interesa adquirirlo:\n\n` +
    `📌 *Modelo:* ${selectedModalProduct.nombre}\n` +
    `🏷️ *Marca:* ${selectedModalProduct.marca}\n` +
    `📏 *Talla solicitada:* ${selectedModalSize}\n` +
    `💰 *Precio:* ${selectedModalProduct.precio} ${STORE_CONFIG.currency}\n\n` +
    `¿Tienen stock disponible para entrega inmediata o envío? ¡Gracias!`;

  window.open(`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank");
};

// ==========================================================================
// 9. CARRITO DE COMPRAS Y PEDIDO COMPLETO
// ==========================================================================
window.quickAddToCart = function(productId) {
  const product = allSneakers.find(p => p.id === productId);
  if (!product) return;
  const tallasArray = Array.isArray(product.tallas) ? product.tallas : [40];
  addToCartLogic(product, tallasArray[0]);
};

window.addModalProductToCart = function() {
  if (!selectedModalProduct || !selectedModalSize) return;
  addToCartLogic(selectedModalProduct, selectedModalSize);
  closeProductModal();
  openCart();
};

function addToCartLogic(product, size) {
  const existingItem = shoppingCart.find(item => item.id === product.id && item.size === size);

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    shoppingCart.push({
      id: product.id,
      name: product.nombre,
      price: product.precio,
      image: product.imagen_url,
      size: size,
      qty: 1
    });
  }

  saveCart();
  updateCartBadge();
  renderCartDrawer();
}

function saveCart() {
  localStorage.setItem("shaday_cart", JSON.stringify(shoppingCart));
}

function updateCartBadge() {
  const total = shoppingCart.reduce((sum, item) => sum + item.qty, 0);
  cartCountBadge.textContent = total;
}

function openCart() {
  renderCartDrawer();
  cartOverlay.classList.add("active");
  cartDrawer.classList.add("active");
}

function closeCart() {
  cartOverlay.classList.remove("active");
  cartDrawer.classList.remove("active");
}

function renderCartDrawer() {
  if (shoppingCart.length === 0) {
    cartItemsList.innerHTML = `
      <div class="cart-empty-msg">
        <i class="fa-solid fa-cart-arrow-down"></i>
        <h4>Tu carrito está vacío</h4>
        <p>Explora el catálogo y añade tus sneakers favoritos.</p>
      </div>
    `;
    cartTotalPrice.textContent = `0 ${STORE_CONFIG.currency}`;
    checkoutBtn.style.opacity = "0.5";
    checkoutBtn.style.pointerEvents = "none";
    return;
  }

  checkoutBtn.style.opacity = "1";
  checkoutBtn.style.pointerEvents = "all";

  let total = 0;
  cartItemsList.innerHTML = shoppingCart.map((item, index) => {
    const subtotal = item.price * item.qty;
    total += subtotal;
    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
        <div class="cart-item-info">
          <h4 class="cart-item-title">${item.name}</h4>
          <div class="cart-item-meta">Talla: <strong>${item.size}</strong> | Cant: ${item.qty}</div>
          <div class="cart-item-price">${subtotal} ${STORE_CONFIG.currency}</div>
        </div>
        <button class="cart-item-remove" onclick="removeCartItem(${index})" title="Quitar">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;
  }).join("");

  cartTotalPrice.textContent = `${total} ${STORE_CONFIG.currency}`;
}

window.removeCartItem = function(index) {
  shoppingCart.splice(index, 1);
  saveCart();
  updateCartBadge();
  renderCartDrawer();
};

function clearCart() {
  if (shoppingCart.length === 0) return;
  if (confirm("¿Deseas vaciar el carrito?")) {
    shoppingCart = [];
    saveCart();
    updateCartBadge();
    renderCartDrawer();
  }
}

function checkoutWhatsAppCart() {
  if (shoppingCart.length === 0) return;

  let totalOrder = 0;
  let itemsListText = "";

  shoppingCart.forEach((item, i) => {
    const sub = item.price * item.qty;
    totalOrder += sub;
    itemsListText += `${i + 1}. *${item.name}*\n   - Talla: ${item.size}\n   - Cantidad: ${item.qty}\n   - Subtotal: ${sub} ${STORE_CONFIG.currency}\n`;
  });

  const msg = `¡Hola *${STORE_CONFIG.storeName}*! 🛒👟\n` +
    `Deseo realizar el siguiente pedido desde su catálogo web:\n\n` +
    `*RESUMEN DEL PEDIDO:*\n` +
    `${itemsListText}\n` +
    `💵 *TOTAL A PAGAR:* ${totalOrder} ${STORE_CONFIG.currency}\n\n` +
    `Por favor, me envían el código QR para realizar la transferencia y coordinar la entrega. ¡Muchas gracias!`;

  window.open(`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank");
}

// INICIAR AL CARGAR
document.addEventListener("DOMContentLoaded", initStore);