<?php

//Archivo de funciones auxiliares


function comprobar_si_existe_fichero($fichero){
	if ($fichero != ''){
		if (file_exists($fichero)){
			include_once $fichero;
			return array('ok' => true, 'code' => '', 'resource' => '');
		}
		else{
			$fecha = date('d/m/Y(H:i:s)', time());
			$entradalog = $fecha.';El fichero no existe;'.$fichero;
			return array('ok' => false, 'code' => 'FILE_NOT_EXISTS_KO', 'resource' => $entradalog);
		}
	}
}

function comprobar_si_existe_clase($clase){
	if ($clase != ''){
		if (class_exists($clase)){
			return array('ok' => true, 'code' => '', 'resource' => '');
		}
		else{
			$fecha = date('d/m/Y(H:i:s)', time());
			$entradalog = $fecha.';La clase no existe;'.$clase;
			return array('ok' => false, 'code' => 'CLASS_NOT_EXISTS_KO', 'resource' => $entradalog);
		}
	}
}

// usada por Base/JWT/JWT.php para señalar fallos de validacion
function fillExceptionAction($mensaje){
	throw new Exception($mensaje);
}


function comprobar_si_existe_metodo($clase, $metodo){

	if ($metodo == ''){
	}
	else{
		if (method_exists($clase, $metodo)){
			return array('ok' => true, 'code' => '', 'resource' => '');
		}
		else{
			$fecha = date('d/m/Y(H:i:s)', time());
			$entradalog = $fecha.';'.$clase.';El metodo no existe;'.$metodo;
			return array('ok' => false, 'code' => 'METHOD_NOT_EXISTS_KO', 'resource' => $entradalog);
		}
	}
	
}

?>
