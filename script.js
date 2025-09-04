const WA = "https://wa.me/905471161988";
const $ = (s)=>document.querySelector(s);

const $grid = $("#grid");
const $search = $("#search");
const $cat = $("#category");
const $comp = $("#composition");
const $print = $("#print");
const $status = $("#status");

let PRODUCTS = [];

document.addEventListener("DOMContentLoaded", () => {
  boot();
  [$search,$cat,$comp,$print].forEach(el => el.addEventListener("input", render));
});

async function boot(){
  try{
    $status.hidden = true;
    const res = await fetch("products.json?ts="+Date.now(), {cache:"no-store"});
    if(!res.ok) throw new Error("HTTP "+res.status);
    PRODUCTS = await res.json();

    hydrateFilters(PRODUCTS);
    render();
  }catch(err){
    console.error(err);
    $status.textContent = "Ошибка загрузки каталога.";
    $status.hidden = false;
  }
}

function hydrateFilters(list){
  // Заполнить уникальные значения «composition» и «print»
  const uniq = (arr)=>[...new Set(arr.filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ru'));
  const comps = uniq(list.map(p => p.composition));
  const prints = uniq(list.map(p => p.print));

  // Очистить и залить
  $comp.innerHTML = `<option value="">Любой состав</option>` +
    comps.map(v=>`<option>${escapeHtml(v)}</option>`).join("");

  $print.innerHTML = `<option value="">Любая печать</option>` +
    prints.map(v=>`<option>${escapeHtml(v)}</option>`).join("");
}

function render(){
  const term = ($search.value||"").toLowerCase().trim();
  const cat  = ($cat.value||"").toLowerCase().trim();
  const comp = ($comp.value||"").toLowerCase().trim();
  const prn  = ($print.value||"").toLowerCase().trim();

  const list = PRODUCTS.filter(p=>{
    const hay = [
      p.name, p.category, p.kind, p.print, p.composition,
      String(p.width_cm || ""), (p.tags||[]).join(" ")
    ].join(" ").toLowerCase();

    const okT = term? hay.includes(term): true;
    const okC = cat? (p.category||"").toLowerCase() === cat : true;
    const okComp = comp? (p.composition||"").toLowerCase() === comp : true;
    const okPrn = prn? (p.print||"").toLowerCase() === prn : true;
    return okT && okC && okComp && okPrn;
  });

  if(list.length === 0){
    $grid.innerHTML = `<div class="card" style="grid-column:1/-1;text-align:center;color:#667">
      Ничего не найдено. Попробуйте изменить фильтры.
    </div>`;
    return;
  }

  $grid.innerHTML = list.map(card).join("");
}

function card(p){
  // Главное изображение: products.json → images[0]
  // если его нет — пробуем /assets/img/{id}.jpg
  const fallback = "/assets/placeholder.jpg";
  const guess = `/assets/img/${p.id}.jpg`;
  const src = (p.images && p.images[0]) || guess;

  const msg = encodeURIComponent(
    `Здравствуйте! Хочу заказать:\n`+
    `• ${p.name}\n`+
    (p.sku?`• SKU: ${p.sku}\n`:"")+
    (p.width_cm?`• Ширина: ${p.width_cm} см\n`:"")+
    (p.composition?`• Состав: ${p.composition}\n`:"")+
    `• Цена: $${p.price_usd} / м\n• Кол-во: ___ м\n`+
    (src?`Фото: ${location.origin}${src}\n`:"")
  );

  return `
    <article class="card item">
      <img src="${src}" alt="${escapeHtml(p.name)}"
           onerror="this.onerror=null;this.src='${fallback}'" loading="lazy">
      <div class="pad">
        <div class="badges">
          ${p.print? `<span class="badge">${escapeHtml(p.print)}</span>`:""}
          ${p.composition? `<span class="badge">${escapeHtml(p.composition)}</span>`:""}
          ${p.width_cm? `<span class="badge">${p.width_cm} см</span>`:""}
          ${p.category? `<span class="badge">${escapeHtml(p.category)}</span>`:""}
          ${p.variants? `<span class="badge">${p.variants.length} цвета</span>`:""}
        </div>
        <h3 style="margin:2px 0 6px">${escapeHtml(p.name)}</h3>
        <div class="price">$${p.price_usd} / м</div>
        <div class="actions-row">
          <a class="btn small ghost" href="product.html?id=${encodeURIComponent(p.id)}">Подробнее</a>
          <a class="btn small primary" href="${WA}?text=${msg}" target="_blank" rel="noopener">WhatsApp</a>
        </div>
      </div>
    </article>
  `;
}

function escapeHtml(str=""){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}