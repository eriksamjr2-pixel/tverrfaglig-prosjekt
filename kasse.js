// Kasseside JavaScript

const SHIPPING_COST = 99;

class CheckoutPage {
  constructor() {
    this.cart = this.loadCart();
    this.init();
  }

  loadCart() {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  }

  init() {
    this.renderCartSummary();
    this.attachFormListener();
  }

  renderCartSummary() {
    const container = document.getElementById("cartSummary");

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div class="alert alert-info text-center">
          <p class="mb-0">Handlekurven er tom. <a href="index.html">Gå tilbake og legg til produkter.</a></p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.cart
      .map(
        (item) => `
          <div class="checkout-item">
            <div class="checkout-item-info">
              <div class="checkout-item-name">${item.name}</div>
              <div class="checkout-item-qty">Antall: ${item.quantity}</div>
            </div>
            <div class="checkout-item-price">kr ${item.price * item.quantity},-</div>
          </div>
        `,
      )
      .join("");

    this.updateTotals();
  }

  updateTotals() {
    const subtotal = this.cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const total = subtotal + SHIPPING_COST;

    document.getElementById("subtotal").textContent = `kr ${subtotal},-`;
    document.getElementById("total").textContent = `kr ${total},-`;
  }

  attachFormListener() {
    const form = document.getElementById("checkoutForm");

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = {
          fullName: document.getElementById("fullName").value,
          email: document.getElementById("email").value,
          address: document.getElementById("address").value,
          postalCode: document.getElementById("postalCode").value,
          city: document.getElementById("city").value,
          items: this.cart,
          total: this.getTotal(),
          timestamp: new Date().toISOString(),
        };

        // Lagre bestilling (demo)
        console.log("Bestilling sendt:", formData);

        // Vis bekreftelse
        alert(
          `Takk for bestillingen, ${formData.fullName}!\n\nTotal: kr ${formData.total},-\n\nEn bekreftelse er sendt til ${formData.email}`,
        );

        // Tøm handlekurven
        localStorage.removeItem("cart");

        // Omdirigér til hjemside
        window.location.href = "index.html";
      });
    }
  }

  getTotal() {
    const subtotal = this.cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    return subtotal + SHIPPING_COST;
  }
}

// Initialisér checkout-siden når den laster
document.addEventListener("DOMContentLoaded", () => {
  new CheckoutPage();
});
//TAKK FOR MEG E.S.E
