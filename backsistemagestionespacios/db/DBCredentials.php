<?php

// Leer variables de entorno en .env
$envPath = __DIR__.'/../.env';
$env = file_exists($envPath)
    ? parse_ini_file($envPath, false, INI_SCANNER_RAW)
    : array();

define('host', $env['DB_HOST'] ?? '');
define ('user', $env['DB_USER'] ?? '');
define ('pass', $env['DB_PASS'] ?? '');
define ('BD', $env['DB_NAME'] ?? '');
define ('BD_test', $env['DB_NAME_TEST'] ?? ''); //el generador automatico de app esta en modo test

?>