import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/** 1) Koble til Supabase */
const supabase = createClient(
  "https://enqtcoensqhabwxdqiba.supabase.co", // Project URL
  "sb_publishable_0kBQILhwtUU4r9Xxwz1SqQ_XHCTO5GW", // anon key
);

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
openBtn.addEventListener("click", () => {
  panel.classList.add("open");
  panel.inert = false;
});
closeBtn.addEventListener("click", () => {
  panel.classList.remove("open");
  panel.inert = true;
});

/** 4) Bytt mellom login/signup */
tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    loginForm.style.display = tab === "login" ? "" : "none";
    signupForm.style.display = tab === "signup" ? "" : "none";
  });
});

/** 5) Oppdater UI */
async function refreshAuthUI() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    loggedOut.style.display = "";
    loggedIn.style.display = "none";
    userBadge.textContent = "";
    return;
  }

  // Les rolle fra profiles-tabellen
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

  // Redirect til index.html
  setTimeout(() => {
    window.location.href = "index.html";
  }, 500);
}

/** 6) Login */
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginMsg.textContent = "Logger inn...";

  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value;

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
  await refreshAuthUI();
});

/** 7) Signup */
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  signupMsg.textContent = "Oppretter...";

  const name = document.getElementById("signupName").value.trim();
  const email = document
    .getElementById("signupEmail")
    .value.trim()
    .toLowerCase();
  const pass = document.getElementById("signupPass").value;

  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: { data: { display_name: name } },
  });

  console.log("Signup response:", { data, error });

  signupMsg.textContent = error
    ? "Feil: " + error.message
    : "Konto opprettet ✅ Sjekk e-post for bekreftelse.";
});

/** 8) Logout */
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  await refreshAuthUI();
});

/** 9) Auth state listener */
supabase.auth.onAuthStateChange(() => refreshAuthUI());
refreshAuthUI();
