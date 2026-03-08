<?php

include 'conn.php';

if ($_SERVER["REQUEST_METHOD"] == "POST"){

    $username = trim($_POST['username']);
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);

    // Clean input
    $username = strtolower($username);
}
$sql = "INSERT INTO users (username,email,password)
        VALUES ('$username','$email', '$password')";

if (mysqli_query($conn, $sql)) {
    echo "go to login page";
    // Redirect to login page after successful signup
    header("Location: login.html");
    exit();
} else {
    echo "Error: " . mysqli_error($conn);
}

mysqli_close($conn);
?>