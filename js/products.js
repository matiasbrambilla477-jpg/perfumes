// Catálogo Elegance — STOCK REAL (única fuente de verdad)
// Solo los 10 perfumes del stock confirmado.
// retailARS = precio minorista FIJO: $40.000 ARS por unidad.
// Los ítems type:"combo" son packs mayoristas con precio cerrado (5 = $165.000 / 10 = $300.000).

const PRODUCTS = [
  // ---- Combos Mayoristas (precio cerrado) ----
  { id: 988801, type: "combo", units: 5, brand: "ELEGANCE", name: "Combo Pack 5 — Surtido Mayorista", gender: "C", retailARS: 165000, unitPriceARS: 33000, img: "img/products/combo5.png", desc: "Pack de 5 perfumes surtidos de nuestro stock (ideal para revendedores que están arrancando).", members: [887875, 26243, 26300, 760112, 103239] },
  { id: 988802, type: "combo", units: 10, brand: "ELEGANCE", name: "Combo Pack 10 — Catálogo Completo", gender: "C", retailARS: 300000, unitPriceARS: 30000, img: "img/products/combo10.png", desc: "Pack cerrado con los 10 perfumes del stock, sin repetir (para distribuidores).", members: [887875, 21394, 26300, 760111, 760112, 103239, 760113, 2057, 26243, 760114] },

  // ---- Los 10 perfumes del stock (precio minorista fijo $40.000) ----
  { id: 887875, brand: "ARMAF", name: "Club de Nuit EDP 100ml", gender: "M", retailARS: 40000, img: "img/products/887875.png", pitch: "Potente, cítrico y ahumado. El rey indiscutido de los cumplidos." },
  { id: 21394, brand: "LATTAFA", name: "Fakhar Pride Gold Extract EDP 100ml", gender: "U", retailARS: 40000, img: "img/products/21394.jpg", pitch: "Lujoso, especiado y dulce. Una bomba de elegancia." },
  { id: 26300, brand: "LATTAFA", name: "Asad EDP 100ml", gender: "M", retailARS: 40000, img: "img/products/26300.png", pitch: "Masculino, especiado con vainilla y tabaco. Oscuro y seductor." },
  { id: 760111, brand: "LATTAFA", name: "Asad Bourbon EDP 100ml", gender: "M", retailARS: 40000, img: "img/products/760111.png", pitch: "Cálido, amaderado con un toque licoroso y envolvente." },
  { id: 760112, brand: "ASDAAF", name: "Ameerat Al Sharq Parfum 100ml", gender: "F", retailARS: 40000, img: "img/products/760112.png", pitch: "Oriental, ámbar y vainilla profunda. Exótico y duradero." },
  { id: 103239, brand: "ARMAF", name: "Odyssey Mandarin Sky EDP 100ml", gender: "M", retailARS: 40000, img: "img/products/103239.png", pitch: "Fresco, dulce y frutal con un fondo almizclado moderno." },
  { id: 760113, brand: "ASDAAF", name: "Ameerat Al Arab EDP 100ml", gender: "F", retailARS: 40000, img: "img/products/760113.jpg", pitch: "Floral frutal ultra femenino, chispeante y adictivo." },
  { id: 2057, brand: "AL WATANIAH", name: "Sabah Al Ward EDP 100ml", gender: "F", retailARS: 40000, img: "img/products/2057.png", pitch: "Floral blanco elegante, limpio, luminoso y sofisticado." },
  { id: 26243, brand: "LATTAFA", name: "Yara EDP 100ml", gender: "F", retailARS: 40000, img: "img/products/26243.png", pitch: "El viral mundial. Dulce, avainillado cremoso estilo postre." },
  { id: 760114, brand: "LATTAFA", name: "Yara Elixir EDP 100ml", gender: "F", retailARS: 40000, img: "img/products/760114.png", pitch: "La evolución más intensa, ambarina y seductora de la línea Yara." }
];