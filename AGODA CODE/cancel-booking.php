<?php
// ===== cancel-booking.php — Allow a guest to cancel their own booking =====

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

$bookingId = (int)trim($_POST['bookingId'] ?? 0);
$userEmail = trim($_POST['userEmail'] ?? '');

if (!$bookingId) {
    echo json_encode(['success' => false, 'message' => 'Booking ID is required.']);
    exit;
}

if (!$userEmail) {
    echo json_encode(['success' => false, 'message' => 'User email is required.']);
    exit;
}

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}
$conn->set_charset('utf8mb4');

// Verify this booking actually belongs to the requesting user
// and is in a cancellable state (confirmed, not already cancelled/completed)
$check = $conn->prepare("
    SELECT Booking_ID, Booking_Status
    FROM BOOKING
    WHERE Booking_ID = ? AND Booking_UserEmail = ?
");
if (!$check) {
    echo json_encode(['success' => false, 'message' => 'Query preparation failed.']);
    exit;
}
$check->bind_param('is', $bookingId, $userEmail);
$check->execute();
$result = $check->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Booking not found or does not belong to your account.']);
    $check->close();
    $conn->close();
    exit;
}

$booking = $result->fetch_assoc();
$check->close();

if (strtolower($booking['Booking_Status']) === 'cancelled') {
    echo json_encode(['success' => false, 'message' => 'This booking is already cancelled.']);
    $conn->close();
    exit;
}

if (strtolower($booking['Booking_Status']) === 'completed') {
    echo json_encode(['success' => false, 'message' => 'Completed bookings cannot be cancelled.']);
    $conn->close();
    exit;
}

// Update status to Cancelled
$stmt = $conn->prepare("
    UPDATE BOOKING
    SET Booking_Status = 'Cancelled'
    WHERE Booking_ID = ? AND Booking_UserEmail = ?
");
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Query preparation failed.']);
    $conn->close();
    exit;
}
$stmt->bind_param('is', $bookingId, $userEmail);

if ($stmt->execute() && $stmt->affected_rows > 0) {
    echo json_encode([
        'success'    => true,
        'message'    => 'Your booking has been cancelled successfully.',
        'booking_id' => $bookingId,
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to cancel booking. Please try again.']);
}

$stmt->close();
$conn->close();
