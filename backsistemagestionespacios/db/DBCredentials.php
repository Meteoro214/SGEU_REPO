<?php

// Leer variables de entorno en .env
$envPath = __DIR__.'/../.env';
$env = file_exists($envPath)
    ? parse_ini_file($envPath, false, INI_SCANNER_RAW)
    : array();

define('host', $env['DB_HOST'] ?? '');
define ('user', $env['DB_USER'] ?? '');
define ('pass', $env['DB_PASS'] ?? '');
define ('BD_prod', $env['DB_NAME'] ?? '');
define ('BD_test', $env['DB_NAME_TEST'] ?? '');


$bdActiva = BD_prod;
if (isset($_POST['db_mode']) && $_POST['db_mode'] === 'TEST') {
    if (!empty(BD_test)) {
        $bdActiva = BD_test;
    }
}

define('BD', $bdActiva);
?>