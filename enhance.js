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



    // Rotating hero photos (one per available listing, crossfade)
    if (hero && typeof PROPERTIES !== "undefined") {
      const photos = [...new Set(PROPERTIES.filter((p) => p.isPhotoImage && !p.sold && p.photo).map((p) => p.photo))].sort((a, b) => (b.includes("carnbee") ? 1 : 0) - (a.includes("carnbee") ? 1 : 0));
      if (photos.length > 1) {
        hero.classList.add("has-slides");
        const wrapS = el("div", "hero-slides");
        const slides = photos.map((src, i) => {
          const d = el("div", "hero-slide");
          if (i === 0) { d.style.backgroundImage = "url('" + src + "')"; d.classList.add("on"); }
          wrapS.appendChild(d);
          return d;
        });
        hero.insertBefore(wrapS, hero.firstChild);
        let cur = 0, timer = null;
        const dots = el("div", "hero-dots");
        const dotEls = photos.map((_, i) => {
          const b = el("button", i === 0 ? "on" : "", "", { type: "button", "aria-label": "Photo " + (i + 1) });
          b.addEventListener("click", () => { go(i); restart(); });
          dots.appendChild(b);
          return b;
        });
        const stats = hero.querySelector(".hero-stats");
        if (stats) stats.insertAdjacentElement("afterend", dots);
        function load(i) {
          if (!slides[i].style.backgroundImage) slides[i].style.backgroundImage = "url('" + photos[i] + "')";
        }
        function go(i) {
          i = (i + photos.length) % photos.length;
          load(i);
          slides[cur].classList.remove("on");
          dotEls[cur].classList.remove("on");
          cur = i;
          void slides[cur].offsetWidth;
          slides[cur].classList.add("on");
          dotEls[cur].classList.add("on");
          load((cur + 1) % photos.length);
        }
        function restart() { clearInterval(timer); if (!reduce) timer = setInterval(() => go(cur + 1), 6500); }
        window.addEventListener("load", () => { load(1); restart(); });
        document.addEventListener("visibilitychange", () => { if (document.hidden) clearInterval(timer); else restart(); });
      }
    }


    // "Talk to an advisor" -> WhatsApp contacts dialog.
    // To add another advisor, add an entry here (number: digits only, with country code).
    const ADVISORS = [
      { name: "Juan Cordova", role: ["Advisor", "Asesor"], number: "17867311295" },
    ];
    const talk = document.querySelector(".btn-hero-ghost");
    if (talk) {
      const modal = el("div", "adv-modal", "", { role: "dialog", "aria-modal": "true" });
      const card = el("div", "adv-card");
      const closeB = el("button", "adv-close", "✕", { type: "button", "aria-label": "Close" });
      const h = i18n(el("h3"), "Talk to an advisor", "Hable con un asesor");
      const sub = i18n(el("p"), "Choose a contact and message us on WhatsApp — we reply in English or Spanish.", "Elija un contacto y escríbanos por WhatsApp — respondemos en inglés o español.");
      card.append(closeB, h, sub);
      const MSG = { en: "Hello! I'm interested in a property on Estate Hub.", es: "¡Hola! Me interesa una propiedad en Estate Hub." };
      const links = [];
      ADVISORS.forEach((a) => {
        const row = el("div", "adv-person");
        row.appendChild(el("div", "adv-avatar", a.name.split(" ").map((w) => w[0]).join("").slice(0, 2)));
        const info = el("div", "adv-info");
        info.appendChild(el("strong", null, a.name));
        info.appendChild(i18n(el("span"), a.role[0], a.role[1]));
        row.appendChild(info);
        const wa = el("a", "btn btn-wa", '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3C8.8 3 3 8.7 3 15.8c0 2.4.7 4.6 1.9 6.5L3 29l6.9-1.8a13 13 0 0 0 6.1 1.5c7.2 0 13-5.7 13-12.8S23.200 3 16 3zm0 23.300c-2 0-3.900-.6-5.500-1.600l-.4-.2-4.100 1.100 1.100-4-.3-.4a10.400 10.400 0 0 1-1.600-5.500C5.200 9.900 10 5.300 16 5.300s10.800 4.600 10.800 10.400S22 26.300 16 26.300zm5.900-7.800c-.3-.2-1.900-.9-2.200-1s-.5-.2-.7.200-.8 1-1 1.200-.4.2-.7.100a8.800 8.800 0 0 1-4.400-3.800c-.3-.6.300-.5.900-1.700.1-.2 0-.4 0-.5l-1-2.300c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.100-.9.400s-1.200 1.100-1.200 2.700 1.200 3.100 1.400 3.300 2.300 3.500 5.600 4.900c2.100.9 2.900.9 3.900.8.600-.1 1.900-.8 2.200-1.500s.3-1.400.2-1.500-.3-.2-.6-.4z"/></svg><span></span>', { target: "_blank", rel: "noopener" });
        const waLabel = wa.querySelector("span");
        i18n(waLabel, "WhatsApp", "WhatsApp");
        links.push([wa, a.number]);
        row.appendChild(wa);
        card.appendChild(row);
      });
      const setLinks = () => links.forEach(([wa, n]) => wa.setAttribute("href", "https://wa.me/" + n + "?text=" + encodeURIComponent(MSG[lang()] || MSG.en)));
      setLinks();
      document.addEventListener("langchange", setLinks);
      const alt = el("div", "adv-alt");
      const call = el("a", "btn btn-ghost-light", "", { href: "tel:+18336650773" });
      i18n(call, "Call toll-free", "Llamar gratis");
      const mail = el("a", "btn btn-ghost-light", "", { href: "#contact" });
      i18n(mail, "Send a message", "Enviar mensaje");
      mail.addEventListener("click", () => closeM());
      alt.append(call, mail);
      card.appendChild(alt);
      modal.appendChild(card);
      document.body.appendChild(modal);
      function openM() { modal.classList.add("open"); document.body.style.overflow = "hidden"; }
      function closeM() { modal.classList.remove("open"); document.body.style.overflow = ""; }
      talk.addEventListener("click", (e) => { e.preventDefault(); openM(); });
      closeB.addEventListener("click", closeM);
      modal.addEventListener("click", (e) => { if (e.target === modal) closeM(); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeM(); });
    }

    // Hero stats: real numbers from the catalog, with a count-up
    if (typeof PROPERTIES !== "undefined") {
      const vals = { props: PROPERTIES.length, countries: new Set(PROPERTIES.map((p) => p.country).filter(Boolean)).size };
      document.querySelectorAll("[data-count]").forEach((n) => {
        const target = vals[n.dataset.count];
        if (target == null) return;
        if (reduce) { n.textContent = target; return; }
        const t0 = performance.now(), dur = 1400;
        n.textContent = "0";
        (function tick(now) {
          const k = Math.min(1, (now - t0) / dur);
          n.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(tick);
        })(t0);
      });
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
