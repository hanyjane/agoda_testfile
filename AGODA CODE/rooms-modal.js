// ===== ROOMS MODAL — rooms-modal.js =====
// Works with your exact ROOM schema:
//   Room_ID, Room_Type, Room_MaxOccpncy, Room_BedType, Room_Price, Room_Amenities

// ============================================================
//  HELPERS
// ============================================================
function fmt(n) {
    return '₱' + Number(n).toLocaleString('en-PH');
}

function starsHtml(n) {
    n = Math.max(0, Math.min(5, parseInt(n) || 0));
    const filled = '<i class="fa fa-star" style="color:#f59e0b;font-size:11px;"></i>'.repeat(n);
    const empty = '<i class="fa fa-star" style="color:rgba(255,255,255,0.25);font-size:11px;"></i>'.repeat(5 - n);
    return filled + empty;
}

// Room type → icon & display label
const ROOM_TYPE_META = {
    'Standard': { icon: 'fa-bed', label: 'Standard Room' },
    'Deluxe': { icon: 'fa-bed', label: 'Deluxe Room' },
    'Superior': { icon: 'fa-bed', label: 'Superior Room' },
    'Suite': { icon: 'fa-crown', label: 'Suite' },
    'Family': { icon: 'fa-people-roof', label: 'Family Room' },
    'Twin': { icon: 'fa-bed', label: 'Twin Room' },
};

function getRoomMeta(type) {
    // Normalise: trim + title-case first word for lookup
    const key = (type || '').trim();
    // Try exact match first, then case-insensitive
    for (const k of Object.keys(ROOM_TYPE_META)) {
        if (key.toLowerCase().includes(k.toLowerCase())) {
            return ROOM_TYPE_META[k];
        }
    }
    return { icon: 'fa-door-open', label: key || 'Room' };
}

// ============================================================
//  CALCULATE NIGHTS FROM SEARCH BAR
// ============================================================
function getNightsFromSearchBar() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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
    const ciStr = (document.getElementById('checkinLabel') || {}).textContent || '';
    const coStr = (document.getElementById('checkoutLabel') || {}).textContent || '';
    const ci = parseLabel(ciStr !== 'Check-in' ? ciStr : null);
    const co = parseLabel(coStr !== 'Check-out' ? coStr : null);
    if (ci && co) return Math.max(1, Math.round((co - ci) / 86400000));
    return 1;
}

// ============================================================
//  RENDER A SINGLE ROOM CARD
// ============================================================
function renderRoomCard(room, nights) {
    const totalPrice = room.price * nights;
    const meta = getRoomMeta(room.type);

    // Room_Amenities is a plain-text description in your schema
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
            onclick="selectRoom(${JSON.stringify(room.type)}, ${room.price}, ${totalPrice}, ${nights})">
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
//  OPEN MODAL — fetch rooms from rooms.php
// ============================================================
async function openRoomsModal(btn) {
    const hotelId = btn.dataset.hotelId;
    const hotelName = btn.dataset.hotelName || 'Hotel';
    const hotelStars = parseInt(btn.dataset.hotelStars) || 3;
    const hotelType = btn.dataset.hotelType || 'Hotel';
    const hotelLoc = btn.dataset.hotelLocation || '';
    const hotelRating = parseFloat(btn.dataset.hotelRating) || 8.0;

    const checkin = (document.getElementById('checkinLabel') || {}).textContent || '';
    const checkout = (document.getElementById('checkoutLabel') || {}).textContent || '';
    const guests = (document.getElementById('guestSummary') || {}).textContent || '2 adults · 1 room';
    const nights = getNightsFromSearchBar();

    // Fill header immediately
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

    // Open modal with spinner
    document.getElementById('roomsModalOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    showRoomsLoading();

    if (!hotelId) {
        showRoomsError('No hotel ID — cannot load rooms.');
        return;
    }

    const adults = (document.getElementById('adultsCount') || {}).textContent || '1';
    const children = (document.getElementById('childrenCount') || {}).textContent || '0';

    try {
        const res = await fetch(`rooms.php?hotel_id=${encodeURIComponent(hotelId)}&adults=${encodeURIComponent(adults)}&children=${encodeURIComponent(children)}`);
        const data = await res.json();

        if (!data.success) {
            showRoomsError(data.message || 'Could not load rooms.');
            return;
        }

        if (!data.rooms || data.rooms.length === 0) {
            showRoomsError('No rooms listed for this hotel yet.');
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
//  CLOSE MODAL
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
//  SELECT ROOM — toast confirmation
// ============================================================
function selectRoom(roomType, pricePerNight, totalPrice, nights) {
    closeRoomsModal();
    const msg = `${roomType} — ${fmt(totalPrice)} for ${nights} night${nights !== 1 ? 's' : ''}`;
    document.getElementById('roomToastMsg').textContent = msg;
    const toast = document.getElementById('roomToast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
}