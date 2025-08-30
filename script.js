const WA = "https://wa.me/905471161988";
const $ = (s)=>document.querySelector(s);

document.addEventListener("DOMContentLoaded", () => {
  const $grid = $("#grid");
  const $search = $("#search");
  const $cat = $("#category");
  const $kind = $("#kind");
  const $print = $("#print");
  if (!$grid) return;

  const params = new URLSearchParams(location.search);
  // значения из URL (часть применим позже, после загрузки ассортимента)
  const initialCat   = params.get("cat")   || "";
  const initialKind  = params.get("kind")  || "";
  const initialPrint = params.get("print") || "";
  const initialQ     = params.get("q")     || "";

  if ($cat && initialCat)   $cat.value = initialCat;
  if ($print && initialPrint) $print.value = initialPrint;
  if ($search && initialQ)  $search.value = initialQ;

  let PRODUCTS = [];

  fetch("products.json?ts=" + Date.now())
    .then(r => r.json())
    .then(data => {
      PRODUCTS = Array.isArray(data) ? data : [];
      populateKindOptions(PRODUCTS);
      // применим kind из URL после заполнения списка
      if ($kind && initialKind) $kind.value = initialKind;
      render();
    })
    .catch(err => {
      console.error(err);
      $grid.innerHTML = `<div style="grid-column:1/-1;color:#b91c1c;padding:20px">Ошибка загрузки каталога.</div>`;
    });

  function unique(values){
    return [...new Set(values.filter(Boolean))];
  }

  function populateKindOptions(items){
    if(!$kind) return;
    const kinds = unique(items.map(p=> (p.kind||"").trim()));
    // Если есть выбранная категория — ограничим типы этой категорией (удобнее)
    const catVal = ($cat?.value || "").trim();
    const filteredKinds = catVal ? unique(items.filter(p=> (p.category||"")===catVal).map(p=> p.kind||"")) : kinds;
    const options = ['<option value="">Любой тип</option>']
      .concat(filteredKinds.map(k=> `<option>${escapeHtml(k)}</option>`))
      .join("");
    $kind.innerHTML = options;
  }

  function escapeHtml(str){
    return String(str||"").replace(/[&<>"']/g, s => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[s]);
  }

  function render(){
    // если пользователь сменил категорию — обновим доступные типы (kind)
    populateKindOptions(PRODUCTS);

    const term = ($search?.value || "").toLowerCase();
    const cat  = ($cat?.value || "");
    const kind = ($kind?.value || "");
    const prn  = ($print?.value || "");

    const list = PRODUCTS.filter(p => {
      const hay = [p.name, p.category, p.kind, p.print, p.composition, p.width_cm, (p.tags||[]).join(" ")].join(" ").toLowerCase();
      const okT   = term ? hay.includes(term) : true;
      const okC   = cat  ? (p.category||"").toLowerCase().includes(cat.toLowerCase()) : true;
      const okK   = kind ? (p.kind||"").toLowerCase() === kind.toLowerCase() : true;
      const okPrn = prn  ? (p.print||"").toLowerCase() === prn.toLowerCase() : true;
      return okT && okC && okK && okPrn;
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
        <img alt="${p.name}" loading="lazy" src="${img}" onclick="location.href='product.html?id=${p.id}'" style="cursor:pointer">
        <div class="pad">
          <div class="badges">
            ${p.category? `<span class="badge">${p.category}</span>`:""}
            ${p.kind? `<span class="badge">${p.kind}</span>`:""}
            ${p.print? `<span class="badge">${p.print}</span>`:""}
            ${p.composition? `<span class="badge">${p.composition}</span>`:""}
            ${p.width_cm? `<span class="badge">${p.width_cm} см</span>`:""}
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

  // Обработчики (если элементы есть)
  [$search, $cat, $kind, $print].filter(Boolean).forEach(el => el.addEventListener("input", render));
});
