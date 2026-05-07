<?php
// ===== bookings.php — Save a booking to the database =====

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'agoda_db');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

$userEmail   = trim($_POST['userEmail']   ?? '');
$hotelId     = trim($_POST['hotelId']     ?? '');
$hotelName   = trim($_POST['hotelName']   ?? '');
$roomType    = trim($_POST['roomType']    ?? '');
$checkin     = trim($_POST['checkin']     ?? '');
$checkout    = trim($_POST['checkout']    ?? '');
$adults      = (int)($_POST['adults']     ?? 1);
$children    = (int)($_POST['children']   ?? 0);
$rooms       = (int)($_POST['rooms']      ?? 1);
$total       = (float)($_POST['total']    ?? 0);

if (!$userEmail || !$hotelId || !$hotelName || !$roomType || !$checkin || !$checkout || $total <= 0) {
    echo json_encode(['success' => false, 'message' => 'Missing required booking fields.']);
    exit;
}

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}
$conn->set_charset('utf8mb4');

$stmt = $conn->prepare("
    INSERT INTO BOOKING 
        (Booking_UserEmail, Booking_HotelID, Booking_HotelName, Booking_RoomType,
         Booking_CheckIn, Booking_CheckOut, Booking_Adults, Booking_Children,
         Booking_Rooms, Booking_Total, Booking_Status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
");

if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Query failed: ' . $conn->error]);
    exit;
}

$stmt->bind_param('sissssiiid',
    $userEmail, $hotelId, $hotelName, $roomType,
    $checkin, $checkout, $adults, $children,
    $rooms, $total
);

if ($stmt->execute()) {
    echo json_encode([
        'success'    => true,
        'message'    => 'Booking confirmed.',
        'booking_id' => $stmt->insert_id
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to save booking.']);
}

$stmt->close();
$conn->close();