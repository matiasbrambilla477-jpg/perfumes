// js/pricing.js — Motor de precios mayorista B2B (AR$)
// Requiere js/products.js cargado antes (usa PRODUCTS y sus segmentos: p.seg).
// Carga el dolar blue (venta) desde DolarAPI con respaldo fijo configurable.
// Toda la matemática del catálogo mayorista vive acá (una sola fuente de verdad).

var PRICING = (function () {
  var TC_FALLBACK = 1240;        // 1 US$ = X $AR (respaldo si la API falla; ajustar)
  // factorCost: sobreprecio al costo USD para cubrir cruce CDE->Iguazu, flete
  // interno Iguazu->plaza, embalaje y merma. Estimado 8-15%. Ajustar con datos reales.
  var COST_FACTOR = 1.12;

  // Margen BRUTO por segmento sobre el costo puesto en plaza (AR$)
  var SEGMENT_MARGIN = { arabe: 0.25, mid: 0.4, nicho: 0.5, lujo: 0.6 };
  var RETAIL_MARGIN = { arabe: 0.5, mid: 0.65, nicho: 0.8, lujo: 0.9 };

  var BULTO_UNITS = 12;          // unidades por bulto (minimo de compra)
  var BULTO_KG = 9;              // peso medio por bulto (referencia logistica)

  // Escalones de compra (por bultos). factor = descuento sobre precio base.
  var TIERS = [
    { key: "revendedor", label: "Revendedor", bultos: 1, minUnits: 12,  factor: 1.0,  discount: 0 },
    { key: "tienda",     label: "Tienda",     bultos: 2, minUnits: 24,  factor: 0.95, discount: 5 },
    { key: "mayorista",  label: "Mayorista",  bultos: 6, minUnits: 72,  factor: 0.9,  discount: 10 }
  ];

  var tc = TC_FALLBACK;

  function refreshTC() {
    return fetch("https://dolarapi.com/v1/dolares/blue")
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (d) {
        var v = Number(d.venta);
        if (!isNaN(v) && v > 0) { tc = v; }
      })
      .then(function () { return tc; })
      .catch(function () { tc = TC_FALLBACK; return tc; });
  }

  function isSeg(s) { return s === "arabe" || s === "mid" || s === "nicho" || s === "lujo"; }
  function segOf(p) { return isSeg(p.seg) ? p.seg : "mid"; }

  // Costo del producto PUSTO EN PLAZA (AR$), incluye factor logistico.
  function costARS(p) { return p.price * tc * COST_FACTOR; }

  // Precio unitario AR$ redondeado a $100 para un escalon dado.
  function unitPrice(p, tier) {
    var base = costARS(p) * (1 + (SEGMENT_MARGIN[segOf(p)] || SEGMENT_MARGIN.mid)) * (tier ? tier.factor : 1);
    return Math.ceil(base / 100) * 100;
  }

  // Precio retail AR$ (parametro: mismo criterio que la web).
  function retailARS(p) {
    var m = RETAIL_MARGIN[segOf(p)] || RETAIL_MARGIN["mid"];
    return Math.ceil((p.price * tc * (1 + m)) / 100) * 100;
  }

  function tierByKey(k) { return TIERS.find(function (t) { return t.key === k; }) || TIERS[0]; }

  function fmtARS(n) { return "$ " + Math.round(n).toLocaleString("es-AR"); }

  return {
    TC_FALLBACK: TC_FALLBACK,
    getTC: function () { return tc; },
    COST_FACTOR: COST_FACTOR,
    SEGMENT_MARGIN: SEGMENT_MARGIN,
    RETAIL_MARGIN: RETAIL_MARGIN,
    BULTO_UNITS: BULTO_UNITS,
    BULTO_KG: BULTO_KG,
    TIERS: TIERS,
    segOf: segOf,
    costARS: costARS,
    unitPrice: unitPrice,
    retailARS: retailARS,
    tierByKey: tierByKey,
    fmtARS: fmtARS,
    refreshTC: refreshTC
  };
})();