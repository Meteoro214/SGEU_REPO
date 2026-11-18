<?php

//Plantilla para clases Model

include_once './base/modelBase.php';

class facultad_MODEL extends modelBase{

	function __construct(){

		$this->tabla = 'facultad';
		$this->clave = array('id_facultad');
		$this->foraneas = array();
		$this->autoincrement = array('id_facultad');
        $this->unicos = array();

	}

}