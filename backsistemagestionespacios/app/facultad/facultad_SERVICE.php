<?php
// Plantilla para clases Service

include_once './base/appServiceBase.php';

class facultad_SERVICE extends appServiceBase {

    public $modelo;

    function __construct() {
        parent::__construct();
    }

    function inicializarRest() {
        $this->listaAtributos = array(
            'id_facultad',
            'nom_facultad',
            'anho_acad_facultad'
        );

        $this->listaAtributosSelect = array(
            'id_facultad',
            'nom_facultad',
            'anho_acad_facultad'
        );

        $this->notnull = array(
            'ADD' => array('nom_facultad', 'anho_acad_facultad'),
            'EDIT' => array('nom_facultad', 'anho_acad_facultad'),
            'DELETE' => array('id_facultad'),
            'DUPLICAR' => array('anho_acad_facultad')
        );

        $this->modelo = $this->crearModelOne('facultad');
    }

    /**
     * Duplica las facultades seleccionadas para otro año académico.
     */
    function DUPLICAR() {

        $ids = $_POST['facultades'] ?? array();

        if (!is_array($ids) || empty($ids)) {
            return array(
                'ok' => false,
                'code' => 'FACULTADES_SELECCION_KO',
                'message' => 'Debes seleccionar al menos una facultad.'
            );
        }

        $idsValidados = array();
        foreach ($ids as $id) {
            if (filter_var($id, FILTER_VALIDATE_INT) === false || intval($id) <= 0) {
                return array(
                    'ok' => false,
                    'code' => 'FACULTAD_ID_INVALIDO_KO'
                );
            }
            $idsValidados[] = intval($id);
        }
        $idsValidados = array_values(array_unique($idsValidados));


        $anhoDestino = trim($_POST['anho_acad_facultad']);
        if (!preg_match('/^(\d{4})-(\d{4})$/', $anhoDestino, $coincidencia)) {
            return array(
                'ok' => false,
                'code' => 'ANHO_ACADEMICO_FORMATO_KO'
            );
        }
        $inicioDestino = intval($coincidencia[1]);
        $finDestino = intval($coincidencia[2]);
        if ($inicioDestino < date('Y') || $finDestino !== $inicioDestino + 1) {
            return array(
                'ok' => false,
                'code' => 'ANHO_ACADEMICO_INVALIDO_KO'
            );
        }


        $map = new mapping('facultad');
        $idsSQL = implode(',', $idsValidados);
        $consulta = "
            SELECT id_facultad, nom_facultad, anho_acad_facultad
            FROM facultad
            WHERE id_facultad IN ({$idsSQL})
        ";

        $resultado = $map->lanzarqueryconresults($consulta);
        if (!$resultado['ok']) {
            return $resultado;
        }

        $originales = $resultado['resource'] ?? array();
        if (count($originales) !== count($idsValidados)) {
            return array(
                'ok' => false,
                'code' => 'FACULTADES_NO_ENCONTRADAS_KO'
            );
        }

        //Comprobar que el destino sea posterior a todos los orígenes.
        $mayorAnhoOrigen = 0;
        foreach ($originales as $facultad) {

            if (!preg_match('/^(\d{4})-(\d{4})$/', $facultad['anho_acad_facultad'], $origen)) {
                return array(
                    'ok' => false,
                    'code' => 'ANHO_ORIGEN_INVALIDO_KO'
                );
            }
            $inicioOrigen = intval($origen[1]);
            if ($inicioOrigen > $mayorAnhoOrigen) {
                $mayorAnhoOrigen = $inicioOrigen;
            }
        }

        if ($inicioDestino <= $mayorAnhoOrigen) {
            return array(
                'ok' => false,
                'code' => 'ANHO_DESTINO_NO_POSTERIOR_KO',
                'message' => 'El año de destino debe ser posterior a todos los años seleccionados.'
            );
        }

        //Crear las nuevas facultades
        $creadas = array();
        $anhoSeguro = addslashes($anhoDestino);

        foreach ($originales as $facultad) {

            $nombre = $facultad['nom_facultad'];
            $nombreSeguro = addslashes($nombre);

            $insertSql = "
                INSERT INTO facultad (nom_facultad, anho_acad_facultad)
                VALUES ('{$nombreSeguro}', '{$anhoSeguro}')";

            $resInsert = $map->lanzarquery($insertSql);

            if (!$resInsert['ok']) {
                return array(
                    'ok' => false,
                    'code' => 'DUPLICACION_PARCIAL_KO',
                    'resource' => array(
                        'creadas' => $creadas,
                        'error' => $resInsert['resource'] ?? ($resInsert['message'] ?? 'Error al insertar facultad.')
                    )
                );
            }

            $nuevoId = (isset($resInsert['resource']) && is_numeric($resInsert['resource']))
                ? intval($resInsert['resource'])
                : null;

            $creadas[] = array(
                'id_facultad' => $nuevoId,
                'nom_facultad' => $nombre,
                'anho_acad_facultad' => $anhoDestino
            );

        }

        return array(
			'ok' => true,
			'code' => 'FACULTADES_DUPLICADAS_OK',
			'resource' => $creadas
		);
    }
}
