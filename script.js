// ========= TexTrend / script.js (id→file map + fallback tries) =========
const WA = "https://wa.me/905471161988";
const $  = (s)=>document.querySelector(s);

const $grid=$("#grid"), $search=$("#search"), $cat=$("#category"),
      $comp=$("#composition"), $print=$("#print");

let PRODUCTS=[], LOADED=false;

// 1) Ручная карта соответствий id → относительный путь к файлу в /assets/img
//    (заполнил по твоим загруженным файлам со скринов)
const IMG_MAP = {
  "muslin-2l-printed": "assets/img/muslin-2l-printed.jpg",
  "muslin-2l-solid":   "assets/img/muslin-2l-solid.jpg",
  "muslin-2l-stripe":  "assets/img/muslin-2l-stripe.jpg",
  "muslin-4l-solid":   "assets/img/muslin-4l-solid.jpg",
  "muslin-4l-stripe":  "assets/img/muslin-4l-stripe.jpg",
  "muslin-check-digital": "assets/img/muslin-check-digital.jpg",
  "muslin-check-rotary":  "assets/img/muslin-check-rotary.jpg",
  "muslin-check-solid":   "assets/img/muslin-check-solid.jpg",
  "muslin-hemp":       "assets/img/muslin-hemp.jpg",
  "muslin-jacquard":   "assets/img/muslin-jacquard.jpg",

  "poplin-solid":      "assets/img/poplin-solid.jpg",
  "poplin-rotary":     "assets/img/poplin-rotary.jpg",
  "poplin-digital":    "assets/img/poplin-digital.jpg",
  "poplin-varenny":    "assets/img/poplin-varenny.jpg",

  "satin-solid":       "assets/img/satin-solid.jpg",
};

// 2) Автопоиск по id, если в карте нет
function imageCandidates(id){
  const norm = String(id).trim().replace(/\s+/g,'-');
  const base = `assets/img/${norm}`;
  return [
    `${base}.jpg`,
    `${base}.jpeg`,
    `${base}.JPG`,
    `${base}.png`,
  ];
}

// 3) Встроенный fallback (чтобы не было «квадратиков»)
const FALLBACK_DATA = 'data:image/svg+xml;utf8,'+encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
     <rect width="100%" height="100%" fill="#f2f2f2"/>
     <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
           font-family="Arial,Helvetica,sans-serif" font-size="20" fill="#9aa0a6">
       Фото скоро будет
     </text>
   </svg>`
);

// 4) onerror-перебор кандидатов
function tryNextImage(imgEl){
  try{
    const list = JSON.parse(imgEl.getAttribute('data-candidates')||'[]');
    let i = Number(imgEl.getAttribute('data-idx')||'0');
    if (i < list.length){
      imgEl.src = list[i];
      imgEl.setAttribute('data-idx', String(i+1));
    }else{
      imgEl.onerror = null;
      imgEl.src = FALLBACK_DATA;
    }
  }catch(_){
    imgEl.onerror = null;
    imgEl.src = FALLBACK_DATA;
  }
}

async function boot(){
  try{
    const res = await fetch("products.json?ts="+Date.now());
    const raw = await res.json();

    PRODUCTS = raw.map(p=>{
      // если для id есть явная картинка — ставим её первой
      const fromMap = IMG_MAP[p.id] ? [IMG_MAP[p.id]] : [];
      const cand = [...fromMap, ...imageCandidates(p.id)];
      return {...p, _candidates: cand};
    });

    LOADED = true;
    render();
  }catch(e){
    console.error("Catalog load failed:", e);
    if (!LOADED){
      $grid.innerHTML = `<div style="grid-column:1/-1;color:#c00;text-align:center;padding:30px">
        Ошибка загрузки каталога.</div>`;
    }
  }
}

function render(){
  const term = ($search?.value||"").toLowerCase();
  const cat  = $cat?.value||"";
  const comp = $comp?.value||"";
  const prn  = $print?.value||"";

  const list = PRODUCTS.filter(p=>{
    const hay = [p.name,p.category,p.print,p.composition,p.width_cm,(p.tags||[]).join(" ")].join(" ").toLowerCase();
    const okT = term ? hay.includes(term) : true;
    const okC = cat  ? (p.category||"").toLowerCase().includes(cat.toLowerCase()) : true;
    const okComp = comp ? (p.composition||"").toLowerCase()===comp.toLowerCase() : true;
    const okPrn  = prn  ? (p.print||"").toLowerCase()===prn.toLowerCase() : true;
    return okT && okC && okComp && okPrn;
  });

  $grid.innerHTML = list.map(card).join("") ||
    `<div style="grid-column:1/-1;text-align:center;color:#666;padding:30px">Ничего не найдено.</div>`;
}

function card(p){
  const cands = p._candidates && p._candidates.length ? p._candidates : imageCandidates(p.id);
  const first = cands[0];

  const msg = encodeURIComponent(
    `Здравствуйте! Хочу заказать:\n`+
    `• ${p.name}\n`+
    (p.sku?`• SKU: ${p.sku}\n`:"")+
    (p.width_cm?`• Ширина: ${p.width_cm} см\n`:"")+
    (p.composition?`• Состав: ${p.composition}\n`:"")+
    `• Цена: $${p.price_usd} / м\n• Кол-во: ___ м\n`+
    (first? `Фото: ${location.origin}/${first}\n`:"")
  );

  return `
  <article class="card">
    <img alt="${p.name}" loading="lazy" decoding="async" fetchpriority="low"
         width="800" height="600"
         src=""
         data-candidates='${JSON.stringify(cands)}'
         data-idx="1"
         onerror="tryNextImage(this)">
    <script>(function(el){ el.src = ${JSON.stringify(first)}; })(document.currentScript.previousElementSibling);</script>

    <div class="pad">
      <div class="badges">
        ${p.print? `<span class="badge">${p.print}</span>`:""}
        ${p.composition? `<span class="badge">${p.composition}</span>`:""}
        ${p.width_cm? `<span class="badge">${p.width_cm} см</span>`:""}
        ${p.category? `<span class="badge">${p.category}</span>`:""}
        ${p.variants? `<span class="badge">${p.variants.length} цвета</span>`:""}
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

document.addEventListener("DOMContentLoaded", ()=>{
  boot();
  [$search,$cat,$comp,$print].forEach(el=>el && el.addEventListener("input",render));
});
// ========= /script.js =========