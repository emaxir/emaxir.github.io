// ========= TexTrend / script.js (robust image resolve) =========
const WA = "https://wa.me/905471161988";
const $ = (s)=>document.querySelector(s);

const $grid=$("#grid"),
      $search=$("#search"),
      $cat=$("#category"),
      $comp=$("#composition"),
      $print=$("#print");

let PRODUCTS=[];

/** Проверяем, грузится ли изображение по url */
function imgExists(url){
  return new Promise(resolve=>{
    const im = new Image();
    im.onload = ()=>resolve(true);
    im.onerror = ()=>resolve(false);
    // добавим cache-buster
    im.src = url + (url.includes("?") ? "&" : "?") + "ts=" + Date.now();
  });
}

/** Подбираем первый рабочий url для картинки товара */
async function pickImageFor(p){
  const candidates = [];

  // 1) что пришло из products.json
  if (Array.isArray(p.images) && p.images[0]) candidates.push(p.images[0]);

  // 2) абсолютный и относительный путь по id
  candidates.push(`/assets/img/${p.id}.jpg`);
  candidates.push(`assets/img/${p.id}.jpg`);

  // 3) если когда-то сохранено в png — тоже попробуем
  candidates.push(`/assets/img/${p.id}.png`);
  candidates.push(`assets/img/${p.id}.png`);

  for (const u of candidates){
    if (await imgExists(u)) return u;
  }
  return "/assets/placeholder.jpg";
}

async function boot(){
  try{
    const res = await fetch("products.json?ts="+Date.now());
    const raw = await res.json();

    // расправим картинки
    const withImgs = [];
    for (const p of raw){
      const url = await pickImageFor(p);
      withImgs.push({...p, images: [url]});
    }
    PRODUCTS = withImgs;

    render();
  }catch(e){
    console.error(e);
    $grid.innerHTML = `<div style="grid-column:1/-1;color:#c00;text-align:center;padding:30px">Ошибка загрузки каталога.</div>`;
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

  $grid.innerHTML = list.map(card).join("")
    || `<div style="grid-column:1/-1;text-align:center;color:#666;padding:30px">Ничего не найдено.</div>`;
}

function card(p){
  const img = (p.images && p.images[0]) || `/assets/img/${p.id}.jpg`;

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
  <article class="card">
    <img alt="${p.name}" loading="lazy" src="${img}"
         onerror="this.onerror=null;this.src='/assets/placeholder.jpg'">
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

document.addEventListener("DOMContentLoaded",()=>{
  boot();
  [$search,$cat,$comp,$print].forEach(el=>el && el.addEventListener("input",render));
});
// ========= /script.js =========