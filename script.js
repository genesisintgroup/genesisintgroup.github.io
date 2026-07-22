// ---------------------------------------------------------------
// Harmony Hall Residence — single-property page behaviour:
// mobile nav toggle + a lightweight lightbox for the gallery.
// ---------------------------------------------------------------

function initNav() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
    nav.style.display = nav.classList.contains("open") ? "flex" : "";
  });
  // Close the mobile menu after tapping a link
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      nav.style.display = "";
    });
  });
}

function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const closeBtn = document.getElementById("lightboxClose");

  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      lightboxImg.src = item.dataset.full;
      lightboxImg.alt = item.querySelector("img").alt;
      lightbox.classList.add("open");
    });
  });

  const close = () => {
    lightbox.classList.remove("open");
    lightboxImg.src = "";
  };

  closeBtn.addEventListener("click", close);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

document.getElementById("year").textContent = new Date().getFullYear();

initNav();
initLightbox();
