document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("productGrid");
  const search = document.getElementById("search");
  const categoryFilter = document.getElementById("categoryFilter");
  const compositionFilter = document.getElementById("compositionFilter");
  const printFilter = document.getElementById("printFilter");

  let products = [];

  fetch("assets/products.json")
    .then(res => res.json())
    .then(data => {
      products = data;
      renderProducts(products);
      populateFilters(products);
    })
    .catch(err => {
      grid.innerHTML = "<p>Ошибка загрузки каталога.</p>";
      console.error(err);
    });

  function renderProducts(items) {
    grid.innerHTML = "";
    if (items.length === 0) {
      grid.innerHTML = "<p>Нет товаров по вашему запросу</p>";
      return;
    }
    items.forEach(prod => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${prod.images[0] || "assets/placeholder.jpg"}" alt="${prod.name}">
        <div class="pad">
          <h3>${prod.name}</h3>
          <p>${prod.composition}</p>
          <p>${prod.width_cm} см</p>
          <p><strong>${prod.price_usd}$ / м</strong></p>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function populateFilters(items) {
    const categories = [...new Set(items.map(p => p.category))];
    categories.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      categoryFilter.appendChild(opt);
    });

    const compositions = [...new Set(items.map(p => p.composition))];
    compositions.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      compositionFilter.appendChild(opt);
    });

    const prints = [...new Set(items.map(p => p.print))];
    prints.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      printFilter.appendChild(opt);
    });
  }

  function filterProducts() {
    const query = search.value.toLowerCase();
    const cat = categoryFilter.value;
    const comp = compositionFilter.value;
    const pr = printFilter.value;

    const filtered = products.filter(p => {
      return (
        (!cat || p.category === cat) &&
        (!comp || p.composition === comp) &&
        (!pr || p.print === pr) &&
        (
          p.name.toLowerCase().includes(query) ||
          p.composition.toLowerCase().includes(query)
        )
      );
    });
    renderProducts(filtered);
  }

  search.addEventListener("input", filterProducts);
  categoryFilter.addEventListener("change", filterProducts);
  compositionFilter.addEventListener("change", filterProducts);
  printFilter.addEventListener("change", filterProducts);
});