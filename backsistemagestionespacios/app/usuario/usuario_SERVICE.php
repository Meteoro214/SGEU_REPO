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

		$this->listaAtributos = array('id_usuario', 'nom_usuario', 'apell_usuario', 'email', 'pass', 'telefono', 'dni', 'fech_nacimiento', 'id_grupo', 'id_edificio', "activo_usuario");

		$this->listaAtributosSelect = array('id_usuario', 'nom_usuario', 'apell_usuario', 'email', 'pass', 'telefono', 'dni', 'fech_nacimiento', 'id_grupo', 'id_edificio', "activo_usuario");

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

		// Gestionar la asignación de edificio cuando cambia el rol.
		if (isset($this->modelo->valores['id_grupo'])) {

			$idUsuario = intval(
				$this->modelo->valores['id_usuario'] ?? $_POST['id_usuario'] ?? 0
			);

			if ($idUsuario > 0) {

				include_once './base/mapping.php';

				$map = new mapping('usuario');

				$resultado = $map->lanzarqueryconresults(
					"SELECT id_grupo FROM usuario WHERE id_usuario = {$idUsuario} LIMIT 1"
				);

				if ($resultado['ok'] && !empty($resultado['resource'])) {

					$grupoAnterior = intval(
						$resultado['resource'][0]['id_grupo']
					);

					$grupoNuevo = intval(
						$this->modelo->valores['id_grupo']
					);

					if ($grupoAnterior !== $grupoNuevo) {

						$consulta = "
							UPDATE usuario
							SET id_edificio = NULL
							WHERE id_usuario = {$idUsuario}
						";

						$resultadoLimpieza = $map->lanzarquery($consulta);

						if (!$resultadoLimpieza['ok']) {
							return $resultadoLimpieza;
						}

						unset($this->modelo->valores['id_edificio']);
					}
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
			'id_grupo' => $fila['id_grupo'],
			'id_edificio' => $fila['id_edificio'],
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
					'id_edificio' => $fila['id_edificio'],
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

	function ejecutar($skip = false) {

		if (
			isset($_POST['action']) &&
			$_POST['action'] === 'GESTORES_DISPONIBLES'
		) {
			return $this->GESTORES_DISPONIBLES();
		}

		return parent::ejecutar($skip);
	}

	function GESTORES_DISPONIBLES() {

		// Comprobar que el usuario autenticado es ADMIN.
		try {
			include_once './base/JWT/token.php';

			$token = isset($_POST['token']) ? $_POST['token'] : '';
			if (empty($token)) {
				return array(
					'ok' => false,
					'code' => 'TOKEN_KO'
				);
			}

			$payload = MiToken::devuelveToken($token);

			if (
				!isset($payload->data->id_grupo) ||
				intval($payload->data->id_grupo) !== 1
			) {
				return array(
					'ok' => false,
					'code' => 'ACCESO_DENEGADO_KO',
					'message' => 'Solo ADMIN puede consultar los gestores disponibles.'
				);
			}

		} catch (Exception $e) {
			return array(
				'ok' => false,
				'code' => 'TOKEN_INVALIDO_KO'
			);
		}

		include_once './base/mapping.php';

		$map = new mapping('usuario');

		$idEdificio = isset($_POST['id_edificio'])
			? intval($_POST['id_edificio'])
			: 0;

		$consulta = "
			SELECT
				id_usuario,
				nom_usuario,
				apell_usuario
			FROM usuario
			WHERE id_grupo = 2
			AND activo_usuario = 1
		";

		if ($idEdificio > 0) {
			$consulta .= "
				AND (
					id_edificio IS NULL
					OR id_edificio = ".$idEdificio."
				)
			";
		} else {
			$consulta .= " AND id_edificio IS NULL ";
		}

		$consulta .= " ORDER BY apell_usuario, nom_usuario";

		return $map->lanzarqueryconresults($consulta);
	}


}