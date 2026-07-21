// ---------------------------------------------------------------
// Sample property data — replace with your own listings or wire
// this up to a real API / CMS.
// ---------------------------------------------------------------
const PROPERTIES = [
  { id: 1,  title: "Sunlit Modern Bungalow", type: "House",     status: "sale", price: 425000, city: "Austin, TX",      beds: 3, baths: 2, sqft: 1850, photo: "photo-1", featured: true,  daysAgo: 2  },
  { id: 2,  title: "Downtown Loft with View", type: "Apartment", status: "rent", price: 2200,   city: "Chicago, IL",     beds: 1, baths: 1, sqft: 780,  photo: "photo-3", featured: true,  daysAgo: 5  },
  { id: 3,  title: "Riverside Family Home",   type: "House",     status: "sale", price: 610000, city: "Portland, OR",    beds: 4, baths: 3, sqft: 2600, photo: "photo-6", featured: false, daysAgo: 11 },
  { id: 4,  title: "Cozy Studio Retreat",     type: "Studio",    status: "rent", price: 1350,   city: "Denver, CO",      beds: 0, baths: 1, sqft: 480,  photo: "photo-2", featured: false, daysAgo: 3  },
  { id: 5,  title: "Lakeview Condo",          type: "Condo",     status: "sale", price: 349000, city: "Minneapolis, MN", beds: 2, baths: 2, sqft: 1180, photo: "photo-5", featured: true,  daysAgo: 8  },
  { id: 6,  title: "Garden Townhouse",        type: "Townhouse", status: "rent", price: 2650,   city: "Nashville, TN",   beds: 3, baths: 2, sqft: 1520, photo: "photo-4", featured: false, daysAgo: 14 },
  { id: 7,  title: "Skyline Penthouse",       type: "Apartment", status: "sale", price: 890000, city: "Chicago, IL",     beds: 3, baths: 3, sqft: 2100, photo: "photo-3", featured: true,  daysAgo: 1  },
  { id: 8,  title: "Suburban Family Retreat", type: "House",     status: "sale", price: 512000, city: "Austin, TX",      beds: 4, baths: 3, sqft: 2400, photo: "photo-1", featured: false, daysAgo: 20 },
  { id: 9,  title: "Compact City Apartment",  type: "Apartment", status: "rent", price: 1800,   city: "Denver, CO",      beds: 1, baths: 1, sqft: 640,  photo: "photo-2", featured: false, daysAgo: 6  },
  { id: 10, title: "Modern Corner Condo",     type: "Condo",     status: "rent", price: 2050,   city: "Portland, OR",    beds: 2, baths: 2, sqft: 980,  photo: "photo-6", featured: false, daysAgo: 9  },
  { id: 11, title: "Historic Brick Townhome", type: "Townhouse", status: "sale", price: 468000, city: "Nashville, TN",   beds: 3, baths: 2, sqft: 1950, photo: "photo-4", featured: false, daysAgo: 17 },
  { id: 12, title: "Minimalist Studio Loft",  type: "Studio",    status: "sale", price: 219000, city: "Minneapolis, MN", beds: 0, baths: 1, sqft: 520,  photo: "photo-5", featured: false, daysAgo: 4  },
];

const currency = (n) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const grid = document.getElementById("propertyGrid");
const resultsCount = document.getElementById("resultsCount");
const emptyState = document.getElementById("emptyState");

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
  const priceLabel = p.status === "rent" ? `${currency(p.price)}<span>/mo</span>` : currency(p.price);
  return `
    <article class="card" data-id="${p.id}">
      <div class="card-photo ${p.photo}">
        <span class="icon">⌂</span>
        <span class="badge ${p.status}">${p.status === "sale" ? "For Sale" : "For Rent"}</span>
      </div>
      <div class="card-body">
        <div class="card-price">${priceLabel}</div>
        <h3 class="card-title">${p.title}</h3>
        <div class="card-location">📍 ${p.city} &middot; ${p.type}</div>
        <div class="card-meta">
          <span>🛏 ${p.beds === 0 ? "Studio" : p.beds + " bd"}</span>
          <span>🛁 ${p.baths} ba</span>
          <span>📐 ${p.sqft.toLocaleString()} sqft</span>
        </div>
        <div class="card-cta">View details →</div>
      </div>
    </article>
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
