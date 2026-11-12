<?php

//Plantilla para clases Model

include_once './base/modelBase.php';

class usuario_MODEL extends modelBase{

	function __construct(){

		$this->tabla = 'usuario';
		$this->clave = array('id_usuario');
		$this->foraneas = array();
		$this->autoincrement = array('id_usuario');
        $this->unicos = array('email','dni');

	}

}