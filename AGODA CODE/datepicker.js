const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const WDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DAYS  = ["Mo","Tu","We","Th","Fr","Sa","Su"];

const _now = new Date();
let viewYear  = _now.getFullYear();
let viewMonth = _now.getMonth();

let checkinDate  = null;
let checkoutDate = null;
let selecting    = null; // 'checkin' | 'checkout'

/* ── Open / Close ─────────────────────────────────── */

function openPicker(which) {
  selecting = which;

  document.getElementById('checkin-box').classList.toggle('active', which === 'checkin');
  document.getElementById('checkout-box').classList.toggle('active', which === 'checkout');

  const ref = which === 'checkin' ? checkinDate : (checkoutDate || checkinDate);
  if (ref) {
    viewYear  = ref.getFullYear();
    viewMonth = ref.getMonth();
  } else {
    // ← default to today's month when no date is selected
    const today = new Date();
    viewYear  = today.getFullYear();
    viewMonth = today.getMonth();
  }

  document.getElementById('picker-popup').style.display = 'block';
  renderBoth();
}

function closePicker() {
  document.getElementById('picker-popup').style.display = 'none';
  document.getElementById('checkin-box').classList.remove('active');
  document.getElementById('checkout-box').classList.remove('active');
  selecting = null;
}

// Close when clicking outside the popup
document.addEventListener('click', (e) => {
  const popup  = document.getElementById('picker-popup');
  const row    = document.querySelector('.date-guest-row');
  if (
    popup.style.display === 'block' &&
    !popup.contains(e.target) &&
    !row.contains(e.target)
  ) {
    closePicker();
  }
});

/* ── Tab switching ────────────────────────────────── */

function setTab(t) {
  const isCal = t === 'cal';
  document.getElementById('tab-cal-content').style.display  = isCal ? 'block' : 'none';
  document.getElementById('tab-flex-content').style.display = isCal ? 'none'  : 'block';
  document.getElementById('tab-cal-btn').classList.toggle('active',  isCal);
  document.getElementById('tab-flex-btn').classList.toggle('active', !isCal);
}

/* ── Month navigation ─────────────────────────────── */

function shiftMonth(delta) {
  viewMonth += delta;
  if (viewMonth > 11) { viewMonth = 0;  viewYear++; }
  if (viewMonth < 0)  { viewMonth = 11; viewYear--; }
  renderBoth();
}

/* ── Render both months ───────────────────────────── */

function renderBoth() {
  let m2 = viewMonth + 1, y2 = viewYear;
  if (m2 > 11) { m2 = 0; y2++; }

  document.getElementById('left-month-label').textContent  = MONTHS[viewMonth] + ' ' + viewYear;
  document.getElementById('right-month-label').textContent = MONTHS[m2] + ' ' + y2;

  buildCal('left-cal',  viewYear, viewMonth);
  buildCal('right-cal', y2, m2);
}

/* ── Build a single month ─────────────────────────── */

function buildCal(containerId, y, m) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  // Day-name headers
  DAYS.forEach(d => {
    const el = document.createElement('div');
    el.className = 'day-name';
    el.textContent = d;
    container.appendChild(el);
  });

  // Leading empty cells (Mon-start grid)
  const firstDow = new Date(y, m, 1).getDay();
  const offset   = firstDow === 0 ? 6 : firstDow - 1;
  for (let i = 0; i < offset; i++) {
    const el = document.createElement('div');
    el.className = 'day-cell empty';
    container.appendChild(el);
  }

  const today     = new Date(); today.setHours(0, 0, 0, 0);
  const totalDays = new Date(y, m + 1, 0).getDate();

  for (let d = 1; d <= totalDays; d++) {
    const date   = new Date(y, m, d);
    const isPast = date < today;
    const isCI   = checkinDate  && sameDay(date, checkinDate);
    const isCO   = checkoutDate && sameDay(date, checkoutDate);
    const inRange = checkinDate && checkoutDate
                    && date > checkinDate && date < checkoutDate;
    const isToday = sameDay(date, today);

    const cell = document.createElement('div');
    cell.className = 'day-cell';

    if (isPast)  cell.classList.add('past');
    if (isToday) cell.classList.add('today');
    if (isCI)    cell.classList.add('selected-start');
    if (isCO)    cell.classList.add('selected-end');
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
    // Auto-switch to checkout
    selecting = 'checkout';
    document.getElementById('checkin-box').classList.remove('active');
    document.getElementById('checkout-box').classList.add('active');

  } else { // 'checkout'
    if (checkinDate && date <= checkinDate) {
      // Picked before checkin — restart
      checkinDate  = date;
      checkoutDate = null;
      updateDisplay('checkin', checkinDate);
      updateDisplay('checkout', null);
      selecting = 'checkout';
    } else {
      checkoutDate = date;
      updateDisplay('checkout', checkoutDate);
      // Both selected — close
      setTimeout(closePicker, 200);
    }
  }

  renderBoth();
}

/* ── Update display boxes ─────────────────────────── */

function updateDisplay(which, date) {
  const valEl = document.getElementById(`${which}-display`);
  const dayEl = document.getElementById(`${which}-day`);

  if (date) {
    valEl.textContent = fmtDate(date);
    dayEl.textContent = WDAYS[date.getDay()];
  } else {
    valEl.textContent = which === 'checkin' ? 'Check-in' : 'Check-out';
    dayEl.textContent = which === 'checkin' ? 'Add date' : 'Add date';
  }
}

/* ── Guest picker stub ────────────────────────────── */
function toggleGuests() {}

/* ── Helpers ──────────────────────────────────────── */

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
      && a.getMonth()    === b.getMonth()
      && a.getDate()     === b.getDate();
}

function fmtDate(d) {
  return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
}

/* ── Init ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  updateDisplay('checkin',  null);
  updateDisplay('checkout', null);
  renderBoth();
});
