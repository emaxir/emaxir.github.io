/* script.js — загружать products.json и рендерить каталог */
const WA = "https://wa.me/905471161988";

function $id(id){ return document.getElementById(id); }

/* элементы — безопасно */
const $grid = $id("grid");
const $search = $id("search");
const $cat = $id("category");
const $comp = $id("composition");
const $print = $id("print");
const $error = $id("error");

let PRODUCTS = [];

/* попытка нескольких путей + обработка ошибок */
async function boot(){
  try{
    await loadProductsWithFallback();
    render();
    attachListeners();
  }catch(err){
    console.error("boot error", err);
    showError("Ошибка загрузки каталога.");
    // оставляем пустой каталог, но интерфейс не падает
  }
}

async function loadProductsWithFallback(){
  const tryPaths = [
    "/products.json",
    "/assets/products.json",
    "/assets/data/products.json"
  ];
  let lastErr = null;
  for(const p of tryPaths){
    try{
      const res = await fetch(p + "?ts=" + Date.now(), {cache: "no-store"});
      if(!res.ok) throw new Error(`fetch ${p} status ${res.status}`);
      const json = await res.json();
      if(!Array.isArray(json)) throw new Error("products.json не массив");
      PRODUCTS = json;
      console.log("Loaded products from", p);
      clearError();
      return;
    }catch(e){
      lastErr = e;
      console.warn("failed to load", p, e);
    }
  }

  // если не удалось — используем минимальный встроенный набор (чтобы было видно интерфейс)
  console.warn("Using fallback product list", lastErr);
  PRODUCTS = FALLBACK_PRODUCTS.slice(); // defined below
  showError("Файл products.json не найден — загружён тестовый набор.");
}

/* безопасно вешаем слушатели */
function attachListeners(){
  if($search) $search.addEventListener("input", render);
  if($cat) $cat.addEventListener("input", render);
  if($comp) $comp.addEventListener("input", render);
  if($print) $print.addEventListener("input", render);
}

/* отобразить сообщение об ошибке */
function showError(text){
  if($error) $error.textContent = text;
}

/* очистить сообщение */
function clearError(){ if($error) $error.textContent = ""; }

/* рендер */
function render(){
  if(!$grid) return;
  const term = ($search && $search.value || "").toLowerCase();
  const cat = ($cat && $cat.value || "").toLowerCase();
  const comp = ($comp && $comp.value || "").toLowerCase();
  const prn = ($print && $print.value || "").toLowerCase();

  const list = PRODUCTS.filter(p=>{
    const hay = [
      p.name || "",
      p.category || "",
      p.print || "",
      p.composition || "",
      String(p.width_cm || ""),
      (p.tags||[]).join(" ")
    ].join(" ").toLowerCase();
    const okT = term ? hay.includes(term) : true;
    const okC = cat ? (p.category||"").toLowerCase().includes(cat) : true;
    const okComp = comp ? (p.composition||"").toLowerCase() === comp : true;
    const okPrn = prn ? (p.print||"").toLowerCase() === prn : true;
    return okT && okC && okComp && okPrn;
  });

  if(!list.length){
    $grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:#666;padding:30px">Ничего не найдено.</div>`;
    return;
  }
  $grid.innerHTML = list.map(card).join("");
}

/* шаблон карточки */
function card(p){
  const img = (p.images && p.images[0]) || "/assets/placeholder.jpg";
  const msg = encodeURIComponent(
    `Здравствуйте! Хочу заказать:\n`+
    `• ${p.name}\n`+
    (p.sku?`• SKU: ${p.sku}\n`:"")+
    (p.width_cm?`• Ширина: ${p.width_cm} см\n`:"")+
    (p.composition?`• Состав: ${p.composition}\n`:"")+
    `• Цена: $${p.price_usd} / м\n• Кол-во: ___ м\n`+
    (p.images && p.images[0] ? `Фото: ${location.origin}${p.images[0]}\n` : "")
  );
  return `<article class="card">
    <img alt="${escapeHtml(p.name||'')}" loading="lazy" src="${img}">
    <div class="pad">
      <div class="badges">
        ${p.print? `<span class="badge">${escapeHtml(p.print)}</span>`:""}
        ${p.composition? `<span class="badge">${escapeHtml(p.composition)}</span>`:""}
        ${p.width_cm? `<span class="badge">${escapeHtml(String(p.width_cm))} см</span>`:""}
        ${p.category? `<span class="badge">${escapeHtml(p.category)}</span>`:""}
        ${p.variants? `<span class="badge">${p.variants.length} цвета</span>`:""}
      </div>
      <h3 style="margin:2px 0 6px">${escapeHtml(p.name)}</h3>
      <div class="price">$${Number(p.price_usd).toFixed(2)} / м</div>
      <div class="actions">
        <a class="btn" href="product.html?id=${encodeURIComponent(p.id)}">Подробнее</a>
        <a class="btn primary" href="${WA}?text=${msg}" target="_blank" rel="noopener">WhatsApp</a>
      </div>
    </div>
  </article>`;
}

/* простая защита от XSS */
function escapeHtml(s){
  return String(s || "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
}

/* минимальный встроенный запас (показывается если внешняя JSON не найдена) */
const FALLBACK_PRODUCTS = [
  {"id":"muslin-4l-solid","name":"Муслин 4 слоя — однотон","category":"Муслин","kind":"4 слоя","print":"Однотон","composition":"100% хлопок","width_cm":"240-250","price_usd":9.50,"images":["/assets/img/muslin-4l-solid.jpg"],"variants":[{"color":"Белый","sku":"MSL4-W","image":"/assets/img/muslin-4l-solid.jpg"},{"color":"Голубой","sku":"MSL4-B","image":"/assets/img/muslin-4l-solid.jpg"}]},
  {"id":"muslin-2l-solid","name":"Муслин 2 слоя — однотон","category":"Муслин","kind":"2 слоя","print":"Однотон","composition":"100% хлопок","width_cm":"160","price_usd":4.80,"images":["/assets/img/muslin-2l-solid.jpg"]},
  {"id":"poplin-solid","name":"Поплин — однотон","category":"Поплин","kind":"Классический","print":"Однотон","composition":"100% хлопок","width_cm":"240","price_usd":2.80,"images":["/assets/img/poplin-solid.jpg"]},
  {"id":"satin-solid","name":"Сатин — однотон","category":"Сатин","kind":"Классический","print":"Однотон","composition":"100% хлопок","width_cm":"240","price_usd":5.20,"images":["/assets/img/satin-solid.jpg"]},
  {"id":"flannel-solid","name":"Фланель — однотон","category":"Фланель","kind":"Классическая","print":"Однотон","composition":"100% хлопок","width_cm":"240","price_usd":4.90,"images":["/assets/img/flannel-solid.jpg"]}
];

document.addEventListener("DOMContentLoaded", boot);