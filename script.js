// Константы и удобные селекторы
const WA = "https://wa.me/905471161988";
const $ = s => document.querySelector(s);

// Элементы
const $grid = $("#grid");
const $search = $("#search");
const $cat = $("#category");
const $kind = $("#kind");
const $comp = $("#composition");
const $print = $("#print");

let PRODUCTS = [];

// Поднять каталог
async function boot(){
  try{
    const res = await fetch("products.json?ts="+Date.now());
    PRODUCTS = await res.json();

    // Заполнить выпадающие (kind, composition, print)
    fillFilters(PRODUCTS);

    render();
    [$search,$cat,$kind,$comp,$print].forEach(el => el.addEventListener("input", render));
  }catch(e){
    $grid.innerHTML = `<div class="card" style="color:#a00">Ошибка загрузки каталога.</div>`;
  }
}

function fillFilters(list){
  // Kind
  const kinds = Array.from(new Set(list.map(p => p.kind).filter(Boolean))).sort();
  $kind.innerHTML = `<option value="">Все позиции</option>` + kinds.map(k => `<option>${escapeHtml(k)}</option>`).join("");

  // Composition
  const comps = Array.from(new Set(list.map(p => p.composition).filter(Boolean))).sort();
  $comp.innerHTML = `<option value="">Любой состав</option>` + comps.map(c => `<option>${escapeHtml(c)}</option>`).join("");

  // Print
  const prints = Array.from(new Set(list.map(p => p.print).filter(Boolean))).sort();
  $print.innerHTML = `<option value="">Любая печать</option>` + prints.map(p => `<option>${escapeHtml(p)}</option>`).join("");
}

function render(){
  const term = ($search.value||"").toLowerCase();
  const cat  = ($cat.value||"").toLowerCase();
  const kind = ($kind.value||"").toLowerCase();
  const comp = ($comp.value||"").toLowerCase();
  const prn  = ($print.value||"").toLowerCase();

  const items = PRODUCTS.filter(p=>{
    const hay = [
      p.name, p.category, p.kind, p.print, p.composition, p.width_cm,
      ...(p.tags||[])
    ].join(" ").toLowerCase();

    const okTerm = term ? hay.includes(term) : true;
    const okCat  = cat  ? (p.category||"").toLowerCase() === cat : true;
    const okKind = kind ? (p.kind||"").toLowerCase() === kind : true;
    const okComp = comp ? (p.composition||"").toLowerCase() === comp : true;
    const okPrn  = prn  ? (p.print||"").toLowerCase() === prn : true;

    return okTerm && okCat && okKind && okComp && okPrn;
  });

  if(!items.length){
    $grid.innerHTML = `<div class="card" style="text-align:center;color:#666">Ничего не найдено.</div>`;
    return;
  }

  $grid.innerHTML = items.map(card).join("");
}

function card(p){
  // Картинка: если в products.json стоит placeholder, пробуем /assets/img/<id>.jpg
  let img = (p.images && p.images[0]) ? p.images[0] : "";
  if(!img || /placeholder/i.test(img)){
    img = `/assets/img/${p.id}.jpg`;
  }

  const msg = encodeURIComponent(
    `Здравствуйте! Хочу заказать:\n`+
    `• ${p.name}\n`+
    (p.sku?`• SKU: ${p.sku}\n`:"")+
    (p.width_cm?`• Ширина: ${p.width_cm} см\n`:"")+
    (p.composition?`• Состав: ${p.composition}\n`:"")+
    `• Цена: $${p.price_usd} / м\n• Кол-во: ___ м\n`+
    (img? `Фото: ${location.origin}${img}\n`:"")
  );

  return `
  <article class="prod">
    <img class="prod__img" alt="${escapeHtml(p.name)}" loading="lazy" src="${img}"
         onerror="this.src='/assets/placeholder.jpg'">
    <div class="prod__body">
      <div class="badges">
        ${p.kind? `<span class="badge">${escapeHtml(p.kind)}</span>`:""}
        ${p.composition? `<span class="badge">${escapeHtml(p.composition)}</span>`:""}
        ${p.width_cm? `<span class="badge">${p.width_cm} см</span>`:""}
        ${p.category? `<span class="badge">${escapeHtml(p.category)}</span>`:""}
      </div>
      <h3>${escapeHtml(p.name)}</h3>
      <div class="price">$${p.price_usd} / м</div>
      <div class="actions">
        <a class="btn btn--ghost" href="product.html?id=${encodeURIComponent(p.id)}">Подробнее</a>
        <a class="btn btn--prime" target="_blank" rel="noopener" href="${WA}?text=${msg}">WhatsApp</a>
      </div>
    </div>
  </article>`;
}

// Безопасный текст
function escapeHtml(s){
  return String(s||"").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[m]);
}

document.addEventListener("DOMContentLoaded", boot);