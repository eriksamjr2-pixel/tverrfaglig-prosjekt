import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/** 1) Koble til Supabase (BYTT til dine nøkler) */
const supabase = createClient(
  "https://xkjtwmewoqcqmbievuoc.supabase.co", // ← Project URL
  "sb_publishable_-iSCpQNQiil5AEcbVrAaSg_raue1Rg5" // ← anon public key
);

/** 2) Finn elementer */
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
openBtn.addEventListener("click", () => panel.classList.add("open"));
closeBtn.addEventListener("click", () => panel.classList.remove("open"));

/** 4) Bytt mellom "Logg inn" og "Opprett profil" */
tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    loginForm.style.display = tab === "login" ? "" : "none";
    signupForm.style.display = tab === "signup" ? "" : "none";
  });
});

/** 5) Oppdater UI (bruker + rolle) */
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

  // Les rolle fra "profiles" (RLS: bruker kan bare lese sin egen rad)
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
}

/** 6) Logg inn */
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginMsg.textContent = "Logger inn...";
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });
  loginMsg.textContent = error ? "Feil: " + error.message : "Innlogget ✅";
  await refreshAuthUI();
  if (!error) setTimeout(() => panel.classList.remove("open"), 400);
});

/** 7) Opprett bruker */
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  signupMsg.textContent = "Oppretter...";
  const name = document.getElementById("signupName").value.trim();
  const email = document
    .getElementById("signupEmail")
    .value.trim()
    .toLowerCase();
  const pass = document.getElementById("signupPass").value;

  const { error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: { data: { display_name: name } },
  });

  signupMsg.textContent = error
    ? "Feil: " + error.message
    : "Konto opprettet ✅ Du kan logge inn nå.";
});

/** 8) Logg ut */
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  await refreshAuthUI();
});

/** 9) Hold UI i sync */
supabase.auth.onAuthStateChange(() => refreshAuthUI());
refreshAuthUI();
