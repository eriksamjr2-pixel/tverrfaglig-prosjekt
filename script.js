// Handlekurv-logikk

class ShoppingCart {
  constructor() {
    this.items = this.loadFromStorage();
    this.initUI();
  }

  loadFromStorage() {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  }

  saveToStorage() {
    localStorage.setItem("cart", JSON.stringify(this.items));
  }

  addItem(product) {
    const existing = this.items.find((item) => item.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.items.push({ ...product, quantity: 1 });
    }
    this.saveToStorage();
    this.updateUI();
  }

  removeItem(id) {
    this.items = this.items.filter((item) => item.id !== id);
    this.saveToStorage();
    this.updateUI();
  }

  getTotal() {
    return this.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  }

  initUI() {
    const cartBtn = document.getElementById("cartBtn");
    const cartCloseBtn = document.getElementById("cartCloseBtn");
    const cartPanel = document.getElementById("cartPanel");

    if (cartBtn) {
      cartBtn.addEventListener("click", () => {
        cartPanel.classList.add("open");
      });
    }

    if (cartCloseBtn) {
      cartCloseBtn.addEventListener("click", () => {
        cartPanel.classList.remove("open");
      });
    }

    this.updateUI();
  }

  updateUI() {
    const cartCount = document.getElementById("cartCount");
    const cartList = document.getElementById("cartList");
    const emptyCart = document.getElementById("emptyCart");
    const cartTotal = document.getElementById("cartTotal");

    // Oppdater antall i badge
    if (this.items.length > 0) {
      cartCount.textContent = this.items.length;
      cartCount.style.display = "inline-block";
    } else {
      cartCount.style.display = "none";
    }

    // Vise/skjule kurv
    if (this.items.length === 0) {
      emptyCart.style.display = "block";
      cartList.style.display = "none";
    } else {
      emptyCart.style.display = "none";
      cartList.style.display = "block";

      // Bygge item-liste
      cartList.innerHTML = this.items
        .map(
          (item) => `
            <div class="cart-item">
              <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.quantity}x kr ${item.price},-</div>
              </div>
              <button class="cart-item-remove" data-id="${item.id}">Fjern</button>
            </div>
          `,
        )
        .join("");

      // Legg til event-listenere for fjern-knapper
      cartList.querySelectorAll(".cart-item-remove").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = e.target.getAttribute("data-id");
          this.removeItem(id);
        });
      });
    }

    // Oppdater total
    const total = this.getTotal();
    cartTotal.textContent = `kr ${total},-`;
  }
}

// Initialisér handlekurven når siden laster
const cart = new ShoppingCart();

// Eksporter funksjon for å legge til produkt fra produktsiden
window.addToCart = function (productId, name, price) {
  cart.addItem({ id: productId, name, price });
  alert(`${name} lagt til i handlekurven!`);
};
