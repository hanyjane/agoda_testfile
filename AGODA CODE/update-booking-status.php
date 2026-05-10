<?php
// ===== update-booking-status.php — Update a booking's status =====

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

$bookingId = (int)($_POST['booking_id'] ?? 0);
$newStatus = strtolower(trim($_POST['status'] ?? ''));

if (!$bookingId) {
    echo json_encode(['success' => false, 'message' => 'Booking ID is required.']);
    exit;
}

$allowed = ['confirmed', 'cancelled', 'completed'];
if (!in_array($newStatus, $allowed)) {
    echo json_encode(['success' => false, 'message' => 'Invalid status. Allowed: confirmed, cancelled, completed.']);
    exit;
}

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}
$conn->set_charset('utf8mb4');

// Capitalise for storage consistency
$statusStored = ucfirst($newStatus);

$stmt = $conn->prepare("
    UPDATE BOOKING
    SET Booking_Status = ?
    WHERE Booking_ID   = ?
");

if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Query preparation failed.']);
    exit;
}

$stmt->bind_param('si', $statusStored, $bookingId);

if ($stmt->execute() && $stmt->affected_rows > 0) {
    echo json_encode([
        'success'    => true,
        'message'    => "Booking #$bookingId status updated to $statusStored.",
        'booking_id' => $bookingId,
        'status'     => $statusStored,
    ]);
} elseif ($stmt->affected_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Booking not found or status unchanged.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update booking status.']);
}

$stmt->close();
$conn->close();
