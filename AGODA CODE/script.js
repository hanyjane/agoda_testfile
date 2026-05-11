// Clear dates on index page load

// ============================================================
//  TAB SWITCHING (search tabs)
// ============================================================
function setTab(el) {
  document.querySelectorAll('.stab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

// ============================================================
//  STAY TOGGLE
// ============================================================
function toggleStay(el) {
  document.querySelectorAll('.stay-toggle button').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

// ============================================================
//  GUEST PICKER TOGGLE
// ============================================================
function toggleGuests() {
  const picker = document.getElementById('guest-picker');
  const box = document.getElementById('guest-box');
  const isOpen = picker.style.display === 'block';
  const datePicker = document.getElementById('picker-popup');
  if (datePicker) datePicker.style.display = 'none';
  document.getElementById('checkin-box').classList.remove('active');
  document.getElementById('checkout-box').classList.remove('active');
  picker.style.display = isOpen ? 'none' : 'block';
  box.classList.toggle('active', !isOpen);
}

function closeGuests() {
  const picker = document.getElementById('guest-picker');
  const box = document.getElementById('guest-box');
  if (picker) picker.style.display = 'none';
  if (box) box.classList.remove('active');
}

document.addEventListener('click', (e) => {
  const picker = document.getElementById('guest-picker');
  const wrap = document.querySelector('.guest-picker-wrap');
  if (picker && wrap && picker.style.display === 'block' && !wrap.contains(e.target)) {
    closeGuests();
  }
});

// ============================================================
//  GUEST COUNTS
// ============================================================
const guests = { adults: 2, children: 0, rooms: 1 };

function changeGuest(type, delta) {
  const min = (type === 'adults' || type === 'rooms') ? 1 : 0;
  guests[type] = Math.max(min, guests[type] + delta);
  document.getElementById(`${type}-count`).textContent = guests[type];
  updateGuestsDisplay();
}

function updateGuestsDisplay() {
  const parts = [`${guests.adults} adult${guests.adults !== 1 ? 's' : ''}`];
  if (guests.children > 0) {
    parts.push(`${guests.children} child${guests.children !== 1 ? 'ren' : ''}`);
  }
  const guestsDisplay = document.getElementById('guests-display');
  const roomsLabel = document.getElementById('rooms-label');
  if (guestsDisplay) guestsDisplay.textContent = parts.join(' · ');
  if (roomsLabel) roomsLabel.textContent = `${guests.rooms} room${guests.rooms !== 1 ? 's' : ''}`;
}

// ============================================================
//  SEARCH
// ============================================================
function handleSearch() {
  const dest = document.getElementById('destInput');
  if (!dest || !dest.value.trim()) return;

  let searches = JSON.parse(localStorage.getItem('recent_searches')) || [];
  searches.push(dest.value.trim());
  searches = searches.slice(-5);
  localStorage.setItem('recent_searches', JSON.stringify(searches));

  window.location.href = "hotel.html?dest=" + encodeURIComponent(dest.value.trim());
}

// ============================================================
//  DESTINATION CARD CLICK
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.dest-card').forEach(card => {
    card.addEventListener('click', () => {
      const name = card.querySelector('.dest-card-name').textContent;
      const destInput = document.getElementById('destInput');
      if (destInput) destInput.value = name;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  updateDisplay('checkin', null);
  updateDisplay('checkout', null);
  renderBoth();
});

// ============================================================
//  DATEPICKER LOGIC
// ============================================================
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const WDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const _now = new Date();
let viewYear = _now.getFullYear();
let viewMonth = _now.getMonth();
let checkinDate = null;
let checkoutDate = null;
let selecting = null;

/* ── Open / Close ─────────────────────────────────── */
function openPicker(which) {
  selecting = which;
  closeGuests();
  document.getElementById('checkin-box').classList.toggle('active', which === 'checkin');
  document.getElementById('checkout-box').classList.toggle('active', which === 'checkout');
  const ref = which === 'checkin' ? checkinDate : (checkoutDate || checkinDate);
  if (ref) {
    viewYear = ref.getFullYear();
    viewMonth = ref.getMonth();
  } else {
    const today = new Date();
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();
  }
  document.getElementById('picker-popup').style.display = 'block';
  renderBoth();
}

function closePicker() {
  const popup = document.getElementById('picker-popup');
  if (popup) popup.style.display = 'none';
  const ci = document.getElementById('checkin-box');
  const co = document.getElementById('checkout-box');
  if (ci) ci.classList.remove('active');
  if (co) co.classList.remove('active');
  selecting = null;
}

document.addEventListener('click', (e) => {
  const popup = document.getElementById('picker-popup');
  const wrap = document.querySelector('.date-picker-wrap');
  if (
    popup && wrap &&
    popup.style.display === 'block' &&
    !popup.contains(e.target) &&
    !wrap.contains(e.target)
  ) {
    closePicker();
  }
});

/* ── Picker Tab switching ─────────────────────────── */
function setPickerTab(t) {
  const isCal = t === 'cal';
  document.getElementById('tab-cal-content').style.display = isCal ? 'block' : 'none';
  document.getElementById('tab-flex-content').style.display = isCal ? 'none' : 'block';
  document.getElementById('tab-cal-btn').classList.toggle('active', isCal);
  document.getElementById('tab-flex-btn').classList.toggle('active', !isCal);
}

/* ── Month navigation ─────────────────────────────── */
function shiftMonth(delta) {
  viewMonth += delta;
  if (viewMonth > 11) { viewMonth = 0; viewYear++; }
  if (viewMonth < 0) { viewMonth = 11; viewYear--; }
  renderBoth();
}

/* ── Render both months ───────────────────────────── */
function renderBoth() {
  let m2 = viewMonth + 1, y2 = viewYear;
  if (m2 > 11) { m2 = 0; y2++; }
  document.getElementById('left-month-label').textContent = MONTHS[viewMonth] + ' ' + viewYear;
  document.getElementById('right-month-label').textContent = MONTHS[m2] + ' ' + y2;
  buildCal('left-cal', viewYear, viewMonth);
  buildCal('right-cal', y2, m2);
}

/* ── Build a single month ─────────────────────────── */
function buildCal(containerId, y, m) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  DAYS.forEach(d => {
    const el = document.createElement('div');
    el.className = 'day-name';
    el.textContent = d;
    container.appendChild(el);
  });
  const firstDow = new Date(y, m, 1).getDay();
  const offset = firstDow === 0 ? 6 : firstDow - 1;
  for (let i = 0; i < offset; i++) {
    const el = document.createElement('div');
    el.className = 'day-cell empty';
    container.appendChild(el);
  }
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const totalDays = new Date(y, m + 1, 0).getDate();
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(y, m, d);
    const isPast = date < today;
    const isCI = checkinDate && sameDay(date, checkinDate);
    const isCO = checkoutDate && sameDay(date, checkoutDate);
    const inRange = checkinDate && checkoutDate
      && date > checkinDate && date < checkoutDate;
    const isToday = sameDay(date, today);
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    if (isPast) cell.classList.add('past');
    if (isToday) cell.classList.add('today');
    if (isCI) cell.classList.add('selected-start');
    if (isCO) cell.classList.add('selected-end');
    if (inRange) cell.classList.add('in-range');
    const span = document.createElement('span');
    span.textContent = d;
    cell.appendChild(span);
    if (!isPast) {
      cell.addEventListener('click', () => pickDay(new Date(y, m, d)));
    }
    container.appendChild(cell);
  }
}

/* ── Handle a day click ───────────────────────────── */
function pickDay(date) {
  if (selecting === 'checkin') {
    checkinDate = date;
    if (checkoutDate && checkoutDate <= checkinDate) checkoutDate = null;
    updateDisplay('checkin', checkinDate);
    updateDisplay('checkout', checkoutDate);
    selecting = 'checkout';
    document.getElementById('checkin-box').classList.remove('active');
    document.getElementById('checkout-box').classList.add('active');
  } else {
    if (checkinDate && date <= checkinDate) {
      checkinDate  = date;
      checkoutDate = null;
      updateDisplay('checkin', checkinDate);
      updateDisplay('checkout', null);
      selecting = 'checkout';
    } else {
      checkoutDate = date;
      updateDisplay('checkout', checkoutDate);
      setTimeout(closePicker, 200);
    }
  }
  renderBoth();

  // ← Save recent search with updated dates every time a date is picked
  if (checkinDate && checkoutDate) {
    const dest    = localStorage.getItem('search_destination') || '';
    const country = localStorage.getItem('search_country')     || '';
    const city    = localStorage.getItem('search_city')        || '';
    if (dest) saveRecentSearch(dest, country, city);
  }
}

/* ── Update display boxes ─────────────────────────── */
function updateDisplay(which, date) {
  const valEl = document.getElementById(`${which}-display`);
  const dayEl = document.getElementById(`${which}-day`);
  if (!valEl) return;
  if (date) {
    valEl.textContent = fmtDate(date);
    if (dayEl) dayEl.textContent = WDAYS[date.getDay()];
  } else {
    valEl.textContent = which === 'checkin' ? 'Check-in' : 'Check-out';
    if (dayEl) dayEl.textContent = '';
  }
}

/* ── Helpers ──────────────────────────────────────── */
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function fmtDate(d) {
  return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
}

// ============================================================
//  I'M FLEXIBLE TAB LOGIC
// ============================================================
const FLEX_VISIBLE = 5;
let flexOffset = 0;
let flexSelectedMonth = null;
let flexNights = 3;
let flexWeekend = true;

function getFlexPool() {
  const today = new Date();
  const pool = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    pool.push({ year: d.getFullYear(), month: d.getMonth() });
  }
  return pool;
}

function initFlex() {
  if (!flexSelectedMonth) {
    const pool = getFlexPool();
    flexSelectedMonth = pool[2];
  }
  renderFlexMonths(false);
}

function renderFlexMonths(animate = false) {
  const pool = getFlexPool();
  const row = document.getElementById('flex-months-row');
  if (!row) return;

  const doRender = () => {
    row.innerHTML = '';
    const slice = pool.slice(flexOffset, flexOffset + FLEX_VISIBLE);
    slice.forEach(({ year, month }) => {
      const card = document.createElement('div');
      card.className = 'flex-month-card';
      const isActive = flexSelectedMonth &&
        flexSelectedMonth.year === year &&
        flexSelectedMonth.month === month;
      if (isActive) card.classList.add('active');
      card.innerHTML = `
        <i class="fa fa-calendar-days"></i>
        <span class="flex-month-name">${MONTHS[month]}</span>
        <span class="flex-month-year">${year}</span>
      `;
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        flexSelectedMonth = { year, month };
        renderFlexMonths(false);
      });
      row.appendChild(card);
    });
    const left = document.getElementById('flex-arrow-left');
    const right = document.getElementById('flex-arrow-right');
    if (left) left.style.visibility = flexOffset <= 0 ? 'hidden' : 'visible';
    if (right) right.style.visibility = flexOffset + FLEX_VISIBLE >= 12 ? 'hidden' : 'visible';
  };

  if (animate) {
    row.style.opacity = '0';
    row.style.transform = 'translateX(6px)';
    setTimeout(() => {
      doRender();
      row.style.transition = 'none';
      row.style.opacity = '0';
      row.style.transform = 'translateX(6px)';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          row.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
          row.style.opacity = '1';
          row.style.transform = 'translateX(0)';
        });
      });
    }, 100);
  } else {
    row.style.transition = 'none';
    row.style.opacity = '1';
    row.style.transform = 'translateX(0)';
    doRender();
  }
}

function scrollFlexMonths(dir) {
  const max = 12 - FLEX_VISIBLE;
  flexOffset = dir > 0
    ? Math.min(max, flexOffset + FLEX_VISIBLE)
    : Math.max(0, flexOffset - FLEX_VISIBLE);
  renderFlexMonths(true);
}

function selectDuration(btn) {
  document.querySelectorAll('.flex-duration-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const map = { '3 nights': 3, '1 week': 7, '1 month': 30 };
  flexNights = map[btn.textContent.trim()] || 3;
}

function toggleWeekend(checkbox) {
  flexWeekend = checkbox.checked;
}

function resolveCheckin(year, month) {
  const nights = flexNights;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const validDays = [];
  for (let d = 1; d <= daysInMonth - nights; d++) {
    const start = new Date(year, month, d);
    if (start < today) continue;
    if (!flexWeekend) { validDays.push(d); continue; }
    for (let offset = 0; offset <= nights; offset++) {
      const day = new Date(year, month, d + offset).getDay();
      if (day === 0 || day === 6) { validDays.push(d); break; }
    }
  }
  if (validDays.length === 0) return new Date(year, month, 1);
  return new Date(year, month, validDays[Math.floor(Math.random() * validDays.length)]);
}

function selectFlex() {
  if (!flexSelectedMonth) { closePicker(); return; }
  const { year, month } = flexSelectedMonth;
  checkinDate = resolveCheckin(year, month);
  checkoutDate = new Date(
    checkinDate.getFullYear(),
    checkinDate.getMonth(),
    checkinDate.getDate() + flexNights
  );
  updateDisplay('checkin', checkinDate);
  updateDisplay('checkout', checkoutDate);
  viewYear = checkinDate.getFullYear();
  viewMonth = checkinDate.getMonth();
  setPickerTab('cal');
  renderBoth();
}

function clearFlex() {
  flexSelectedMonth = null;
  flexOffset = 0;
  flexNights = 3;
  flexWeekend = true;
  document.querySelectorAll('.flex-duration-btn').forEach((b, i) => {
    b.classList.toggle('active', i === 0);
  });
  const wk = document.getElementById('weekend-check');
  if (wk) wk.checked = true;
  checkinDate = null;
  checkoutDate = null;
  updateDisplay('checkin', null);
  updateDisplay('checkout', null);
  renderBoth();
  initFlex();
}

const _origSetPickerTab = setPickerTab;
setPickerTab = function (t) {
  _origSetPickerTab(t);
  if (t === 'flex') initFlex();
};

document.addEventListener('DOMContentLoaded', () => {
  initFlex();
});

// ============================================================
//  SEARCH BAR (hotel.html only — guarded)
// ============================================================
const checkinInput = document.getElementById('checkinDate');
const checkoutInput = document.getElementById('checkoutDate');

if (checkinInput) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return {
      label: d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear(),
      day: days[d.getDay()]
    };
  }

  checkinInput.addEventListener('change', function () {
    const f = formatDate(this.value);
    document.getElementById('checkinLabel').textContent = f.label;
    document.getElementById('checkinDay').textContent = f.day;
  });

  checkoutInput.addEventListener('change', function () {
    const f = formatDate(this.value);
    document.getElementById('checkoutLabel').textContent = f.label;
    document.getElementById('checkoutDay').textContent = f.day;
  });

  const guestState = { adults: 2, children: 0, rooms: 1 };

  function changeGuest(type, delta) {
    guestState[type] = Math.max(type === 'rooms' ? 1 : 0, guestState[type] + delta);
    if (type === 'adults') guestState.adults = Math.max(1, guestState.adults);
    document.getElementById('adultsCount').textContent = guestState.adults;
    document.getElementById('childrenCount').textContent = guestState.children;
    document.getElementById('roomsCount').textContent = guestState.rooms;
    const total = guestState.adults + guestState.children;
    document.getElementById('guestSummary').textContent =
      total + ' adult' + (total !== 1 ? 's' : '') +
      (guestState.children > 0 ? ', ' + guestState.children + ' child' + (guestState.children !== 1 ? 'ren' : '') : '') +
      ' · ' + guestState.rooms + ' room' + (guestState.rooms !== 1 ? 's' : '');
  }

  const guestsField = document.getElementById('guestsField');
  if (guestsField) {
    guestsField.addEventListener('click', function (e) {
      e.stopPropagation();
      document.getElementById('guestsDropdown').classList.toggle('open');
    });
  }

  document.addEventListener('click', function () {
    const dd = document.getElementById('guestsDropdown');
    if (dd) dd.classList.remove('open');
  });
}

// ============================================================
//  COLLECT SEARCH DATA & REDIRECT (index.html hero bar)
// ============================================================
// ── Toast helper ──────────────────────────────────────
function showToast(msg, icon = 'fa-circle-exclamation') {
  let toast = document.getElementById('search-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'search-toast';
    toast.className = 'search-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fa ${icon}"></i> ${msg}`;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ============================================================
//  COLLECT SEARCH DATA & REDIRECT (index.html hero bar)
// ============================================================


function collectAndSearch() {
  const searchInput = document.getElementById('searchInput');
  const destination = searchInput ? searchInput.value.trim() : '';
  const country     = localStorage.getItem('search_country') || '';
  const city        = localStorage.getItem('search_city')    || '';

  const ciDisplay = document.getElementById('checkin-display');
  const coDisplay = document.getElementById('checkout-display');
  const checkin   = ciDisplay ? ciDisplay.textContent.trim() : '';
  const checkout  = coDisplay ? coDisplay.textContent.trim() : '';

  // ── Validation ──────────────────────────────────
  if (!destination && !country && !city) {
    if (searchInput) {
      searchInput.classList.add('search-input-error');
      searchInput.focus();
      setTimeout(() => searchInput.classList.remove('search-input-error'), 3000);
    }
    showToast('Please enter a destination');
    return;
  }

  if (!checkin || checkin === 'Check-in') {
    showToast('Please select a check-in date');
    openPicker('checkin');
    return;
  }

  if (!checkout || checkout === 'Check-out') {
    showToast('Please select a check-out date');
    openPicker('checkout');
    return;
  }
  // ────────────────────────────────────────────────

  if (searchInput) searchInput.classList.remove('search-input-error');

  const adults   = document.getElementById('adults-count')   ? document.getElementById('adults-count').textContent.trim()   : '2';
  const children = document.getElementById('children-count') ? document.getElementById('children-count').textContent.trim() : '0';
  const rooms    = document.getElementById('rooms-count')    ? document.getElementById('rooms-count').textContent.trim()    : '1';

  const params = new URLSearchParams();
  if (country)     params.set('country',  country);
  if (city)        params.set('city',     city);
  if (destination) params.set('dest',     destination);
  if (checkin  && checkin  !== 'Check-in')  params.set('checkin',  checkin);
  if (checkout && checkout !== 'Check-out') params.set('checkout', checkout);
  params.set('adults',   adults);
  params.set('children', children);
  params.set('rooms',    rooms);

  localStorage.setItem('search_destination', destination);
  localStorage.setItem('search_guests',
    adults + ' adult' + (adults !== '1' ? 's' : '') +
    (children !== '0' ? ', ' + children + ' child' + (children !== '1' ? 'ren' : '') : '') +
    ' · ' + rooms + ' room' + (rooms !== '1' ? 's' : '')
  );
// Save full recent search object
localStorage.setItem('recent_search', JSON.stringify({
  destination: destination || city,
  city:        city,
  country:     country,
  checkin:     checkin,
  checkinDay:  checkinDate ? WDAYS[checkinDate.getDay()] : '',
  checkout:    checkout,
  checkoutDay: checkoutDate ? WDAYS[checkoutDate.getDay()] : '',
  guests:      adults,
  dates: `${checkin} – ${checkout}`
}));
  window.location.href = 'hotel.html?' + params.toString();
}