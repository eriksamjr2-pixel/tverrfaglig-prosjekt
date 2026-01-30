import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

/* SUPABASE */
const supabase = createClient(
  "https://enqtcoensqhabwxdqiba.supabase.co",
  "sb_publishable_0kBQILhwtUU4r9Xxwz1SqQ_XHCTO5GW",
);
async function init() {
  /* ELEMENTER */
  const panel = document.getElementById("authPanel");
  const openBtn =
    document.getElementById("openAuth") ||
    document.getElementById("authOpenBtn");
  const closeBtn =
    document.getElementById("closeAuth") ||
    document.getElementById("authCloseBtn");

  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  const loginMsg = document.getElementById("loginMsg");
  const signupMsg = document.getElementById("signupMsg");

  const tabs = document.querySelectorAll("[data-tab]");

  /* PANEL */
  if (openBtn && panel) {
    openBtn.addEventListener("click", () => {
      panel.classList.add("open");
    });
  } else console.debug("openBtn or panel missing", { openBtn, panel });

  if (closeBtn && panel) {
    closeBtn.addEventListener("click", () => {
      panel.classList.remove("open");
    });
  } else console.debug("closeBtn or panel missing", { closeBtn, panel });

  /* TABS */
  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const tab = btn.dataset.tab;
      if (loginForm) loginForm.style.display = tab === "login" ? "" : "none";
      if (signupForm) signupForm.style.display = tab === "signup" ? "" : "none";
    });
  });

  /* LOGIN */
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (loginMsg) loginMsg.textContent = "Logger inn...";

      const emailEl = document.getElementById("loginEmail");
      const passEl = document.getElementById("loginPass");
      const email = emailEl ? emailEl.value.trim() : "";
      const password = passEl ? passEl.value : "";

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (loginMsg) loginMsg.textContent = "Feil: " + error.message;
        return;
      }

      if (loginMsg) loginMsg.textContent = "Innlogget ✅";
      window.location.href =
        "https://eriksamjr2-pixel.github.io/tverrfaglig-prosjekt/index.html";
    });
  }

  /* SIGNUP */
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (signupMsg) signupMsg.textContent = "Oppretter konto...";

      const emailEl = document.getElementById("signupEmail");
      const passEl = document.getElementById("signupPass");
      const email = emailEl ? emailEl.value.trim() : "";
      const password = passEl ? passEl.value : "";

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signupMsg)
        signupMsg.textContent = error
          ? "Feil: " + error.message
          : "Konto opprettet ✅ Du kan logge inn nå";
    });
  }

  /* AUTO-REDIRECT HVIS INNLOGGET */
  try {
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (user) {
      window.location.href =
        "https://eriksamjr2-pixel.github.io/tverrfaglig-prosjekt/index.html";
    }
  } catch (err) {
    console.error("Error checking auth user:", err);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
//TAKK FOR MEG E.S.E
