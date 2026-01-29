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

// Refresh UI uten å trigge AbortError
async function refreshAuthUI() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) console.log("Get user error:", error);

    if (!user) {
      loggedOut.style.display = "";
      loggedIn.style.display = "none";
      userBadge.textContent = "";
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role ?? "user";

    loggedOut.style.display = "none";
    loggedIn.style.display = "";
    whoami.textContent = `Innlogget som ${user.email}`;
    roleBadge.textContent = `Rolle: ${role}`;
    userBadge.textContent = role === "admin" ? "Admin" : "Innlogget";

    // Redirect etter UI er oppdatert
    window.location.href = "index.html";
  } catch (err) {
    console.error("refreshAuthUI error:", err);
  }
}

// Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginMsg.textContent = "Logger inn...";

  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    console.log("Login response:", { data, error });

    if (error) {
      loginMsg.textContent = "Feil: " + error.message;
      return;
    }

    if (!data.user) {
      loginMsg.textContent = "Epost ikke bekreftet eller feil info";
      return;
    }

    loginMsg.textContent = "Innlogget ✅";
    await refreshAuthUI(); // nå safe, ingen AbortError
  } catch (err) {
    console.error("Login error:", err);
    loginMsg.textContent = "Noe gikk galt under innlogging";
  }
});

// Signup
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  signupMsg.textContent = "Oppretter...";

  const name = document.getElementById("signupName").value.trim();
  const email = document
    .getElementById("signupEmail")
    .value.trim()
    .toLowerCase();
  const pass = document.getElementById("signupPass").value;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { display_name: name } },
    });

    console.log("Signup response:", { data, error });

    signupMsg.textContent = error
      ? "Feil: " + error.message
      : "Konto opprettet ✅ Sjekk e-post for bekreftelse.";
  } catch (err) {
    console.error("Signup error:", err);
    signupMsg.textContent = "Noe gikk galt under registrering";
  }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await supabase.auth.signOut();
    await refreshAuthUI();
  } catch (err) {
    console.error("Logout error:", err);
  }
});

// Auth state listener
supabase.auth.onAuthStateChange(() => refreshAuthUI());
refreshAuthUI();
