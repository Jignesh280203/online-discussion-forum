// public/js/main.js
document.addEventListener('DOMContentLoaded', () => {
  // Toggle profile dropdown is handled in layout
  // Add generic confirm for delete links/forms if data-confirm attribute is present
  document.addEventListener('submit', (e) => {
    const form = e.target;
    if (form.dataset.confirm === "true") {
      const ok = confirm(form.dataset.confirmMessage || "Are you sure?");
      if (!ok) e.preventDefault();
    }
  });

  // Simple progressive enhancement: Ajax voting (optional)
  const ajaxForms = document.querySelectorAll('form.ajax-vote');
  ajaxForms.forEach((f) => {
    f.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const url = f.action;
      const body = new FormData(f);
      fetch(url, { method: f.method || 'POST', body, credentials: 'include' })
        .then(res => {
          // reload to reflect new counts (simple)
          window.location.reload();
        })
        .catch(err => {
          console.error("AJAX vote error", err);
          window.location.reload();
        });
    });
  });
});
