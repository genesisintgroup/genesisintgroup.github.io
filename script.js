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
    price: 275000,
    city: "Harmony Hall, St. Philip, Barbados",
    beds: 3,
    baths: 2,
    land: 5423,
    photo: "images/hero.jpeg",
    isPhotoImage: true,
    featured: true,
    daysAgo: 0,
    detailUrl: "property-harmony-hall.html",
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
  location: "all",
  minBeds: 0,
  maxPrice: 1000000,
  keyword: "",
  sort: "default",
};

function renderCard(p) {
  const priceLabel = p.comingSoon
    ? "Coming Soon"
    : p.status === "rent" ? `${currency(p.price)}<span>/mo</span>` : currency(p.price);
  const photoInner = p.isPhotoImage
    ? `<img src="${p.photo}" alt="${p.title}" loading="lazy">`
    : `<span class="icon">⌂</span>`;
  const photoClass = p.isPhotoImage ? "" : p.photo;
  const landMeta = p.land ? `<span>📐 ${p.land.toLocaleString()} sq ft land</span>` : "";
  const href = p.detailUrl || "#";

  return `
    <a class="card" href="${href}" data-id="${p.id}">
      <div class="card-photo ${photoClass}">
        ${photoInner}
        <span class="badge ${p.status}">${p.status === "sale" ? "For Sale" : "For Rent"}</span>
      </div>
      <div class="card-body">
        <div class="card-price${p.comingSoon ? " coming-soon" : ""}">${priceLabel}</div>
        <h3 class="card-title">${p.title}</h3>
        <div class="card-location">📍 ${p.city} &middot; ${p.type}</div>
        <div class="card-meta">
          <span>🛏 ${p.beds === 0 ? "Studio" : p.beds + " bd"}</span>
          <span>🛁 ${p.baths} ba</span>
          ${landMeta}
        </div>
        <div class="card-cta">View details →</div>
      </div>
    </a>
  `;
}

function applyFilters() {
  let list = PROPERTIES.filter((p) => {
    if (state.status !== "all" && p.status !== state.status) return false;
    if (state.propertyType !== "all" && p.type !== state.propertyType) return false;
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
// Populate the location dropdown from the data set
// ---------------------------------------------------------------
function populateLocations() {
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
    priceLabel.textContent = val >= 1000000 ? "Any" : currency(val);
    render();
  });

  document.getElementById("sortBy").addEventListener("change", (e) => {
    state.sort = e.target.value;
    render();
  });

  document.getElementById("resetFilters").addEventListener("click", () => {
    state.status = "all";
    state.propertyType = "all";
    state.location = "all";
    state.minBeds = 0;
    state.maxPrice = 1000000;
    state.keyword = "";
    state.sort = "default";

    chips.forEach((c) => c.classList.remove("active"));
    document.querySelector('[data-status="all"]').classList.add("active");
    document.getElementById("filterPropertyType").value = "all";
    document.getElementById("filterLocation").value = "all";
    document.getElementById("filterBeds").value = "0";
    priceRange.value = 1000000;
    priceLabel.textContent = "Any";
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
