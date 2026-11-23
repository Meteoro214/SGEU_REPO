<?php
//Plantilla para clases Service

include_once './base/appServiceBase.php';

class usuario_SERVICE extends appServiceBase{

	public $modelo;

	//METODOS

	function __construct(){

		parent::__construct();

	}

	function inicializarRest(){

		$this->listaAtributos = array('id_usuario', 'nom_usuario', 'apell_usuario', 'email', 'pass', 'telefono', 'dni', 'fech_nacimiento', 'id_grupo', "activo_usuario");

		$this->listaAtributosSelect = array('id_usuario', 'nom_usuario', 'apell_usuario', 'email', 'pass', 'telefono', 'dni', 'fech_nacimiento', 'id_grupo', "activo_usuario");

		$this->notnull = array(
			'ADD' => array('nom_usuario', 'apell_usuario', 'email', 'pass', 'dni', 'id_grupo', "activo_usuario"),
			'EDIT' => array('id_usuario'),
			'DELETE' => array('id_usuario'),
			'REGISTRAR' => array('nom_usuario', 'apell_usuario', 'email', 'pass', 'dni'),
			'REACTIVAR' => array('id_usuario'),
			'LOGIN' => array('email', 'pass'),
		);

		$this->modelo = $this->crearModelOne('usuario');

	}

	// ADD y EDIT con contraseña cifrada
	function ADD() {
		$this->modelo->valores['pass'] = md5($this->modelo->valores['pass']);
		$this->modelo->valores['activo_usuario'] = 0;
		return $this->modelo->ADD();
	}

	function EDIT(){

		// Comprobar si se ha proporcionado una nueva contraseña.
		if (isset($_POST['pass']) && $_POST['pass'] !== '') {

			$oldPass = $_POST['oldPass'] ?? '';
			$id_usuario = $this->modelo->valores['id_usuario'] ?? $_POST['id_usuario'] ?? null;

			if ($id_usuario) {
				include_once './base/mapping.php';

				$map = new mapping('usuario');
				$id_seguro = intval($id_usuario);

				$resultado = $map->lanzarqueryconresults(
					"SELECT pass FROM usuario WHERE id_usuario = {$id_seguro} LIMIT 1"
				);

				if ($resultado['ok'] && !empty($resultado['resource'])) {

					$passAlmacenada = $resultado['resource'][0]['pass'];

					if ($passAlmacenada !== md5($oldPass)) {
						return array(
							'ok' => false,
							'code' => 'USUARIO_EDIT_PASS_KO'
						);
					}

				} else {
					return array(
						'ok' => false,
						'code' => 'USUARIO_EDIT_PASS_KO'
					);
				}
			}

			$this->modelo->valores['pass'] = md5($_POST['pass']);

		} else {
			unset($this->modelo->valores['pass']);
		}

		// Gestionar las asignaciones cuando cambia el rol.
		if (isset($this->modelo->valores['id_grupo'])) {

			$idUsuario = intval(
				$this->modelo->valores['id_usuario'] ?? $_POST['id_usuario'] ?? 0
			);

			if ($idUsuario > 0) {

				include_once './base/mapping.php';

				$map = new mapping('usuario');

				$resultado = $map->lanzarqueryconresults(
					"SELECT id_grupo
					FROM usuario
					WHERE id_usuario = {$idUsuario}
					LIMIT 1"
				);

				if (!$resultado['ok'] || empty($resultado['resource'])) {
					return array(
						'ok' => false,
						'code' => 'USUARIO_EDIT_KO'
					);
				}

				$grupoAnterior = intval($resultado['resource'][0]['id_grupo']);
				$grupoNuevo = intval($this->modelo->valores['id_grupo']);

				// Si deja de ser gestor, eliminar sus asignaciones.
				if ($grupoAnterior === 2 && $grupoNuevo !== 2) {

					$inicio = $map->lanzarquery("START TRANSACTION");

					if (!$inicio['ok']) {
						return $inicio;
					}

					// Primero quitar el responsable de los espacios.
					$limpieza = $map->lanzarquery(
						"UPDATE espacio
						SET id_gestor = NULL
						WHERE id_gestor = {$idUsuario}"
					);

					if (!$limpieza['ok']) {
						$map->lanzarquery("ROLLBACK");
						return $limpieza;
					}

					// Después eliminar todas sus asignaciones.
					$eliminacion = $map->lanzarquery(
						"DELETE FROM gestor_edificio
						WHERE id_usuario = {$idUsuario}"
					);

					if (!$eliminacion['ok']) {
						$map->lanzarquery("ROLLBACK");
						return $eliminacion;
					}

					// Actualizar los datos del usuario.
					$actualizacion = $this->modelo->EDIT();

					if (
						empty($actualizacion['ok']) ||
						($actualizacion['code'] ?? '') !== 'QUERY_OK'
					) {
						$map->lanzarquery("ROLLBACK");
						return $actualizacion;
					}

					$confirmacion = $map->lanzarquery("COMMIT");

					if (!$confirmacion['ok']) {
						$map->lanzarquery("ROLLBACK");
						return $confirmacion;
					}

					return $actualizacion;
				}
			}
		}

		return $this->modelo->EDIT();
	}

	function REACTIVAR(){
		return $this->reactivarRegistro('activo_usuario');
	}

	function LOGIN(){
		$mail = $_POST['email'];
		$password = $_POST['pass'];
		$postOriginal = $_POST;

		include_once './app/usuario/usuario_SERVICE.php';
		$_POST = array(
			'controlador' => 'usuario',
			'action' => 'SEARCH_BY',
			'email' => $mail
		);

		$usuario = new usuario_SERVICE;
		$respuesta = $usuario->ejecutar(true);
		$_POST = $postOriginal;

		if (empty($respuesta['resource'])) {
			return array(
				'ok' => false,
				'code' => 'USUARIO_LOGIN_KO',
				'resource' => array('email' => $mail)
			);
		}

		$fila = $respuesta['resource'][0];
		
		if ($fila['pass'] != md5($password)) {
			return array(
				'ok' => false,
				'code' => 'USUARIO_LOGIN_KO',
				'resource' => array('email' => $mail)
			);
		}

		if (isset($fila['activo_usuario']) && $fila['activo_usuario'] != 1) {
			return array(
				'ok' => false,
				'code' => 'USUARIO_INACTIVO_KO',
				'resource' => array('email' => $mail)
			);
		}

		// Obtener nombre del grupo
		$nombreRol = '';
		include_once './base/mapping.php';
		$mapRol = new mapping('grupo_usuarios');
		$resRol = $mapRol->lanzarqueryconresults(
			"SELECT nom_grupo FROM grupo_usuarios WHERE id_grupo = ".intval($fila['id_grupo'])." LIMIT 1"
		);
		if ($resRol['ok'] && !empty($resRol['resource'])) {
			$nombreRol = $resRol['resource'][0]['nom_grupo'];
		}
		if (empty($nombreRol)) {
			if (intval($fila['id_grupo']) === 1) {
				$nombreRol = 'ADMIN';
			} elseif (intval($fila['id_grupo']) === 2) {
				$nombreRol = 'GESTOR';
			} elseif (intval($fila['id_grupo']) === 3) {
				$nombreRol = 'LECTOR';
			}
		}

		include_once './base/JWT/token.php';
		$datosUsuario = array(
			'id_usuario' => $fila['id_usuario'],
			'email' => $fila['email'],
			'nom_usuario' => $fila['nom_usuario'],
			'apell_usuario' => $fila['apell_usuario'],
			'id_grupo' => $fila['id_grupo']
		);
		$token = MiToken::creaToken($fila['email'], '', $datosUsuario);


		return array(
			'ok' => true,
			'code' => 'LOGIN_OK',
			'resource' => array(
				'token' => $token,
				'usuario' => array(
					'id_usuario' => $fila['id_usuario'],
					'dni' => $fila['dni'],
					'email' => $fila['email'],
					'nom_usuario' => $fila['nom_usuario'],
					'apell_usuario' => $fila['apell_usuario'],
					'telefono' => $fila['telefono'],
					'fech_nacimiento' => $fila['fech_nacimiento'],
					'id_grupo' => $fila['id_grupo'],
					'nom_grupo' => $nombreRol
				)
			)
		);
	}

	function REGISTRAR(){

		if (!isset($_POST['id_grupo']) || $_POST['id_grupo'] == '') {
			$_POST['id_grupo'] = 3; // lector por defecto
		}

		if (!isset($_POST['activo_usuario']) || $_POST['activo_usuario'] == '') {
			$_POST['activo_usuario'] = 0; // desactivado
		}
		include_once './base/mapping.php';
		$map = new mapping('usuario');
		$mail = addslashes($_POST['email']);
		$dni = addslashes($_POST['dni']);
		$existente = $map->lanzarqueryconresults(
			"SELECT id_usuario FROM usuario WHERE email = '{$mail}' OR dni = '{$dni}' LIMIT 1"
		);
		if ($existente['ok'] && !empty($existente['resource'])) {
			return array('ok' => false, 'code' => 'USUARIO_YA_EXISTE_KO');
		}

		$postOriginal = $_POST;

		include_once './app/usuario/usuario_SERVICE.php';
		$_POST['controlador'] = 'usuario';
		$_POST['action'] = 'ADD';

		$usuario = new usuario_SERVICE;
		$res = $usuario->ejecutar(true);
		$_POST = $postOriginal;

		if ($res['ok'] === true) {
			$res['code'] = 'REGISTRAR_OK';
		}

		return $res;
	}
	
	// Recupera gestores activos disponibles para el año académico del edificio.
	// Al editar, incluye también los gestores ya asignados a ese edificio.
	function GESTORES_DISPONIBLES() {

		include_once './base/mapping.php';

		$map = new mapping('usuario');

		$idEdificio = isset($_POST['id_edificio'])
			? intval($_POST['id_edificio'])
			: 0;

		if ($idEdificio > 0) {

			$consulta = "
				SELECT
					u.id_usuario,
					u.nom_usuario,
					u.apell_usuario
				FROM usuario u
				WHERE u.id_grupo = 2
				AND u.activo_usuario = 1
				AND (
					NOT EXISTS (
						SELECT 1
						FROM gestor_edificio ge
						INNER JOIN edificio e
							ON e.id_edificio = ge.id_edificio
							AND e.anho_acad_edificio = ge.anho_acad_edificio
						WHERE ge.id_usuario = u.id_usuario
						AND ge.anho_acad_edificio = (
							SELECT anho_acad_edificio
							FROM edificio
							WHERE id_edificio = {$idEdificio}
							LIMIT 1
						)
					)
					OR EXISTS (
						SELECT 1
						FROM gestor_edificio ge
						WHERE ge.id_usuario = u.id_usuario
						AND ge.id_edificio = {$idEdificio}
					)
				)
				ORDER BY u.apell_usuario, u.nom_usuario
			";

		} else {

			// Sin edificio concreto no se puede determinar
			// la disponibilidad de un gestor para un año.
			// Se devuelven los gestores activos.
			$consulta = "
				SELECT
					id_usuario,
					nom_usuario,
					apell_usuario
				FROM usuario
				WHERE id_grupo = 2
				AND activo_usuario = 1
				ORDER BY apell_usuario, nom_usuario
			";
		}

		return $map->lanzarqueryconresults($consulta);
	}


	function SEARCH() {

		// Ejecutar la búsqueda original, conservando filtros y paginación.
		$resultado = $this->modelo->SEARCH();

		if (
			!$resultado['ok'] ||
			empty($resultado['resource']) ||
			!is_array($resultado['resource'])
		) {
			return $resultado;
		}

		// Recoger los IDs de los usuarios que son gestores.
		$idsGestores = array();

		foreach ($resultado['resource'] as $usuario) {
			if (
				isset($usuario['id_grupo']) &&
				intval($usuario['id_grupo']) === 2
			) {
				$idsGestores[] = intval($usuario['id_usuario']);
			}
		}

		// Si no hay gestores en esta página, no necesitamos otra consulta.
		if (empty($idsGestores)) {
			return $resultado;
		}

		$idsSQL = implode(',', $idsGestores);

		include_once './base/mapping.php';
		$map = new mapping('gestor_edificio');

		$sql = "
			SELECT
				ge.id_usuario,
				e.id_edificio,
				e.nom_edificio,
				ge.anho_acad_edificio
			FROM gestor_edificio ge
			INNER JOIN edificio e
				ON e.id_edificio = ge.id_edificio
				AND e.anho_acad_edificio = ge.anho_acad_edificio
			WHERE ge.id_usuario IN ($idsSQL)
			ORDER BY e.nom_edificio ASC, ge.anho_acad_edificio DESC
		";

		$resultadoEdificios = $map->lanzarqueryconresults($sql);

		if (!$resultadoEdificios['ok']) {
			return array(
				'ok' => false,
				'code' => 'ERROR_EDIFICIOS_ASIGNADOS_KO',
				'message' => 'No se pudieron consultar los edificios asignados a los gestores.'
			);
		}

		// Agrupar edificios por usuario.
		$edificiosPorUsuario = array();

		foreach ($idsGestores as $idUsuario) {
			$edificiosPorUsuario[$idUsuario] = array();
		}

		if (!empty($resultadoEdificios['resource'])) {
			foreach ($resultadoEdificios['resource'] as $edificio) {

				$idUsuario = intval($edificio['id_usuario']);

				$edificiosPorUsuario[$idUsuario][] = array(
					'id_edificio' => intval($edificio['id_edificio']),
					'nom_edificio' => $edificio['nom_edificio'],
					'anho_acad_edificio' => $edificio['anho_acad_edificio']
				);
			}
		}

		// Añadir edificios_asignados a cada gestor.
		foreach ($resultado['resource'] as &$usuario) {

			if (
				isset($usuario['id_grupo']) &&
				intval($usuario['id_grupo']) === 2
			) {
				$idUsuario = intval($usuario['id_usuario']);

				$usuario['edificios_asignados'] =
					$edificiosPorUsuario[$idUsuario] ?? array();
			}
		}

		unset($usuario);

		return $resultado;
	}




}