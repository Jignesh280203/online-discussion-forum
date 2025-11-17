// public/js/main.js
document.addEventListener('DOMContentLoaded', () => {
  // profile dropdown already in layout, but we keep safety
  const btn = document.getElementById('profileBtn');
  const dd = document.getElementById('profileDropdown');
  if (btn) {
    btn.addEventListener('click', e => {
      e.preventDefault();
      if (dd) dd.classList.toggle('hidden');
    });
  }
  // enable feather icons (if needed)
  if (typeof feather !== "undefined") feather.replace();
});
