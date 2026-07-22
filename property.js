// ---------------------------------------------------------------
// Behavior for individual property detail pages (gallery lightbox,
// mobile nav toggle, footer year).
// ---------------------------------------------------------------

function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const closeBtn = document.getElementById("lightboxClose");
  if (!lightbox || !lightboxImg) return;

  document.querySelectorAll(".gallery-item[data-full]").forEach((btn) => {
    btn.addEventListener("click", () => {
      lightboxImg.src = btn.dataset.full;
      lightboxImg.alt = btn.querySelector("img")?.alt || "";
      lightbox.classList.add("open");
    });
  });

  function close() {
    lightbox.classList.remove("open");
    lightboxImg.src = "";
  }

  closeBtn?.addEventListener("click", close);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

function initNav() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
    nav.style.display = nav.classList.contains("open") ? "flex" : "";
  });
}

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

initLightbox();
initNav();
