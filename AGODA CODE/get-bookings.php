<?php
// ===== get-bookings.php — Return bookings filtered by staff's assigned hotel =====

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

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}
$conn->set_charset('utf8mb4');

// Staff's assigned hotel (sent from dashboard via localStorage)
$hotelID      = intval($_GET['hotel_id'] ?? 0);
$statusFilter = trim($_GET['status'] ?? '');
$searchQuery  = trim($_GET['search'] ?? '');

if (!$hotelID) {
    echo json_encode(['success' => false, 'message' => 'No hotel assigned to this staff account.']);
    exit;
}

$where  = ['b.Booking_HotelID = ?'];
$params = [$hotelID];
$types  = 'i';

if ($statusFilter && in_array(strtolower($statusFilter), ['confirmed', 'cancelled', 'completed'])) {
    $where[]  = 'LOWER(b.Booking_Status) = ?';
    $params[] = strtolower($statusFilter);
    $types   .= 's';
}

if ($searchQuery) {
    $like     = '%' . $searchQuery . '%';
    $where[]  = '(b.Booking_UserEmail LIKE ? OR b.Booking_HotelName LIKE ? OR b.Booking_RoomType LIKE ? OR CAST(b.Booking_ID AS CHAR) LIKE ?)';
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
    $types   .= 'ssss';
}

$whereSQL = 'WHERE ' . implode(' AND ', $where);

$sql = "
    SELECT
        b.Booking_ID,
        b.Booking_UserEmail,
        b.Booking_HotelID,
        b.Booking_HotelName,
        b.Booking_RoomType,
        b.Booking_CheckIn,
        b.Booking_CheckOut,
        b.Booking_Adults,
        b.Booking_Children,
        b.Booking_Rooms,
        b.Booking_Total,
        b.Booking_Status,
        b.Booking_CreatedAt,
        CONCAT(u.User_Fname, ' ', u.User_Lname) AS Customer_Name,
        u.User_Phone AS Customer_Contact
    FROM BOOKING b
    LEFT JOIN USER u ON u.User_Email = b.Booking_UserEmail
    $whereSQL
    ORDER BY b.Booking_ID DESC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result   = $stmt->get_result();
$bookings = [];

while ($row = $result->fetch_assoc()) {
    $bookings[] = $row;
}

// Summary counts for THIS hotel only
$summaryStmt = $conn->prepare("
    SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN LOWER(Booking_Status) = 'confirmed'  THEN 1 ELSE 0 END) AS confirmed,
        SUM(CASE WHEN LOWER(Booking_Status) = 'cancelled'  THEN 1 ELSE 0 END) AS cancelled,
        SUM(CASE WHEN LOWER(Booking_Status) = 'completed'  THEN 1 ELSE 0 END) AS completed,
        SUM(Booking_Total) AS revenue
    FROM BOOKING
    WHERE Booking_HotelID = ?
");
$summaryStmt->bind_param('i', $hotelID);
$summaryStmt->execute();
$summary = $summaryStmt->get_result()->fetch_assoc();

echo json_encode([
    'success'  => true,
    'bookings' => $bookings,
    'summary'  => $summary,
]);

$stmt->close();
$summaryStmt->close();
$conn->close();