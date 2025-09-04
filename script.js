// ===== Константы и элементы
const WA = "https://wa.me/905471161988";
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

const $grid = $("#grid");
const $search = $("#search");
const $cat = $("#category");
const $pos = $("#position");
const $comp = $("#composition");
const $print = $("#print");

let PRODUCTS = [];

// ===== Загрузка каталога и инициализация
async function boot(){
  try{
    const res = await fetch("products.json?ts="+Date.now());
    PRODUCTS = await res.json();

    buildFiltersFromData(PRODUCTS);
    render();
    [$search,$cat,$pos,$comp,$print].forEach(el => el.addEventListener("input", render));
  }catch(e){
    $grid.innerHTML = `<div class="card" style="grid-column:1/-1;color:#b00020">
      Ошибка загрузки каталога.
    </div>`;
    console.error(e);
  }
}

// ===== Построение списков селектов из данных
function buildFiltersFromData(list){
  fillSelect($cat, ["Все категории", ...uniq(list.map(p=>p.category).filter(Boolean))]);
  fillSelect($pos, ["Все позиции", ...uniq(list.map(p=>p.kind).filter(Boolean))]);
  fillSelect($comp, ["Любой состав", ...uniq(list.map(p=>p.composition).filter(Boolean))]);
  fillSelect($print, ["Любая печать", ...uniq(list.map(p=>p.print).filter(Boolean))]);
}
function fillSelect(sel, items){
  sel.innerHTML = items.map((t,i)=>`<option value="${i===0?"":escapeAttr(t)}">${t}</option>`).join("");
}
function escapeAttr(s){ return String(s).replace(/"/g,"&quot;"); }
function uniq(arr){ return [...new Set(arr)]; }

// ===== Рендер каталога
function render(){
  const term = ($search.value||"").toLowerCase();
  const cat = $cat.value||"";
  const pos = $pos.value||"";
  const comp = $comp.value||"";
  const prn = $print.value||"";

  const list = PRODUCTS.filter(p=>{
    const hay = [p.name,p.category,p.kind,p.print,p.composition,p.width_cm,(p.tags||[]).join(" ")].join(" ").toLowerCase();
    const okT = term ? hay.includes(term) : true;
    const okC = cat ? (p.category||"").toLowerCase()===cat.toLowerCase() : true;
    const okP = pos ? (p.kind||"").toLowerCase()===pos.toLowerCase() : true;
    const okComp = comp ? (p.composition||"").toLowerCase()===comp.toLowerCase() : true;
    const okPrn = prn ? (p.print||"").toLowerCase()===prn.toLowerCase() : true;
    return okT && okC && okP && okComp && okPrn;
  });

  $grid.innerHTML = list.map(card).join("") ||
    `<div class="card" style="grid-column:1/-1;text-align:center;color:#71808d;padding:26px">
       Ничего не найдено.
     </div>`;
}

function card(p){
  const img = (p.images && p.images[0]) || "";
  const hasImg = Boolean(img);
  const msg = encodeURIComponent(
    `Здравствуйте! Хочу заказать:\n`+
    `• ${p.name}\n`+
    (p.sku?`• SKU: ${p.sku}\n`:"")+
    (p.width_cm?`• Ширина: ${p.width_cm} см\n`:"")+
    (p.composition?`• Состав: ${p.composition}\n`:"")+
    `• Цена: $${p.price_usd} / м\n• Кол-во: ___ м\n`+
    (hasImg ? `Фото: ${location.origin}${img}\n` : "")
  );

  return `
  <article class="card product">
    ${hasImg
      ? `<img alt="${escapeAttr(p.name)}" loading="lazy" src="${img}">`
      : `<div class="ph">Фото скоро будет</div>`
    }
    <div class="pad">
      <div class="badges">
        ${p.print? `<span class="badge">${p.print}</span>`:""}
        ${p.kind? `<span class="badge">${p.kind}</span>`:""}
        ${p.composition? `<span class="badge">${p.composition}</span>`:""}
        ${p.width_cm? `<span class="badge">${p.width_cm} см</span>`:""}
        ${p.category? `<span class="badge">${p.category}</span>`:""}
      </div>
      <h3 style="margin:2px 0 6px">${p.name}</h3>
      <div class="price">$${p.price_usd} / м</div>
      <div class="actions">
        <a class="btn" href="product.html?id=${encodeURIComponent(p.id)}">Подробнее</a>
        <a class="btn primary" href="${WA}?text=${msg}" target="_blank" rel="noopener">WhatsApp</a>
      </div>
    </div>
  </article>`;
}

// Старт
document.addEventListener("DOMContentLoaded", boot);