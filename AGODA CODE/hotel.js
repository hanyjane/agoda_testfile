// ===== HOTEL PAGE — hotel.js =====

// ============================================================
//  HOTEL DATA (sample Philippine hotels)
// ============================================================
const HOTELS = [
  {
    id: 1,
    name: "Manila Grand Palace Hotel",
    city: "Manila",
    country: "Philippines",
    area: "Makati",
    stars: 5,
    rating: 9.2,
    reviews: 3842,
    price: 8500,
    originalPrice: 12400,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
    type: "Hotel",
    amenities: ["wifi", "pool", "breakfast", "parking", "gym"],
    description: "Luxury 5-star hotel in the heart of Makati with stunning city views and world-class amenities."
  },
  {
    id: 2,
    name: "Cebu Oceanview Resort & Spa",
    city: "Cebu",
    country: "Philippines",
    area: "Mactan Island",
    stars: 5,
    rating: 9.0,
    reviews: 2156,
    price: 12000,
    originalPrice: 16500,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80",
    type: "Resort",
    amenities: ["wifi", "pool", "breakfast", "parking", "gym"],
    description: "Beachfront resort with private beach access, infinity pool, and luxurious spa treatments."
  },
  {
    id: 3,
    name: "Boracay Sunset Beach Hotel",
    city: "Boracay Island",
    country: "Philippines",
    area: "Station 1",
    stars: 4,
    rating: 8.8,
    reviews: 1523,
    price: 6800,
    originalPrice: 9200,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80",
    type: "Hotel",
    amenities: ["wifi", "pool", "breakfast"],
    description: "Steps away from White Beach with breathtaking sunset views and modern Filipino hospitality."
  },
  {
    id: 4,
    name: "Baguio Pine Forest Lodge",
    city: "Baguio",
    country: "Philippines",
    area: "Camp John Hay",
    stars: 4,
    rating: 8.5,
    reviews: 987,
    price: 4200,
    originalPrice: 5800,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80",
    type: "Hotel",
    amenities: ["wifi", "parking", "breakfast"],
    description: "Nestled among pine trees with cool mountain air, perfect for a tranquil city escape."
  },
  {
    id: 5,
    name: "Davao Waterfront Residence",
    city: "Davao City",
    country: "Philippines",
    area: "Downtown",
    stars: 4,
    rating: 8.3,
    reviews: 645,
    price: 3800,
    originalPrice: 5200,
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80",
    type: "Apartment",
    amenities: ["wifi", "pool", "parking", "gym"],
    description: "Modern serviced apartment with panoramic waterfront views and fully equipped kitchen."
  },
  {
    id: 6,
    name: "Palawan Island Paradise Resort",
    city: "Palawan",
    country: "Philippines",
    area: "El Nido",
    stars: 5,
    rating: 9.5,
    reviews: 4210,
    price: 15000,
    originalPrice: 22000,
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80",
    type: "Resort",
    amenities: ["wifi", "pool", "breakfast", "parking"],
    description: "Award-winning eco-luxury resort set on a private beach with crystal-clear lagoon access."
  },
  {
    id: 7,
    name: "BGC Modern Suites",
    city: "Manila",
    country: "Philippines",
    area: "Bonifacio Global City",
    stars: 4,
    rating: 8.6,
    reviews: 1320,
    price: 5500,
    originalPrice: 7200,
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80",
    type: "Apartment",
    amenities: ["wifi", "pool", "gym", "parking"],
    description: "Contemporary urban suites in BGC with rooftop pool and co-working space."
  },
  {
    id: 8,
    name: "Siargao Surf Hostel",
    city: "Siargao",
    country: "Philippines",
    area: "General Luna",
    stars: 3,
    rating: 8.1,
    reviews: 534,
    price: 1200,
    originalPrice: 1800,
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&q=80",
    type: "Hostel",
    amenities: ["wifi", "breakfast"],
    description: "Laid-back surfer hostel steps from Cloud 9 with board rentals and chill vibes."
  },
  {
    id: 9,
    name: "Tagaytay Highlands Retreat",
    city: "Tagaytay",
    country: "Philippines",
    area: "Tagaytay Ridge",
    stars: 4,
    rating: 8.7,
    reviews: 890,
    price: 4800,
    originalPrice: 6500,
    image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&q=80",
    type: "Hotel",
    amenities: ["wifi", "breakfast", "parking", "pool"],
    description: "Hilltop retreat with Taal Volcano views, cool breeze, and farm-to-table dining."
  },
  {
    id: 10,
    name: "Cebu Backpackers Hub",
    city: "Cebu",
    country: "Philippines",
    area: "IT Park",
    stars: 3,
    rating: 7.9,
    reviews: 412,
    price: 900,
    originalPrice: 1300,
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80",
    type: "Hostel",
    amenities: ["wifi"],
    description: "Budget-friendly hostel in Cebu's IT Park with social lounge and airport shuttle."
  },
  {
    id: 11,
    name: "Iloilo River Esplanade Hotel",
    city: "Iloilo",
    country: "Philippines",
    area: "City Proper",
    stars: 4,
    rating: 8.4,
    reviews: 567,
    price: 3500,
    originalPrice: 4800,
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=80",
    type: "Hotel",
    amenities: ["wifi", "breakfast", "parking", "gym"],
    description: "Elegant hotel along the Iloilo River with heritage-inspired design and river-view rooms."
  },
  {
    id: 12,
    name: "Manila Bay Luxury Suites",
    city: "Manila",
    country: "Philippines",
    area: "Pasay",
    stars: 5,
    rating: 9.1,
    reviews: 2890,
    price: 9800,
    originalPrice: 14500,
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80",
    type: "Hotel",
    amenities: ["wifi", "pool", "breakfast", "parking", "gym"],
    description: "Ultra-luxury suites overlooking Manila Bay with butler service and exclusive lounge."
  },
  {
    id: 13, name: "Tokyo Sakura Grand Hotel", city: "Tokyo", country: "Japan",
    area: "Shinjuku", stars: 5, rating: 9.3, reviews: 5200, price: 8500, originalPrice: 12000,
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
    type: "Hotel", amenities: ["wifi","breakfast","gym"],
    description: "Iconic 5-star hotel in Shinjuku with panoramic Mount Fuji views and traditional Japanese hospitality."
  },
  {
    id: 14, name: "Osaka Dotonbori Suites", city: "Osaka", country: "Japan",
    area: "Namba", stars: 4, rating: 8.9, reviews: 3100, price: 6200, originalPrice: 8800,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    type: "Hotel", amenities: ["wifi","breakfast"],
    description: "Modern hotel steps from Dotonbori with easy access to world-famous street food and nightlife."
  },
  {
    id: 15, name: "Kyoto Temple Garden Inn", city: "Kyoto", country: "Japan",
    area: "Gion", stars: 4, rating: 9.0, reviews: 2800, price: 5500, originalPrice: 7500,
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80",
    type: "Hotel", amenities: ["wifi","breakfast","parking"],
    description: "Traditional ryokan-inspired inn in Gion with bamboo gardens and nightly tea ceremony."
  },
  {
    id: 16, name: "Bangkok Riverside Palace", city: "Bangkok", country: "Thailand",
    area: "Chao Phraya", stars: 5, rating: 9.1, reviews: 6800, price: 4800, originalPrice: 7200,
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80",
    type: "Hotel", amenities: ["wifi","pool","breakfast","gym"],
    description: "Grand riverside palace hotel with private boat pier, rooftop infinity pool, and Thai spa."
  },
  {
    id: 17, name: "Phuket Andaman Beach Resort", city: "Phuket", country: "Thailand",
    area: "Patong Beach", stars: 5, rating: 9.0, reviews: 4500, price: 9200, originalPrice: 13500,
    image: "https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=600&q=80",
    type: "Resort", amenities: ["wifi","pool","breakfast","parking"],
    description: "Beachfront resort on Patong with direct Andaman Sea access, water sports, and sunset cruises."
  },
  {
    id: 18, name: "Marina Bay Garden Hotel", city: "Singapore", country: "Singapore",
    area: "Marina Bay", stars: 5, rating: 9.4, reviews: 7900, price: 12500, originalPrice: 18000,
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80",
    type: "Hotel", amenities: ["wifi","pool","breakfast","gym","parking"],
    description: "Iconic luxury hotel overlooking Marina Bay Sands with rooftop infinity pool and Michelin dining."
  },
  {
    id: 19, name: "KL Twin Towers Hotel", city: "Kuala Lumpur", country: "Malaysia",
    area: "KLCC", stars: 5, rating: 9.0, reviews: 4200, price: 5800, originalPrice: 8500,
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&q=80",
    type: "Hotel", amenities: ["wifi","pool","breakfast","gym"],
    description: "Luxury hotel connected to the Petronas Twin Towers with sky bridge views and world-class amenities."
  },
  {
    id: 20, name: "Bali Ubud Jungle Retreat", city: "Bali", country: "Indonesia",
    area: "Ubud", stars: 5, rating: 9.5, reviews: 5600, price: 6800, originalPrice: 10500,
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
    type: "Resort", amenities: ["wifi","pool","breakfast"],
    description: "Award-winning jungle retreat in Ubud with private plunge pools, rice terrace views, and holistic spa."
  }
];


// ============================================================
//  READ URL PARAMETERS
// ============================================================
function getSearchParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    dest:     params.get('dest')     || '',
    country:  params.get('country')  || '',
    city:     params.get('city')     || '',
    checkin:  params.get('checkin')  || '',
    checkout: params.get('checkout') || '',
    adults:   params.get('adults')   || '2',
    children: params.get('children') || '0',
    rooms:    params.get('rooms')    || '1'
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
  const checkinDay   = document.getElementById('checkinDay');
  if (checkinLabel && search.checkin) {
    checkinLabel.textContent = search.checkin;
    checkinDay.textContent   = '';
  }

  const checkoutLabel = document.getElementById('checkoutLabel');
  const checkoutDay   = document.getElementById('checkoutDay');
  if (checkoutLabel && search.checkout) {
    checkoutLabel.textContent = search.checkout;
    checkoutDay.textContent   = '';
  }

  // Guest counts
  const adultsCount   = document.getElementById('adultsCount');
  const childrenCount = document.getElementById('childrenCount');
  const roomsCount    = document.getElementById('roomsCount');
  const guestSummary  = document.getElementById('guestSummary');

  if (adultsCount)   adultsCount.textContent   = search.adults;
  if (childrenCount) childrenCount.textContent = search.children;
  if (roomsCount)    roomsCount.textContent    = search.rooms;

  if (guestSummary) {
    const a = parseInt(search.adults)   || 2;
    const c = parseInt(search.children) || 0;
    const r = parseInt(search.rooms)    || 1;
    let txt = a + ' adult' + (a !== 1 ? 's' : '');
    if (c > 0) txt += ', ' + c + ' child' + (c !== 1 ? 'ren' : '');
    txt += ' · ' + r + ' room' + (r !== 1 ? 's' : '');
    guestSummary.textContent = txt;
  }

  // Filter summary
  const summary = document.getElementById('filterSearchSummary');
  if (summary) {
    let html = '';
    if (search.dest) html += `<div class="summary-row"><i class="fa fa-location-dot"></i> ${search.dest}</div>`;
    if (search.checkin && search.checkout) html += `<div class="summary-row"><i class="fa fa-calendar"></i> ${search.checkin} → ${search.checkout}</div>`;
    else if (search.checkin) html += `<div class="summary-row"><i class="fa fa-calendar"></i> ${search.checkin}</div>`;
    const a = parseInt(search.adults) || 2;
    const r = parseInt(search.rooms)  || 1;
    html += `<div class="summary-row"><i class="fa fa-user"></i> ${a} adult${a!==1?'s':''} · ${r} room${r!==1?'s':''}</div>`;
    summary.innerHTML = html;
  }
}


// ============================================================
//  FILTER & SORT HOTELS
// ============================================================
let currentFilters = {
  maxPrice: 25000,
  stars: 0,        // 0 = all
  types: ['Hotel', 'Resort', 'Hostel', 'Apartment'],
  amenities: [],
  sort: 'recommended'
};

function filterHotels(search) {
  let results = [...HOTELS];

  // Priority 1: country + city
  if (search.country && search.city) {
    results = results.filter(h =>
      h.country.toLowerCase() === search.country.toLowerCase() &&
      h.city.toLowerCase() === search.city.toLowerCase()
    );
  }
  // Priority 2: country only
  else if (search.country) {
    results = results.filter(h =>
      h.country.toLowerCase() === search.country.toLowerCase()
    );
  }
  // Priority 3: legacy text search
  else if (search.dest) {
    const q = search.dest.toLowerCase();
    results = results.filter(h =>
      h.city.toLowerCase().includes(q) ||
      h.area.toLowerCase().includes(q) ||
      h.country.toLowerCase().includes(q) ||
      h.name.toLowerCase().includes(q)
    );
  }

  // Filter by price
  results = results.filter(h => h.price <= currentFilters.maxPrice);

  // Filter by stars
  if (currentFilters.stars > 0) {
    results = results.filter(h => h.stars >= currentFilters.stars);
  }

  // Filter by property type
  results = results.filter(h => currentFilters.types.includes(h.type));

  // Filter by amenities
  if (currentFilters.amenities.length > 0) {
    results = results.filter(h =>
      currentFilters.amenities.every(a => h.amenities.includes(a))
    );
  }

  // Sort
  switch (currentFilters.sort) {
    case 'price-low':
      results.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      results.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      results.sort((a, b) => b.rating - a.rating);
      break;
    case 'stars':
      results.sort((a, b) => b.stars - a.stars);
      break;
    default: // recommended — by rating * reviews
      results.sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews));
  }

  return results;
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
  return '₱' + n.toLocaleString('en-PH');
}

function getAmenityIcon(a) {
  const map = {
    wifi:      '<i class="fa fa-wifi"></i> WiFi',
    pool:      '<i class="fa fa-water-ladder"></i> Pool',
    breakfast: '<i class="fa fa-utensils"></i> Breakfast',
    parking:   '<i class="fa fa-square-parking"></i> Parking',
    gym:       '<i class="fa fa-dumbbell"></i> Gym'
  };
  return map[a] || '';
}

function renderHotels(hotels, search) {
  const container = document.getElementById('hotelCardsList');
  const noResults = document.getElementById('noResults');
  const countEl   = document.getElementById('resultsCount');

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
    const parseDate = (str) => {
      // Handle formats like "8 May 2026"
      const d = new Date(str);
      return isNaN(d.getTime()) ? null : d;
    };
    const ci = parseDate(search.checkin);
    const co = parseDate(search.checkout);
    if (ci && co) {
      nights = Math.max(1, Math.round((co - ci) / (1000 * 60 * 60 * 24)));
    }
  }

  container.innerHTML = hotels.map((h, i) => {
    const discount = Math.round((1 - h.price / h.originalPrice) * 100);
    const totalPrice = h.price * nights;
    const amenitiesHtml = h.amenities.slice(0, 4).map(a => `<span class="hotel-amenity-tag">${getAmenityIcon(a)}</span>`).join('');
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
                <span class="hotel-card-review-count">${h.reviews.toLocaleString()} reviews</span>
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
              <button class="hotel-card-btn">Book now</button>
            </div>
          </div>
        </div>
      </div>`;
  }).join('');
}


// ============================================================
//  GUESTS COUNTER (hotel.html version)
// ============================================================
const hotelGuestState = { adults: 2, children: 0, rooms: 1 };

function changeGuestHotel(type, delta) {
  hotelGuestState[type] = Math.max(type === 'rooms' || type === 'adults' ? 1 : 0, hotelGuestState[type] + delta);

  const el = document.getElementById(type === 'adults' ? 'adultsCount' : type === 'children' ? 'childrenCount' : 'roomsCount');
  if (el) el.textContent = hotelGuestState[type];

  const summary = document.getElementById('guestSummary');
  if (summary) {
    let txt = hotelGuestState.adults + ' adult' + (hotelGuestState.adults !== 1 ? 's' : '');
    if (hotelGuestState.children > 0) txt += ', ' + hotelGuestState.children + ' child' + (hotelGuestState.children !== 1 ? 'ren' : '');
    txt += ' · ' + hotelGuestState.rooms + ' room' + (hotelGuestState.rooms !== 1 ? 's' : '');
    summary.textContent = txt;
  }
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
const dayNames  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const monthAbbs = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDateInput(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return {
    label : d.getDate() + ' ' + monthAbbs[d.getMonth()] + ' ' + d.getFullYear(),
    day   : dayNames[d.getDay()]
  };
}

const checkinInput  = document.getElementById('checkinDate');
const checkoutInput = document.getElementById('checkoutDate');

if (checkinInput) {
  checkinInput.addEventListener('change', function () {
    const f = formatDateInput(this.value);
    document.getElementById('checkinLabel').textContent = f.label;
    document.getElementById('checkinDay').textContent   = f.day;
  });
}

if (checkoutInput) {
  checkoutInput.addEventListener('change', function () {
    const f = formatDateInput(this.value);
    document.getElementById('checkoutLabel').textContent = f.label;
    document.getElementById('checkoutDay').textContent   = f.day;
  });
}


// ============================================================
//  FILTER EVENT LISTENERS
// ============================================================
function setupFilters(search) {
  // Price range
  const priceSlider = document.getElementById('priceRange');
  const priceLabel  = document.getElementById('priceRangeValue');
  priceSlider.addEventListener('input', () => {
    const val = parseInt(priceSlider.value);
    currentFilters.maxPrice = val;
    priceLabel.textContent = val >= 25000 ? '₱25,000+' : '₱' + val.toLocaleString('en-PH');
    renderHotels(filterHotels(search), search);
  });

  // Star rating buttons
  document.querySelectorAll('.star-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.star-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilters.stars = parseInt(btn.dataset.stars);
      renderHotels(filterHotels(search), search);
    });
  });

  // Property type checkboxes
  document.querySelectorAll('.filter-group:nth-child(4) .filter-check input').forEach(cb => {
    cb.addEventListener('change', () => {
      currentFilters.types = [];
      document.querySelectorAll('.filter-group:nth-child(4) .filter-check input:checked').forEach(c => {
        currentFilters.types.push(c.value);
      });
      renderHotels(filterHotels(search), search);
    });
  });

  // Amenity checkboxes
  document.querySelectorAll('.filter-group:nth-child(5) .filter-check input').forEach(cb => {
    cb.addEventListener('change', () => {
      currentFilters.amenities = [];
      document.querySelectorAll('.filter-group:nth-child(5) .filter-check input:checked').forEach(c => {
        currentFilters.amenities.push(c.value);
      });
      renderHotels(filterHotels(search), search);
    });
  });

  // Sort select
  document.getElementById('sortSelect').addEventListener('change', (e) => {
    currentFilters.sort = e.target.value;
    renderHotels(filterHotels(search), search);
  });

  // Search button on hotel page
  document.getElementById('hotelSearchBtn').addEventListener('click', () => {
    const destEl = document.getElementById('searchInput');
    const dest   = destEl ? destEl.value.trim() : '';
    const ci  = document.getElementById('checkinLabel').textContent;
    const co  = document.getElementById('checkoutLabel').textContent;
    const a   = document.getElementById('adultsCount').textContent;
    const c   = document.getElementById('childrenCount').textContent;
    const r   = document.getElementById('roomsCount').textContent;
    const params = new URLSearchParams();
    const savedCountry = localStorage.getItem('search_country') || '';
    const savedCity    = localStorage.getItem('search_city')    || '';
    if (savedCountry) params.set('country', savedCountry);
    if (savedCity)    params.set('city',    savedCity);
    if (dest) params.set('dest', dest);
    if (ci && ci !== 'Check-in')   params.set('checkin',  ci);
    if (co && co !== 'Check-out')  params.set('checkout', co);
    params.set('adults', a); params.set('children', c); params.set('rooms', r);
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
  hotelGuestState.adults   = parseInt(search.adults)   || 2;
  hotelGuestState.children = parseInt(search.children) || 0;
  hotelGuestState.rooms    = parseInt(search.rooms)    || 1;

  populateSearchBar(search);
  setupFilters(search);
  renderHotels(filterHotels(search), search);

  // Update page title
  if (search.city && search.country) {
    document.title = `Hotels in ${search.city}, ${search.country} – Agoda`;
  } else if (search.country) {
    document.title = `Hotels in ${search.country} – Agoda`;
  } else if (search.dest) {
    document.title = `Hotels in ${search.dest} – Agoda`;
  }

  // Re-render results live when user picks from the dropdown
  document.addEventListener('destinationSelected', (e) => {
    const { country, city, name } = e.detail;
    search.country = country || '';
    search.city    = city    || '';
    search.dest    = name ? name + ', ' + country : country;
    renderHotels(filterHotels(search), search);
    const titleCity = city || country;
    document.title = city
      ? `Hotels in ${city}, ${country} – Agoda`
      : `Hotels in ${country} – Agoda`;
  });
});