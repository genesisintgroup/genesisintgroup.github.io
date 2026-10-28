// ---------------------------------------------------------------
// Estate Hub — interaction polish (shared by every page).
// Pure progressive enhancement: if this file fails to load the site
// still works exactly as before. Honors prefers-reduced-motion.
// ---------------------------------------------------------------
(function () {
  const root = document.documentElement;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lang = () => (window.EstateHubLang ? window.EstateHubLang.getLang() : "en");
  const isHome = !!document.getElementById("propertyGrid");

  function el(tag, cls, html, attrs) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    if (attrs) Object.keys(attrs).forEach((k) => n.setAttribute(k, attrs[k]));
    return n;
  }
  function i18n(node, en, es) {
    node.setAttribute("data-i18n-en", en);
    node.setAttribute("data-i18n-es", es);
    node.textContent = lang() === "es" ? es : en;
    return node;
  }

  root.classList.add("js-reveal");

  /* ---------- scroll progress, header state, back-to-top ---------- */
  const bar = el("div", "scroll-progress");
  document.body.appendChild(bar);
  const toTop = el("button", "to-top", "↑", { type: "button", "aria-label": "Back to top" });
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));
  document.body.appendChild(toTop);
  const header = document.querySelector(".site-header");

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ")";
      if (header) header.classList.toggle("scrolled", window.scrollY > 12);
      toTop.classList.toggle("show", window.scrollY > 700);
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    if (header) root.style.setProperty("--hdr-h", header.offsetHeight + "px");
  });
  if (header) root.style.setProperty("--hdr-h", header.offsetHeight + "px");
  onScroll();

  /* ---------- reveal on scroll ---------- */
  let io = null;
  if ("IntersectionObserver" in window && !reduce) {
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
  }
  function reveal(node, kind, delay) {
    if (!node || node.hasAttribute("data-reveal")) return;
    node.setAttribute("data-reveal", kind || "up");
    if (delay) node.style.setProperty("--d", delay + "ms");
    if (io) io.observe(node);
    else node.classList.add("in");
  }
  function revealGroup(selector, step, kind) {
    document.querySelectorAll(selector).forEach((n, i) => reveal(n, kind, Math.min(i, 8) * (step || 70)));
  }

  revealGroup(".section-heading", 0);
  revealGroup(".filters", 0);
  revealGroup(".step", 110);
  revealGroup(".about-inner > *", 120);
  revealGroup(".contact-inner > *", 120);
  revealGroup(".footer-inner > *", 80);
  revealGroup(".overview-inner, .facts-card, .disclaimer-note, .details-inner", 0);
  revealGroup(".feature-list li", 45);
  revealGroup(".gallery-item", 70, "scale");
  revealGroup(".map-frame, .plotplan-card, .location-intro", 0);

  // Cards are re-rendered by script.js on every filter / language change.
  const grid = document.getElementById("propertyGrid");
  function revealCards() {
    if (!grid) return;
    grid.querySelectorAll(".card").forEach((c, i) => {
      reveal(c, "up", Math.min(i, 6) * 80);
      const img = c.querySelector("img");
      if (img) {
        if (img.complete && img.naturalWidth) img.classList.add("loaded");
        else {
          img.addEventListener("load", () => img.classList.add("loaded"), { once: true });
          img.addEventListener("error", () => img.classList.add("loaded"), { once: true });
        }
      }
    });
  }
  if (grid) {
    revealCards();
    let lastCount = null;
    new MutationObserver(() => {
      revealCards();
      const rc = document.getElementById("resultsCount");
      if (rc && lastCount !== null && lastCount !== rc.textContent && !reduce) {
        rc.classList.remove("pop");
        void rc.offsetWidth;
        rc.classList.add("pop");
      }
      if (rc) lastCount = rc.textContent;
    }).observe(grid, { childList: true });
  }
  // Safety net: never leave content hidden if observers misbehave.
  setTimeout(() => {
    document.querySelectorAll("[data-reveal]:not(.in)").forEach((n) => {
      const r = n.getBoundingClientRect();
      if (r.top < window.innerHeight * 1.2) n.classList.add("in");
    });
  }, 2500);

  /* ---------- HOME: hero orbs, country chips, mobile filters ---------- */
  if (isHome) {
    const hero = document.querySelector(".hero");
    if (hero) {
      hero.appendChild(el("span", "hero-orb o1"));
      hero.appendChild(el("span", "hero-orb o2"));
    }

    const select = document.getElementById("filterCountry");
    const searchCard = document.getElementById("searchForm");
    if (select && searchCard && typeof PROPERTIES !== "undefined") {
      const ES = { "Barbados": "Barbados", "Turks and Caicos Islands": "Islas Turcas y Caicos", "Trinidad and Tobago": "Trinidad y Tobago", "Colombia": "Colombia" };
      const countries = [...new Set(PROPERTIES.map((p) => p.country).filter(Boolean))].sort();
      const wrap = el("div", "quick-countries");
      wrap.appendChild(i18n(el("span", "qc-label"), "Browse by country:", "Explorar por país:"));
      const chips = [];
      function chip(value, en, es) {
        const b = el("button", "qc-chip", "", { type: "button", "data-country": value });
        i18n(b, en, es);
        b.addEventListener("click", () => {
          select.value = value;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          sync();
          const target = document.getElementById("listings");
          if (target) target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        });
        chips.push(b);
        wrap.appendChild(b);
      }
      chip("all", "All", "Todos");
      countries.forEach((c) => chip(c, c, ES[c] || c));
      function sync() {
        chips.forEach((b) => b.classList.toggle("active", b.dataset.country === select.value));
      }
      select.addEventListener("change", sync);
      const reset = document.getElementById("resetFilters");
      if (reset) reset.addEventListener("click", () => setTimeout(sync, 0));
      sync();
      searchCard.insertAdjacentElement("afterend", wrap);
    }

    // Collapsible filters on small screens
    const filters = document.getElementById("filters");
    if (filters) {
      const btn = el("button", "filters-toggle", "", { type: "button", "aria-expanded": "false" });
      const label = el("span");
      i18n(label, "Show filters", "Mostrar filtros");
      btn.appendChild(el("span", null, "☰"));
      btn.appendChild(label);
      const mq = window.matchMedia("(max-width: 980px)");
      function setCollapsed(c) {
        filters.classList.toggle("collapsed", c);
        btn.setAttribute("aria-expanded", String(!c));
        const en = c ? "Show filters" : "Hide filters";
        const es = c ? "Mostrar filtros" : "Ocultar filtros";
        label.setAttribute("data-i18n-en", en);
        label.setAttribute("data-i18n-es", es);
        label.textContent = lang() === "es" ? es : en;
      }
      btn.addEventListener("click", () => setCollapsed(!filters.classList.contains("collapsed")));
      filters.parentNode.insertBefore(btn, filters);
      setCollapsed(mq.matches);
      (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))((e) => setCollapsed(e.matches));
    }
  }

  /* ---------- PROPERTY PAGES: sticky bars ---------- */
  const quick = document.querySelector(".hero-quickfacts");
  if (quick && !isHome) {
    const h1 = document.querySelector(".hero-address h1");
    const priceEl = quick.querySelector(".qf-price");
    const contact = document.getElementById("contact");

    const top = el("div", "pbar-top");
    const inner = el("div", "container pbar-inner");
    const title = el("span", "pbar-title", "");
    title.textContent = h1 ? h1.textContent : document.title;
    const price = el("span", "pbar-price");
    const syncPrice = () => { if (priceEl) price.textContent = priceEl.textContent; };
    syncPrice();
    document.addEventListener("langchange", syncPrice);
    const cta = el("a", "btn btn-primary", "", { href: "#contact" });
    i18n(cta, "Contact", "Contactar");
    inner.append(title, price, cta);
    top.appendChild(inner);
    document.body.appendChild(top);

    const bottom = el("div", "pbar-bottom");
    const b1 = el("a", "btn btn-primary", "", { href: "#contact" });
    i18n(b1, "Contact", "Contactar");
    const b2 = el("a", "btn btn-ghost-light", "", { href: "tel:+18336650773" });
    i18n(b2, "Call", "Llamar");
    bottom.append(b2, b1);
    document.body.appendChild(bottom);
    document.body.classList.add("has-pbar");

    let heroGone = false, contactIn = false;
    const update = () => {
      top.classList.toggle("show", heroGone);
      bottom.classList.toggle("show", heroGone && !contactIn);
    };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((en) => { heroGone = !en[0].isIntersecting && en[0].boundingClientRect.top < 0; update(); }).observe(quick);
      if (contact) new IntersectionObserver((en) => { contactIn = en[0].isIntersecting; update(); }, { threshold: 0.15 }).observe(contact);
    }
  }
})();
