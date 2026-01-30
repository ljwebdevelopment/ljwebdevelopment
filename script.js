/* =========================
   DOM READY
========================= */
document.addEventListener('DOMContentLoaded', () => {

  /* =========================
     ELEMENTS
  ========================= */
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const dashboard = document.getElementById('dashboard');
  const yearSpan = document.getElementById('year');

  /* =========================
     FOOTER YEAR
  ========================= */
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  /* =========================
     LOGIN STATE
  ========================= */
  function showDashboard() {
    if (!dashboard) return;
    dashboard.classList.remove('hidden');
  }

  function hideDashboard() {
    if (!dashboard) return;
    dashboard.classList.add('hidden');
  }

  function isLoggedIn() {
    return localStorage.getItem('lj_logged_in') === 'true';
  }

  function setLoggedIn(state) {
    localStorage.setItem('lj_logged_in', state ? 'true' : 'false');
  }

  /* =========================
     INIT LOGIN STATE
  ========================= */
  if (isLoggedIn()) {
    showDashboard();
  } else {
    hideDashboard();
  }

  /* =========================
     LOGIN / LOGOUT
  ========================= */
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      setLoggedIn(true);
      showDashboard();

      // scroll to dashboard
      dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      setLoggedIn(false);
      hideDashboard();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* =========================
     SCROLL BUTTONS
  ========================= */
  document.querySelectorAll('[data-action="scroll"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const target = document.getElementById(targetId);

      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

});
