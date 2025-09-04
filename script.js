document.addEventListener("DOMContentLoaded", () => {
  const productList = document.getElementById("productList");
  if (!productList) return;

  fetch("products.json")
    .then(response => response.json())
    .then(products => {
      productList.innerHTML = "";
      products.forEach(product => {
        const card = document.createElement("div");
        card.classList.add("product-card");

        card.innerHTML = `
          <img src="${product.images[0]}" alt="${product.name}">
          <h3>${product.name}</h3>
          <p>${product.composition} | ${product.width_cm} см</p>
          <p class="price">$${product.price_usd} / м</p>
          <a href="https://wa.me/905471161988?text=Интересует: ${product.name}" target="_blank">Заказать</a>
        `;

        productList.appendChild(card);
      });
    })
    .catch(() => {
      productList.innerHTML = "Ошибка загрузки каталога.";
    });
});