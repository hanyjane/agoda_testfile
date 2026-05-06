<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'agoda_db');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

// ⚠️ MUST match JavaScript FormData keys
$firstName = trim($_POST['User_Fname']    ?? '');
$lastName  = trim($_POST['User_Lname']    ?? '');
$email     = trim($_POST['User_Email']    ?? '');
$phone     = trim($_POST['User_Phone']    ?? '');
$password  = trim($_POST['User_Password'] ?? '');

// Debug - remove after testing
// echo json_encode(['debug' => $_POST]); exit;

if ($firstName === '' || $lastName === '' || $email === '' || $phone === '' || $password === '') {
    echo json_encode([
        'success' => false, 
        'message' => 'All fields are required.',
        'debug' => [
            'User_Fname' => $firstName,
            'User_Lname' => $lastName,
            'User_Email' => $email,
            'User_Phone' => $phone,
            'User_Password' => empty($password) ? 'EMPTY' : 'SET'
        ]
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']);
    exit;
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}

$check = $conn->prepare('SELECT User_ID FROM USER WHERE User_Email = ?');
$check->bind_param('s', $email);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Email is already registered.']);
    $check->close();
    $conn->close();
    exit;
}
$check->close();

$stmt = $conn->prepare(
    'INSERT INTO USER (User_Fname, User_Lname, User_Email, User_Phone, User_Password, created_at)
     VALUES (?, ?, ?, ?, ?, NOW())'
);

$stmt->bind_param('sssss', $firstName, $lastName, $email, $phone, $hashedPassword);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Account created successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to create account.']);
}

$stmt->close();
$conn->close();