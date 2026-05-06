<?php
// ===== LOGIN.PHP — Authenticate user =====

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// ── Database config ──
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');      // ← REPLACE with your actual password
define('DB_NAME', 'agoda_db');

// ── Only accept POST ──
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

// ── Read input (keys match login.js FormData exactly) ──
$email    = trim($_POST['User_Email']    ?? '');
$password = trim($_POST['User_Password'] ?? '');

// ── Validation ──
if ($email === '' || $password === '') {
    echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
    exit;
}

// ── Connect to database ──
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}

// ── Fetch user by email ──
$stmt = $conn->prepare('SELECT User_Fname, User_Lname, User_Email, User_Password FROM USER WHERE User_Email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();
$user   = $result->fetch_assoc();

if (!$user) {
    echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
    $stmt->close();
    $conn->close();
    exit;
}

// ── Verify password ──
if (!password_verify($password, $user['User_Password'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
    $stmt->close();
    $conn->close();
    exit;
}

// ── Login successful — return user info ──
echo json_encode([
    'success'    => true,
    'User_Fname' => $user['User_Fname'],
    'User_Lname' => $user['User_Lname'],
    'User_Email' => $user['User_Email']
]);

$stmt->close();
$conn->close();