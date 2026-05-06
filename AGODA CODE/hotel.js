// ===== HOTEL PAGE — hotel.js (DB-powered) =====
// Replaces static HOTELS array with a fetch from hotels.php


// ============================================================
//  READ URL PARAMETERS
// ============================================================
function getSearchParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    dest: params.get('dest') || '',
    country: params.get('country') || '',
    city: params.get('city') || '',
    checkin: params.get('checkin') || '',
    checkout: params.get('checkout') || '',
    adults: params.get('adults') || '2',
    children: params.get('children') || '0',
    rooms: params.get('rooms') || '1'
  };
}


// ============================================================
//  POPULATE SEARCH BAR FROM URL PARAMS
// ============================================================
function populateSearchBar(search) {
  const destInput = document.getElementById('searchInput');
  if (destInput) {
    if (search.city && search.country) {
      destInput.value = search.city + ', ' + search.country;
    } else if (search.country) {
      destInput.value = search.country;
    } else if (search.dest) {
      destInput.value = search.dest;
    }
  }

  const checkinLabel = document.getElementById('checkinLabel');
  const checkinDay = document.getElementById('checkinDay');
  if (checkinLabel && search.checkin) {
    checkinLabel.textContent = search.checkin;
    checkinDay.textContent = '';
  }

  const checkoutLabel = document.getElementById('checkoutLabel');
  const checkoutDay = document.getElementById('checkoutDay');
  if (checkoutLabel && search.checkout) {
    checkoutLabel.textContent = search.checkout;
    checkoutDay.textContent = '';
  }

  const adultsCount = document.getElementById('adultsCount');
  const childrenCount = document.getElementById('childrenCount');
  const roomsCount = document.getElementById('roomsCount');
  const guestSummary = document.getElementById('guestSummary');

  if (adultsCount) adultsCount.textContent = search.adults;
  if (childrenCount) childrenCount.textContent = search.children;
  if (roomsCount) roomsCount.textContent = search.rooms;

  if (guestSummary) {
    const a = parseInt(search.adults) || 2;
    const c = parseInt(search.children) || 0;
    const r = parseInt(search.rooms) || 1;
    let txt = a + ' adult' + (a !== 1 ? 's' : '');
    if (c > 0) txt += ', ' + c + ' child' + (c !== 1 ? 'ren' : '');
    txt += ' · ' + r + ' room' + (r !== 1 ? 's' : '');
    guestSummary.textContent = txt;
  }

  const summary = document.getElementById('filterSearchSummary');
  if (summary) {
    let html = '';
    if (search.dest) html += `<div class="summary-row"><i class="fa fa-location-dot"></i> ${search.dest}</div>`;
    if (search.checkin && search.checkout) html += `<div class="summary-row"><i class="fa fa-calendar"></i> ${search.checkin} → ${search.checkout}</div>`;
    else if (search.checkin) html += `<div class="summary-row"><i class="fa fa-calendar"></i> ${search.checkin}</div>`;
    const a = parseInt(search.adults) || 2;
    const r = parseInt(search.rooms) || 1;
    html += `<div class="summary-row"><i class="fa fa-user"></i> ${a} adult${a !== 1 ? 's' : ''} · ${r} room${r !== 1 ? 's' : ''}</div>`;
    summary.innerHTML = html;
  }
}


// ============================================================
//  CLIENT-SIDE FILTER STATE  (applied on top of DB results)
// ============================================================
let allHotels = [];   // raw data returned from the last DB fetch
let currentSearch = {};

let currentFilters = {
  maxPrice: 25000,
  stars: 0,
  types: ['Hotel', 'Resort', 'Hostel', 'Apartment'],
  amenities: [],
  sort: 'recommended'
};


// ============================================================
//  FETCH HOTELS FROM PHP BACKEND
// ============================================================
async function fetchHotels(search) {
  // Show loading state
  const countEl = document.getElementById('resultsCount');
  if (countEl) countEl.textContent = 'Loading hotels...';

  const params = new URLSearchParams();
  if (search.country) params.set('country', search.country);
  if (search.city) params.set('city', search.city);
  if (search.dest) params.set('dest', search.dest);
  params.set('sort', currentFilters.sort);

  try {
    const res = await fetch('hotels.php?' + params.toString());
    const json = await res.json();

    if (!json.success) {
      showError('Failed to load hotels: ' + (json.message || 'Unknown error'));
      return;
    }

    allHotels = json.hotels;
    applyClientFilters(search);

  } catch (err) {
    showError('Network error — could not reach hotels.php');
    console.error(err);
  }
}

function showError(msg) {
  const countEl = document.getElementById('resultsCount');
  if (countEl) countEl.textContent = msg;
}


// ============================================================
//  CLIENT-SIDE FILTERING  (price, stars, type, amenities)
// ============================================================
function applyClientFilters(search) {
  let results = [...allHotels];

  // Price
  results = results.filter(h => h.price <= currentFilters.maxPrice);

  // Stars
  if (currentFilters.stars > 0) {
    results = results.filter(h => h.stars >= currentFilters.stars);
  }

  // Property type
  results = results.filter(h => currentFilters.types.includes(h.type));

  // Amenities
  if (currentFilters.amenities.length > 0) {
    results = results.filter(h =>
      currentFilters.amenities.every(a => h.amenities.includes(a))
    );
  }

  // Client-side sort (re-sort since DB results come pre-sorted by recommended)
  switch (currentFilters.sort) {
    case 'price-low': results.sort((a, b) => a.price - b.price); break;
    case 'price-high': results.sort((a, b) => b.price - a.price); break;
    case 'rating': results.sort((a, b) => b.rating - a.rating); break;
    case 'stars': results.sort((a, b) => b.stars - a.stars); break;
    default: results.sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews));
  }

  renderHotels(results, search);
}


// ============================================================
//  RENDER HOTEL CARDS
// ============================================================
function getRatingLabel(rating) {
  if (rating >= 9.0) return 'Exceptional';
  if (rating >= 8.5) return 'Excellent';
  if (rating >= 8.0) return 'Very Good';
  if (rating >= 7.0) return 'Good';
  return 'Pleasant';
}

function formatPrice(n) {
  return '₱' + Number(n).toLocaleString('en-PH');
}

function getAmenityIcon(a) {
  const map = {
    wifi: '<i class="fa fa-wifi"></i> WiFi',
    pool: '<i class="fa fa-water-ladder"></i> Pool',
    breakfast: '<i class="fa fa-utensils"></i> Breakfast',
    parking: '<i class="fa fa-square-parking"></i> Parking',
    gym: '<i class="fa fa-dumbbell"></i> Gym'
  };
  return map[a] || '';
}

function renderHotels(hotels, search) {
  const container = document.getElementById('hotelCardsList');
  const noResults = document.getElementById('noResults');
  const countEl = document.getElementById('resultsCount');

  if (hotels.length === 0) {
    container.innerHTML = '';
    noResults.style.display = 'flex';
    countEl.textContent = 'No hotels found';
    return;
  }

  noResults.style.display = 'none';
  let destText = search.city && search.country
    ? `${search.city}, ${search.country}`
    : search.country || search.dest || 'All destinations';
  countEl.textContent = `${hotels.length} propert${hotels.length !== 1 ? 'ies' : 'y'} found in ${destText}`;

  // Calculate nights
  let nights = 1;
  if (search.checkin && search.checkout) {
    const ci = new Date(search.checkin);
    const co = new Date(search.checkout);
    if (!isNaN(ci) && !isNaN(co)) {
      nights = Math.max(1, Math.round((co - ci) / (1000 * 60 * 60 * 24)));
    }
  }

  container.innerHTML = hotels.map((h, i) => {
    const discount = Math.round((1 - h.price / h.originalPrice) * 100);
    const totalPrice = h.price * nights;
    const amenitiesHtml = h.amenities.slice(0, 4).map(a =>
      `<span class="hotel-amenity-tag">${getAmenityIcon(a)}</span>`
    ).join('');
    const starsHtml = '★'.repeat(h.stars);
    const ratingLabel = getRatingLabel(h.rating);

    return `
      <div class="hotel-card" style="animation-delay: ${i * 0.06}s">
        <div class="hotel-card-image-wrap">
          <img src="${h.image}" alt="${h.name}" class="hotel-card-image" loading="lazy"/>
          <div class="hotel-card-badge">${discount}% OFF</div>
          <button class="hotel-card-fav" title="Save"><i class="fa-regular fa-heart"></i></button>
        </div>
        <div class="hotel-card-body">
          <div class="hotel-card-top">
            <div class="hotel-card-meta">
              <span class="hotel-card-type">${h.type}</span>
              <span class="hotel-card-stars">${starsHtml}</span>
            </div>
            <div class="hotel-card-title-row">
              <h3 class="hotel-card-name">${h.name}</h3>
            </div>
            <p class="hotel-card-location"><i class="fa fa-location-dot"></i> ${h.area}, ${h.city}</p>
            <p class="hotel-card-desc">${h.description}</p>
            <div class="hotel-card-amenities">${amenitiesHtml}</div>
          </div>
          <div class="hotel-card-bottom">
            <div class="hotel-card-rating-wrap">
              <div class="hotel-card-rating-badge">${h.rating}</div>
              <div class="hotel-card-rating-info">
                <span class="hotel-card-rating-label">${ratingLabel}</span>
                <span class="hotel-card-review-count">${Number(h.reviews).toLocaleString()} reviews</span>
              </div>
            </div>
            <div class="hotel-card-price-action">
              <div class="hotel-card-price-wrap">
                <span class="hotel-card-original-price">${formatPrice(h.originalPrice)}</span>
                <div class="hotel-card-price-main">
                  <span class="hotel-card-price">${formatPrice(h.price)}</span>
                  <span class="hotel-card-price-info">/night</span>
                </div>
                ${nights > 1 ? `<span class="hotel-card-total">Total: ${formatPrice(totalPrice)} for ${nights} nights</span>` : ''}
              </div>
              <button class="hotel-card-btn"
                data-hotel-id="${h.id}"
                data-hotel-name="${h.name}"
                data-hotel-stars="${h.stars}"
                data-hotel-type="${h.type}"
                data-hotel-location="${h.area}, ${h.city}"
                data-hotel-rating="${h.rating}"
                data-hotel-price="${h.price}"
                data-hotel-amenities='${JSON.stringify(h.amenities)}'
                onclick="openRoomsModal(this)">Book now</button>
            </div>
          </div>
        </div>
      </div>`;
  }).join('');
}


// ============================================================
//  GUESTS COUNTER
// ============================================================
const hotelGuestState = { adults: 2, children: 0, rooms: 1 };

function changeGuestHotel(type, delta) {
  hotelGuestState[type] = Math.max(
    type === 'rooms' || type === 'adults' ? 1 : 0,
    hotelGuestState[type] + delta
  );
  const elMap = { adults: 'adultsCount', children: 'childrenCount', rooms: 'roomsCount' };
  const el = document.getElementById(elMap[type]);
  if (el) el.textContent = hotelGuestState[type];

  const summary = document.getElementById('guestSummary');
  if (summary) {
    let txt = hotelGuestState.adults + ' adult' + (hotelGuestState.adults !== 1 ? 's' : '');
    if (hotelGuestState.children > 0)
      txt += ', ' + hotelGuestState.children + ' child' + (hotelGuestState.children !== 1 ? 'ren' : '');
    txt += ' · ' + hotelGuestState.rooms + ' room' + (hotelGuestState.rooms !== 1 ? 's' : '');
    summary.textContent = txt;
  }
   fetchHotels(currentSearch);
}


// ============================================================
//  GUESTS DROPDOWN TOGGLE
// ============================================================
document.getElementById('guestsField').addEventListener('click', function (e) {
  e.stopPropagation();
  document.getElementById('guestsDropdown').classList.toggle('open');
});

function closeGuestsDropdown() {
  document.getElementById('guestsDropdown').classList.remove('open');
}

document.addEventListener('click', function () {
  closeGuestsDropdown();
});


// ============================================================
//  DATE INPUTS
// ============================================================
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthAbbs = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDateInput(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return {
    label: d.getDate() + ' ' + monthAbbs[d.getMonth()] + ' ' + d.getFullYear(),
    day: dayNames[d.getDay()]
  };
}

const checkinInput = document.getElementById('checkinDate');
const checkoutInput = document.getElementById('checkoutDate');

if (checkinInput) {
  checkinInput.addEventListener('change', function () {
    const f = formatDateInput(this.value);
    document.getElementById('checkinLabel').textContent = f.label;
    document.getElementById('checkinDay').textContent = f.day;
  });
}

if (checkoutInput) {
  checkoutInput.addEventListener('change', function () {
    const f = formatDateInput(this.value);
    document.getElementById('checkoutLabel').textContent = f.label;
    document.getElementById('checkoutDay').textContent = f.day;
  });
}


// ============================================================
//  FILTER EVENT LISTENERS
// ============================================================
function setupFilters(search) {
  // Price range
  const priceSlider = document.getElementById('priceRange');
  const priceLabel = document.getElementById('priceRangeValue');
  priceSlider.addEventListener('input', () => {
    const val = parseInt(priceSlider.value);
    currentFilters.maxPrice = val;
    priceLabel.textContent = val >= 25000 ? '₱25,000+' : '₱' + val.toLocaleString('en-PH');
    applyClientFilters(search);
  });

  // Star rating buttons
  document.querySelectorAll('.star-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.star-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilters.stars = parseInt(btn.dataset.stars);
      applyClientFilters(search);
    });
  });

  // Property type checkboxes
  document.querySelectorAll('.filter-group:nth-child(4) .filter-check input').forEach(cb => {
    cb.addEventListener('change', () => {
      currentFilters.types = [];
      document.querySelectorAll('.filter-group:nth-child(4) .filter-check input:checked').forEach(c => {
        currentFilters.types.push(c.value);
      });
      applyClientFilters(search);
    });
  });

  // Amenity checkboxes
  document.querySelectorAll('.filter-group:nth-child(5) .filter-check input').forEach(cb => {
    cb.addEventListener('change', () => {
      currentFilters.amenities = [];
      document.querySelectorAll('.filter-group:nth-child(5) .filter-check input:checked').forEach(c => {
        currentFilters.amenities.push(c.value);
      });
      applyClientFilters(search);
    });
  });

  // Sort select — re-fetch with new sort order
  document.getElementById('sortSelect').addEventListener('change', (e) => {
    currentFilters.sort = e.target.value;
    fetchHotels(search);   // re-fetch so DB can sort too
  });

  // Search button on hotel page
  document.getElementById('hotelSearchBtn').addEventListener('click', () => {
    const destEl = document.getElementById('searchInput');
    const dest = destEl ? destEl.value.trim() : '';
    const ci = document.getElementById('checkinLabel').textContent;
    const co = document.getElementById('checkoutLabel').textContent;
    const a = document.getElementById('adultsCount').textContent;
    const c = document.getElementById('childrenCount').textContent;
    const r = document.getElementById('roomsCount').textContent;
    const params = new URLSearchParams();
    const savedCountry = localStorage.getItem('search_country') || '';
    const savedCity = localStorage.getItem('search_city') || '';
    if (savedCountry) params.set('country', savedCountry);
    if (savedCity) params.set('city', savedCity);
    if (dest) params.set('dest', dest);
    if (ci && ci !== 'Check-in') params.set('checkin', ci);
    if (co && co !== 'Check-out') params.set('checkout', co);
    params.set('adults', a);
    params.set('children', c);
    params.set('rooms', r);
    window.location.href = 'hotel.html?' + params.toString();
  });
}


// ============================================================
//  INITIALIZE
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const search = getSearchParams();

  // Fallback to localStorage if no URL params
  if (!search.country && localStorage.getItem('search_country')) {
    search.country = localStorage.getItem('search_country');
  }
  if (!search.city && localStorage.getItem('search_city')) {
    search.city = localStorage.getItem('search_city');
  }
  if (!search.dest && localStorage.getItem('search_destination')) {
    search.dest = localStorage.getItem('search_destination');
  }
  if (!search.checkin && localStorage.getItem('search_checkin_label')) {
    search.checkin = localStorage.getItem('search_checkin_label');
  }
  if (!search.checkout && localStorage.getItem('search_checkout_label')) {
    search.checkout = localStorage.getItem('search_checkout_label');
  }

  // Set guest state from params
  hotelGuestState.adults = parseInt(search.adults) || 2;
  hotelGuestState.children = parseInt(search.children) || 0;
  hotelGuestState.rooms = parseInt(search.rooms) || 1;

  currentSearch = search;

  populateSearchBar(search);
  setupFilters(search);

  // ── MAIN FETCH — replaces static HOTELS array ──
  fetchHotels(search);

  // Update page title
  if (search.city && search.country) {
    document.title = `Hotels in ${search.city}, ${search.country} – Agoda`;
  } else if (search.country) {
    document.title = `Hotels in ${search.country} – Agoda`;
  } else if (search.dest) {
    document.title = `Hotels in ${search.dest} – Agoda`;
  }

  // Re-fetch when user picks from the destination dropdown
  document.addEventListener('destinationSelected', (e) => {
    const { country, city, name } = e.detail;
    currentSearch.country = country || '';
    currentSearch.city = city || '';
    currentSearch.dest = name ? name + ', ' + country : country;
    fetchHotels(currentSearch);
    document.title = city
      ? `Hotels in ${city}, ${country} – Agoda`
      : `Hotels in ${country} – Agoda`;
  });
});