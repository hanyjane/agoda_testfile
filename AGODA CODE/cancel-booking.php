<?php
// ===== cancel-booking.php — Allow a guest to cancel their own booking =====

// Buffer ALL output so no stray whitespace/warnings corrupt the JSON
ob_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Suppress display of errors — log them instead, never echo them
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
ini_set('log_errors', 1);

// Catch any fatal/unexpected output and wrap it as a JSON error
function sendJson($data) {
    ob_end_clean();          // discard any stray output before us
    echo json_encode($data);
    exit;
}

// Register a shutdown handler so even fatal PHP errors return valid JSON
register_shutdown_function(function () {
    $err = error_get_last();
    if ($err && in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        ob_end_clean();
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Server error: ' . $err['message']]);
    }
});

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'agoda_db');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['success' => false, 'message' => 'Invalid request method.']);
}

$bookingId = (int)($_POST['bookingId'] ?? 0);
$userEmail = trim($_POST['userEmail'] ?? '');

if (!$bookingId) {
    sendJson(['success' => false, 'message' => 'Booking ID is required.']);
}

if (!$userEmail) {
    sendJson(['success' => false, 'message' => 'User email is required.']);
}

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    sendJson(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]);
}
$conn->set_charset('utf8mb4');

// Verify booking belongs to this user
$check = $conn->prepare("
    SELECT Booking_ID, Booking_Status
    FROM BOOKING
    WHERE Booking_ID = ? AND Booking_UserEmail = ?
");
if (!$check) {
    sendJson(['success' => false, 'message' => 'Query preparation failed: ' . $conn->error]);
}

$check->bind_param('is', $bookingId, $userEmail);
$check->execute();
$result = $check->get_result();

if ($result->num_rows === 0) {
    $check->close(); $conn->close();
    sendJson(['success' => false, 'message' => 'Booking not found or does not belong to your account.']);
}

$booking = $result->fetch_assoc();
$check->close();

$currentStatus = strtolower($booking['Booking_Status']);

if ($currentStatus === 'cancelled') {
    $conn->close();
    sendJson(['success' => false, 'message' => 'This booking is already cancelled.']);
}

if ($currentStatus === 'completed') {
    $conn->close();
    sendJson(['success' => false, 'message' => 'Completed bookings cannot be cancelled.']);
}

// Update status to Cancelled
$stmt = $conn->prepare("
    UPDATE BOOKING
    SET Booking_Status = 'Cancelled'
    WHERE Booking_ID = ? AND Booking_UserEmail = ?
");
if (!$stmt) {
    $conn->close();
    sendJson(['success' => false, 'message' => 'Query preparation failed: ' . $conn->error]);
}

$stmt->bind_param('is', $bookingId, $userEmail);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    $stmt->close(); $conn->close();
    sendJson([
        'success'    => true,
        'message'    => 'Your booking has been cancelled successfully.',
        'booking_id' => $bookingId,
    ]);
} else {
    $stmt->close(); $conn->close();
    sendJson(['success' => false, 'message' => 'Failed to cancel. The booking may have already been updated.']);
}