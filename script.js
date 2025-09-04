fetch("products.json")
  .then(res => res.json())
  .then(data => {
    const grid = document.getElementById("products");
    data.forEach(p => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${p.images[0]}" alt="${p.name}">
        <div class="pad">
          <h3>${p.name}</h3>
          <div class="badges">
            <span class="badge">${p.composition}</span>
            <span class="badge">${p.width_cm} см</span>
            <span class="badge">${p.print}</span>
          </div>
          <div class="price">$${p.price_usd} / м</div>
          <a class="btn" href="https://wa.me/905471161988" target="_blank">Заказать</a>
        </div>
      `;
      grid.appendChild(card);
    });
  });