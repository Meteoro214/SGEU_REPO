<?php

//Plantilla para clases Model

include_once './base/modelBase.php';

class xxentidadxx_MODEL extends modelBase{

	function __construct(){

		$this->tabla = 'xxentidadxx';
		$this->clave = array(xxprimariasxx);
		$this->foraneas = array();
		$this->autoincrement = array(xxautoincrementalesxx);
        $this->unicos = array(xxunicosxx);

	}

}