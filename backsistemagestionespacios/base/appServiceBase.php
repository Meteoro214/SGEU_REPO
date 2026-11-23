<?php

abstract class appServiceBase{


	public $listaAtributos = array();
	public $listaAtributosSelect = array();
	public $notnull = array();
	public $modelo = '';
	private $default_search_init = 0;
	private $default_page_size = 25;
	public $valores;

	function __construct(){

		if (method_exists($this, 'inicializarRest')) {
			$this->inicializarRest();
		}
	}

	function verificarPermisos(){
		$accion = $_POST['action'] ?? '';
		$controlador = $_POST['controlador'] ?? '';

		$accionesPublicas = ['LOGIN', 'REGISTRAR'];
		if (in_array($accion, $accionesPublicas)) {
			return true;
		}

		$datos = $this->obtenerDatosToken();
		if (!$datos["ok"]) {
			return $datos;
		}

		$idGrupoUsuario = intval($datos["data"]->id_grupo);
		$idUsuarioToken = isset($datos["data"]->id_usuario) ? intval($datos["data"]->id_usuario) : null;

		$nombreFuncionalidad = strtoupper($controlador);
		$accionNombre = strtoupper($accion);

		// Permisos específicos para la busqueda global
		if ($nombreFuncionalidad === 'BUSQUEDA' && $accionNombre === 'GLOBAL_SEARCH') {
			return true;
		}

		// Permisos específicos para la limpieza  de testing
		if ($nombreFuncionalidad === 'QA_CLEANUP' && $accionNombre === 'LIMPIAR') {
			return true;
		}

		// Permisos específicos para la gestión de usuarios
		if ($nombreFuncionalidad === 'USUARIO') {//lo pusimos distinto en la de permisos
			$nombreFuncionalidad = 'USER';

			if ($accionNombre === 'EDIT') {
				$idUsuarioPost = isset($_POST['id_usuario']) ? intval($_POST['id_usuario']) : null;
				// Si el usuario edita un ID que coincide exactamente con el suyo propio, se le concede acceso
				if ($idUsuarioPost !== null && $idUsuarioToken !== null && $idUsuarioPost === $idUsuarioToken) {
					return true;
				}
			} else if ($accionNombre === 'REACTIVAR') { //Cuenta como permiso de edit
				$accionNombre = 'EDIT';
			} else if ($accionNombre === 'GESTORES_DISPONIBLES') { //Cuenta como permiso de showall
				$accionNombre = 'SHOW ALL';
			}
		}

		// Permisos específicos para la gestión de facultades
		if ($nombreFuncionalidad === 'FACULTAD') {
			if ($accionNombre === 'DUPLICAR') { //Cuenta como permiso de ADD
				$accionNombre = "ADD";
			}
		}

		// Permisos específicos para la gestión de edificios.
		if ($nombreFuncionalidad === 'EDIFICIO') {
			if (
				$idGrupoUsuario === 2 &&
				in_array($accionNombre, ['EDIT', 'DELETE'])
			) {

				$idEdificioSolicitado = isset($_POST['id_edificio'])
					? intval($_POST['id_edificio'])
					: 0;

				if ($idEdificioSolicitado <= 0 || $idUsuarioToken === null) {
					return array(
						'ok' => false,
						'code' => 'ACCESO_DENEGADO_KO',
						'message' => 'No tienes permiso para gestionar este edificio.'
					);
				}

				// Comprobar que el gestor está asignado al edificio
				// en el año académico correspondiente.
				include_once './base/mapping.php';

				$mapGestor = new mapping('gestor_edificio');

				$sqlAsignacion = "
				SELECT 1
				FROM edificio e
				INNER JOIN gestor_edificio ge
					ON ge.id_edificio = e.id_edificio
					AND ge.anho_acad_edificio = e.anho_acad_edificio
				WHERE e.id_edificio = $idEdificioSolicitado
					AND ge.id_usuario = $idUsuarioToken
				LIMIT 1
			";

				$resultadoAsignacion = $mapGestor->lanzarqueryconresults(
					$sqlAsignacion
				);

				if (!$resultadoAsignacion['ok']) {
					return array(
						'ok' => false,
						'code' => 'ERROR_VERIFICAR_ASIGNACION_KO',
						'message' => 'No se pudo comprobar la asignación del gestor.'
					);
				}

				if (empty($resultadoAsignacion['resource'])) {
					return array(
						'ok' => false,
						'code' => 'ACCESO_DENEGADO_KO',
						'message' => 'No tienes asignado este edificio.'
					);
				}

				$accionNombre = 'MANAGE';

			} else if ($accionNombre === 'DUPLICAR') {
				// DUPLICAR cuenta como ADD.
				$accionNombre = 'ADD';
			}
		}

		//todo Permisos específicos para la gestión de espacios.


		include_once './base/mapping.php';
		$mapPermiso = new mapping('tiene_permiso');

		$sql = "SELECT 1 
            FROM tiene_permiso tp
            JOIN accion a ON tp.id_accion = a.id_accion
            JOIN funcionalidad f ON tp.id_func = f.id_func
            WHERE tp.id_grupo = {$idGrupoUsuario}
              AND a.nom_accion = '".addslashes($accionNombre)."'
              AND f.nom_func = '".addslashes($nombreFuncionalidad)."'
            LIMIT 1";

		$resultadoPermiso = $mapPermiso->lanzarqueryconresults($sql);

		//Si la consulta devuelve resultados, el grupo tiene permiso para la acción
		if ($resultadoPermiso['ok'] && !empty($resultadoPermiso['resource'])) {
			return true;
		}

		//Si no existe la relación en la base de datos, se deniega el acceso
		return array(
			'ok' => false,
			'code' => 'ACCESO_DENEGADO_KO',
			'message' => 'No tienes permisos suficientes para realizar esta acción.'
		);

	}

	function ejecutar($skip = false){

		$permisoValido = $this->verificarPermisos();
		if ($skip === false and $permisoValido !== true) {
			return $permisoValido;
		}
		$res = $this->comprobarnulos();

		if ($res === true) { // no hay nulos

			$accionejecutar = $_POST['action'];

			$res = comprobar_si_existe_metodo(get_class($this), $accionejecutar);

			if ($res['ok']) {
				$mires = $this->$accionejecutar();
			} else {
				if ($this->modelo !== '') {
					$mires = $this->modelo->$accionejecutar();
				}
			}

			if (isset($mires)) {
				return $mires;
			}

		} else { // hay nulos
			return $res;
		}
	}

	/**
	 * Carga el model y lo rellena
	 * @param mixed $entidad
	 * @return object
	 */
	function crearModelOne($entidad){
		$entidadbase = $entidad;
		include_once './app/'.$entidadbase.'/'.$entidadbase.'_MODEL.php';
		$entidadbase = $entidadbase.'_MODEL';
		$this->entidad = new $entidadbase;
		if (isset($this->listaAtributos)) {
			$this->rellenaModel($this->entidad, $this->listaAtributos, $this->listaAtributosSelect);
		}
		return $this->entidad;
	}

	function rellenaModel(&$obj_entidad, $listaAtributos, $listaAtributosSelect){

		$objeto = $obj_entidad;

		foreach ($listaAtributos as $atributo) {
			if (!isset($_POST[$atributo])) {
				$_POST[$atributo] = '';
			}
			$objeto->$atributo = $_POST[$atributo];
			$objeto->valores[$atributo] = $_POST[$atributo];

		}

		//if (($_POST['action'] == 'SEARCH') || ($_POST['action'] == 'SEARCH_BY')) {
		if (!isset($_POST['empieza'])) {
			$empieza = $this->default_search_init;
		} elseif ($_POST['empieza'] == '') {
			$empieza = $this->default_search_init;
		} else {
			$empieza = $_POST['empieza'];
		} // sino viene empieza defecto 0


		$objeto->empieza = $empieza;

		if (!isset($_POST['filaspagina'])) {
			$filaspagina = $this->default_page_size;
		} elseif ($_POST['filaspagina'] == '' || $_POST['filaspagina'] == 0) {
			$filaspagina = $this->default_page_size;
		} else {
			$filaspagina = $_POST['filaspagina'];
		}// sino viene filaspagina defecto 25

		$objeto->filaspagina = $filaspagina;

		//}


		$objeto->listaAtributos = $listaAtributos;
		$objeto->listaAtributosSelect = $listaAtributosSelect;

	}

	/**
	 * Para ADD EDIT o DELETE, comprueba los valores que no sean nulos
	 */
	function comprobarnulos(){

		if (($_POST['action'] == 'SEARCH') || ($_POST['action'] == 'SEARCH_BY')|| ($_POST['action'] == 'GLOBAL_SEARCH')) {
		} else {
			if (isset($this->notnull)) {
				foreach ($this->notnull[$_POST['action']] as $atributo) {
					if ((!isset($_POST[$atributo])) || (strlen($_POST[$atributo]) == 0)) {
						$respuesta['ok'] = false;
						$respuesta['code'] = $atributo.'_ES_NULO_KO';
						return $respuesta;
					}
				}
			}
		}

		return true;

	}

	function reactivarRegistro($campoActivo){
		$this->modelo->foraneas = [];
		$resultado = $this->modelo->SEARCH_BY();

		if ($resultado['code'] == 'RECORDSET_VACIO') {
			return array('ok' => false, 'code' => 'REGISTRO_NO_ENCONTRADO_KO');
		}

		$registro = $resultado['resource'][0];

		if ($registro[$campoActivo] == 1) {
			return array('ok' => false, 'code' => 'REGISTRO_YA_ACTIVO_KO');
		}

		$tabla = $this->modelo->tabla;
		$condiciones = array();
		foreach ($this->modelo->clave as $pk) {
			$condiciones[] = "`{$pk}` = ".intval($this->modelo->valores[$pk]);
		}
		$where = implode(' AND ', $condiciones);
		$set = "`{$campoActivo}` = 1";
		$map = new mapping($tabla);
		$res = $map->lanzarquery("UPDATE `{$tabla}` SET {$set} WHERE {$where}");
		if ($res['ok']) {
			$res['code'] = 'REACTIVACION_OK';
		}
		return $res;
	}

	function obtenerDatosToken() {
		include_once './base/JWT/token.php';
		$token = isset($_POST['token']) ? $_POST['token'] : '';

        if (empty($token)) {
            return array(
                'ok' => false,
                'code' => 'TOKEN_KO',
                'message' => 'No se ha proporcionado un token de autenticación.'
            );
        }

		try {
			$payload = MiToken::devuelveToken($token);

			if (
				!isset($payload->data->id_grupo) ||
				!isset($payload->data->id_usuario)
			) {
                return array(
                    'ok' => false,
                    'code' => 'TOKEN_INVALIDO_KO',
                    'message' => 'El token no contiene los datos necesarios.'
                );
			}

			return array(
                'ok' => true,
                'data' => $payload->data
            );

		} catch (Throwable $e) {
            return array(
                'ok' => false,
                'code' => 'TOKEN_INVALIDO_KO',
                'message' => 'El token no es válido o ha caducado.'
            );
		}
	}

}

?>