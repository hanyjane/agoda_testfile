// ===== ROOMS MODAL — rooms-modal.js =====

// ============================================================
//  HELPERS
// ============================================================
function fmt(n) {
  return '₱' + Number(n).toLocaleString('en-PH');
}

function starsHtml(n) {
  n = Math.max(0, Math.min(5, parseInt(n) || 0));
  const filled = '<i class="fa fa-star" style="color:#f59e0b;font-size:11px;"></i>'.repeat(n);
  const empty  = '<i class="fa fa-star" style="color:rgba(255,255,255,0.25);font-size:11px;"></i>'.repeat(5 - n);
  return filled + empty;
}

const ROOM_TYPE_META = {
  'Standard': { icon: 'fa-bed',         label: 'Standard Room' },
  'Deluxe':   { icon: 'fa-bed',         label: 'Deluxe Room'   },
  'Superior': { icon: 'fa-bed',         label: 'Superior Room' },
  'Suite':    { icon: 'fa-crown',       label: 'Suite'         },
  'Family':   { icon: 'fa-people-roof', label: 'Family Room'   },
  'Twin':     { icon: 'fa-bed',         label: 'Twin Room'     },
};

function getRoomMeta(type) {
  const key = (type || '').trim();
  for (const k of Object.keys(ROOM_TYPE_META)) {
    if (key.toLowerCase().includes(k.toLowerCase())) return ROOM_TYPE_META[k];
  }
  return { icon: 'fa-door-open', label: key || 'Room' };
}

// ============================================================
//  CALCULATE NIGHTS FROM SEARCH BAR
// ============================================================
function getNightsFromSearchBar() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const parseLabel = (s) => {
    if (!s) return null;
    const parts = s.trim().split(' ');
    if (parts.length === 3) {
      const d = parseInt(parts[0]);
      const m = months.indexOf(parts[1]);
      const y = parseInt(parts[2]);
      if (!isNaN(d) && m >= 0 && !isNaN(y)) return new Date(y, m, d);
    }
    return null;
  };
  const ciStr = (document.getElementById('checkinLabel')  || {}).textContent || '';
  const coStr = (document.getElementById('checkoutLabel') || {}).textContent || '';
  const ci = parseLabel(ciStr !== 'Check-in'  ? ciStr : null);
  const co = parseLabel(coStr !== 'Check-out' ? coStr : null);
  if (ci && co) return Math.max(1, Math.round((co - ci) / 86400000));
  return 1;
}

// ============================================================
//  RENDER A SINGLE ROOM CARD
// ============================================================
function renderRoomCard(room, nights) {
  const totalPrice = room.price * nights;
  const meta       = getRoomMeta(room.type);

  const amenitiesHtml = room.amenities
    ? `<p class="room-amenities-text">
         <i class="fa fa-circle-check" style="color:#1a56db;font-size:11px;margin-right:4px;"></i>
         ${room.amenities}
       </p>`
    : '';

  const bedHtml = room.bedType
    ? `<span class="room-detail-item"><i class="fa fa-bed"></i> ${room.bedType}</span>`
    : '';

  return `
    <div class="room-card">
      <div class="room-card-img-wrap">
        <div class="room-card-img-placeholder">
          <i class="fa ${meta.icon}"></i>
          <span>${meta.label}</span>
        </div>
      </div>
      <div class="room-card-body">
        <div class="room-card-top">
          <h4 class="room-card-name">${room.type}</h4>
          <div class="room-card-detail-row">
            ${bedHtml}
            <span class="room-detail-item"><i class="fa fa-user-group"></i> Up to ${room.maxOccupancy} guests</span>
          </div>
          ${amenitiesHtml}
        </div>
        <div class="room-card-footer">
          <div class="room-price-block">
            <div>
              <span class="room-price-main">${fmt(room.price)}</span>
              <span class="room-price-per-night"> /night</span>
            </div>
            ${nights > 1
              ? `<div class="room-price-total">Total: <strong>${fmt(totalPrice)}</strong> for ${nights} night${nights !== 1 ? 's' : ''}</div>`
              : ''}
          </div>
          <button class="room-select-btn"
            data-type="${room.type}"
            data-price="${room.price}"
            data-total="${totalPrice}"
            data-nights="${nights}"
            onclick="selectRoom(this)">
            Select Room
          </button>
        </div>
      </div>
    </div>`;
}

// ============================================================
//  LOADING / ERROR STATES
// ============================================================
function showRoomsLoading() {
  document.getElementById('roomsList').innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;padding:60px 20px;gap:14px;
                color:#888;font-family:'Nunito Sans',sans-serif;">
      <i class="fa fa-circle-notch fa-spin" style="font-size:32px;color:#1a56db;"></i>
      <span style="font-size:14px;font-weight:600;">Loading available rooms…</span>
    </div>`;
}

function showRoomsError(msg) {
  document.getElementById('roomsList').innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;padding:60px 20px;gap:12px;
                color:#888;font-family:'Nunito Sans',sans-serif;text-align:center;">
      <i class="fa fa-triangle-exclamation" style="font-size:32px;color:#e63946;"></i>
      <span style="font-size:14px;font-weight:600;">${msg}</span>
    </div>`;
}

// ============================================================
//  OPEN ROOMS MODAL
// ============================================================
async function openRoomsModal(btn) {
  const hotelId    = btn.dataset.hotelId;
  const hotelName  = btn.dataset.hotelName     || 'Hotel';
  const hotelStars = parseInt(btn.dataset.hotelStars) || 3;
  const hotelType  = btn.dataset.hotelType     || 'Hotel';
  const hotelLoc   = btn.dataset.hotelLocation || '';
  const hotelRating = parseFloat(btn.dataset.hotelRating) || 8.0;

  const checkin  = (document.getElementById('checkinLabel')  || {}).textContent || '';
  const checkout = (document.getElementById('checkoutLabel') || {}).textContent || '';
  const guests   = (document.getElementById('guestSummary')  || {}).textContent || '2 adults · 1 room';
  const nights   = getNightsFromSearchBar();

  document.getElementById('modalHotelName').textContent = hotelName;
  document.getElementById('modalHotelMeta').innerHTML = `
    <span>${starsHtml(hotelStars)}</span>
    <span style="color:rgba(255,255,255,0.35);">•</span>
    <span>${hotelType}</span>
    <span style="color:rgba(255,255,255,0.35);">•</span>
    <span><i class="fa fa-location-dot"></i> ${hotelLoc}</span>
    <span style="color:rgba(255,255,255,0.35);">•</span>
    <span><i class="fa fa-star" style="color:#4ade80;font-size:10px;"></i> ${hotelRating}</span>
  `;
  document.getElementById('modalStayInfo').innerHTML = `
    ${checkin && checkin !== 'Check-in'
      ? `<span class="rooms-stay-item"><i class="fa fa-calendar-day"></i> Check-in: <strong style="color:#fff">${checkin}</strong></span>` : ''}
    ${checkout && checkout !== 'Check-out'
      ? `<span class="rooms-stay-item"><i class="fa fa-calendar-check"></i> Check-out: <strong style="color:#fff">${checkout}</strong></span>` : ''}
    <span class="rooms-stay-item"><i class="fa fa-moon"></i> <strong style="color:#fff">${nights}</strong> night${nights !== 1 ? 's' : ''}</span>
    <span class="rooms-stay-item"><i class="fa fa-user-group"></i> ${guests}</span>
  `;

  document.getElementById('roomsModalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  showRoomsLoading();

  if (!hotelId) {
    showRoomsError('No hotel ID — cannot load rooms.');
    return;
  }

  const adults   = (document.getElementById('adultsCount')   || {}).textContent || '1';
  const children = (document.getElementById('childrenCount') || {}).textContent || '0';
  const rooms    = (document.getElementById('roomsCount')    || {}).textContent || '1';

  try {
    const res  = await fetch(
      `rooms.php?hotel_id=${encodeURIComponent(hotelId)}`
      + `&adults=${encodeURIComponent(adults)}`
      + `&children=${encodeURIComponent(children)}`
      + `&rooms=${encodeURIComponent(rooms)}`
    );
    const data = await res.json();

    if (!data.success) {
      showRoomsError(data.message || 'Could not load rooms.');
      return;
    }

    if (!data.rooms || data.rooms.length === 0) {
      showRoomsError('No rooms available for your selected guests.');
      return;
    }

    document.getElementById('roomsList').innerHTML =
      data.rooms.map(room => renderRoomCard(room, nights)).join('');

  } catch (err) {
    console.error('rooms.php fetch error:', err);
    showRoomsError('Network error — could not reach rooms.php.');
  }
}

// ============================================================
//  CLOSE ROOMS MODAL
// ============================================================
function closeRoomsModal() {
  document.getElementById('roomsModalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('roomsModalClose').addEventListener('click', closeRoomsModal);
document.getElementById('roomsModalOverlay').addEventListener('click', function (e) {
  if (e.target === this) closeRoomsModal();
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeRoomsModal();
});

// ============================================================
//  SELECT ROOM → BOOKING CONFIRMATION MODAL
// ============================================================
function selectRoom(btn) {
  closeRoomsModal();
  const roomType      = btn.dataset.type;
  const pricePerNight = parseFloat(btn.dataset.price);
  const totalPrice    = parseFloat(btn.dataset.total);
  const nights        = parseInt(btn.dataset.nights);

  const overlay = document.getElementById('bookingConfirmOverlay');
  if (!overlay) {
    alert('bookingConfirmOverlay div is missing from hotel.html — add it before </body>');
    return;
  }

  const hotelName = document.getElementById('modalHotelName').textContent;
  const checkin   = (document.getElementById('checkinLabel')  || {}).textContent || '—';
  const checkout  = (document.getElementById('checkoutLabel') || {}).textContent || '—';
  const adults    = (document.getElementById('adultsCount')   || {}).textContent || '1';
  const children  = (document.getElementById('childrenCount') || {}).textContent || '0';
  const rooms     = (document.getElementById('roomsCount')    || {}).textContent || '1';
  const roomCount = parseInt(rooms) || 1;

  const subtotal = totalPrice * roomCount;
  const tax      = subtotal * 0.12;
  const grand    = subtotal + tax;

  overlay.innerHTML = `
    <div class="booking-confirm-modal">

      <!-- HEADER -->
      <div class="bcm-header">
        <div>
          <div class="bcm-tag">Booking Summary</div>
          <h2 class="bcm-hotel-name">${hotelName}</h2>
        </div>
        <button class="bcm-close" onclick="closeBookingConfirm()">
          <i class="fa fa-xmark"></i>
        </button>
      </div>

      <!-- ROOM HIGHLIGHT -->
      <div class="bcm-room-highlight">
        <i class="fa fa-door-open bcm-room-icon"></i>
        <div>
          <div class="bcm-room-type">${roomType}</div>
          <div class="bcm-room-sub">Selected Room</div>
        </div>
      </div>

      <!-- STAY DETAILS -->
      <div class="bcm-details-grid">
        <div class="bcm-detail-item">
          <i class="fa fa-calendar-day bcm-detail-icon"></i>
          <div>
            <div class="bcm-detail-label">Check-in</div>
            <div class="bcm-detail-value">${checkin}</div>
          </div>
        </div>
        <div class="bcm-detail-item">
          <i class="fa fa-calendar-check bcm-detail-icon"></i>
          <div>
            <div class="bcm-detail-label">Check-out</div>
            <div class="bcm-detail-value">${checkout}</div>
          </div>
        </div>
        <div class="bcm-detail-item">
          <i class="fa fa-moon bcm-detail-icon"></i>
          <div>
            <div class="bcm-detail-label">Duration</div>
            <div class="bcm-detail-value">${nights} night${nights !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <div class="bcm-detail-item">
          <i class="fa fa-user-group bcm-detail-icon"></i>
          <div>
            <div class="bcm-detail-label">Guests</div>
            <div class="bcm-detail-value">
              ${adults} adult${parseInt(adults) !== 1 ? 's' : ''}
              ${parseInt(children) > 0 ? `, ${children} child${parseInt(children) !== 1 ? 'ren' : ''}` : ''}
            </div>
          </div>
        </div>
        <div class="bcm-detail-item">
          <i class="fa fa-door-closed bcm-detail-icon"></i>
          <div>
            <div class="bcm-detail-label">Rooms</div>
            <div class="bcm-detail-value">${rooms} room${parseInt(rooms) !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <div class="bcm-detail-item">
          <i class="fa fa-tag bcm-detail-icon"></i>
          <div>
            <div class="bcm-detail-label">Price / night</div>
            <div class="bcm-detail-value">₱${pricePerNight.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <!-- PRICE BREAKDOWN -->
      <div class="bcm-price-breakdown">
        <div class="bcm-price-row">
          <span>₱${pricePerNight.toLocaleString()} × ${nights} night${nights !== 1 ? 's' : ''}</span>
          <span>₱${totalPrice.toLocaleString()}</span>
        </div>
        ${roomCount > 1 ? `
        <div class="bcm-price-row">
          <span>× ${roomCount} rooms</span>
          <span>₱${subtotal.toLocaleString()}</span>
        </div>` : ''}
        <div class="bcm-price-row bcm-price-row--tax">
          <span>Taxes & fees (est. 12%)</span>
          <span>₱${tax.toFixed(2)}</span>
        </div>
        <div class="bcm-price-divider"></div>
        <div class="bcm-price-row bcm-price-row--total">
          <span>Total</span>
          <span>₱${grand.toFixed(2)}</span>
        </div>
      </div>

      <!-- ACTIONS -->
      <div class="bcm-actions">
        <button class="bcm-btn-back" onclick="closeBookingConfirm()">
          <i class="fa fa-arrow-left"></i> Back to Rooms
        </button>
        <button class="bcm-btn-confirm" onclick="confirmBooking()">
  <i class="fa fa-check"></i> Confirm Booking
</button>
      </div>

    </div>`;

  overlay.classList.add('open');
}
// ============================================================
//  CLOSE BOOKING CONFIRMATION MODAL
// ============================================================
function closeBookingConfirm() {
  const overlay = document.getElementById('bookingConfirmOverlay');
  if (overlay) overlay.classList.remove('open');
}

document.addEventListener('click', function (e) {
  const overlay = document.getElementById('bookingConfirmOverlay');
  if (overlay && e.target === overlay) closeBookingConfirm();
});

// ============================================================
//  CONFIRM BOOKING
// ============================================================
function confirmBooking() {
  const hotelName  = document.getElementById('modalHotelName').textContent;
  const checkin    = (document.getElementById('checkinLabel')  || {}).textContent || '';
  const checkout   = (document.getElementById('checkoutLabel') || {}).textContent || '';
  const adults     = (document.getElementById('adultsCount')   || {}).textContent || '1';
  const children   = (document.getElementById('childrenCount') || {}).textContent || '0';
  const rooms      = (document.getElementById('roomsCount')    || {}).textContent || '1';
  const roomType   = document.querySelector('.bcm-room-type')  ? document.querySelector('.bcm-room-type').textContent : '';
  const totalEl    = document.querySelector('.bcm-price-row--total span:last-child');
  const totalRaw   = totalEl ? totalEl.textContent.replace(/[^0-9.]/g, '') : '0';
  const userEmail  = localStorage.getItem('user_User_Email') || '';
  const hotelId    = localStorage.getItem('last_hotel_id')   || '0';

  const formData = new FormData();
  formData.append('userEmail',  userEmail);
  formData.append('hotelId',    hotelId);
  formData.append('hotelName',  hotelName);
  formData.append('roomType',   roomType);
  formData.append('checkin',    checkin);
  formData.append('checkout',   checkout);
  formData.append('adults',     adults);
  formData.append('children',   children);
  formData.append('rooms',      rooms);
  formData.append('total',      totalRaw);

  fetch('bookings.php', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        // Also save to localStorage as backup
        const booking = {
          id: data.booking_id,
          hotelName, roomType, checkin, checkout,
          adults, children, rooms,
          total: '₱' + parseFloat(totalRaw).toLocaleString('en-PH'),
          bookedOn: new Date().toLocaleDateString('en-PH', { year:'numeric', month:'short', day:'numeric' }),
          status: 'confirmed'
        };
        const existing = JSON.parse(localStorage.getItem('my_bookings') || '[]');
        existing.unshift(booking);
        localStorage.setItem('my_bookings', JSON.stringify(existing));
      }
    })
    .catch(err => console.error('Booking save error:', err));

  closeBookingConfirm();

  const toast = document.getElementById('roomToast');
  const msg   = document.getElementById('roomToastMsg');
  if (toast && msg) {
    msg.textContent = 'Booking confirmed! Thank you.';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }
}