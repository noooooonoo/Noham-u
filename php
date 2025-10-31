<?php
$email = $_POST['email'];
$password = $_POST['password'];

// Hachage du mot de passe
$hash = password_hash($password, PASSWORD_DEFAULT);

$pdo = new PDO('mysql:host=localhost;dbname=ton_site;charset=utf8', 'root', '');
$stmt = $pdo->prepare("INSERT INTO utilisateurs (email, mot_de_passe) VALUES (?, ?)");
$stmt->execute([$email, $hash]);

echo "Inscription réussie !";
?>
