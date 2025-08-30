const WA = "https://wa.me/905471161988";
const $ = (s)=>document.querySelector(s);

document.addEventListener("DOMContentLoaded", () => {
  // Берём элементы ПОСЛЕ загрузки DOM
  const $grid = $("#grid");
  const $search = $("#search");
  const $cat = $("#category");
  const $comp = $("#composition");
  const $print = $("#print");

  // Если это не страница каталога (нет #grid) — тихо выходим
  if (!$grid) return;

  let PRODUCTS = [];

  // Загружаем товары
  fetch("products.json?ts=" + Date.now())
    .then(r => r.json())
    .then(data => { PRODUCTS = data; render(); })
    .catch(err => {
      console.error(err);
      $grid.innerHTML = `<div style="grid-column:1/-1;color:#b91c1c;padding:20px">Ошибка загрузки каталога.</div>`;
    });

  function render(){
    const term = ($search?.value || "").toLowerCase();
    const cat  = ($cat?.value || "");
    const comp = ($comp?.value || "");
    const prn  = ($print?.value || "");

    const list = PRODUCTS.filter(p => {
      const hay = [p.name, p.category, p.print, p.composition, p.width_cm, (p.tags||[]).join(" ")].join(" ").toLowerCase();
      const okT    = term ? hay.includes(term) : true;
      const okC    = cat  ? (p.category||"").toLowerCase().includes(cat.toLowerCase()) : true;
      const okComp = comp ? (p.composition||"").toLowerCase() === comp.toLowerCase() : true;
      const okPrn  = prn  ? (p.print||"").toLowerCase() === prn.toLowerCase() : true;
      return okT && okC && okComp && okPrn;
    });

    $grid.innerHTML = list.map(card).join("") ||
      `<div style="grid-column:1/-1;text-align:center;color:#666;padding:30px">Ничего не найдено.</div>`;
  }

  function card(p){
    const img = (p.images && p.images[0]) || "/assets/placeholder.jpg";
    const msg = encodeURIComponent(
      `Здравствуйте! Хочу заказать:\n`+
      `• ${p.name}\n`+
      (p.sku?`• SKU: ${p.sku}\n`:"")+
      (p.width_cm?`• Ширина: ${p.width_cm} см\n`:"")+
      (p.composition?`• Состав: ${p.composition}\n`:"")+
      `• Цена: $${p.price_usd} / м\n• Кол-во: ___ м\n`+
      ((p.images && p.images[0]) ? `Фото: ${location.origin}${p.images[0]}\n` : "")
    );
    const colorsBadge = Array.isArray(p.variants) && p.variants.length
      ? `<span class="badge">${p.variants.length} цвета</span>` : "";

    return `
      <article class="card">
        <img alt="${p.name}" loading="lazy" src="${img}">
        <div class="pad">
          <div class="badges">
            ${p.print? `<span class="badge">${p.print}</span>`:""}
            ${p.composition? `<span class="badge">${p.composition}</span>`:""}
            ${p.width_cm? `<span class="badge">${p.width_cm} см</span>`:""}
            ${p.category? `<span class="badge">${p.category}</span>`:""}
            ${colorsBadge}
          </div>
          <h3 style="margin:2px 0 6px">${p.name}</h3>
          <div class="price">$${p.price_usd} / м</div>
          <div class="actions">
            <a class="btn" href="product.html?id=${p.id}">Подробнее</a>
            <a class="btn primary" href="${WA}?text=${msg}" target="_blank" rel="noopener">WhatsApp</a>
          </div>
        </div>
      </article>`;
  }

  // Вешаем обработчики только на существующие элементы
  [$search, $cat, $comp, $print].filter(Boolean).forEach(el => el.addEventListener("input", render));
});
