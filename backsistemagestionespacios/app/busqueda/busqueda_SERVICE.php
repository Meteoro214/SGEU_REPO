<?php

include_once './base/appServiceBase.php';
include_once './app/busqueda/busqueda_MODEL.php';

class busqueda_SERVICE extends appServiceBase {

    public $modelo;

    function inicializarRest() {
        $this->modelo = new busqueda_MODEL();
    }


    function GLOBAL_SEARCH() {
        $datosToken = $this->obtenerDatosToken();

        if (!$datosToken['ok']) {
            return $datosToken;
        }
        $idGrupo = $datosToken["data"]->id_grupo;

        // Recuperar y validar el texto.
        $texto = trim($_POST['texto'] ?? '');

        if (strlen($texto) < 2) {
            return array(
                'ok' => false,
                'code' => 'BUSQUEDA_TEXTO_CORTO_KO',
                'message' => 'Introduce al menos dos caracteres para buscar.'
            );
        }

        if (strlen($texto) > 100) {
            return array(
                'ok' => false,
                'code' => 'BUSQUEDA_TEXTO_LARGO_KO',
                'message' => 'El texto de búsqueda no puede superar los 100 caracteres.'
            );
        }

        try {
            $resultados = $this->modelo->buscarGlobal(
                $texto,
                $idGrupo,
                $datosToken["data"]->id_usuario
            );

            return array(
                'ok' => true,
                'code' => 'GLOBAL_SEARCH_OK',
                'resource' => $resultados
            );

        } catch (Exception $e) {

            return array(
                'ok' => false,
                'code' => 'GLOBAL_SEARCH_ERROR',
                'message' => 'No se ha podido realizar la búsqueda.',
                'resource' => array()
            );
        }
    }

}

?>
