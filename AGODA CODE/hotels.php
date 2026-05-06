<?php
// ===== hotels.php — Fetch hotels from the normalized DB =====

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// ── Database config ──────────────────────────────────────────
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');       // ← replace with your actual password
define('DB_NAME', 'agoda_db');

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}
$conn->set_charset('utf8mb4');

// ── Build WHERE clause ───────────────────────────────────────
$conditions = [];
$params     = [];
$types      = '';

// Filter by country name
if (!empty($_GET['country'])) {
    $conditions[] = 'co.Country_Name = ?';
    $params[]     = $_GET['country'];
    $types       .= 's';
}

// Filter by city name
if (!empty($_GET['city'])) {
    $conditions[] = 'ci.City_Name = ?';
    $params[]     = $_GET['city'];
    $types       .= 's';
}

// Free-text destination fallback
if (!empty($_GET['dest']) && empty($_GET['country'])) {
    $q            = '%' . $_GET['dest'] . '%';
    $conditions[] = '(ci.City_Name LIKE ? OR h.Hotel_Area LIKE ? OR co.Country_Name LIKE ? OR h.Hotel_Name LIKE ?)';
    $params[]     = $q; $params[] = $q; $params[] = $q; $params[] = $q;
    $types       .= 'ssss';
}

// Filter by max price
if (!empty($_GET['max_price']) && is_numeric($_GET['max_price'])) {
    $conditions[] = 'h.Hotel_Price <= ?';
    $params[]     = (int) $_GET['max_price'];
    $types       .= 'i';
}

// Filter by minimum star rating
if (!empty($_GET['stars']) && (int) $_GET['stars'] > 0) {
    $conditions[] = 'h.Hotel_Stars >= ?';
    $params[]     = (int) $_GET['stars'];
    $types       .= 'i';
}

if (!empty($_GET['adults']) || !empty($_GET['children'])) {
    $adults      = !empty($_GET['adults'])   && is_numeric($_GET['adults'])   ? (int)$_GET['adults']   : 1;
    $children    = !empty($_GET['children']) && is_numeric($_GET['children']) ? (int)$_GET['children'] : 0;
    $totalGuests = $adults + $children;
    $conditions[] = 'EXISTS (
        SELECT 1 FROM ROOM r2
        WHERE r2.Room_HotelID = h.Hotel_ID  
        AND r2.Room_MaxOccpncy >= ?
    )';
    $params[] = $totalGuests;
    $types   .= 'i';
}

// Filter by property type  (comma-separated: Hotel,Resort)
if (!empty($_GET['types'])) {
    $typeList     = array_map('trim', explode(',', $_GET['types']));
    $placeholders = implode(',', array_fill(0, count($typeList), '?'));
    $conditions[] = "h.Hotel_Type IN ($placeholders)";
    foreach ($typeList as $t) { $params[] = $t; $types .= 's'; }
}

// Filter by amenities — hotel must have ALL requested tags
if (!empty($_GET['amenities'])) {
    $amenList = array_map('trim', explode(',', $_GET['amenities']));
    foreach ($amenList as $a) {
        $conditions[] =
          'EXISTS (SELECT 1 FROM HOTEL_AMENITY ha2
                   WHERE ha2.HA_HotelID = h.Hotel_ID AND ha2.HA_Tag = ?)';
        $params[] = $a;
        $types   .= 's';
    }
}

// ── Sort ─────────────────────────────────────────────────────
$sortMap = [
    'price-low'   => 'h.Hotel_Price ASC',
    'price-high'  => 'h.Hotel_Price DESC',
    'rating'      => 'h.Hotel_Rating DESC',
    'stars'       => 'h.Hotel_Stars DESC',
    'recommended' => '(h.Hotel_Rating * h.Hotel_Reviews) DESC',
];
$sortRaw = $_GET['sort'] ?? 'recommended';
$orderBy = $sortMap[$sortRaw] ?? $sortMap['recommended'];

// ── Main query — JOIN HOTEL → CITY → COUNTRY ─────────────────
// Amenities are aggregated with GROUP_CONCAT so we get one row per hotel
$sql = "
  SELECT
    h.Hotel_ID        AS id,
    h.Hotel_Name      AS name,
    ci.City_Name      AS city,
    co.Country_Name   AS country,
    h.Hotel_Area      AS area,
    h.Hotel_Stars     AS stars,
    h.Hotel_Type      AS type,
    h.Hotel_Rating    AS rating,
    h.Hotel_Reviews   AS reviews,
    h.Hotel_Price     AS price,
    h.Hotel_OrigPrice AS originalPrice,
    h.Hotel_Image     AS image,
    h.Hotel_Desc      AS description,
    GROUP_CONCAT(ha.HA_Tag ORDER BY ha.HA_Tag SEPARATOR ',') AS amenities
  FROM       HOTEL        h
  INNER JOIN CITY         ci ON ci.City_ID    = h.Hotel_CityID
  INNER JOIN COUNTRY      co ON co.Country_ID = ci.City_CountryID
  LEFT  JOIN HOTEL_AMENITY ha ON ha.HA_HotelID = h.Hotel_ID
";

if ($conditions) {
    $sql .= ' WHERE ' . implode(' AND ', $conditions);
}

$sql .= " GROUP BY h.Hotel_ID ORDER BY $orderBy";

// ── Execute ───────────────────────────────────────────────────
if ($params) {
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
        exit;
    }
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $result = $conn->query($sql);
}

if (!$result) {
    echo json_encode(['success' => false, 'message' => 'Query failed: ' . $conn->error]);
    exit;
}

// ── Collect rows ──────────────────────────────────────────────
$hotels = [];
while ($row = $result->fetch_assoc()) {
    // Convert amenities CSV string → JS-friendly array
    $row['amenities']    = $row['amenities']
                           ? array_map('trim', explode(',', $row['amenities']))
                           : [];
    // Cast numeric fields
    $row['id']           = (int)   $row['id'];
    $row['stars']        = (int)   $row['stars'];
    $row['reviews']      = (int)   $row['reviews'];
    $row['price']        = (float) $row['price'];
    $row['originalPrice']= (float) $row['originalPrice'];
    $row['rating']       = (float) $row['rating'];

    $hotels[] = $row;
}

// ── Optionally fetch rooms for a single hotel ─────────────────
// Call:  hotels.php?hotel_id=5   to get that hotel's rooms too
if (!empty($_GET['hotel_id']) && is_numeric($_GET['hotel_id'])) {
    $hid   = (int) $_GET['hotel_id'];
    $rStmt = $conn->prepare(
        'SELECT Room_ID AS id, Room_Type AS type,
                Room_MaxOccpncy AS maxOccupancy, Room_BedType AS bedType,
                Room_Price AS price, Room_Amenities AS amenities
         FROM   ROOM WHERE Room_HotelID = ?
         ORDER BY Room_Price ASC'
    );
    $rStmt->bind_param('i', $hid);
    $rStmt->execute();
    $rResult = $rStmt->get_result();
    $rooms = [];
    while ($r = $rResult->fetch_assoc()) {
        $r['id']           = (int)   $r['id'];
        $r['maxOccupancy'] = (int)   $r['maxOccupancy'];
        $r['price']        = (float) $r['price'];
        $rooms[] = $r;
    }
    echo json_encode(['success' => true, 'count' => count($hotels), 'hotels' => $hotels, 'rooms' => $rooms]);
    $conn->close();
    exit;
}

echo json_encode([
    'success' => true,
    'count'   => count($hotels),
    'hotels'  => $hotels,
]);

$conn->close();