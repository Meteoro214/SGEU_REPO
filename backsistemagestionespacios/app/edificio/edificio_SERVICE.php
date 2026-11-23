<?php
//Plantilla para clases Service

include_once './base/appServiceBase.php';
include_once './base/mapping.php';
include_once './base/JWT/token.php';

class edificio_SERVICE extends appServiceBase{

	public $modelo;

	//METODOS

	function __construct(){

		parent::__construct();

	}

	function inicializarRest(){

		$this->listaAtributos = array('id_edificio','nom_edificio','dir_edificio','tel_edificio','anho_acad_edificio');

		$this->listaAtributosSelect = array('id_edificio','nom_edificio','dir_edificio','tel_edificio','anho_acad_edificio');

		$this->notnull = array(
						'ADD' => array('nom_edificio','dir_edificio','anho_acad_edificio'),
						'EDIT' => array('nom_edificio','dir_edificio','anho_acad_edificio'),
						'DELETE' => array('id_edificio'),
    					'DUPLICAR' => array('anho_acad_edificio')
						);

		$this->modelo = $this->crearModelOne('edificio');
	}

	/**
	 * Duplica edificios y copia sus gestores a las nuevas copias.
	 * Toda la operación se realiza dentro de una única transacción.
	 */
	function DUPLICAR() {

		$ids = $_POST['edificios'] ?? array();

		if (!is_array($ids) || empty($ids)) {
			return array(
				'ok' => false,
				'code' => 'EDIFICIOS_SELECCION_KO',
				'message' => 'Debes seleccionar al menos un edificio.'
			);
		}

		$idsValidados = array();

		foreach ($ids as $id) {
			if (
				filter_var($id, FILTER_VALIDATE_INT) === false ||
				intval($id) <= 0
			) {
				return array(
					'ok' => false,
					'code' => 'EDIFICIO_ID_INVALIDO_KO'
				);
			}

			$idsValidados[] = intval($id);
		}

		$idsValidados = array_values(array_unique($idsValidados));

		//Validar el año académico destino.
		$anhoDestino = trim($_POST['anho_acad_edificio']);

		if (!preg_match('/^(\d{4})-(\d{4})$/', $anhoDestino, $coincidencia)) {
			return array(
				'ok' => false,
				'code' => 'ANHO_ACADEMICO_FORMATO_KO'
			);
		}

		$inicioDestino = intval($coincidencia[1]);
		$finDestino = intval($coincidencia[2]);

		if (
			$inicioDestino < date('Y') ||
			$finDestino !== $inicioDestino + 1
		) {
			return array(
				'ok' => false,
				'code' => 'ANHO_ACADEMICO_INVALIDO_KO'
			);
		}

		include_once './base/mapping.php';

		$mapEdificio = new mapping('edificio');
		$mapGestorEdificio = new mapping('gestor_edificio');
		$mapPlanta = new mapping('planta');

		
		$idsSQL = implode(',', $idsValidados);
		$anhoDestinoSQL = addslashes($anhoDestino);
		$creados = array();
		$transaccionActiva = false;

		try {
			//Iniciar la transacción.
			$resTx = $mapEdificio->lanzarquery("START TRANSACTION");
			if (!$resTx['ok']) {
				throw new Exception('No se pudo iniciar la transacción.');
			}
			$transaccionActiva = true;

			//Consultar y bloquear los edificios originales.
			$consulta = "
				SELECT
					id_edificio,
					nom_edificio,
					dir_edificio,
					tel_edificio,
					anho_acad_edificio
				FROM edificio
				WHERE id_edificio IN ({$idsSQL})
				FOR UPDATE
			";

			$resOriginales = $mapEdificio->lanzarqueryconresults($consulta);
			if (!$resOriginales['ok']) {
				$detalle = is_string($resOriginales['resource']) ? $resOriginales['resource'] : 'Error al consultar edificios.';
				throw new Exception($detalle);
			}
			$originales = is_array($resOriginales['resource']) ? $resOriginales['resource'] : array();
	
			// Comprobar que existen todos los edificios seleccionados.
			if (count($originales) !== count($idsValidados)) {
				$mapEdificio->lanzarquery("ROLLBACK");
				return array(
					'ok' => false,
					'code' => 'EDIFICIOS_NO_ENCONTRADOS_KO',
					'message' => 'Uno o varios edificios seleccionados no existen.'
				);
			}

			//Validar los años académicos de origen.
			$mayorAnhoOrigen = 0;
			foreach ($originales as $edificio) {
				if (
					!preg_match(
						'/^(\d{4})-(\d{4})$/',
						$edificio['anho_acad_edificio'],
						$origen
					)
				) {
					$mapEdificio->lanzarquery("ROLLBACK");
					return array(
						'ok' => false,
						'code' => 'ANHO_ORIGEN_INVALIDO_KO'
					);
				}
				
				$inicioOrigen = intval($origen[1]);
				$finOrigen = intval($origen[2]);
				if (
					$inicioOrigen < date("Y") ||
					$finOrigen !== $inicioOrigen + 1
				) {
					$mapEdificio->lanzarquery("ROLLBACK");
					return array(
						'ok' => false,
						'code' => 'ANHO_ORIGEN_INVALIDO_KO'
					);
				}
				if ($inicioOrigen > $mayorAnhoOrigen) {
					$mayorAnhoOrigen = $inicioOrigen;
				}
			}

			//Comprobar que el destino sea posterior a todos los orígenes.
			if ($inicioDestino <= $mayorAnhoOrigen) {
				$mapEdificio->lanzarquery("ROLLBACK");
				return array(
					'ok' => false,
					'code' => 'ANHO_DESTINO_NO_POSTERIOR_KO',
					'message' => 'El año destino debe ser posterior al año de origen más reciente.'
				);
			}	

			//Comprobar conflictos de gestores antes de duplicar.
			$sqlConflictos = "
				SELECT
					ge.id_usuario,
					u.nom_usuario,
					u.apell_usuario,
					COUNT(DISTINCT ge.id_edificio) AS num_edificios_origen,
					MAX(
						CASE
							WHEN destino.id_usuario IS NOT NULL THEN 1
							ELSE 0
						END
					) AS asignado_destino
				FROM gestor_edificio ge
				INNER JOIN usuario u
					ON u.id_usuario = ge.id_usuario
				LEFT JOIN gestor_edificio destino
					ON destino.id_usuario = ge.id_usuario
					AND destino.anho_acad_edificio = '{$anhoDestinoSQL}'
				WHERE ge.id_edificio IN ({$idsSQL})
				GROUP BY
					ge.id_usuario,
					u.nom_usuario,
					u.apell_usuario
				HAVING
					num_edificios_origen > 1
					OR asignado_destino = 1
			";

			$resConflictos = $mapGestorEdificio->lanzarqueryconresults($sqlConflictos);
			if (!$resConflictos['ok']) {
				$detalle = is_string($resConflictos['resource']) ? $resConflictos['resource'] : 'Error al comprobar conflictos de gestores.';
				throw new Exception($detalle);
			}

			$filasConflictos = is_array($resConflictos['resource']) ? $resConflictos['resource'] : array();
			$conflictos = array();
			foreach ($filasConflictos as $filaConflicto) {
				$motivos = array();

				if (intval($filaConflicto['asignado_destino']) === 1) {
					$motivos[] = "ya está asignado a otro edificio en {$anhoDestino}";
				}

				if (intval($filaConflicto['num_edificios_origen']) > 1) {
					$motivos[] = "aparece en varios edificios seleccionados";
				}

				$conflictos[] = array(
					'id_usuario' => intval($filaConflicto['id_usuario']),
					'nombre' => trim($filaConflicto['nom_usuario'].' '.$filaConflicto['apell_usuario']),
					'motivo' => implode(' y ', $motivos)
				);
			}

			if (!empty($conflictos)) {
				$mapEdificio->lanzarquery("ROLLBACK");

				$mensajes = array();
				foreach ($conflictos as $conflicto) {
					$mensajes[] = $conflicto['nombre'].': '.$conflicto['motivo'];
				}

				return array(
					'ok' => false,
					'code' => 'GESTORES_CONFLICTO_DUPLICACION_KO',
					'message' => 'No se pueden duplicar los edificios por los siguientes conflictos: ' .
						implode('; ', $mensajes).'.'
				);
			}

			//Crear cada edificio, duplicar plantas y copiar gestores.
			foreach ($originales as $edificio) {
				$nombre = $edificio['nom_edificio'];
				$direccion = $edificio['dir_edificio'];
				$telefono = $edificio['tel_edificio'];
				$idOriginal = intval($edificio['id_edificio']);

				$nombreSQL = addslashes($nombre);
				$direccionSQL = addslashes($direccion);
				$telefonoSQL = addslashes($telefono);

				$sqlInsertEdificio = "
					INSERT INTO edificio (
						nom_edificio,
						dir_edificio,
						tel_edificio,
						anho_acad_edificio
					)
					VALUES (
						'{$nombreSQL}',
						'{$direccionSQL}',
						'{$telefonoSQL}',
						'{$anhoDestinoSQL}'
					)
				";
				
				$resInsertEdificio = $mapEdificio->lanzarquery($sqlInsertEdificio);
				if (!$resInsertEdificio['ok']) {
					$detalle = is_string($resInsertEdificio['resource']) ? $resInsertEdificio['resource'] : 'Error al insertar el edificio duplicado.';
					throw new Exception($detalle);
				}

				$idNuevo = (isset($resInsertEdificio['resource']) && is_numeric($resInsertEdificio['resource']))
					? intval($resInsertEdificio['resource'])
					: 0;
				if ($idNuevo <= 0) {
					throw new Exception(
						'No se pudo obtener el identificador del edificio nuevo.'
					);
				}
				
				// Duplicar las plantas del edificio original.
				$sqlDuplicarPlantas = "
					INSERT INTO planta (
						id_edificio,
						id_planta,
						nom_planta,
						superf_total,
						superf_usable,
						anho_acad_planta
					)
					SELECT
						{$idNuevo},
						id_planta,
						nom_planta,
						superf_total,
						superf_usable,
						'{$anhoDestinoSQL}'
					FROM planta
					WHERE id_edificio = {$idOriginal}
				";				
				
				$resPlantas = $mapPlanta->lanzarquery($sqlDuplicarPlantas);

				if (!$resPlantas['ok']) {
					$detalle = is_string($resPlantas['resource']) ? $resPlantas['resource'] : 'Error al duplicar las plantas.';
					throw new Exception($detalle);
				}				

				// Copiar las asignaciones de gestores del edificio original.
				$sqlDuplicarGestores = "
					INSERT INTO gestor_edificio (
						id_edificio,
						id_usuario,
						anho_acad_edificio
					)
					SELECT
						{$idNuevo},
						ge.id_usuario,
						'{$anhoDestinoSQL}'
					FROM gestor_edificio ge
					WHERE ge.id_edificio = {$idOriginal}
				";

				$resGestores = $mapGestorEdificio->lanzarquery($sqlDuplicarGestores);

				if (!$resGestores['ok']) {
					$detalle = is_string($resGestores['resource']) ? $resGestores['resource'] : 'Error al copiar los gestores.';
					throw new Exception($detalle);
				}
				
				$creados[] = array(
					'id_edificio' => $idNuevo,
					'nom_edificio' => $nombre,
					'dir_edificio' => $direccion,
					'tel_edificio' => $telefono,
					'anho_acad_edificio' => $anhoDestino,
					'id_edificio_origen' => $idOriginal
				);
			}
			//Confirmar todos los cambios.
			$resCommit = $mapEdificio->lanzarquery("COMMIT");
			if (!$resCommit['ok']) {
				throw new Exception('No se pudo confirmar la transacción.');
			}
			$transaccionActiva = false;
			
			return array(
				'ok' => true,
				'code' => 'EDIFICIOS_DUPLICADOS_OK',
				'resource' => $creados
			);		
			} catch (Throwable $e) {

			if ($transaccionActiva) {
				$mapEdificio->lanzarquery("ROLLBACK");
			}

			return array(
				'ok' => false,
				'code' => 'EDIFICIOS_DUPLICACION_KO',
				'message' => $e->getMessage()
			);
		}
	}

	//valida los gestores del edificio
	function validarGestores($idEdificio, $anhoAcademico) {

		$datos = $_POST['gestores'] ?? array();

		if (!is_array($datos)) {
			return array('ok' => false, 'code' => 'GESTORES_INVALIDOS');
		}

		$ids = array();

		foreach ($datos as $id) {
			$id = filter_var($id, FILTER_VALIDATE_INT);

			if ($id === false || $id <= 0) {
				return array('ok' => false, 'code' => 'GESTORES_INVALIDOS');
			}

			$ids[] = intval($id);
		}

		$ids = array_values(array_unique($ids));

		if (empty($ids)) {
			return array('ok' => true, 'ids' => array());
		}

		$idsSQL = implode(',', $ids);
		$idEdificio = intval($idEdificio);
		$anhoAcademico = trim($anhoAcademico);

		if (!preg_match('/^\d{4}-\d{4}$/', $anhoAcademico)) {
			return array('ok' => false, 'code' => 'ANHO_ACADEMICO_INVALIDO_KO');
		}

		$map = new mapping('usuario');

		$sql = "
			SELECT u.id_usuario
			FROM usuario u
			WHERE u.id_usuario IN ($idsSQL)
			AND u.id_grupo = 2
			AND u.activo_usuario = 1
			AND NOT EXISTS (
				SELECT 1
				FROM gestor_edificio ge
				WHERE ge.id_usuario = u.id_usuario
					AND ge.anho_acad_edificio = '$anhoAcademico'
					AND ge.id_edificio <> $idEdificio
			)
		";

		$res = $map->lanzarqueryconresults($sql);

		if (!$res['ok']) {
			return $res;
		}

		$idsValidos = array();

		if (is_array($res['resource'])) {
			foreach ($res['resource'] as $fila) {
				$idsValidos[] = intval($fila['id_usuario']);
			}
		}

		sort($idsValidos);
		$idsOrdenados = $ids;
		sort($idsOrdenados);

		if ($idsValidos !== $idsOrdenados) {
			return array(
				'ok' => false,
				'code' => 'GESTORES_NO_DISPONIBLES',
				'message' => 'Algún gestor no está disponible para ese año académico porque ya está asignado a otro edificio, o no es un gestor activo.'
			);
		}

		return array('ok' => true, 'ids' => $ids);
	}

	// Modifica los gestores del edificio.
	// La transacción la controla ADD() o EDIT().
	function guardarGestores($idEdificio, $anhoAcademico, $idsGestores) {

		$map = new mapping('gestor_edificio');

		$idEdificio = intval($idEdificio);
		$anhoAcademico = trim($anhoAcademico);

		$idsGestores = array_values(
			array_unique(array_map('intval', $idsGestores))
		);

		if (!preg_match('/^\d{4}-\d{4}$/', $anhoAcademico)) {
			return array(
				'ok' => false,
				'code' => 'ANHO_ACADEMICO_INVALIDO_KO'
			);
		}

		$idsSQL = !empty($idsGestores)
			? implode(',', $idsGestores)
			: '';

		try {

			// Desasignar de los espacios a los gestores que se van a retirar.
			$condicionExcluir = !empty($idsSQL)
				? "AND id_gestor NOT IN ($idsSQL)"
				: "";

			$sqlEspacios = "
				UPDATE espacio
				SET id_gestor = NULL
				WHERE id_edificio = $idEdificio
				AND anho_acad_espacio = '$anhoAcademico'
				AND id_gestor IS NOT NULL
				$condicionExcluir
			";

			$res = $map->lanzarquery($sqlEspacios);

			if (!$res['ok']) {
				throw new Exception(
					'No se pudieron actualizar los responsables de los espacios.'
				);
			}

			// Eliminar las asignaciones anteriores que ya no se mantienen.
			$sqlEliminar = "
				DELETE FROM gestor_edificio
				WHERE id_edificio = $idEdificio
				AND anho_acad_edificio = '$anhoAcademico'
				".(
					!empty($idsSQL)
						? "AND id_usuario NOT IN ($idsSQL)"
						: ""
				);

			$res = $map->lanzarquery($sqlEliminar);

			if (!$res['ok']) {
				throw new Exception(
					'No se pudieron eliminar las asignaciones anteriores.'
				);
			}

			// Insertar las nuevas asignaciones.
			foreach ($idsGestores as $idGestor) {

				$sqlInsertar = "
					INSERT INTO gestor_edificio (
						id_edificio,
						id_usuario,
						anho_acad_edificio
					)
					SELECT
						$idEdificio,
						$idGestor,
						'$anhoAcademico'
					WHERE NOT EXISTS (
						SELECT 1
						FROM gestor_edificio
						WHERE id_edificio = $idEdificio
						AND id_usuario = $idGestor
						AND anho_acad_edificio = '$anhoAcademico'
					)
				";

				$res = $map->lanzarquery($sqlInsertar);

				if (!$res['ok']) {
					throw new Exception(
						'No se pudo asignar uno de los gestores.'
					);
				}
			}

			return array(
				'ok' => true,
				'code' => 'QUERY_OK'
			);

		} catch (Throwable $e) {

			return array(
				'ok' => false,
				'code' => 'GESTORES_ASIGNACION_KO',
				'message' => $e->getMessage()
			);
		}
	}

	function ADD() {

		$anhoAcademico = $_POST['anho_acad_edificio'] ?? '';

		// Validar los gestores antes de iniciar la transacción.
		$validacion = $this->validarGestores(0, $anhoAcademico);

		if (!$validacion['ok']) {
			return $validacion;
		}

		$map = new mapping('edificio');

		$transaccionIniciada = false;

		try {

			// Iniciar la transacción.
			$res = $map->lanzarquery("START TRANSACTION");

			if (!$res['ok']) {
				throw new Exception('No se pudo iniciar la transacción.');
			}

			$transaccionIniciada = true;

			// Crear el edificio.
			$this->modelo->valores = array(
				'nom_edificio' => $_POST['nom_edificio'],
				'dir_edificio' => $_POST['dir_edificio'],
				'tel_edificio' => $_POST['tel_edificio'] ?? '',
				'anho_acad_edificio' => $anhoAcademico
			);

			$resultado = $this->modelo->ADD();

			if (!$resultado['ok'] || $resultado['code'] !== 'QUERY_OK') {
				throw new Exception('No se pudo crear el edificio.');
			}

			$idEdificio = intval($resultado['resource']);

			if ($idEdificio <= 0) {
				throw new Exception(
					'No se pudo obtener el identificador del edificio.'
				);
			}

			// Guardar las asignaciones de gestores.
			$asignacion = $this->guardarGestores(
				$idEdificio,
				$anhoAcademico,
				$validacion['ids']
			);

			if (!$asignacion['ok']) {
				throw new Exception(
					$asignacion['message'] ?? 'No se pudieron asignar los gestores.'
				);
			}

			// Confirmar edificio y gestores conjuntamente.
			$res = $map->lanzarquery("COMMIT");

			if (!$res['ok']) {
				throw new Exception('No se pudo confirmar el alta del edificio.');
			}

			$transaccionIniciada = false;

			return $resultado;

		} catch (Throwable $e) {

			if ($transaccionIniciada) {
				$map->lanzarquery("ROLLBACK");
			}

			return array(
				'ok' => false,
				'code' => 'EDIFICIO_ADD_KO',
				'message' => $e->getMessage()
			);
		}
	}

	function EDIT() {

		$datosToken = $this->obtenerDatosToken();
		$idGrupo = intval($datosToken["data"]->id_grupo);
		$idEdificio = isset($_POST['id_edificio'])
			? intval($_POST['id_edificio'])
			: 0;

		if ($idEdificio <= 0) {
			return array(
				'ok' => false,
				'code' => 'EDIFICIO_ID_KO'
			);
		}

		// Comprobar que el año académico no se modifica.
		$map = new mapping('edificio');

		$resAnho = $map->lanzarqueryconresults("
			SELECT anho_acad_edificio
			FROM edificio
			WHERE id_edificio = $idEdificio
		");

		if (
			!$resAnho['ok'] ||
			!is_array($resAnho['resource']) ||
			empty($resAnho['resource'])
		) {
			return array(
				'ok' => false,
				'code' => 'EDIFICIO_NO_ENCONTRADO_KO'
			);
		}

		$anhoActual = $resAnho['resource'][0]['anho_acad_edificio'];
		$anhoRecibido = $_POST['anho_acad_edificio'] ?? '';

		if ($anhoRecibido !== $anhoActual) {
			return array(
				'ok' => false,
				'code' => 'ANHO_ACADEMICO_NO_MODIFICABLE',
				'message' => 'El año académico no se puede modificar. Debes duplicar el edificio para asignarle otro año.'
			);
		}

		// Solo ADMIN puede modificar las asignaciones de gestores.
		if ($idGrupo === 1) {

			$validacion = $this->validarGestores(
				$idEdificio,
				$anhoActual
			);

			if (!$validacion['ok']) {
				return $validacion;
			}
		}

		$transaccionIniciada = false;

		try {

			// Iniciar la transacción.
			$res = $map->lanzarquery("START TRANSACTION");

			if (!$res['ok']) {
				throw new Exception('No se pudo iniciar la transacción.');
			}

			$transaccionIniciada = true;

			// Modificar los datos del edificio.
			$this->modelo->valores = array(
				'id_edificio' => $idEdificio,
				'nom_edificio' => $_POST['nom_edificio'],
				'dir_edificio' => $_POST['dir_edificio'],
				'tel_edificio' => $_POST['tel_edificio'] ?? '',
				'anho_acad_edificio' => $anhoActual
			);

			$resultado = $this->modelo->EDIT();

			if (!$resultado['ok'] || $resultado['code'] !== 'QUERY_OK') {
				throw new Exception('No se pudieron modificar los datos del edificio.');
			}

			// Si es ADMIN, guardar también las asignaciones de gestores.
			if ($idGrupo === 1) {

				$asignacion = $this->guardarGestores(
					$idEdificio,
					$anhoActual,
					$validacion['ids']
				);

				if (!$asignacion['ok']) {
					throw new Exception(
						$asignacion['message'] ?? 'No se pudieron guardar los gestores.'
					);
				}
			}

			// Confirmar todos los cambios.
			$res = $map->lanzarquery("COMMIT");

			if (!$res['ok']) {
				throw new Exception('No se pudo confirmar la modificación.');
			}

			$transaccionIniciada = false;

			return $resultado;

		} catch (Throwable $e) {

			if ($transaccionIniciada) {
				$map->lanzarquery("ROLLBACK");
			}

			return array(
				'ok' => false,
				'code' => 'EDIFICIO_EDIT_KO',
				'message' => $e->getMessage()
			);
		}
	}

	function DELETE() {
		$idEdificio = isset($_POST['id_edificio'])
			? filter_var($_POST['id_edificio'], FILTER_VALIDATE_INT)
			: false;

		if ($idEdificio === false || $idEdificio <= 0) {
			return array(
				'ok' => false,
				'code' => 'EDIFICIO_ID_KO',
				'message' => 'El identificador del edificio no es válido.'
			);
		}

		$idEdificio = intval($idEdificio);

		include_once './base/mapping.php';
		$mapEdificio = new mapping('edificio');
		$mapPlanta = new mapping('planta');
		$mapEspacio = new mapping('espacio');

		$transaccionActiva = false;

		try {
			//Iniciar la transacción.
			$resTx = $mapEdificio->lanzarquery("START TRANSACTION");
			if (!$resTx['ok']) {
				throw new Exception('No se pudo iniciar la transacción.');
			}
			$transaccionActiva = true;

			// Comprobar que el edificio existe y bloquearlo.
			$sqlComprobar = "
				SELECT id_edificio
				FROM edificio
				WHERE id_edificio = {$idEdificio}
				FOR UPDATE
			";

			$resComprobar = $mapEdificio->lanzarqueryconresults($sqlComprobar);

			if (!$resComprobar['ok']) {
				$detalle = is_string($resComprobar['resource']) ? $resComprobar['resource'] : 'Error al comprobar el edificio.';
				throw new Exception($detalle);
			}

			if (!is_array($resComprobar['resource']) || count($resComprobar['resource']) === 0) {
				$mapEdificio->lanzarquery("ROLLBACK");
				$transaccionActiva = false;

				return array(
					'ok' => false,
					'code' => 'EDIFICIO_NO_ENCONTRADO_KO',
					'message' => 'El edificio que intentas eliminar no existe.'
				);
			}
			
			//Eliminar primero los espacios del edificio.
			$resEspacios = $mapEspacio->lanzarquery("
				DELETE FROM espacio
				WHERE id_edificio = {$idEdificio}
			");

			if (!$resEspacios['ok']) {
				$detalle = is_string($resEspacios['resource']) ? $resEspacios['resource'] : 'Error al eliminar los espacios del edificio.';
				throw new Exception($detalle);
			}

			//Eliminar las plantas del edificio.
			$resPlantas = $mapPlanta->lanzarquery("
				DELETE FROM planta
				WHERE id_edificio = {$idEdificio}
			");

			if (!$resPlantas['ok']) {
				$detalle = is_string($resPlantas['resource']) ? $resPlantas['resource'] : 'Error al eliminar las plantas del edificio.';
				throw new Exception($detalle);
			}
			
			//Eliminar finalmente el edificio.
			// Las asignaciones de gestores se eliminan mediante ON DELETE CASCADE.
			$resEdificio = $mapEdificio->lanzarquery("
				DELETE FROM edificio
				WHERE id_edificio = {$idEdificio}
			");

			if (!$resEdificio['ok']) {
				$detalle = is_string($resEdificio['resource']) ? $resEdificio['resource'] : 'No se pudo eliminar el edificio.';
				throw new Exception($detalle);
			}

			// Confirmar todas las eliminaciones.
			$resCommit = $mapEdificio->lanzarquery("COMMIT");
			if (!$resCommit['ok']) {
				throw new Exception('No se pudo confirmar la eliminación.');
			}
			$transaccionActiva = false;

			return array(
				'ok' => true,
				'code' => 'QUERY_OK',
				'message' => 'Edificio eliminado correctamente.'
			);
		} catch (Throwable $e) {

			if ($transaccionActiva) {
				$mapEdificio->lanzarquery("ROLLBACK");
			}

			return array(
				'ok' => false,
				'code' => 'EDIFICIO_DELETE_KO',
				'message' => $e->getMessage()
			);
		}
	}

	function SEARCH() {
		$resultado = $this->modelo->SEARCH();

		if (
			!$resultado['ok'] ||
			empty($resultado['resource']) ||
			!is_array($resultado['resource'])
		) {
			return $resultado;
		}

		$idsEdificios = array();

		foreach ($resultado['resource'] as $edificio) {
			$id = intval($edificio['id_edificio']);

			if ($id > 0) {
				$idsEdificios[] = $id;
			}
		}

		if (empty($idsEdificios)) {
			return $resultado;
		}

		$idsEdificios = array_unique($idsEdificios);
		$idsSQL = implode(',', $idsEdificios);

		$map = new mapping('gestor_edificio');

		$consulta = "
			SELECT
				ge.id_edificio,
				ge.anho_acad_edificio,
				u.id_usuario,
				u.nom_usuario,
				u.apell_usuario
			FROM gestor_edificio ge
			INNER JOIN usuario u
				ON u.id_usuario = ge.id_usuario
			WHERE ge.id_edificio IN ($idsSQL)
			ORDER BY ge.anho_acad_edificio, u.apell_usuario, u.nom_usuario
		";

		$resultadoGestores = $map->lanzarqueryconresults($consulta);

		if (!$resultadoGestores['ok']) {
			return $resultadoGestores;
		}

		$gestoresPorEdificio = array();

		if (is_array($resultadoGestores['resource'])) {
			foreach ($resultadoGestores['resource'] as $gestor) {
				$idEdificio = intval($gestor['id_edificio']);

				if (!isset($gestoresPorEdificio[$idEdificio])) {
					$gestoresPorEdificio[$idEdificio] = array();
				}

				$gestoresPorEdificio[$idEdificio][] = array(
					'id_usuario' => $gestor['id_usuario'],
					'nom_usuario' => $gestor['nom_usuario'],
					'apell_usuario' => $gestor['apell_usuario'],
					'anho_acad_edificio' => $gestor['anho_acad_edificio']
				);
			}
		}

		foreach ($resultado['resource'] as &$edificio) {
			$idEdificio = intval($edificio['id_edificio']);

			$edificio['gestores'] = isset($gestoresPorEdificio[$idEdificio])
				? $gestoresPorEdificio[$idEdificio]
				: array();
		}

		unset($edificio);

		return $resultado;
	}

}