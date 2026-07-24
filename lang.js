// ---------------------------------------------------------------
// Site-wide English / Spanish toggle.
// Persists the visitor's choice in localStorage so it carries across
// every page of the site (header toggle + mobile nav toggle use the
// same [data-lang-btn] buttons everywhere).
//
// Three ways content can be translated:
//   1. data-i18n-en="..." data-i18n-es="..."  -> swaps textContent
//   2. data-i18n-en-placeholder="..." / -es-placeholder="..."  -> swaps placeholder
//   3. .lang-block / .lang-inline with data-lang="en|es"       -> shows/hides
//      (use this for longer, richly-formatted passages)
// ---------------------------------------------------------------
(function () {
  const STORAGE_KEY = "estatehub-lang";

  function getLang() {
    try {
      return localStorage.getItem(STORAGE_KEY) || "en";
    } catch (e) {
      return "en";
    }
  }

  function applyLang(lang) {
    document.documentElement.setAttribute("lang", lang);

    document.querySelectorAll("[data-lang-btn]").forEach((b) => {
      b.classList.toggle("active", b.dataset.langBtn === lang);
    });

    document.querySelectorAll(".lang-block, .lang-inline").forEach((el) => {
      el.classList.toggle("active", el.dataset.lang === lang);
    });

    document.querySelectorAll("[data-i18n-en]").forEach((el) => {
      const text = lang === "es" ? el.dataset.i18nEs : el.dataset.i18nEn;
      if (text !== undefined) el.textContent = text;
    });

    document.querySelectorAll("[data-i18n-en-placeholder]").forEach((el) => {
      const text = lang === "es" ? el.dataset.i18nEsPlaceholder : el.dataset.i18nEnPlaceholder;
      if (text !== undefined) el.setAttribute("placeholder", text);
    });

    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
  }

  function setLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* ignore (private browsing, etc.) */
    }
    applyLang(lang);
  }

  function initToggles() {
    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.dataset.langBtn));
    });
  }

  window.EstateHubLang = { getLang, setLang, applyLang };

  document.addEventListener("DOMContentLoaded", () => {
    initToggles();
    applyLang(getLang());
  });
})();
