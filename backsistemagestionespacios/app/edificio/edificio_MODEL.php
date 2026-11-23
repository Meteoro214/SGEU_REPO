<?php

//Plantilla para clases Model

include_once './base/modelBase.php';

class edificio_MODEL extends modelBase{

	function __construct(){

		$this->tabla = 'edificio';
		$this->clave = array('id_edificio');
		$this->foraneas = array();
		$this->autoincrement = array('id_edificio');
        $this->unicos = array();

	}

}