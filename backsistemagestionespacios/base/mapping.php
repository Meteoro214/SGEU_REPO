<?php

include_once __DIR__.'/mappingBase.php';

class mapping extends mappingBase{

	var $tabla; //nombre de la tabla

	/**
	 * 
	 * @param mixed $tabla El nombre de la tabla
	 */
	function __construct($tabla){
		$this->tabla = $tabla;
	}

	/**
	 * Recibe una query no select, la ejecuta, y devuelve el resultado
	 * @param mixed $query
	 * @return array
	 */
	function lanzarquery($query){

		$this->query = $query;
		$this->execute_single_query();
		return $this->feedback;

	}

	/**
	 * Recibe una query SELECT, la ejecuta y devuelve el resultado
	 * @param mixed $query
	 * @return array
	 */
	function lanzarqueryconresults($query){

		$this->query = $query;
		$this->get_results_from_query();
		return $this->feedback;

	}

	/**
	 * Construye un filtro de LIKE, no pasar campos no filtrados 
	 * @param mixed $valores diccionario 
	 * @return string
	 */
	function construirCondicionesWhereLIKE($valores){

		$cadena = '';
		$primero = true;

		foreach ($valores as $key => $value){

			// los campos sin filtro llegan como cadena vacia; si se incluyen igualmente como
			// "campo LIKE '%%'" y ese campo es NULL en la fila, la condicion evalua a NULL (no a
			// verdadero) y la fila desaparece de los resultados aunque exista, asi que se omiten.
			if (strlen($value) == 0) continue;

			if ($primero){
				$primero = false;
			}
			else{
				$cadena = $cadena.' AND ';
			}

			$cadena = $cadena."(".$key." LIKE "."'%". $value."%')";

		}

		if ($cadena === ''){
			$cadena = '1=1';
		}

		return $cadena;
	}

	/**
	 * Construye un filtro de EQUUALS, no pasar campos no filtrados 
	 * @param mixed $valores diccionario, permite numericos y strings 
	 * @return string
	 */
	function construirCondicionesWhereEQUALS($valores){

		$primero = true;
		$cadena = '';

		$atributosnumericos = $this->formatonumericoatributos($this->tabla);

		foreach ($valores as $key => $value){

			if (strlen($value)!=0){

				if ($primero){
					$primero = false;
					$insertarand = '';
				}
				else{
					$insertarand = ' AND ';
					$cadena = $cadena.$insertarand;
				}

				if (empty($atributosnumericos)){
					$cadena = $cadena."(".$key."="."'". $value."')";
				}
				else{
					if (in_array($key, $atributosnumericos)){
						$cadena = $cadena."(".$key."=".$value.")";
					}
					else{
						$cadena = $cadena."(".$key."="."'". $value."')";
					}
				}
			}
			
		}

		return $cadena;
	}

	/**
	 * Construye un filtro de EQUUALS, no pasar campos no filtrados, solo usa los campos que estan en claves
	 * @param mixed $valores diccionario, permite numericos y strings 
	 * @return string
	 */
	function construirCondicionesWhereEQUALSclaves($clave, $valores){

		$cadena = '';
		$primero = true;

		$atributosnumericos = $this->formatonumericoatributos($this->tabla);

		foreach ($valores as $key => $value){

			if (in_array($key, $clave)){

				if ($primero){
					$primero = false;
				}
				else{
					if (strlen($value)!=0){
						$cadena = $cadena.' AND ';
					}
				}

				if (strlen($value)!=0){
					if (empty($atributosnumericos)){
						$cadena = $cadena."(".$key."="."'". $value."')";
					}
					else{
						if (in_array($key, $atributosnumericos)){
							$cadena = $cadena."(".$key."=".$value.")";
						}
						else{
							$cadena = $cadena."(".$key."="."'". $value."')";
						}
					}
				}
			}

		}

		return $cadena;
	}

	/**
	 * Comprueba que atributos son numericos y los devuelve en un array
	 * @param mixed $tabla
	 */
	function formatonumericoatributos($tabla){


		$mapping1 = new mapping($tabla);

		$mapping1->query = "SHOW COLUMNS FROM ".$tabla;
		$res = $mapping1->get_results_from_query();
		if ($mapping1->feedback['ok']){

			$respuesta = $mapping1->feedback['resource'];

			$atributosnumericos = array();
			foreach ($respuesta as $atributo){
				$tiposnumericos = array('int', 'tinyint','smallint', 'mediumint', 'bigint', 'float', 'double', 'decimal');
				$tipo = strtolower($atributo['Type']);
				$tipobase = preg_split('/[\s(]/', $tipo)[0];
				if (in_array($tipobase, $tiposnumericos)){
					array_push($atributosnumericos, $atributo['Field']); //creo array con los atributos que son numericos
				}
			}
			return $atributosnumericos;
		}
		else{
			return $res;
		}


	}

	// Columnas DATE/DATETIME/TIMESTAMP de $tabla: un valor vacío ('') en una de estas columnas
	// no puede insertarse/actualizarse tal cual -- MySQL en modo estricto lo rechaza con
	// "Incorrect datetime value" en vez de tratarlo como "sin fecha". Se usa en ADD()/EDIT()
	// para mandar NULL (sin comillas) en su lugar cuando el campo es opcional y viene vacío
	// (p.ej. fecha_fin de una convivencia sin fecha de fin todavía).
	
		/**
	 * Comprueba que atributos son fechas y los devuelve en un array
	 * @param mixed $tabla
	 */
	function formatofechaatributos($tabla){

		$mapping1 = new mapping($tabla);

		$mapping1->query = "SHOW COLUMNS FROM ".$tabla;
		$res = $mapping1->get_results_from_query();
		if ($mapping1->feedback['ok']){

			$respuesta = $mapping1->feedback['resource'];

			$atributosfecha = array();
			$tiposfecha = array('date', 'datetime', 'timestamp');
			foreach ($respuesta as $atributo){
				$parentesis = strpos($atributo['Type'], '(');
				$tipobase = $parentesis !== false ? substr($atributo['Type'], 0, $parentesis) : $atributo['Type'];
				if (in_array($tipobase, $tiposfecha)){
					array_push($atributosfecha, $atributo['Field']);
				}
			}
			return $atributosfecha;
		}
		else{
			return $res;
		}

	}


	/**
	 * Hace un search completo sobre una tabla foranea
	 * @param mixed $tabla
	 * @return array[]
	 */
	function buscarforaneas($tabla){

		$mapping1 = new mapping($tabla);
		$respuesta = $mapping1->SEARCH($tabla,'','','nulo','nulo','');
		return $respuesta;

	}

	/**
	 * Recupera los datos de las foraneas. Hace el jpin con la foranea metiendo los datos en el campo de la foranea
	 * @param mixed $principal la consulta sin incluir datos foraneos
	 * @param mixed $tabla la tabla a consultar
	 * @param mixed $clave la FK
	 * @return array
	 */
	function incluirforaneas($principal=null, $tabla, $clave){

		$filasforaneas = $this->buscarforaneas($tabla); //obtener filas de tabla principal de las claves foraneas de esta entidad

		$auxiliar = array();

		if (!(empty($principal) || ($principal === null) || ($principal== ''))){

			foreach ($principal as $fila) { //recorro array recordset fila a fila

				if ($filasforaneas['code'] == 'RECORDSET_VACIO') {} //sino no hay foraneas por fallo en la integridad de los datos
				else{

					foreach ($filasforaneas['resource'] as $filasforanea) { //recorro array foraneas fila a fila

						if ($fila[$clave] == $filasforanea[$clave]){ // si el valor de la clave en la fila del recordset es igual a la clave del array de foraneas

							$fila[$clave] = $filasforanea; // cambio el valor de la clave por el array de atriburos de la fila en la tabla foranea con esa clave

						}

					}

				}

				array_push($auxiliar, $fila); //almaceno la fila en el array de respuesta
			}

		}

		return $auxiliar;
	}


	/**
	 * Hace un search
	 * @param mixed $tabla La tabla a consultar
	 * @param mixed $atributos Si no esta vacio y es distinto de null, añade un where like
	 * @param mixed $valores Valores para el filtro
	 * @param mixed $empieza valor para paginacion, si no se usa escribir "nulo" o usar null en ambos campos
	 * @param mixed $filaspagina valor para paginacion, si no se usa escribir "nulo" o usar null en ambos campos
	 * @param mixed $foraneas diccionario de las claves foraneas, si no es vacio las carga. El dic es FK:Tabla
	 * @return array<array>
	 */
	function SEARCH($tabla, $atributos = null, $valores, $empieza = "nulo", $filaspagina = "nulo", $foraneas=null){

		$query = "SELECT * FROM ".$tabla;

		if (!empty($atributos)){

			$query = $query." WHERE (";

			$condiciones = $this->construirCondicionesWhereLIKE($valores);

			$query = $query.$condiciones;

			$query = $query.')';

		}


		if (!(($empieza == 'nulo' or $empieza == null) and ($filaspagina == 'nulo' or $filaspagina == null))) {

			$query = $query.' LIMIT '.$empieza.','.$filaspagina;

		}

		$this->query = $query;


		$this->get_results_from_query();

		if (!empty($this->feedback['resource']) and !empty($foraneas)){
			foreach ($foraneas as $key => $value) {
				$this->feedback['resource'] = $this->incluirforaneas($this->feedback['resource'], $value, $key);
			}
		}
		return $this->feedback;
	}

	/**
	 * Hace un count y devuelve el feedback de la query
	 */
	function COUNT($tabla){

		$this->query = "SELECT COUNT(*) FROM ". $tabla;

		$this->get_one_result_from_query();

		return $this->feedback;
	}

	/**
	 * Realiza un ADD. Fechas opcionales vacias se cambian a null
	 * @param mixed $tabla tabla a añadir
	 * @param mixed $atributos Atrivutos de la tabla que se añaden
	 * @param mixed $valores diccionario de los valores correspondientes a los atributos
	 * @param mixed $autoincrement Array de autoincrementales
	 * @return array[] retorna el id
	 */
	function ADD($tabla, $atributos, $valores, $autoincrement){

		$query = "INSERT INTO ".$tabla. "(";

		$primero = true;
		foreach ($atributos as $atributo){
			
			if (!(in_array($atributo, $autoincrement))){
				
				if ($primero){
					$primero = false;
				}
				else{
					$query = $query.',';
				}

				$query = $query.$atributo;

			}
		}

		$query = $query.')  VALUES (';

		$atributosnumericos = $this->formatonumericoatributos($tabla); //obtengo atributos de show columns de la $tabla
		$atributosfecha = $this->formatofechaatributos($tabla);

		$primero = true;
		foreach ($atributos as $atributo){

			if (!(in_array($atributo, $autoincrement))){

				if ($primero){
					$primero = false;
				}
				else{
					$query = $query.',';
				}

				if ((in_array($atributo, $atributosnumericos) || in_array($atributo, $atributosfecha)) && $valores[$atributo] === ''){ //opcional sin valor
					$query = $query.'NULL';
				}
				elseif (in_array($atributo, $atributosnumericos)){//numerico
					$query = $query.$valores[$atributo];
				}
				else{
					$query = $query.'\''. $valores[$atributo].'\'';
				}
			}
		}

		$query = $query.')';

		$this->query = $query;

		$this->execute_single_query();

		return $this->feedback;

	}

	/**
	 * Hace un delete con filtrado por claves
	 * @param mixed $tabla La tabla donde borrar
	 * @param mixed $clave array de atributos para filtrar
	 * @param mixed $valor filtros
	 * @return array[]
	 */
	function DELETE($tabla, $clave, $valor){

		$this->query = "DELETE FROM ".$tabla." WHERE (";

		$cadena = $this->construirCondicionesWhereEQUALSclaves($clave,$valor);

		$this->query = $this->query.$cadena.")";

		$this->execute_single_query();

		return $this->feedback;

	}

	/**
	 * Hace un update
	 * @param mixed $tabla tabla sobre la que actua
	 * @param mixed $valores diccionario de los valores a editar
	 * @param mixed $clave valores PK para buscar
	 * @return array[]
	 */
	function EDIT($tabla, $valores, $clave){

		$atributosnumericos = $this->formatonumericoatributos($this->tabla);
		$atributosfecha = $this->formatofechaatributos($this->tabla);

		$this->query = "UPDATE ".$tabla." SET ";

		$cadena = '';

		$primero = true;
		foreach ($valores as $key => $value) {
			if (!(in_array($key, $clave))){
				if ($primero){
					$primero = false;
				}
				else{
					$cadena .= ', ';
				}
				if ((in_array($key, $atributosnumericos) || in_array($key, $atributosfecha)) && $value === ''){ //opcional sin valor
					$cadena .= $key.' = NULL';
				}
				elseif (in_array($key, $atributosnumericos)){
					$cadena .= $key.' = '.$value;
				}
				else{
					$cadena .= $key.' = '.'\''.$value.'\'';
				}
			}
		}

		$this->query .= $cadena;
		$this->query .= ' WHERE (';

		// construir condicion claves

		$cadena = '';
		$primero = true;
		foreach ($valores as $key => $value) {
			if (in_array($key, $clave)){
				if ($primero){
					$primero = false;
				}
				else{
					$cadena .= ' AND ';
				}
				if (in_array($key, $atributosnumericos)){
					$cadena .= $key. ' = '.$value;
				}
				else{
					$cadena .= $key. ' = '.'\''.$value.'\'';
				}
			}
		}

		$this->query .= $cadena;
		$this->query .= ')';

		$this->execute_single_query();

		return $this->feedback;

	}

	//busca sobre los ids de la tabla

	/**
	 * Realiza un search by. A diferencia del search normal, este hace un filtro por equals y no search by
	 * @param mixed $tabla Tabla a consultar
	 * @param mixed $valores Para filtrado
	 * @param mixed $foraneas las foraneas a incluir
	 * @return array[]
	 */
	function SEARCH_BY($tabla, $valores, $foraneas=null){


		$query = "SELECT * FROM ".$tabla;

		if (!empty($valores)){

			$query = $query." WHERE (";

			$condiciones = $this->construirCondicionesWhereEQUALS($valores);

			$query = $query.$condiciones;

			$query = $query.')';

		}

		$this->query = $query;

		$this->get_results_from_query();


		if (!empty($foraneas)){
			foreach ($foraneas as $key => $value) {

				$aux = 	$this->feedback['resource'];
				if (is_array($aux)){
					$this->feedback['resource'] = $this->incluirforaneas($aux, $value, $key);
				}

			}
		}

		return $this->feedback;

	}

}

?>
