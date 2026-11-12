<?php

header('Access-Control-Allow-Origin: *'); //Permite acceso de cualquier direccion para CORS
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS'); //Permite estos metodos HTTP
header('Access-Control-Allow-Headers: Content-Type, Authorization'); //Indica cabeceras extra permitidas en CORS
header('Access-Control-Allow-Credentials: true'); //Permite uso de credenciales
header('Content-Type: application/json; charset=utf-8'); //Configura las respuestas

error_reporting(E_ALL); //Registra todo tipo de errores
ini_set('display_errors', '0'); //Evita que los errores se printeen a la respuesta

//Ante las option, da 200, Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start(); //Inicia la sesion de usuario


$basePath = __DIR__; //directorio del back
$configPath = $basePath.'/db/DBCredentials.php'; //archivo de config para BD


//Falta archivo de config
if (!is_file($configPath)) {
    http_response_code(500);
    echo json_encode(array(
        'ok' => false,
        'code' => 'CONFIGURACION_NO_ENCONTRADA_KO',
        'resource' => 'Falta db/DBCredentials.php'
    ));
    exit();
}

include_once $configPath;
include_once $basePath.'/comun/funcionesGenerales.php'; //Carga funcionalidades generales


//Creacion automatica de entidades
if (isset($_POST['managementCore']) && $_POST['managementCore']=='crear'){
		include_once './core/crearGestionEntidad.php';
		$managementCore = new managementCore();
		$respuesta = $managementCore->ejecutarmanagementCore();
		header('Content-type: application/json');
		echo(json_encode($respuesta));
		exit();
}

// Control de peticiones

//asegura que exista el parametro controlador
if (!isset($_POST['controlador'])){ 
	$mensaje = '';
	$respuesta = array('ok' => false, 'code' => 'CONTROLADOR_VACIO_KO', 'resource' => $mensaje);
	header('Content-type: application/json');
	echo(json_encode($respuesta));
	exit();
}

$rest = $_POST['controlador'];


//asegura que exista el parametro action

if (!isset($_POST['action']) || $_POST['action'] == ''){
	$mensaje = '';
	$respuesta = array('ok' => false, 'code' => 'ACCION_VACIA_KO', 'resource' => $mensaje);
	header('Content-type: application/json');
	echo(json_encode($respuesta));
	exit();
}

$action = $_POST['action'];


// qa_cleanup se mantiene en tests/qa-cleanup y no forma parte de las entidades CRUD.
if ($rest === 'qa_cleanup') {
    $ficheroController = $basePath.'/tests/qa-cleanup/qa-cleanup_CONTROLLER.php';
    $ficheroServicio = $basePath.'/tests/qa-cleanup/qa-cleanup_MODEL.php';
    if (is_file($ficheroServicio)) {
        include_once $ficheroServicio;
    }
} else {
    $ficheroController = './app/'.$rest.'/'.$rest.'_CONTROLLER.php'; //Carga el controller
}

//Comprueba si existe archivo de controller
$res = comprobar_si_existe_fichero($ficheroController);
if(!$res['ok']){
    $mensaje = 'No existe la definición del controlador indicada : '.$fichero;
    $respuesta = array('ok' => false, 'code' => 'DEFINICION_CONTROLADOR_INVALIDA_KO', 'resource' => $mensaje);
    header('Content-type: application/json');
    echo(json_encode($respuesta));
    exit();

}

//Comprueba si existe clase de controller
$res = comprobar_si_existe_clase($rest);
if (!$res['ok']){
        $mensaje = 'No existe el controlador indicado : '.$rest;
        $respuesta = array('ok' => false, 'code' => 'CONTROLADOR_INVALIDO_KO', 'resource' => $mensaje);
        header('Content-type: application/json');
        echo(json_encode($respuesta));
        exit();

}

$nombrerest = new $rest; //Crea el controller

?>
