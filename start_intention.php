<?php
include 'log.php';

$intention = htmlspecialchars($_POST['intention']);
logAction("Intention started: user started an intention");

// Symbolically connect to the Servitor and pass the intention
logAction("Servitor amplifying intention (intention not logged).");

echo "Your intention has been sent to the Servitor for amplification.";
?>
