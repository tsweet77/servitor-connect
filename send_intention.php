<?php
include 'log.php';

$intention = htmlspecialchars($_POST['intention']);
logAction("Intention sent: $intention");

echo "Your intention has been sent and amplified by the Servitor.";
?>
