
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
     * Intercepta la acción DUPLICAR.
     * Las demás acciones siguen el comportamiento heredado.
     */
    function ejecutar($skip = false) {

        if (($_POST['action'] ?? '') === 'DUPLICAR') {
            return $this->duplicarFacultades();
        }

        return parent::ejecutar($skip);
    }

    /**
     * Comprueba el token y que el usuario sea ADMIN.
     */
    private function comprobarAdminDuplicacion() {

        $token = $_POST['token'] ?? '';

        if (empty($token)) {
            return array(
                'ok' => false,
                'code' => 'TOKEN_KO',
                'message' => 'No se ha proporcionado un token de autenticación.'
            );
        }

        try {
            include_once './base/JWT/token.php';

            $payload = MiToken::devuelveToken($token);

            if (!isset($payload->data->id_grupo)) {
                return array(
                    'ok' => false,
                    'code' => 'TOKEN_INVALIDO_KO',
                    'message' => 'El token no contiene el grupo del usuario.'
                );
            }

            if (intval($payload->data->id_grupo) !== 1) {
                return array(
                    'ok' => false,
                    'code' => 'ACCESO_DENEGADO_KO',
                    'message' => 'Solo ADMIN puede duplicar facultades.'
                );
            }

        } catch (Exception $e) {
            return array(
                'ok' => false,
                'code' => 'TOKEN_INVALIDO_KO',
                'message' => $e->getMessage()
            );
        }

        return true;
    }

    /**
     * Duplica las facultades seleccionadas para otro año académico.
     */
    private function duplicarFacultades() {

        // 1. Comprobar permisos.
        $permiso = $this->comprobarAdminDuplicacion();

        if ($permiso !== true) {
            return $permiso;
        }

        // 2. Comprobar campos obligatorios.
        $res = $this->comprobarnulos();

        if ($res !== true) {
            return $res;
        }

        // 3. Validar identificadores recibidos.
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

        // 4. Validar año académico de destino.
        $anhoDestino = trim($_POST['anho_acad_facultad']);

        if (!preg_match('/^(\d{4})-(\d{4})$/', $anhoDestino, $coincidencia)) {
            return array(
                'ok' => false,
                'code' => 'ANHO_ACADEMICO_FORMATO_KO'
            );
        }

        $inicioDestino = intval($coincidencia[1]);
        $finDestino = intval($coincidencia[2]);

        if ($inicioDestino < 2026 || $finDestino !== $inicioDestino + 1) {
            return array(
                'ok' => false,
                'code' => 'ANHO_ACADEMICO_INVALIDO_KO'
            );
        }

        // 5. Consultar las facultades originales.
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

        // 6. Comprobar que el destino sea posterior a todos los orígenes.
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

        // 7. Crear las nuevas facultades mediante consultas preparadas.
		$creadas = array();

		$conn = new mysqli(host, user, pass, BD);

		if ($conn->connect_error) {
			return array(
				'ok' => false,
				'code' => 'DB_CONNECTION_ERROR'
			);
		}

		$conn->set_charset('utf8');

		$stmt = $conn->prepare(
			"INSERT INTO facultad (nom_facultad, anho_acad_facultad)
			VALUES (?, ?)"
		);

		if (!$stmt) {
			$conn->close();

			return array(
				'ok' => false,
				'code' => 'QUERY_ERROR'
			);
		}

		$stmt->bind_param('ss', $nombre, $anho);

		foreach ($originales as $facultad) {

			$nombre = $facultad['nom_facultad'];
			$anho = $anhoDestino;

			if (!$stmt->execute()) {
				$error = $stmt->error;

				$stmt->close();
				$conn->close();

				return array(
					'ok' => false,
					'code' => 'DUPLICACION_PARCIAL_KO',
					'resource' => array(
						'creadas' => $creadas,
						'error' => $error
					)
				);
			}

			$creadas[] = array(
				'id_facultad' => $conn->insert_id,
				'nom_facultad' => $nombre,
				'anho_acad_facultad' => $anho
			);
		}

		$stmt->close();
		$conn->close();

		return array(
			'ok' => true,
			'code' => 'FACULTADES_DUPLICADAS_OK',
			'resource' => $creadas
		);
    }
}
