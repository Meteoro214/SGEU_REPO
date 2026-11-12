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
		$this->modificacion_atributos();

		if (method_exists($this, 'inicializarRest')) {
			$this->inicializarRest();
		}
	}

	/**
	 * Ok no se usa
	 * @return void
	 */
	function modificacion_atributos(){}

 	function verificarPermisos() {
		$accion = $_POST['action'] ?? '';
		$controlador = $_POST['controlador'] ?? '';

		$accionesPublicas = ['LOGIN', 'REGISTRAR'];
		if (in_array($accion, $accionesPublicas)) {
			return true;
		}

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
		$datosToken = MiToken::devuelveToken($token); 
		
      $payload = MiToken::devuelveToken($token);
  
        // Extraer el id_grupo almacenado dentro del objeto 'data' del payload
        if (!isset($payload->data->id_grupo)) {
            return array(
                'ok' => false,
                'code' => 'TOKEN_INVALIDO_KO',
                'message' => 'El token no contiene información del grupo de usuario.'
            );
        }

        $idGrupoUsuario = intval($payload->data->id_grupo);
		$idUsuarioToken = isset($payload->data->id_usuario) ? intval($payload->data->id_usuario) : null;
		} catch (Exception $e) {
        // Captura excepciones lanzadas por JWT o MiToken (tokens caducados, firmas rotas, etc.)
        return array(
            'ok' => false,
            'code' => 'TOKEN_INVALIDO_KO',
            'message' => $e->getMessage()
        );
    }

    $nombreFuncionalidad = strtoupper($controlador);
    if ($nombreFuncionalidad === 'USUARIO') { //lo pusimos distinto en la de permisos
        $nombreFuncionalidad = 'USER';
    }
    $accionNombre = strtoupper($accion);
	if ($accionNombre === 'REACTIVAR') { //lo pusimos distinto en la de permisos
        $accionNombre = 'EDIT';
    }

	if ($nombreFuncionalidad === 'USER' && $accionNombre === 'EDIT') {
        $idUsuarioPost = isset($_POST['id_usuario']) ? intval($_POST['id_usuario']) : null;
        
        // Si el usuario edita un ID que coincide exactamente con el suyo propio, se le concede acceso
        if ($idUsuarioPost !== null && $idUsuarioToken !== null && $idUsuarioPost === $idUsuarioToken) {
            return true;
        }
    }
	
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

    // 6. Si la consulta devuelve resultados, el grupo tiene permiso para la acción
    if ($resultadoPermiso['ok'] && !empty($resultadoPermiso['resource'])) {
        return true;
    }

    // Si no existe la relación en la base de datos, se deniega el acceso
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

			$validacionesresultado = $this->incluirValidaciones($this->modelo->tabla);

			if ($validacionesresultado === true) { //no hay errores de validacion

				$accionejecutar = $_POST['action'];

				$res = comprobar_si_existe_metodo(get_class($this), $accionejecutar);

				if (($accionejecutar == 'ADD' || $accionejecutar == 'EDIT')) {
					if (isset($this->files)) {
						if ($this->files == '') {

						} else {
							$procesarfiles = $this->procesarfiles($this->files);
							if ($procesarfiles['ok'] == false) {
								return $procesarfiles;
							}
						}
					}
				}

				//gestion de tokens TODO



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

			} else { //hay errores de validacion
				return $validacionesresultado;
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

		if (($_POST['action'] == 'SEARCH') || ($_POST['action'] == 'SEARCH_BY')) {
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

	/**
	 * Busca archivos de validaciones especiales y los incluye
	 * @param mixed $entidad
	 */
	function incluirValidaciones($entidad){


		$ficherovalidaciones = './app/'.$entidad.'/'.$entidad.'_VALIDACIONESACCIONES.php';
		if (file_exists($ficherovalidaciones)) {
			include_once $ficherovalidaciones;
		}

		$ficherovalidaciones = './app/'.$entidad.'/'.$entidad.'_VALIDACIONESATRIBUTOS.php';
		if (file_exists($ficherovalidaciones)) {
			include_once $ficherovalidaciones;
		}

		$ficherovalidaciones = './app/'.$this->modelo->tabla.'/'.$this->modelo->tabla.'_VALIDACIONESACCIONES.php';

		if (file_exists($ficherovalidaciones)) {
			$metodo = 'VALIDACION_ACCION_'.$_POST['action'].'_'.$this->modelo->tabla;
			if (function_exists($metodo)) {
				//$res = $metodo($this->modelo->valores);
				$res = $metodo($_POST);
				if ($res === true) {
				} else {
					return $res;
				}
			}
		}

		$ficherovalidaciones = './app/'.$this->modelo->tabla.'/'.$this->modelo->tabla.'_VALIDACIONESATRIBUTOS.php';

		if (file_exists($ficherovalidaciones)) {
			$metodo = 'VALIDACION_ATRIBUTOS_'.$_POST['action'].'_'.$this->modelo->tabla;
			if (function_exists($metodo)) {
				//$res = $metodo($this->modelo->valores);
				$res = $metodo($_POST);
				if ($res === true) {
				} else {
					return $res;
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

	function softDelete($campoActivo){
		$tabla = $this->modelo->tabla;
		$condiciones = array();
		foreach ($this->modelo->clave as $pk) {
			$condiciones[] = "`{$pk}` = ".intval($this->modelo->valores[$pk]);
		}
		$where = implode(' AND ', $condiciones);
		$set = "`{$campoActivo}` = 0";
		$map = new mapping($tabla);
		$res = $map->lanzarquery("UPDATE `{$tabla}` SET {$set} WHERE {$where}");
		if ($res['ok']) {
			$res['code'] = 'BAJA_LOGICA_OK';
		}
		return $res;
	}

	/**
	 * Procesa ficheros
	 */
	function procesarfiles($ficheros){

		$errors = array();


		foreach ($ficheros as $files) {

			$nuevofichero = $files[0];
			$fichero = $files[1];
			$ruta = $files[2];
			$extensiones = $files[3];
			$size = $files[4];

			//si trae un string trae el valor anterior y ningun nuevo fichero
			if ($_FILES[$nuevofichero]['name'] == '') {
				$this->modelo->$fichero = $_POST[$fichero];
				$this->modelo->valores[$fichero] = $_POST[$fichero];
			} else {
				$file_name = $_FILES[$nuevofichero]['name'];
				$file_size = $_FILES[$nuevofichero]['size'];
				$file_tmp = $_FILES[$nuevofichero]['tmp_name'];
				$file_type = $_FILES[$nuevofichero]['type'];
				$file_ext = explode('.', $file_name);
				$file_ext = end($file_ext);
				$file_ext = strtolower($file_ext);

				$extensions = $extensiones;

				if (in_array($file_ext, $extensions) === false) {
					$textoextension = '';
					$primero = true;
					foreach ($extensions as $extension) {
						if ($primero) {
							$textoextension .= $extension;
							$primero = false;
						} else {
							$textoextension .= ','.$extension;
						}
					}
					$errors[] = "extension not allowed, please choose a ".$textoextension." file.";
				}

				if ($file_size > $size) {
					$errors[] = 'File size must be exactely '.$size.' bytes';
				}

				if (empty($errors) == true) {
					$this->modelo->$fichero = $file_name;
					$this->modelo->valores[$fichero] = $file_name;

					if (move_uploaded_file($file_tmp, $ruta.$file_name)) {
						$respuesta['ok'] = true;
					} //dar permisos
					else {
						$respuesta['ok'] = false;
						return $respuesta;
					}
				} else {
					$respuesta['ok'] = false;
					$respuesta['code'] = 'ERROR_UPLOAD_'.$fichero.'_KO';
					$respuesta['resource'] = $errors;
					return $respuesta;
				}

			}
		}

		$respuesta['ok'] = true;
		$respuesta['code'] = 'UPLOAD_'.$fichero.'_OK';
		return $respuesta;
	}

}


// solo para validaciones
function devolver($funcionalidad, $valores){

	include_once './app/'.$funcionalidad.'/'.$funcionalidad.'_SERVICE.php';

	$clase = $funcionalidad.'_SERVICE';

	$almacenPOST = $_POST;

	unset($_POST);
	$_POST = $valores;
	$_POST['action'] = 'SEARCH_BY';
	$_POST['controlador'] = $funcionalidad;

	$prueba = new $clase;

	$res = $prueba->ejecutar();

	unset($_POST);
	$_POST = $almacenPOST; //recupero el contenido de POST	

	return $res;


}

// solo para validaciones
function devuelvoFalseSicomprobar($existe, $tabla, $atributo, $valores, $codigo){

	if ($atributo == '') {
		$res = devolver($tabla, $valores);
	} else {
		$res = devolver($tabla, array($atributo => $valores[$atributo]));
	}

	if ($existe == 'existe') {
		if ($res['code'] == 'RECORDSET_DATOS') {
			$respuesta['ok'] = false;
			$respuesta['code'] = $codigo;
		} else {
			$respuesta['ok'] = true;
		}
	} else {
		if ($res['code'] == 'RECORDSET_VACIO') {
			$respuesta['ok'] = false;
			$respuesta['code'] = $codigo;
		} else {
			$respuesta['ok'] = true;
		}
	}
	return $respuesta;

}



?>