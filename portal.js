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

// Only create Firestore if the library is loaded on this page
const db = (typeof firebase.firestore === "function")
  ? firebase.firestore()
  : null;

console.log("Firebase ready:", {
  auth: !!auth,
  firestore: !!db
});



/* ============================
   LOGIN
============================ */
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    window.location.href = "dashboard.html";
  } catch (err) {
    loginError.textContent = err.message;
  }
});

/* ============================
   DASHBOARD (protected)
============================ */
auth.onAuthStateChanged(async (user) => {
  if (!user && window.location.pathname.includes("dashboard")) {
    window.location.href = "login.html";
    return;
  }

  if (user && document.getElementById("plan")) {
    const doc = await db.collection("clients").doc(user.uid).get();
    if (doc.exists) {
      const data = doc.data();
      document.getElementById("plan").textContent = data.plan || "—";
      document.getElementById("lastUpdate").textContent = data.lastUpdate || "—";
      document.getElementById("notes").textContent = data.notes || "—";

      const site = document.getElementById("website");
      site.textContent = data.website || "—";
      site.href = data.website || "#";
    }
  }
});

/* ============================
   LOGOUT
============================ */
document.getElementById("logout")?.addEventListener("click", async () => {
  await auth.signOut();
  window.location.href = "login.html";
});
