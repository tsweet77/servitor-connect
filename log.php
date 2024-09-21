<?php
// log.php

function logAction($action) {
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents('servitor_log.txt', "$timestamp: $action\n", FILE_APPEND);
}
?>
