import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://enqtcoensqhabwxdqiba.supabase.co",
  "sb_publishable_0kBQILhwtUU4r9Xxwz1SqQ_XHCTO5GW",
);

const panel = document.getElementById("authPanel");
const openBtn = document.getElementById("authOpenBtn");
const closeBtn = document.getElementById("authCloseBtn");
const userBadge = document.getElementById("authUserBadge");
const loggedOut = document.getElementById("authLoggedOut");
const loggedIn = document.getElementById("authLoggedIn");
const whoami = document.getElementById("whoami");
const roleBadge = document.getElementById("roleBadge");

const tabButtons = document.querySelectorAll("[data-tab]");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const loginMsg = document.getElementById("loginMsg");
const signupMsg = document.getElementById("signupMsg");

// Åpne/lukk panel
openBtn.addEventListener("click", () => {
  panel.classList.add("open");
  panel.inert = false;
});
closeBtn.addEventListener("click", () => {
  panel.classList.remove("open");
  panel.inert = true;
});

// Bytt tab
tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    loginForm.style.display = tab === "login" ? "" : "none";
    signupForm.style.display = tab === "signup" ? "" : "none";
  });
});
/** DOM-avhengig init — kjør når HTML er ferdig lastet */
function init() {
  /** 2) Elementer */
  const panel = document.getElementById("authPanel");
  const openBtn = document.getElementById("authOpenBtn");
  const closeBtn = document.getElementById("authCloseBtn");
  const userBadge = document.getElementById("authUserBadge");
  const loggedOut = document.getElementById("authLoggedOut");
  const loggedIn = document.getElementById("authLoggedIn");
  const whoami = document.getElementById("whoami");
  const roleBadge = document.getElementById("roleBadge");

  const tabButtons = document.querySelectorAll("[data-tab]");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const loginMsg = document.getElementById("loginMsg");
  const signupMsg = document.getElementById("signupMsg");

  /** 3) Åpne/lukk panel */
  if (openBtn) {
    openBtn.addEventListener("click", () => {
      panel.classList.add("open");
      panel.inert = false;
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      panel.classList.remove("open");
      panel.inert = true;
    });
  }

  /** 4) Bytt mellom login/signup */
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.dataset.tab;
      if (loginForm) loginForm.style.display = tab === "login" ? "" : "none";
      if (signupForm) signupForm.style.display = tab === "signup" ? "" : "none";
    });
  });

  /** 5) Oppdater UI */
  async function refreshAuthUI() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      if (loggedOut) loggedOut.style.display = "";
      if (loggedIn) loggedIn.style.display = "none";
      if (userBadge) userBadge.textContent = "";
      return;
    }

    // Les rolle fra profiles-tabellen
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role ?? "user";
    if (loggedOut) loggedOut.style.display = "none";
    if (loggedIn) loggedIn.style.display = "";
    if (whoami) whoami.textContent = `Innlogget som ${user.email}`;
    if (roleBadge) roleBadge.textContent = `Rolle: ${role}`;
    if (userBadge)
      userBadge.textContent = role === "admin" ? "Admin" : "Innlogget";

    // Redirect til index.html
    setTimeout(() => {
      window.location.href = "index.html";
    }, 500);
  }

  /** 6) Login */
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (loginMsg) loginMsg.textContent = "Logger inn...";

      const emailInput = document.getElementById("loginEmail");
      const passInput = document.getElementById("loginPass");
      const email = emailInput ? emailInput.value.trim() : "";
      const pass = passInput ? passInput.value : "";

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      console.log("Login response:", { data, error });

      if (error) {
        if (loginMsg) loginMsg.textContent = "Feil: " + error.message;
        return;
      }

      if (!data.user) {
        if (loginMsg)
          loginMsg.textContent = "Epost ikke bekreftet eller feil info";
        return;
      }

      if (loginMsg) loginMsg.textContent = "Innlogget ✅";
      await refreshAuthUI();
    });
  }

  /** 7) Signup */
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (signupMsg) signupMsg.textContent = "Oppretter...";

      const nameInput = document.getElementById("signupName");
      const emailInput = document.getElementById("signupEmail");
      const passInput = document.getElementById("signupPass");
      const name = nameInput ? nameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
      const pass = passInput ? passInput.value : "";

      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { display_name: name } },
      });

      console.log("Signup response:", { data, error });

      if (signupMsg)
        signupMsg.textContent = error
          ? "Feil: " + error.message
          : "Konto opprettet ✅ Sjekk e-post for bekreftelse.";
    });
  }

  /** 8) Logout */
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      await refreshAuthUI();
    });
  }

  /** 9) Auth state listener */
  supabase.auth.onAuthStateChange(() => refreshAuthUI());
  refreshAuthUI();
}

// Kjør init når dokumentet er klart
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
