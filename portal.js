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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = (typeof firebase.firestore === "function")
  ? firebase.firestore()
  : null;

/* ============================
   LOGIN
============================ */
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const rememberMe = document.getElementById("rememberMe");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email")?.value.trim() || "";
    const password = document.getElementById("password")?.value || "";

    if (loginError) loginError.textContent = "";

    try {
      const persistence = rememberMe?.checked
        ? firebase.auth.Auth.Persistence.LOCAL
        : firebase.auth.Auth.Persistence.SESSION;

      await auth.setPersistence(persistence);
      await auth.signInWithEmailAndPassword(email, password);

      window.location.href = "dashboard.html";
    } catch (err) {
      if (loginError) loginError.textContent = err.message;
    }
  });
}

/* ============================
   DASHBOARD PROTECTION
============================ */
auth.onAuthStateChanged(async (user) => {
  if (!user && window.location.pathname.includes("dashboard")) {
    window.location.href = "login.html";
  }
});

/* ============================
   LOGOUT
============================ */
const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await auth.signOut();
    window.location.href = "login.html";
  });
}
