<?php
// ===== my-bookings.php — Return all bookings for a specific user =====

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'agoda_db');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

$email = trim($_GET['email'] ?? '');

if (!$email) {
    echo json_encode(['success' => false, 'message' => 'Email is required.']);
    exit;
}

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}
$conn->set_charset('utf8mb4');

$stmt = $conn->prepare("
    SELECT
        Booking_ID,
        Booking_UserEmail,
        Booking_HotelID,
        Booking_HotelName,
        Booking_RoomType,
        Booking_CheckIn,
        Booking_CheckOut,
        Booking_Adults,
        Booking_Children,
        Booking_Rooms,
        Booking_Total,
        Booking_Status,
        Booking_CreatedAt
    FROM BOOKING
    WHERE Booking_UserEmail = ?
    ORDER BY Booking_ID DESC
");

if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Query preparation failed: ' . $conn->error]);
    exit;
}

$stmt->bind_param('s', $email);
$stmt->execute();
$result   = $stmt->get_result();
$bookings = [];

while ($row = $result->fetch_assoc()) {
    $bookings[] = $row;
}

echo json_encode([
    'success'  => true,
    'bookings' => $bookings,
]);

$stmt->close();
$conn->close();
