# ELEGANCE — Estrategia B2B Mayorista (Córdoba · Rosario · Buenos Aires)

Documento de operación para el canal mayorista. Complementa los entregables generados:

| Entregable | Ruta |
|---|---|
| Catálogo mayorista (web/PDF/CSV) | `b2b/catalogo-mayorista.html` → abrir y **Imprimir → Guardar como PDF** |
| Lista mayorista para Excel | `b2b/catalogo-mayorista.csv` |
| Motor de precios (parámetros) | `js/pricing.js` |
| Imágenes locales (sin hotlink) | `img/products/*.png` |

---

## 1. Modelo de negocio (operación)

```
PROVEEDOR (Ciudad del Este)
      │  compra en US$ (catálogo proveedor; precio público = nuestro costo de referencia)
      ▼
CRUCE CDE → PUERTO IGUAZÚ
      │  bulto mixto de 12 u (~9 kg), traslado y almacenado en Iguazú
      ▼
VÍA CARGO (desde Iguazú)
      │  envío por bulto a Córdoba / Rosario / Buenos Aires
      ▼
PUNTO DE ENTREGA EN CADA PLAZA (sucursal Vía Cargo / punto propio)
      ▼
TIENDA / REVENDEDOR (cobro: seña + contra entrega, o transferencia + envío)
```

Clave: el bulto es la unidad logística. Todo el pricing se piensa **por bulto** (12 u mixtas, ~9 kg) y se vende **por unidad**, con los costos de flete ya incluidos en el precio (ver §3).

---

## 2. Mínimos de compra por bulto y por plaza

| Plaza | Mínimo de compra | Justificación |
|---|---|---|
| **Córdoba** (base) | 1 bulto = 12 u mixtas (3 a 6 referencias como máximo) | Entrega directa, no hay flete adicional |
| **Rosario** | 2 bultos = 24 u mixtas | Amortiza el bulto de Vía Cargo desde Iguazú |
| **Buenos Aires** (CABA+GBA) | 2 bultos = 24 u (recomendado 3-4 = 36-48 u) | Mismo flete por bulto; conviene consolidar |

Regla de oro: **entre 3 y 6 referencias por bulto**. Menos de 3 = difícil reponer y el cliente no ancla surtido; más de 6 = fraccionás mucho el pedido y el picking se encarece.

Escalones de precio (ya en el catálogo):

| Escalón | Volumen | Descuento sobre precio base |
|---|---|---|
| Revendedor | 1 bulto (12 u) | — |
| Tienda | 2 bultos (24 u) | −5% |
| Mayorista | 6 bultos (72 u) | −10% |

---

## 3. Estructura de precios en AR$

Todo se calcula en `js/pricing.js` (una sola fuente de verdad). La fórmula por unidad:

```
costo puesto en plaza   = costoUS$ × TC_blue × COST_FACTOR
precio por escalón      = costo puesto × (1 + margen_segmento) × factor_escalón   (redondeado a $100)
```

| Parámetro | Valor ej. | Qué cubre / cómo ajustar |
|---|---|---|
| `TC_FALLBACK` | 1240 | Dólar blue de respaldo (se reemplaza solo con DolarAPI). |
| `COST_FACTOR` | 1.12 | Cruce CDE→Iguazú, flete Iguazú→plaza, embalaje, merma. **Calibrar con tu tarifa real de Vía Cargo.** |
| Margen por segmento | ver abajo | Ganancia bruta por segmento. |

Márgenes bruto por segmento (más agresivos donde hay más arbitraje contra Ciudad del Este):

| Segmento | Margen | Lógica |
|---|---|---|
| **Árabe** (Lattafa, Armaf, Al Wataniah, Afnan, Rasasi) | **25%** | Es el segmento donde el cliente cotiza contra CDE; precio tenso, mucha rotación. |
| **Comercial** (CK, Montblanc, Bogart, Ferrari, Animale) | **40%** | Marca conocida, comparación moderada. |
| **Nicho** (French Avenue, Xerjoff) | **50%** | Menos comparadores locales, ticket alto, poca rotación. |
| **Lujo** (Dior, Lancôme, Carolina Herrera) | **60%** | No hay oferta barata local confiable; el cliente paga servicio y disponibilidad. |

Nota de validación: estos márgenes son sobre **costo puesto en plaza**. Con `COST_FACTOR=1.12` + margen de segmento de 25%, revender un árabe de costo US$24 a TC 1240 da ~AR$38.200 → margen bruto ≈ $7.600 por unidad, compitiendo contra el precio CDE + flete del propio cliente.

**Política de precio único por plaza**: misma lista para las 3 plazas (flete incluido). Solo cambia el mínimo. Evita que un revendedor haga arbitraje entre plazas.

Precios del retail (web): `products.js` usa márgenes retail por segmento (arabe 50%, comercial 65%, nicho 80%, lujo 90%) para que la web no canibalice el canal mayorista.

---

## 4. Logística Vía Cargo desde Iguazú

**Cómo opera** (típico): Vía Cargo tiene sucursal en Puerto Iguazú y envía por bulto (por peso ~ kg) a las plazas. Se retira en sucursal de destino o se coordina reparto. Los tiempos son de 24 a 72 hs según conexión.

**Regla práctica por bulto** (bulto mixto de 12 u ≈ 9 kg):

- Córdoba: 1 bulto (9 kg) — entrega directa el mismo día del despacho.
- Rosario / Buenos Aires: consolidar 2-4 bultos por envío para bajar el peso-por-unidad.
- Costo de referencia: el flete no debe superar ≈ 8-12% del valor del bulto para que `COST_FACTOR` siga cerrando. Si tu tarifa real lo supera, ajustás `COST_FACTOR` (no el precio de lista por unidad, que ya publicamos en el catálogo).

**Embalaje**: caja exterior rígida (10-12 kg), interior con plástico de burbuja por frasco, relleno. Frasco dentro de su caja original con precinto.

**Riesgos operativos (sin factura)**:
- Vía Cargo y el transporte de cargas suelen exigir remito/declaración y fecha de vencimiento de mercadería; sin factura podés quedar trabado en la sucursal o ante un control. Mientras no tengas CUIT, usá **remito de constancia / "aviso de envío" con valor declarado** y probá el primer envío antes de escalar.
- Alternativas mientras tanto: encomienda por empresa de colectivos de larga distancia (Iguazú→Rosario/Bs As) y **punto de retiro** en cada plaza.
- Recomendación fuerte a 60 días: dado el volumen en 3 ciudades, te conviene monotributo + factura C (aunque sea vía API gratuita de AFIP) para poder operar transporte formal, ofrecer a tiendas que SÍ piden factura y blindarte ante controles. Es la llave para captar el canal tienda (no solo revendedor).

---

## 5. Plan por plaza (captación de revendedores y tiendas)

### Córdoba (base — entrega en 24 h)
- Blancos: perfumerías y regalarías de barrio, casas de regalo y kioscos premium, locales de indumentaria/unisex de la Peatonal y Nueva Córdoba, bolichos y barberías.
- Táctica: catálogo PDF + **muestra gratis** (kit de 3 testers) al primer pedido; entrega en mano; reposición semanal.
- Oferta de entrada: 12 u mixtas a precio Revendedor con 30 días de cobertura de cambio (fijás la cotización a la compra).

### Rosario
- Blancos: regalarías del centro (Peatonal Córdoba, Palacio Minetti zona), perfumerías de barrios (Pichincha, zona Pellegrini), locales de ropa que revenden fragancias, barberías premium.
- Táctica: mínimo 24 u + catálogo con **casos de surtido armados** (ej. "set mujer 8 u", "set árabe 12 u") para que el local no piense el mix.
- Punto de retiro: sucursal Vía Cargo Rosario o encomienda a domicilio tipo.

### Buenos Aires (CABA + GBA) — la plaza de mayor volumen
- Blancos:
  - **Revendedoras por Instagram** (el canal más rentable y rápido de sumar): buscá hashtags de venta de perfumes / " fábrica de regalos", micro-influencers.
  - Mayoristas y bazares de **Flores / Caballito**, casas de regalo de Belgrano y Villa Crespo.
  - Mercados y paseos del **Gran Buenos Aires (oeste y sur)** con fuerte rotación de regalería (La Salada y periferias, Avellaneda, Morón).
  - Tiendas de indumentaria de Once y floresta que complementan con fragancias.
- Táctica: mínimo 24 u, descuento por volumen explícito (−10% desde 72 u), **referidos pagos**: un revendedor que presenta una tienda nueva suma —2% en su próximo pedido.
- Punto de retiro: sucursal Vía Cargo o pick-up point coordinado por WhatsApp; para revendedoras de Instagram, envío a domicilio contra seña.

### Tácticas B2B comunes (las 3 plazas)
1. **Kit de muestreo**: al primer pedido, testers + un frasco de cortesía (tirá 1 de esas 12 u al precio ya incluido).
2. **Surtidos armados** para no vender "restos" sino metas de venta: estándar 6 / 12 / 24 con mix sugerido por perfil de cliente (mujer/hombre/unisex, árabes/ lujo).
3. **WhatsApp como canal de venta**: entregar el PDF del catálogo + un mensaje tipo con los 8 best-sellers árabes. Seguimiento a 3, 7 y 15 días del primer contacto (reponer antes de que se quede sin stock).
4. **Precios por quincena**: cada 15 días se manda por estado de WhatsApp el TC blue actualizado + listas top rotadoras; genera urgencia ("próxima lista lunes").
5. **Casa/refidora**: para captar el canal tienda formal que pide factura, ese argumento te diferencia del que vende sin documento.

---

## 6. Cadencia operativa semanal

- **Lunes**: cerrar pedidos de la semana (WhatsApp) → armar bultos en CDE/Iguazú.
- **Martes-Miércoles**: crucero y despacho Vía Cargo (o encomienda).
- **Jueves-Viernes**: reparto Córdoba + retiros en Rosario/Bs As; cobrar pendientes.
- **Sábado**: reconciliación, stock real (surtido más vendido), ajuste de TC y listas.
- Consolidar al menos 1 bulto por plaza por envío; el efectivo/cobranza de contado sirve para financiar la reposición siguiente (**pedir el siguiente bulto antes de entregarlo: evita descapitalizarte**).

## 7. Checklist para despegar el canal

- [ ] Verificar tarifa real Vía Cargo Iguazú→Córdoba/Rosario/Bs As (validar `COST_FACTOR`).
- [ ] Abrir `b2b/catalogo-mayorista.html`, chequear que los precios en AR$ cierran con el TC del día → imprimir PDF.
- [ ] Enviar CSV a tu Excel; armar listas por segmento y surtidos armados.
- [ ] Primer envío piloto (1 bulto a cada plaza) para validar plazos y retiros.
- [ ] Definir si el pedido se hace con factura ya mismo (recomendado) o solo remito sin documento (riesgo acotado al comienzo).
- [ ] Publicar link del catálogo mayorista en el sitio (o mantenerlo solo para WhatsApp, según la estrategia de ocultar la fuente).