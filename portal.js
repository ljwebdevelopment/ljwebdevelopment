// Firebase config (SAFE to expose)
const firebaseConfig = {
  apiKey: "AIzaSyDBPFR35ijo-UTfnC22y0FR2rVMBVo5RE0",
  authDomain: "lj-web-development-portal.firebaseapp.com",
  projectId: "lj-web-development-portal",
  storageBucket: "lj-web-development-portal.firebasestorage.app",
  messagingSenderId: "1027196050099",
  appId: "1:1027196050099:web:38e50f1be663ec14d62ec6"
};

// Init Firebase safely
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

// Firestore is OPTIONAL on login page; required on dashboard page if you show client data
const hasFirestore = typeof firebase.firestore === "function";
const db = hasFirestore ? firebase.firestore() : null;

/* ============================
   HELPERS
============================ */
function isDashboardPage() {
  // Works on GitHub Pages and local file paths
  const path = (window.location.pathname || "").toLowerCase();
  return path.includes("dashboard");
}

function friendlyAuthError(err) {
  const code = err?.code || "";
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
    return "Incorrect email or password.";
  }
  if (code === "auth/too-many-requests") {
    return "Too many attempts. Please wait a minute and try again.";
  }
  if (code === "auth/invalid-email") {
    return "Please enter a valid email address.";
  }
  if (code === "auth/network-request-failed") {
    return "Network error. Check your connection and try again.";
  }
  return err?.message || "Something went wrong. Please try again.";
}

function setButtonLoading(btn, loadingText = "Signing in…") {
  if (!btn) return () => {};
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.style.opacity = "0.9";
  btn.textContent = loadingText;

  return () => {
    btn.disabled = false;
    btn.style.opacity = "";
    btn.textContent = originalText;
  };
}

/* ============================
   LOGIN
============================ */
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const rememberMe = document.getElementById("rememberMe");
const loginButton = loginForm?.querySelector('button[type="submit"]');

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const emailEl = document.getElementById("email");
  const passEl = document.getElementById("password");

  const email = (emailEl?.value || "").trim();
  const password = passEl?.value || "";

  if (loginError) loginError.textContent = "";

  // Button loading state
  const stopLoading = setButtonLoading(loginButton);

  try {
    // Remember me behavior:
    // - checked: LOCAL (stays signed in after closing browser)
    // - unchecked: SESSION (signs out when browser closes)
    const persistence = rememberMe?.checked
      ? firebase.auth.Auth.Persistence.LOCAL
      : firebase.auth.Auth.Persistence.SESSION;

    await auth.setPersistence(persistence);
    await auth.signInWithEmailAndPassword(email, password);

    window.location.href = "/dashboard.html";
  } catch (err) {
    if (loginError) loginError.textContent = friendlyAuthError(err);
  } finally {
    stopLoading();
  }
});

/* ============================
   DASHBOARD (protected + data)
============================ */
auth.onAuthStateChanged(async (user) => {
  // If you hit dashboard without a user, go to login
  if (!user && isDashboardPage()) {
    window.location.href = "login.html";
    return;
  }

  // If you're on dashboard and Firestore isn't loaded, warn but don't crash
  const planEl = document.getElementById("plan");
  if (user && planEl) {
    if (!db) {
      // You forgot the Firestore script on dashboard.html
      console.warn("Firestore not loaded. Add firebase-firestore-compat.js to dashboard.html if you want client data.");
      planEl.textContent = "—";
      document.getElementById("lastUpdate")?.textContent = "—";
      document.getElementById("notes")?.textContent = "Firestore not enabled on this page.";
      const site = document.getElementById("website");
      if (site) {
        site.textContent = "—";
        site.href = "#";
      }
      return;
    }

    try {
      const snap = await db.collection("clients").doc(user.uid).get();
      if (!snap.exists) {
        planEl.textContent = "—";
        document.getElementById("lastUpdate")?.textContent = "—";
        document.getElementById("notes")?.textContent = "No client record found.";
        const site = document.getElementById("website");
        if (site) {
          site.textContent = "—";
          site.href = "#";
        }
        return;
      }

      const data = snap.data() || {};
      planEl.textContent = data.plan || "—";
      document.getElementById("lastUpdate")?.textContent = data.lastUpdate || "—";
      document.getElementById("notes")?.textContent = data.notes || "—";

      const site = document.getElementById("website");
      if (site) {
        const url = data.website || "—";
        site.textContent = url;
        site.href = data.website || "#";
      }
    } catch (err) {
      console.error("Dashboard data error:", err);
      planEl.textContent = "—";
      document.getElementById("notes")?.textContent = "Could not load dashboard data.";
    }
  }
});

/* ============================
   LOGOUT
============================ */
document.getElementById("logout")?.addEventListener("click", async () => {
  try {
    await auth.signOut();
  } finally {
    window.location.href = "login.html";
  }
});
