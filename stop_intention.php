<?php
include 'log.php';

$intention = htmlspecialchars($_POST['intention'] ?? '');

// Check if the intention is empty (i.e., the user is stopping it)
if (empty($intention)) {
    logAction("Intention stopped by the user.");
    logAction("Servitor has stopped amplifying the intention.");
} else {
    // Handle any other case if needed
    logAction("Received non-empty intention at stopping, which is unexpected.");
}

echo "The Servitor has stopped focusing on your intention.";
?>
