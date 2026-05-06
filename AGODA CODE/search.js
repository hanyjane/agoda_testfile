// ===== search.js =====

const destinations = [
    { country: 'Philippines', city: 'Cebu',          name: 'Cebu',          count: 5254,  tags: 'beaches, nature',       img: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=100&q=60' },
    { country: 'Philippines', city: 'Manila',         name: 'Manila',         count: 13223, tags: 'shopping, restaurants',  img: 'https://images.unsplash.com/photo-1573108037329-37aa135a142e?w=100&q=60' },
    { country: 'Philippines', city: 'Baguio',         name: 'Baguio',         count: 1944,  tags: 'nature, sightseeing',   img: 'https://images.unsplash.com/photo-1604999565976-8913ad2ddb7c?w=100&q=60' },
    { country: 'Philippines', city: 'Boracay Island', name: 'Boracay Island', count: 1038,  tags: 'beaches, romance',      img: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=100&q=60' },
    { country: 'Philippines', city: 'Palawan',        name: 'Palawan',        count: 870,   tags: 'beaches, nature',       img: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=100&q=60' },
    { country: 'Philippines', city: 'Davao City',     name: 'Davao City',     count: 1200,  tags: 'nature, food',          img: 'https://images.unsplash.com/photo-1573108037329-37aa135a142e?w=100&q=60' },
    { country: 'Philippines', city: 'Siargao',        name: 'Siargao',        count: 420,   tags: 'surfing, beaches',      img: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=100&q=60' },
    { country: 'Philippines', city: 'Tagaytay',       name: 'Tagaytay',       count: 680,   tags: 'views, nature',         img: 'https://images.unsplash.com/photo-1604999565976-8913ad2ddb7c?w=100&q=60' },
    { country: 'Japan',       city: 'Tokyo',          name: 'Tokyo',          count: 18500, tags: 'culture, food',         img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=100&q=60' },
    { country: 'Japan',       city: 'Osaka',          name: 'Osaka',          count: 9800,  tags: 'food, nightlife',       img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&q=60' },
    { country: 'Japan',       city: 'Kyoto',          name: 'Kyoto',          count: 7200,  tags: 'culture, temples',      img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=100&q=60' },
    { country: 'Thailand',    city: 'Bangkok',        name: 'Bangkok',        count: 22000, tags: 'culture, shopping',     img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=100&q=60' },
    { country: 'Thailand',    city: 'Phuket',         name: 'Phuket',         count: 7600,  tags: 'beaches, nightlife',    img: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=100&q=60' },
    { country: 'Singapore',   city: 'Singapore',      name: 'Singapore',      count: 11200, tags: 'shopping, food',        img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=100&q=60' },
    { country: 'Malaysia',    city: 'Kuala Lumpur',   name: 'Kuala Lumpur',   count: 8900,  tags: 'shopping, culture',     img: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=100&q=60' },
    { country: 'Indonesia',   city: 'Bali',           name: 'Bali',           count: 14000, tags: 'beaches, culture',      img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=100&q=60' },
];

const countryFlags = {
    'Philippines': '🇵🇭',
    'Japan':       '🇯🇵',
    'Thailand':    '🇹🇭',
    'Singapore':   '🇸🇬',
    'Malaysia':    '🇲🇾',
    'Indonesia':   '🇮🇩',
};

const allCountries = [...new Set(destinations.map(d => d.country))];

// ── Element references ──
const searchInput    = document.getElementById('searchInput');
const searchDropdown = document.getElementById('searchDropdown');
const recentSection  = document.getElementById('recentSection');
const citySection    = document.getElementById('citySection');
const cityResults    = document.getElementById('cityResults');
const popularSection = document.getElementById('popularSection');
const popularList    = document.getElementById('popularList');

document.getElementById('columnsSection').style.display = 'none';

// ── State ──
let lastSelectedCountry = null;

// ── Build popular country list (default view) ──
function buildPopularCountries() {
    lastSelectedCountry = null;

    popularList.innerHTML = allCountries.map(country => {
        const cities      = destinations.filter(d => d.country === country);
        const totalProps  = cities.reduce((s, d) => s + d.count, 0);
        const flag        = countryFlags[country] || '🌍';
        return `
      <div class="popular-country-card" onclick="showCountryCities('${country}')">
        <div class="pcc-flag">${flag}</div>
        <div class="pcc-info">
          <p class="pcc-name">${country}</p>
          <p class="pcc-sub">${cities.length} cities · ${totalProps.toLocaleString()} properties</p>
        </div>
        <i class="fa fa-chevron-right pcc-arrow"></i>
      </div>
    `;
    }).join('');

    document.querySelector('#popularSection .search-section-title').textContent = 'Popular destinations';
    popularSection.style.display = 'block';
    citySection.style.display    = 'none';
}

// ── Show cities of selected country (with "All hotels in X" at top) ──
function showCountryCities(country) {
    lastSelectedCountry = country;
    const flag      = countryFlags[country] || '🌍';
    const cities    = destinations.filter(d => d.country === country);
    const totalAll  = cities.reduce((s, d) => s + d.count, 0);

    cityResults.innerHTML = `
    <div class="city-back-btn" onclick="buildPopularCountries()">
      <i class="fa fa-arrow-left"></i> All countries
    </div>
    <p class="city-country-header">${flag} ${country}</p>

    <!-- ALL hotels in country option -->
    <div class="result-item result-all-country" onclick="selectCountry('${country}')">
      <div class="result-all-icon"><i class="fa fa-globe"></i></div>
      <div class="result-info">
        <p class="result-name"><strong>All hotels in ${country}</strong></p>
        <p class="result-sub">${totalAll.toLocaleString()} properties across ${cities.length} cities</p>
      </div>
      <i class="fa fa-chevron-right" style="color:#ccc;margin-left:auto;font-size:12px;"></i>
    </div>

    ${cities.map(d => `
      <div class="result-item" onclick="selectDestination('${d.name}', '${d.country}', '${d.city}')">
        <img class="result-img" src="${d.img}" alt="${d.name}" onerror="this.style.background='#e5e5e5';this.removeAttribute('src')"/>
        <div class="result-info">
          <p class="result-name">${d.name} <span>(${d.count.toLocaleString()})</span></p>
          <p class="result-sub">${d.tags}</p>
        </div>
      </div>
    `).join('')}
  `;

    popularSection.style.display = 'none';
    citySection.style.display    = 'block';
}

// ── Select entire country (no specific city) ──
function selectCountry(country) {
    const flag = countryFlags[country] || '🌍';
    searchInput.value       = country;
    lastSelectedCountry     = country;
    searchDropdown.classList.remove('active');
    localStorage.setItem('search_country',     country);
    localStorage.setItem('search_city',        '');
    localStorage.setItem('search_destination', country);
    saveRecentSearch(country);
    document.dispatchEvent(new CustomEvent('destinationSelected', {
        detail: { name: country, country, city: '' }
    }));
}

// ── Select specific city ──
function selectDestination(name, country, city) {
    searchInput.value       = name + ', ' + country;
    lastSelectedCountry     = country;
    searchDropdown.classList.remove('active');
    localStorage.setItem('search_country',     country);
    localStorage.setItem('search_city',        city);
    localStorage.setItem('search_destination', name + ', ' + country);
    saveRecentSearch(name + ', ' + country);
    document.dispatchEvent(new CustomEvent('destinationSelected', {
        detail: { name, country, city }
    }));
}

// ── Recent search ──
function loadRecent() {
    const recent = JSON.parse(localStorage.getItem('recent_search') || 'null');
    if (recent) {
        document.getElementById('recentCity').textContent   = recent.destination;
        document.getElementById('recentDates').textContent  = recent.dates;
        document.getElementById('recentGuests').textContent = recent.guests;
        recentSection.style.display = 'block';
    } else {
        recentSection.style.display = 'none';
    }
}

function useRecent() {
    const recent = JSON.parse(localStorage.getItem('recent_search') || 'null');
    if (recent) {
        searchInput.value = recent.destination;
        searchDropdown.classList.remove('active');
        localStorage.setItem('search_destination', recent.destination);
    }
}

function showDefault() {
    loadRecent();
    if (lastSelectedCountry) {
        showCountryCities(lastSelectedCountry);
    } else {
        buildPopularCountries();
    }
}

// ── Filter by typed query ──
function filterResults(q) {
    const cleaned = q.split(',')[0].trim().toLowerCase();

    recentSection.style.display  = 'none';
    popularSection.style.display = 'none';
    citySection.style.display    = 'none';

    const matchedCountries = allCountries.filter(c => c.toLowerCase().includes(cleaned));
    const matchedCities    = destinations.filter(d =>
        d.name.toLowerCase().includes(cleaned) ||
        d.city.toLowerCase().includes(cleaned) ||
        d.tags.toLowerCase().includes(cleaned)
    );

    // Only country matches → show that country's cities
    if (matchedCountries.length === 1 && matchedCities.filter(d => d.country === matchedCountries[0]).length > 0) {
        showCountryCities(matchedCountries[0]);
        citySection.style.display = 'block';
        return;
    }

    // Multiple country matches → show country cards
    if (matchedCountries.length > 1 && matchedCities.length === 0) {
        cityResults.innerHTML = matchedCountries.map(country => {
            const flag   = countryFlags[country] || '🌍';
            const cities = destinations.filter(d => d.country === country);
            const total  = cities.reduce((s, d) => s + d.count, 0);
            return `
        <div class="popular-country-card" onclick="showCountryCities('${country}')">
          <div class="pcc-flag">${flag}</div>
          <div class="pcc-info">
            <p class="pcc-name">${highlight(country, cleaned)}</p>
            <p class="pcc-sub">${cities.length} cities · ${total.toLocaleString()} properties</p>
          </div>
          <i class="fa fa-chevron-right pcc-arrow"></i>
        </div>
      `;
        }).join('');
        citySection.style.display = 'block';
        return;
    }

    // Mixed / city-level matches — group by country
    const allMatches = destinations.filter(d =>
        d.name.toLowerCase().includes(cleaned) ||
        d.country.toLowerCase().includes(cleaned) ||
        d.city.toLowerCase().includes(cleaned) ||
        d.tags.toLowerCase().includes(cleaned)
    );

    if (allMatches.length === 0) {
        cityResults.innerHTML     = `<p class="no-results">No results for "<strong>${q}</strong>"</p>`;
        citySection.style.display = 'block';
        return;
    }

    const grouped = {};
    allMatches.forEach(d => {
        if (!grouped[d.country]) grouped[d.country] = [];
        grouped[d.country].push(d);
    });

    cityResults.innerHTML = Object.entries(grouped).map(([country, cities]) => `
    <div class="result-group">
      <p class="result-group-label">${countryFlags[country] || '🌍'} ${country}
        <span class="result-group-all" onclick="selectCountry('${country}')">All hotels</span>
      </p>
      ${cities.slice(0, 4).map(d => `
        <div class="result-item" onclick="selectDestination('${d.name}', '${d.country}', '${d.city}')">
          <img class="result-img" src="${d.img}" alt="${d.name}" onerror="this.style.background='#e5e5e5';this.removeAttribute('src')"/>
          <div class="result-info">
            <p class="result-name">${highlight(d.name, cleaned)} <span>(${d.count.toLocaleString()})</span></p>
            <p class="result-sub">${d.tags}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');
    citySection.style.display = 'block';
}

function highlight(text, query) {
    if (!query) return text;
    const regex = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return text.replace(regex, '<strong>$1</strong>');
}

function saveRecentSearch(destination) {
    const today    = new Date();
    const checkin  = new Date(today); checkin.setDate(today.getDate() + 5);
    const checkout = new Date(today); checkout.setDate(today.getDate() + 9);
    const fmt      = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    localStorage.setItem('recent_search', JSON.stringify({
        destination,
        dates:  fmt(checkin) + ' – ' + fmt(checkout),
        guests: 2
    }));
}

// ── Events ──
searchInput.addEventListener('focus', function () {
    searchDropdown.classList.add('active');
    if (this.value.trim() === '') showDefault();
    else filterResults(this.value.trim());
});

searchInput.addEventListener('input', function () {
    const q = this.value.trim();
    if (q === '') { showDefault(); return; }
    filterResults(q);
});

searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        const q = this.value.trim();
        if (q) {
            saveRecentSearch(q);
            searchDropdown.classList.remove('active');
            localStorage.setItem('search_destination', q);
        }
    }
});

document.addEventListener('click', function (e) {
    if (!e.target.closest('.search-bar-wrap')) {
        searchDropdown.classList.remove('active');
    }
});