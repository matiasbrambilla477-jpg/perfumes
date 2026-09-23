// js/shipping.js — Simulador de envíos (peso vs. volumen) — módulo de tarifas
// ESTIMADOR DE REFERENCIA: no consulta APIs en vivo. Los costos se calculan con
// un tarifario paramétrico (base + por kg + zona + modalidad) pensado para
// emitir, en orden de magnitud, el costo de: Correo Argentino, OCA, Andreani y
// Vía Cargo en Argentina. AJUSTÁ los parámetros con tu tarifa real de cada
// empresa (base, perKg, min, doorFactor, ZONE_FACTOR, estKg, dims).

var SHIPPING = (function () {
  // --- Origen del despacho (ajustar a tu operación) ---
  var ORIGIN = { province: "Córdoba", city: "Córdoba" };

  // --- Peso vs. Volumen ---
  var DIVISOR_VOL = 6000;            // cm³ por kg (factor volumétrico estándar)
  var PACK_DIMS = { l: 22, w: 14, h: 10 }; // caja aprox. de 1 perfume (cm)
  var PACK_VOL = PACK_DIMS.l * PACK_DIMS.w * PACK_DIMS.h; // 3080 cm³
  var PACK_KG_EXTRA = 0.15;          // empaque por unidad

  // Peso real estimado por producto (base + por ml + empaque)
  function estKg(p) {
    var m = (p.name || "").match(/(\d+(?:\.\d+)?)\s?ml/i);
    var ml = m ? Number(m[1]) : 100;
    return Math.round((0.35 + 0.0022 * ml + PACK_KG_EXTRA) * 100) / 100;
  }

  // Peso facturable = el mayor entre peso real y peso volumétrico
  function billWeight(kgReal, cm3) {
    return Math.max(kgReal, cm3 / DIVISOR_VOL);
  }

  // --- Zonas: factor por provincia de destino (distancia desde Córdoba) ---
  var ZONE_FACTOR = {
    "Córdoba": 1.00,
    "San Luis": 1.05,
    "La Rioja": 1.10,
    "Santa Fe": 1.10,
    "San Juan": 1.12,
    "Mendoza": 1.15,
    "Catamarca": 1.15,
    "Entre Ríos": 1.15,
    "Santiago del Estero": 1.18,
    "La Pampa": 1.22,
    "Buenos Aires": 1.25,
    "CABA": 1.22,
    "Misiones": 1.15,
    "Corrientes": 1.25,
    "Tucumán": 1.30,
    "Chaco": 1.30,
    "Salta": 1.35,
    "Neuquén": 1.35,
    "Río Negro": 1.38,
    "Jujuy": 1.40,
    "Formosa": 1.40,
    "Chubut": 1.45,
    "Santa Cruz": 1.55,
    "Tierra del Fuego": 1.75
  };

  // --- Tarifas de referencia (AR$). Modelo: (base + perKg×kg) × zona × modalidad → min ---
  var COMPANIES = [
    {
      key: "correo", name: "Correo Argentino",
      base: 3400, perKg: 1450, min: 3400, doorFactor: 1.35,
      days: [4, 7], note: "Envíos a sucursal / encomienda por peso. Puerta a puerta con complemento."
    },
    {
      key: "oca", name: "OCA",
      base: 4200, perKg: 1750, min: 4200, doorFactor: 1.05,
      days: [2, 5], note: "Red por zonas; puerta a puerta incluido en el cálculo."
    },
    {
      key: "andreani", name: "Andreani",
      base: 4700, perKg: 1950, min: 4700, doorFactor: 1.12,
      days: [2, 4], note: "Servicio puerta a puerta, manejo y entrega en sucursal opcional."
    },
    {
      key: "viacargo", name: "Vía Cargo",
      base: 6000, perKg: 3200, min: 6000, doorFactor: 1.2,
      days: [1, 3], note: "Aéreo de cargas, precio por kg con mínimo; la opción más rápida."
    }
  ];

  // Redondeo comercial por kg al alza (las empresas facturan medios kg)
  function roundHalf(n) { return Math.ceil(n * 2) / 2; }

  // Cotiza un envío. opts: {province, mode:"sucursal"|"domicilio", kgReal, cm3}
  function quote(company, opts) {
    var bill = roundHalf(billWeight(opts.kgReal, opts.cm3 || 0));
    var zone = ZONE_FACTOR[opts.province] || 1.2;
    var modeMult = opts.mode === "domicilio" ? company.doorFactor : 1;
    var cost = company.base + company.perKg * bill;
    cost = cost * zone * modeMult;
    cost = Math.max(cost, company.min);
    return {
      key: company.key,
      name: company.name,
      price: Math.round(cost / 10) * 10,
      billKg: bill,
      days: company.days,
      note: company.note
    };
  }

  function quoteAll(opts) {
    return COMPANIES.map(function (c) { return quote(c, opts); })
      .sort(function (a, b) { return a.price - b.price; });
  }

  function provinces() {
    return Object.keys(ZONE_FACTOR).map(function (p) { return { prov: p, factor: ZONE_FACTOR[p] }; });
  }

  return {
    ORIGIN: ORIGIN,
    estKg: estKg,
    billWeight: billWeight,
    PACK_DIMS: PACK_DIMS,
    PACK_VOL: PACK_VOL,
    quoteAll: quoteAll,
    provinces: provinces,
    ZONE_FACTOR: ZONE_FACTOR,
    COMPANIES: COMPANIES
  };
})();