<?php
// Exemple très simplifié — ne pas utiliser tel quel en production !

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

// Connexion à la base de données
$pdo = new PDO('mysql:host=localhost;dbname=ton_site;charset=utf8', 'root', '');

// Vérifie si l'utilisateur existe
$stmt = $pdo->prepare("SELECT * FROM utilisateurs WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['mot_de_passe'])) {
    session_start();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['email'] = $user['email'];
    echo "Connexion réussie ! Bienvenue " . htmlspecialchars($user['email']);
} else {
    echo "Adresse e-mail ou mot de passe incorrect.";
}
?>
