// ---------------------------------------------------------------
// Behavior for individual property detail pages (gallery lightbox,
// mobile nav toggle, footer year).
// ---------------------------------------------------------------

function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const closeBtn = document.getElementById("lightboxClose");
  if (!lightbox || !lightboxImg) return;

  const items = Array.from(document.querySelectorAll(".gallery-item[data-full]"));
  if (!items.length) return;

  // Prev / next arrows + caption/counter bar (added here so every
  // property page gets them without touching its HTML).
  const prev = document.createElement("button");
  prev.className = "lb-nav lb-prev";
  prev.type = "button";
  prev.setAttribute("aria-label", "Previous photo");
  prev.textContent = "‹";
  const next = document.createElement("button");
  next.className = "lb-nav lb-next";
  next.type = "button";
  next.setAttribute("aria-label", "Next photo");
  next.textContent = "›";
  const meta = document.createElement("div");
  meta.className = "lb-meta";
  const caption = document.createElement("span");
  const count = document.createElement("span");
  count.className = "lb-count";
  meta.append(caption, count);
  lightbox.append(prev, next, meta);

  let index = 0;

  function show(i, animate) {
    index = (i + items.length) % items.length;
    const btn = items[index];
    const apply = () => {
      lightboxImg.src = btn.dataset.full;
      lightboxImg.alt = btn.querySelector("img")?.alt || "";
      caption.textContent = btn.querySelector(".gallery-caption")?.textContent || "";
      count.textContent = index + 1 + " / " + items.length;
      lightboxImg.classList.remove("swap");
    };
    if (animate) {
      lightboxImg.classList.add("swap");
      setTimeout(apply, 180);
    } else {
      apply();
    }
    // warm the cache for the neighbours
    [index + 1, index - 1].forEach((n) => {
      const pre = new Image();
      pre.src = items[(n + items.length) % items.length].dataset.full;
    });
    const single = items.length < 2;
    prev.style.display = next.style.display = single ? "none" : "";
  }

  function open(i) {
    show(i, false);
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function close() {
    lightbox.classList.remove("open");
    lightboxImg.src = "";
    document.body.style.overflow = "";
  }

  items.forEach((btn, i) => btn.addEventListener("click", () => open(i)));
  prev.addEventListener("click", (e) => { e.stopPropagation(); show(index - 1, true); });
  next.addEventListener("click", (e) => { e.stopPropagation(); show(index + 1, true); });
  closeBtn?.addEventListener("click", close);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(index - 1, true);
    else if (e.key === "ArrowRight") show(index + 1, true);
  });

  // Swipe left / right on touch screens
  let x0 = null, y0 = null;
  lightbox.addEventListener("touchstart", (e) => {
    x0 = e.touches[0].clientX;
    y0 = e.touches[0].clientY;
  }, { passive: true });
  lightbox.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    const dy = e.changedTouches[0].clientY - y0;
    x0 = y0 = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(index + (dx < 0 ? 1 : -1), true);
  }, { passive: true });
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

// Note: the English/Spanish toggle itself now lives in lang.js
// (site-wide header toggle) — it handles every [data-lang-btn] /
// .lang-block / .lang-inline element on the page automatically.

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

initLightbox();
initNav();
