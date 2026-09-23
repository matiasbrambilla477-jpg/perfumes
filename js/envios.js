// js/envios.js — UI del simulador de envíos (sección + bloque en el carrito)
// Requiere: js/products.js y js/shipping.js cargados previamente.
// Persiste la última selección en localStorage ("elegance-ship").
// Expone window.SHIP_LINE() para que main.js incorpore el envío al pedido por WhatsApp.

(function () {
  if (typeof SHIPPING === "undefined" || typeof PRODUCTS === "undefined") return;

  var shipLine = null; // última cotización elegida: {text, price, prov, company}

  function getCart() {
    try { return JSON.parse(localStorage.getItem("elegance-cart") || "[]"); }
    catch (e) { return []; }
  }

  function cartTotals() {
    var cart = getCart(), kg = 0, n = 0;
    cart.forEach(function (i) {
      var p = PRODUCTS.find(function (x) { return x.id === i.id; });
      if (p) { kg += SHIPPING.estKg(p) * i.qty; n += i.qty; }
    });
    var cm3 = SHIPPING.PACK_VOL * n;
    return { kg: Math.round(kg * 100) / 100, n: n, cm3: cm3 };
  }

  function fillProvince(selId) {
    var el = document.getElementById(selId);
    if (!el) return;
    var opts = SHIPPING.provinces().map(function (z) {
      return '<option value="' + z.prov + '">' + z.prov + "</option>";
    }).join("");
    el.innerHTML = opts;
    var saved = readShip();
    if (saved.prov) {
      for (var i = 0; i < el.options.length; i++) {
        if (el.options[i].value === saved.prov) { el.value = saved.prov; break; }
      }
    }
  }

  function readShip() {
    try { return JSON.parse(localStorage.getItem("elegance-ship") || "null") || {}; }
    catch (e) { return {}; }
  }
  function writeShip(o) {
    localStorage.setItem("elegance-ship", JSON.stringify(o));
  }

  function fmt(n) { return "$ " + Math.round(n).toLocaleString("es-AR"); }

  function companyRow(q, i) {
    var badge = i === 0 ? '<span class="ship-badge">Más barato</span>' : "";
    return '<div class="company-row">' +
      '<div class="cr-info"><strong>' + q.name + "</strong>" + badge +
      "<span>" + q.note + "</span></div>" +
      '<div class="cr-data"><b>' + fmt(q.price) + "</b>" +
      "<span>" + q.days[0] + "–" + q.days[1] + " días · factura " + q.billKg + " kg</span></div>" +
      "</div>";
  }

  function buildResultsHTML(list, opts, w) {
    var vol = (opts.cm3 || 0) / SHIPPING.DIVISOR_VOL;
    var fact = SHIPPING.billWeight? list[0].billKg : 0;
    var modo = opts.mode === "domicilio" ? "Puerta a puerta" : "A sucursal";
    return '<p class="ship-sum">Origen: <b>' + SHIPPING.ORIGIN.city + '</b> · Peso real: <b>' + w.kg + ' kg</b> · Volumétrico: <b>' +
           (vol > 0 ? vol.toFixed(2) : "—") + ' kg</b> · Factura: <b>' + fact + " kg</b> · Modalidad: <b>" + modo + "</b></p>" +
           list.map(companyRow).join("");
  }

  function modeFrom(groupName) {
    var r = document.querySelector('input[name="' + groupName + '"]:checked');
    return (r && r.value) || "sucursal";
  }

  // ---- Sección "Simulador de envíos" ----
  function initSection() {
    var prov = document.getElementById("env-prov");
    var quoteBtn = document.getElementById("env-quote");
    var res = document.getElementById("env-results");
    var useCart = document.getElementById("env-usa-carrito");
    var kgInput = document.getElementById("env-kg");
    if (!prov || !quoteBtn || !res || !useCart || !kgInput) return;

    fillProvince("env-prov");
    var saved = readShip();
    if (saved.mode) {
      var r = document.querySelector('input[name="env-mode"][value="' + (saved.mode === "domicilio" ? "domicilio" : "sucursal") + '"]');
      if (r) r.checked = true;
    }

    function onUseCartToggle() {
      var t = cartTotals();
      if (useCart.checked && t.n === 0) useCart.checked = false;
      kgInput.disabled = useCart.checked;
      if (useCart.checked) kgInput.value = "";
      document.getElementById("env-cart-hint").textContent = useCart.checked
        ? "Se toma tu carrito (" + t.n + " perfume" + (t.n === 1 ? "" : "s") + " ≈ " + t.kg + " kg)."
        : "Escribí un peso aproximado del paquete (p. ej. 1.8 kg por 2-3 perfumes).";
    }
    useCart.addEventListener("change", onUseCartToggle);
    onUseCartToggle();

    // chips de peso rápido
    document.querySelectorAll("[data-setkg]").forEach(function (b) {
      b.addEventListener("click", function () {
        useCart.checked = false;
        kgInput.value = b.dataset.setkg;
        onUseCartToggle();
      });
    });

    quoteBtn.addEventListener("click", function () {
      var t = cartTotals();
      var useCartState = useCart.checked && t.n > 0;
      var kgReal = useCartState ? t.kg : (parseFloat(kgInput.value) || 1);
      var cm3 = useCartState ? t.cm3 : Math.ceil(kgReal / 0.7) * SHIPPING.PACK_VOL;
      var opts = { province: prov.value, mode: modeFrom("env-mode"), kgReal: kgReal, cm3: cm3 };
      var list = SHIPPING.quoteAll(opts);
      res.innerHTML = buildResultsHTML(list, opts, { kg: kgReal, cm3: cm3 });
      shipLine = { text: "Envío a " + prov.value + " (" + list[0].name + ", " + (opts.mode === "domicilio" ? "puerta a puerta" : "a sucursal") + "): " + fmt(list[0].price), price: list[0].price };
      writeShip(Object.assign(saved, { prov: prov.value, mode: opts.mode }));
      res.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  // ---- Bloque dentro del carrito ----
  function initCartBox() {
    var prov = document.getElementById("cart-prov");
    var quoteBtn = document.getElementById("cart-quote");
    var res = document.getElementById("cart-ship");
    var hint = document.getElementById("cart-ship-empty");
    if (!prov || !quoteBtn || !res) return;
    fillProvince("cart-prov");
    var saved = readShip();
    if (saved.mode) {
      var r = document.querySelector('input[name="cart-mode"][value="' + (saved.mode === "domicilio" ? "domicilio" : "sucursal") + '"]');
      if (r) r.checked = true;
    }

    function render() {
      var t = cartTotals();
      if (t.n === 0) { res.innerHTML = ""; if (hint) hint.style.display = "block"; return; }
      if (hint) hint.style.display = "none";
      var opts = { province: prov.value, mode: modeFrom("cart-mode"), kgReal: t.kg, cm3: t.cm3 };
      var list = SHIPPING.quoteAll(opts);
      res.innerHTML = buildResultsHTML(list, opts, t);
      shipLine = { text: "Envío a " + prov.value + " (" + list[0].name + "): " + fmt(list[0].price), price: list[0].price };
      writeShip({ prov: prov.value, mode: opts.mode });
    }
    quoteBtn.addEventListener("click", render);

    // re-calcular cuando cambia el carrito (botón agregar o controles del drawer)
    document.querySelector(".grid").addEventListener("click", function (e) {
      if (e.target.closest(".add-btn")) setTimeout(render, 0);
    });
    document.querySelector(".cart-btn").addEventListener("click", function () { setTimeout(render, 120); });
    document.querySelector("#cart-items").addEventListener("click", function () { setTimeout(render, 0); });
  }

  window.SHIP_LINE = function () { return shipLine; };

  initSection();
  initCartBox();
  fillProvince("env-prov"); // repuebla por si el DOM tardó
})();