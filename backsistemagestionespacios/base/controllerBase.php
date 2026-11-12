<?php

class controllerBase {

    function __construct() {
        $controlador = get_class($this);

        // Incluir el SERVICE correspondiente
        $fichero = './app/' . $controlador . '/' . $controlador . '_SERVICE.php';
        if (file_exists($fichero)) {
            include_once $fichero;
        }

        // Buscar la clase SERVICE (AUTH_SERVICE, usuario_SERVICE, etc.)
        $posibles = array(
            strtoupper($controlador) . '_SERVICE',
            $controlador . '_SERVICE'
        );

        $claseServicio = null;
        foreach ($posibles as $clase) {
            if (class_exists($clase)) {
                $claseServicio = $clase;
                break;
            }
        }

        header('Content-type: application/json');

        if ($claseServicio) {
            $servicio  = new $claseServicio();
            $respuesta = $servicio->ejecutar();
        } else {
            $respuesta = array(
                'ok'       => false,
                'code'     => 'SERVICIO_NO_ENCONTRADO_KO',
                'resource' => $controlador
            );
        }

        echo json_encode($respuesta);
    }
}

?>
