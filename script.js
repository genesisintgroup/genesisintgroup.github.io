// ---------------------------------------------------------------
// Card copy in English / Spanish, keyed off the site-wide toggle
// in lang.js (window.EstateHubLang).
// ---------------------------------------------------------------
const CARD_STRINGS = {
  en: {
    forSale: "For Sale",
    forRent: "For Rent",
    sold: "Sold",
    comingSoon: "Coming Soon",
    viewDetails: "View details →",
    sqftLand: "sq ft land",
    acres: "acres",
    studio: "Studio",
    bd: "bd",
    ba: "ba",
    perMonth: "/mo",
    any: "Any",
    lotM2: "m² lot",
  },
  es: {
    forSale: "En venta",
    forRent: "En alquiler",
    sold: "Vendida",
    comingSoon: "Próximamente",
    viewDetails: "Ver detalles →",
    sqftLand: "pies² de terreno",
    acres: "acres",
    studio: "Estudio",
    bd: "hab",
    ba: "baños",
    perMonth: "/mes",
    any: "Cualquiera",
    lotM2: "m² de lote",
  },
};
function t() {
  const lang = window.EstateHubLang ? window.EstateHubLang.getLang() : "en";
  return CARD_STRINGS[lang] || CARD_STRINGS.en;
}

// ---------------------------------------------------------------
// Property data — add a new object here for every real listing.
// Set "photo" to an image path (e.g. "images/yourphoto.jpeg") for
// a real listing, or to one of the photo-1..photo-6 gradient
// classes as a placeholder until real photos are ready.
// ---------------------------------------------------------------
const PROPERTIES = [
  {
    id: 1,
    title: "Coral & Mint Bajan Home",
    type: "House",
    status: "sale",
    price: 650000,
    city: "Harmony Hall, St. Philip, Barbados",
    country: "Barbados",
    beds: 3,
    baths: 2,
    land: 5423,
    photo: "images/hero.jpeg",
    isPhotoImage: true,
    featured: true,
    daysAgo: 0,
    detailUrl: "property-harmony-hall.html",
  },
  {
    id: 2,
    title: "Chance Hall Heritage Estate",
    type: "Land",
    status: "sale",
    price: 137500,
    priceDisplay: "$275,000 BBD",
    city: "Chance Hall, St. Lucy, Barbados",
    country: "Barbados",
    acres: 1.26,
    land: 54885,
    photo: "images/chancehall-aerial.jpeg",
    isPhotoImage: true,
    featured: true,
    daysAgo: 0,
    detailUrl: "property-chance-hall.html",
  },
  {
    id: 3,
    title: "One on Marlin Studio Retreat",
    type: "Studio",
    status: "sale",
    price: 225000,
    city: "Cheshire Hall & Richmond Hill, Providenciales, Turks and Caicos",
    country: "Turks and Caicos Islands",
    land: 448,
    photo: "images/onemarlin-hero.jpeg",
    isPhotoImage: true,
    featured: true,
    daysAgo: 0,
    detailUrl: "property-onemarlin.html",
  },
  {
    id: 4,
    title: "Floridablanca Multi-Family House",
    type: "House",
    status: "sale",
    sold: true,
    price: 0,
    beds: 5,
    baths: 5,
    city: "Engativá, Bogotá, Colombia",
    country: "Colombia",
    landSqm: 130,
    photo: "images/floridablanca-hero.jpeg",
    isPhotoImage: true,
    featured: false,
    daysAgo: 0,
    detailUrl: "property-floridablanca.html",
  },
  {
    id: 5,
    title: "Halls Village Family Home",
    type: "House",
    status: "sale",
    price: 370000,
    priceDisplay: "$740,000 BBD",
    beds: 5,
    baths: 2,
    city: "Halls Village, St. James, Barbados",
    country: "Barbados",
    land: 3420,
    photo: "images/hallsvillage-hero.jpeg",
    isPhotoImage: true,
    featured: false,
    daysAgo: 0,
    detailUrl: "property-hallsvillage.html",
  },
  {
    id: 6,
    title: "Carnbee Two-Storey Residence",
    type: "House",
    status: "sale",
    price: 0,
    beds: 4,
    baths: 3,
    city: "Carnbee, Tobago, Trinidad and Tobago",
    country: "Trinidad and Tobago",
    land: 15220,
    photo: "images/carnbee-hero.jpeg",
    isPhotoImage: true,
    featured: false,
    daysAgo: 0,
    detailUrl: "property-tobago.html",
    comingSoon: true,
  },
  {
    id: 7,
    title: "St. Joseph Multi-Unit Residence",
    type: "House",
    status: "sale",
    price: 0,
    city: "St. Joseph, Trinidad, Trinidad and Tobago",
    country: "Trinidad and Tobago",
    land: 4950,
    photo: "images/stjoseph-hero.jpeg",
    isPhotoImage: true,
    featured: false,
    daysAgo: 0,
    detailUrl: "property-stjoseph.html",
    comingSoon: true,
  },
];

const currency = (n) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const grid = document.getElementById("propertyGrid");
const resultsCount = document.getElementById("resultsCount");
const emptyState = document.getElementById("emptyState");
const aboutCount = document.getElementById("aboutCount");

const state = {
  status: "all",
  propertyType: "all",
  country: "all",
  location: "all",
  minBeds: 0,
  maxPrice: 1000000,
  keyword: "",
  sort: "default",
};

function renderCard(p) {
  const s = t();
  const priceLabel = p.sold
    ? s.sold
    : p.comingSoon
    ? s.comingSoon
    : p.priceDisplay
    ? p.priceDisplay
    : p.status === "rent" ? `${currency(p.price)}<span>${s.perMonth}</span>` : currency(p.price);
  const priceClass = p.sold ? " sold" : p.comingSoon ? " coming-soon" : "";
  const badgeLabel = p.sold ? s.sold : p.status === "sale" ? s.forSale : s.forRent;
  const badgeClass = p.sold ? "sold" : p.status;
  const photoInner = p.isPhotoImage
    ? `<img src="${p.photo}" alt="${p.title}" loading="lazy">`
    : `<span class="icon">⌂</span>`;
  const photoClass = p.isPhotoImage ? "" : p.photo;
  const bedsMeta = p.beds !== undefined ? `<span>🛏 ${p.beds === 0 ? s.studio : p.beds + " " + s.bd}</span>` : "";
  const bathsMeta = p.baths !== undefined ? `<span>🛁 ${p.baths} ${s.ba}</span>` : "";
  const landMeta = p.landSqm
    ? `<span>📐 ${p.landSqm} ${s.lotM2}</span>`
    : p.acres
    ? `<span>📐 ${p.acres} ${s.acres}</span>`
    : p.land
    ? `<span>📐 ${p.land.toLocaleString()} ${s.sqftLand}</span>`
    : "";
  const href = p.detailUrl || "#";

  return `
    <a class="card" href="${href}" data-id="${p.id}">
      <div class="card-photo ${photoClass}">
        ${photoInner}
        <span class="badge ${badgeClass}">${badgeLabel}</span>
      </div>
      <div class="card-body">
        <div class="card-price${priceClass}">${priceLabel}</div>
        <h3 class="card-title">${p.title}</h3>
        <div class="card-location">📍 ${p.city} &middot; ${p.type}</div>
        <div class="card-meta">
          ${bedsMeta}
          ${bathsMeta}
          ${landMeta}
        </div>
        <div class="card-cta">${s.viewDetails}</div>
      </div>
    </a>
  `;
}

function applyFilters() {
  let list = PROPERTIES.filter((p) => {
    if (state.status !== "all" && p.status !== state.status) return false;
    if (state.propertyType !== "all" && p.type !== state.propertyType) return false;
    if (state.country !== "all" && p.country !== state.country) return false;
    if (state.location !== "all" && p.city !== state.location) return false;
    if (state.minBeds > 0 && p.beds < state.minBeds) return false;
    if (state.maxPrice > 0 && p.price > state.maxPrice) return false;
    if (state.keyword) {
      const kw = state.keyword.toLowerCase();
      const haystack = `${p.title} ${p.city} ${p.type}`.toLowerCase();
      if (!haystack.includes(kw)) return false;
    }
    return true;
  });

  switch (state.sort) {
    case "price-asc": list.sort((a, b) => a.price - b.price); break;
    case "price-desc": list.sort((a, b) => b.price - a.price); break;
    case "beds-desc": list.sort((a, b) => b.beds - a.beds); break;
    case "newest": list.sort((a, b) => a.daysAgo - b.daysAgo); break;
    default: list.sort((a, b) => (b.featured === a.featured ? 0 : b.featured ? 1 : -1));
  }

  return list;
}

function render() {
  const list = applyFilters();
  resultsCount.textContent = list.length;
  if (aboutCount) aboutCount.textContent = PROPERTIES.length;
  grid.innerHTML = list.map(renderCard).join("");
  emptyState.hidden = list.length !== 0;
}

// ---------------------------------------------------------------
// Populate the country & location dropdowns from the data set
// ---------------------------------------------------------------
function populateLocations() {
  const countrySelect = document.getElementById("filterCountry");
  const countries = [...new Set(PROPERTIES.map((p) => p.country).filter(Boolean))].sort();
  countries.forEach((country) => {
    const opt = document.createElement("option");
    opt.value = country;
    opt.textContent = country;
    countrySelect.appendChild(opt);
  });

  const select = document.getElementById("filterLocation");
  const cities = [...new Set(PROPERTIES.map((p) => p.city))].sort();
  cities.forEach((city) => {
    const opt = document.createElement("option");
    opt.value = city;
    opt.textContent = city;
    select.appendChild(opt);
  });
}

// ---------------------------------------------------------------
// Wire up controls
// ---------------------------------------------------------------
function initFilters() {
  // Status chips
  const chips = document.querySelectorAll("#statusChips .chip");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      state.status = chip.dataset.status;
      render();
    });
  });

  document.getElementById("filterPropertyType").addEventListener("change", (e) => {
    state.propertyType = e.target.value;
    render();
  });

  document.getElementById("filterCountry").addEventListener("change", (e) => {
    state.country = e.target.value;
    render();
  });

  document.getElementById("filterLocation").addEventListener("change", (e) => {
    state.location = e.target.value;
    render();
  });

  document.getElementById("filterBeds").addEventListener("change", (e) => {
    state.minBeds = Number(e.target.value);
    render();
  });

  const priceRange = document.getElementById("filterPriceRange");
  const priceLabel = document.getElementById("priceRangeLabel");
  priceRange.addEventListener("input", (e) => {
    const val = Number(e.target.value);
    state.maxPrice = val;
    priceLabel.textContent = val >= 1000000 ? t().any : currency(val);
    render();
  });

  document.getElementById("sortBy").addEventListener("change", (e) => {
    state.sort = e.target.value;
    render();
  });

  document.getElementById("resetFilters").addEventListener("click", () => {
    state.status = "all";
    state.propertyType = "all";
    state.country = "all";
    state.location = "all";
    state.minBeds = 0;
    state.maxPrice = 1000000;
    state.keyword = "";
    state.sort = "default";

    chips.forEach((c) => c.classList.remove("active"));
    document.querySelector('[data-status="all"]').classList.add("active");
    document.getElementById("filterPropertyType").value = "all";
    document.getElementById("filterCountry").value = "all";
    document.getElementById("filterLocation").value = "all";
    document.getElementById("filterBeds").value = "0";
    priceRange.value = 1000000;
    priceLabel.textContent = t().any;
    document.getElementById("sortBy").value = "default";
    document.getElementById("searchKeyword").value = "";

    render();
  });

  // Hero search bar feeds into the same filter state
  document.getElementById("searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    state.keyword = document.getElementById("searchKeyword").value.trim();
    const type = document.getElementById("searchType").value;
    state.status = type;
    chips.forEach((c) => c.classList.toggle("active", c.dataset.status === type));

    const maxPrice = Number(document.getElementById("searchPrice").value);
    if (maxPrice > 0) {
      state.maxPrice = maxPrice;
      priceRange.value = Math.min(maxPrice, 1000000);
      priceLabel.textContent = currency(maxPrice);
    }

    document.getElementById("listings").scrollIntoView({ behavior: "smooth" });
    render();
  });
}

// ---------------------------------------------------------------
// Mobile nav toggle
// ---------------------------------------------------------------
function initNav() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
    nav.style.display = nav.classList.contains("open") ? "flex" : "";
  });
}

document.getElementById("year").textContent = new Date().getFullYear();

populateLocations();
initFilters();
initNav();
render();

// Re-render cards (and refresh the price-range label) whenever the
// site-wide language toggle in lang.js changes.
document.addEventListener("langchange", () => {
  const priceRange = document.getElementById("filterPriceRange");
  const priceLabel = document.getElementById("priceRangeLabel");
  if (priceRange && priceLabel) {
    priceLabel.textContent = Number(priceRange.value) >= 1000000 ? t().any : currency(Number(priceRange.value));
  }
  render();
});
