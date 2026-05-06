<?php
// ===== rooms.php — Fetch rooms for a hotel using the real schema =====

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);


define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'agoda_db');

// ── Validate ─────────────────────────────────────────────────
if (empty($_GET['hotel_id']) || !is_numeric($_GET['hotel_id'])) {
    echo json_encode(['success' => false, 'message' => 'Missing or invalid hotel_id.']);
    exit;
}

$hotelId = (int) $_GET['hotel_id'];

// ── Guest counts (moved up, defined ONCE) ────────────────────
$adults      = !empty($_GET['adults'])   && is_numeric($_GET['adults'])   ? (int)$_GET['adults']   : 1;
$children    = !empty($_GET['children']) && is_numeric($_GET['children']) ? (int)$_GET['children'] : 0;
$totalGuests = $adults + $children;

// ── Connect ───────────────────────────────────────────────────
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}
$conn->set_charset('utf8mb4');

// ── Fetch hotel meta ──────────────────────────────────────────
$hStmt = $conn->prepare("
    SELECT
        h.Hotel_ID      AS id,
        h.Hotel_Name    AS name,
        h.Hotel_Stars   AS stars,
        h.Hotel_Type    AS type,
        h.Hotel_Rating  AS rating,
        h.Hotel_Area    AS area,
        ci.City_Name    AS city
    FROM  HOTEL h
    INNER JOIN CITY ci ON ci.City_ID = h.Hotel_CityID
    WHERE h.Hotel_ID = ?
    LIMIT 1
");
if (!$hStmt) {
    echo json_encode(['success' => false, 'message' => 'Hotel query failed: ' . $conn->error]);
    exit;
}
$hStmt->bind_param('i', $hotelId);
$hStmt->execute();
$hotel = $hStmt->get_result()->fetch_assoc();

if (!$hotel) {
    echo json_encode(['success' => false, 'message' => 'Hotel not found.']);
    exit;
}

$hotel['id']     = (int)   $hotel['id'];
$hotel['stars']  = (int)   $hotel['stars'];
$hotel['rating'] = (float) $hotel['rating'];

// ── Fetch rooms filtered by max occupancy ────────────────────
$rStmt = $conn->prepare("
    SELECT
        Room_ID         AS id,
        Room_Type       AS type,
        Room_MaxOccpncy AS maxOccupancy,
        Room_BedType    AS bedType,
        Room_Price      AS price,
        Room_Amenities  AS amenities
    FROM  ROOM
    WHERE Room_HotelID  = ?
      AND Room_MaxOccpncy >= ?
    ORDER BY Room_Price ASC
");
if (!$rStmt) {
    echo json_encode(['success' => false, 'message' => 'Rooms query failed: ' . $conn->error]);
    exit;
}
$rStmt->bind_param('ii', $hotelId, $totalGuests);
$rStmt->execute();
$rResult = $rStmt->get_result();

$rooms = [];
while ($row = $rResult->fetch_assoc()) {
    $row['id']           = (int)   $row['id'];
    $row['maxOccupancy'] = (int)   $row['maxOccupancy'];
    $row['price']        = (float) $row['price'];
    $row['amenities']    = $row['amenities'] ?? '';
    $rooms[] = $row;
}

$conn->close();

echo json_encode([
    'success'     => true,
    'hotel'       => $hotel,
    'rooms'       => $rooms,
    'count'       => count($rooms),
    'totalGuests' => $totalGuests,
]);