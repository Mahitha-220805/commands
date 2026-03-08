<?php

// Database connection
$servername = "localhost:3307";
$username = "root";
$password = "";
$dbname = "signup_db";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get data from login form
$email = $_POST['email'];
$password = $_POST['password'];

// SQL query to check user
$sql = "SELECT * FROM users WHERE email='$email' AND password='$password'";

$result = $conn->query($sql);

// Check if user exists
if ($result->num_rows > 0) {
    echo "Login Successful";
} else {
    echo "Invalid email or Password";
}

$conn->close();

?>