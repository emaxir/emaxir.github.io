document.addEventListener("DOMContentLoaded", () => {
  const productsContainer = document.getElementById("products");

  // Заглушка: здесь подгрузка будет из products.json
  productsContainer.innerHTML = `
    <div class="product-card">
      <img src="assets/muslin.jpg" alt="Муслин 4 слоя">
      <div class="info">
        <h3>Муслин 4 слоя — однотон</h3>
        <p>100% хлопок · 240 см</p>
        <div class="price">$9.5 / м</div>
      </div>
    </div>
  `;
});