(() => {
  const grid = document.getElementById("grid");
  const filters = document.getElementById("filters");
  const search = document.getElementById("search");
  const sort = document.getElementById("sort");
  const cartBtn = document.getElementById("cart-btn");
  const cartDrawer = document.getElementById("cart-drawer");
  const cartOverlay = document.getElementById("cart-overlay");
  const cartClose = document.getElementById("cart-close");
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const cartTotal = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkout-btn");
  const toast = document.getElementById("toast");

  const WA = "5493757655746";
  // COTIZACIÓN AUTOMÁTICA DEL DÓLAR BLUE (ARS) — se obtiene de DolarAPI (venta).
  // Si la API no responde, se usa este respaldo fijo (actualizalo manualmente):
  const USD_TO_ARS_FALLBACK = 1240; // 1 US$ = X$ ARS (solo si la API falla)
  let USD_TO_ARS = USD_TO_ARS_FALLBACK;
  const fmt = (n) => "$ " + Math.round(n * USD_TO_ARS).toLocaleString("es-AR");

  // DolarAPI — dólar blue, cotización de VENTA (referencia de reposición de mercadería)
  async function fetchBlueRate() {
    try {
      const res = await fetch("https://dolarapi.com/v1/dolares/blue");
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const venta = Number(data.venta);
      if (!isNaN(venta) && venta > 0) USD_TO_ARS = venta;
    } catch (err) {
      USD_TO_ARS = USD_TO_ARS_FALLBACK; // respaldo: se cae la API → usamos el número fijo
      console.warn("DolarAPI no disponible, usando respaldo:", USD_TO_ARS_FALLBACK);
    }
    renderGrid();
    renderCart();
  }
  const GENDER_LABEL = { F: "Femenino", M: "Masculino", U: "Unisex" };
  let activeFilter = "todos";
  let searchTerm = "";
  let sortBy = "default";
  let cart = JSON.parse(localStorage.getItem("elegance-cart") || "[]");

  // ---------- Lightbox ----------
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.innerHTML = '<span class="lightbox-close">&times;</span><img alt="Foto del perfume">';
  document.body.appendChild(lightbox);
  const lightboxImg = lightbox.querySelector("img");
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.classList.contains("lightbox-close")) lightbox.classList.remove("open");
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") lightbox.classList.remove("open"); });

  function openLightbox(src) { lightboxImg.src = src; lightbox.classList.add("open"); }

  // ---------- Filtering ----------
  function getVisibleProducts() {
    let items = PRODUCTS.filter((p) => {
      const matchFilter = activeFilter === "todos" || p.gender === activeFilter;
      const matchSearch = !searchTerm ||
        (p.brand + " " + p.name).toLowerCase().includes(searchTerm);
      return matchFilter && matchSearch;
    });

    if (sortBy === "price-asc") items = [...items].sort((a, b) => a.final - b.final);
    else if (sortBy === "price-desc") items = [...items].sort((a, b) => b.final - a.final);
    else if (sortBy === "name") items = [...items].sort((a, b) => (a.brand + a.name).localeCompare(b.brand + b.name));
    else if (sortBy === "id") items = [...items].sort((a, b) => b.id - a.id);
    return items;
  }

  // ---------- Helpers ----------
  function imgsOf(p) {
    return (p.imgs && p.imgs.length) ? p.imgs : [p.img];
  }
  function sizeOf(p) {
    const m = p.name.match(/\d+(?:\.\d+)?\s?ml/i);
    return m ? m[0].replace(/\s/g, "").toLowerCase() : "";
  }

  // ---------- Render ----------
  function cardHTML(p) {
    const waMsg = encodeURIComponent(`Hola Elegance, me interesa el ${p.name} (${GENDER_LABEL[p.gender]}) que está a ${fmt(p.final)}.`);
    const hasNotes = p.notes && p.notes.top;
    const imgs = imgsOf(p);
    const size = sizeOf(p);
    const shareMsg = encodeURIComponent(`Mirá este perfume en Elegance: ${p.name} (${GENDER_LABEL[p.gender]}) por ${fmt(p.final)} ${location.href.split('#')[0]}`);
    const thumbs = imgs.length > 1
      ? `<div class="thumb-row">
          ${imgs.map((src, i) => `<button class="thumb ${i === 0 ? 'active' : ''}" data-thumb="${i}" aria-label="Foto ${i + 1}"><img src="${src}" alt="" loading="lazy"></button>`).join("")}
        </div>`
      : "";
    return `
      <article class="card" data-cat="${p.gender}">
        <div class="card-img-wrap">
          <button class="gallery-btn" data-lightbox="${imgs[0]}" aria-label="Ampliar foto">
            <img src="${imgs[0]}" alt="${p.name}" loading="lazy" onerror="this.closest('.card').style.display='none'">
          </button>
          ${thumbs}
        </div>
        <div class="card-body">
          <p class="card-brand">${p.brand}</p>
          <h3 class="card-name">${p.name}</h3>
          <div class="card-meta">
            <p class="card-tag">${GENDER_LABEL[p.gender]}</p>
            ${size ? `<p class="card-size">${size}</p>` : ""}
          </div>
          ${hasNotes ? `<details class="card-notes">
            <summary>Notas de la fragancia</summary>
            <p><strong>Salida:</strong> ${p.notes.top}</p>
            <p><strong>Corazón:</strong> ${p.notes.heart}</p>
            <p><strong>Fondo:</strong> ${p.notes.base}</p>
          </details>` : ""}
          <div class="card-price-row">
            <span class="price-now">${fmt(p.final)}</span>
            <button class="share-btn" data-share="${p.id}" aria-label="Compartir">Compartir</button>
          </div>
          <div class="buy-row">
            <div class="qty" data-id="${p.id}">
              <button data-qdec aria-label="Quitar uno">&minus;</button>
              <span class="qty-val">1</span>
              <button data-qinc aria-label="Sumar uno">+</button>
            </div>
            <button class="add-btn" data-id="${p.id}">Agregar al carrito</button>
          </div>
          <a class="wa-btn" href="https://wa.me/${WA}?text=${waMsg}" target="_blank" rel="noopener">Consultar por WhatsApp</a>
        </div>
      </article>`;
  }

  function renderGrid() {
    const items = getVisibleProducts();
    if (!items.length) {
      grid.innerHTML = '<p style="text-align:center;color:var(--gray)">No hay productos que coincidan con tu búsqueda.</p>';
      return;
    }
    grid.innerHTML = items.map(cardHTML).join("");
  }

  filters.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    renderGrid();
  });

  search.addEventListener("input", () => {
    searchTerm = search.value.trim().toLowerCase();
    renderGrid();
  });

  sort.addEventListener("change", () => {
    sortBy = sort.value;
    renderGrid();
  });

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-btn");
    if (btn) {
      const id = Number(btn.dataset.id);
      const product = PRODUCTS.find((p) => p.id === id);
      if (!product) return;
      const qtyEl = grid.querySelector(`.qty[data-id="${id}"] .qty-val`);
      const qty = qtyEl ? Number(qtyEl.textContent) : 1;
      addToCart(product, qty);
      return;
    }

    const inc = e.target.closest("[data-qinc]");
    if (inc) {
      const val = inc.parentElement.querySelector(".qty-val");
      val.textContent = Math.min(30, Number(val.textContent) + 1);
      return;
    }
    const dec = e.target.closest("[data-qdec]");
    if (dec) {
      const val = dec.parentElement.querySelector(".qty-val");
      val.textContent = Math.max(1, Number(val.textContent) - 1);
      return;
    }

    const thumbBtn = e.target.closest("[data-thumb]");
    if (thumbBtn) {
      const card = thumbBtn.closest(".card");
      const mainImg = card.querySelector(".gallery-btn img");
      const id = Number(card.querySelector(".add-btn").dataset.id);
      const product = PRODUCTS.find((p) => p.id === id);
      const imgs = imgsOf(product);
      mainImg.src = imgs[Number(thumbBtn.dataset.thumb)];
      card.querySelectorAll(".thumb").forEach((t) => t.classList.toggle("active", t === thumbBtn));
      return;
    }

    const zoomBtn = e.target.closest("[data-lightbox]");
    if (zoomBtn) openLightbox(zoomBtn.dataset.lightbox);

    const share = e.target.closest("[data-share]");
    if (share) handleShare(Number(share.dataset.share));
  });

  // ---------- Share ----------
  function handleShare(id) {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) return;
    const text = `Míralo en Elegance: ${p.name} (${GENDER_LABEL[p.gender]}) por ${fmt(p.final)}`;
    const url = location.href.split("#")[0];
    if (navigator.share) {
      navigator.share({ title: "Elegance - Perfumes", text, url }).catch(() => {});
    } else {
      const full = `${text}\n${url}`;
      const fallback = () => window.open(`https://wa.me/?text=${encodeURIComponent(full)}`, "_blank");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(full).then(() => showToast("Enlace copiado, listo para compartir")).catch(fallback);
      } else {
        fallback();
      }
    }
  }

  // ---------- Cart ----------
  function save() { localStorage.setItem("elegance-cart", JSON.stringify(cart)); }

  function addToCart(p, qty = 1) {
    const existing = cart.find((i) => i.id === p.id);
    if (existing) existing.qty += qty;
    else cart.push({ id: p.id, qty });
    save();
    renderCart();
    showToast(p.name + " agregado");
  }

  function changeQty(id, delta) {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
    save();
    renderCart();
  }

  function removeItem(id) {
    cart = cart.filter((i) => i.id !== id);
    save();
    renderCart();
  }

  function renderCart() {
    const count = cart.reduce((a, i) => a + i.qty, 0);
    cartCount.textContent = count;
    cartCount.style.display = count ? "flex" : "none";

    if (!cart.length) {
      cartItems.innerHTML = '<div class="cart-empty">Tu carrito está vacío.<br>Agregá tus fragancias favoritas.</div>';
      cartTotal.textContent = fmt(0);
      return;
    }

    cartItems.innerHTML = cart.map((i) => {
      const p = PRODUCTS.find((x) => x.id === i.id);
      if (!p) return "";
      return `
        <div class="cart-item">
          <img src="${p.img}" alt="${p.name}">
          <div class="cart-item-info">
            <p class="ci-name">${p.name}</p>
            <p class="ci-price">${fmt(p.final * i.qty)}</p>
            <div class="ci-qty">
              <button data-dec="${p.id}" aria-label="Restar">&minus;</button>
              <span>${i.qty}</span>
              <button data-inc="${p.id}" aria-label="Sumar">+</button>
            </div>
          </div>
          <button class="ci-remove" data-rm="${p.id}" aria-label="Eliminar">&times;</button>
        </div>`;
    }).join("");

    const total = cart.reduce((a, i) => a + (PRODUCTS.find((x) => x.id === i.id)?.final || 0) * i.qty, 0);
    cartTotal.textContent = fmt(total);
  }

  cartItems.addEventListener("click", (e) => {
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    const rm = e.target.closest("[data-rm]");
    if (inc) changeQty(Number(inc.dataset.inc), 1);
    if (dec) changeQty(Number(dec.dataset.dec), -1);
    if (rm) removeItem(Number(rm.dataset.rm));
  });

  function openCart() { cartDrawer.classList.add("open"); cartOverlay.classList.add("show"); }
  function closeCart() { cartDrawer.classList.remove("open"); cartOverlay.classList.remove("show"); }

  cartBtn.addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

  checkoutBtn.addEventListener("click", () => {
    if (!cart.length) return;
    const lines = cart.map((i) => {
      const p = PRODUCTS.find((x) => x.id === i.id);
      return `- ${p.name} x${i.qty} = ${fmt(p.final * i.qty)}`;
    });
    const total = cart.reduce((a, i) => a + (PRODUCTS.find((x) => x.id === i.id)?.final || 0) * i.qty, 0);
    const msg = encodeURIComponent(`Hola Elegance, quiero hacer este pedido:\n${lines.join("\n")}\n\nTotal: ${fmt(total)}`);
    window.open(`https://wa.me/${WA}?text=${msg}`, "_blank");
    showToast("¡Gracias por tu pedido en Elegance!");
    cart = [];
    save();
    renderCart();
    closeCart();
  });

  // ---------- Toast ----------
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  renderGrid();
  renderCart();
  fetchBlueRate();
})();