<?php
// ===== staff-login.php — Authenticate staff members =====

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

$username = trim($_POST['username'] ?? '');
$password = trim($_POST['password'] ?? '');

if (!$username || !$password) {
    echo json_encode(['success' => false, 'message' => 'Username and password are required.']);
    exit;
}

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}
$conn->set_charset('utf8mb4');

$stmt = $conn->prepare("
    SELECT Staff_ID, Staff_Username, Staff_Name, Staff_Role, Staff_Password
    FROM staff
    WHERE Staff_Username = ?
    LIMIT 1
");

if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Query preparation failed.']);
    exit;
}

$stmt->bind_param('s', $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
    $stmt->close();
    $conn->close();
    exit;
}

$staff = $result->fetch_assoc();

// Verify password (supports both hashed and plain-text for easy setup)
$passwordValid = password_verify($password, $staff['Staff_Password'])
              || $password === $staff['Staff_Password'];

if (!$passwordValid) {
    echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
    $stmt->close();
    $conn->close();
    exit;
}

echo json_encode([
    'success'  => true,
    'username' => $staff['Staff_Username'],
    'name'     => $staff['Staff_Name'],
    'role'     => $staff['Staff_Role'],
]);

$stmt->close();
$conn->close();
