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

// TODO revisar si se usan

function guardar_test(&$resultadosTESTS, $rest){
	foreach ($rest as $item){
		array_push($resultadosTESTS, $item);
	}
}

function presentarResultadosPruebas($resultadoTest){

?>
		<h1>Test de unidad</h1>

		<div id = 'menu'>

		</div>

		<table border='1' style="width: 100%; font-size: 10;">
			<tr style = "position: sticky;">
				<th>
					Entidad
				</th>
				<th>
					Acción
				</th>
				<th>
					Tipo
				</th>
				<th>
					Prueba
				</th>
				<th>
					Datos
				</th>
				<th>
					Valor Esperado
				</th>
				<th>
					Valor Obtenido
				</th>
				<th>
					Exito
				</th>
			</tr>

<?php

		$entidadactual = '';
		$accionactual = '';
		$tipoactual = '';
		foreach ($resultadoTest as $test)
		{
			if ($test['RespEsperada'] == $test['RespObtenida']){
				$exito = true;
			}
			else{
				$exito = false;
			}

			// cambiamos de entidad
			if (!($entidadactual === $test['entidad'])){
				$entidadactual = $test['entidad'];
				$accionactual = '';
?>
				<tr><td colspan="8" bgcolor='#008f39'><center><?php echo $entidadactual; ?></center></td></tr>
<?php
					
			}

			// cambiamos de accion en la misma entidad
			if (!($accionactual === $test['accion'])){
					$accionactual = $test['accion'];
					$validacionactual = '';
?>
					<tr><td colspan="8"><center><?php echo $entidadactual.'--'.$accionactual; ?></center></td></tr>
<?php
				
			}

			// cambiamos de validación en la misma entidad
			if (!($validacionactual === $test['tipo'])){
					$validacionactual = $test['tipo'];
?>
					<tr><td colspan="8"><center><?php echo $entidadactual.'--'.$accionactual.'--'.$validacionactual; ?></center></td></tr>
<?php
			}
?>
			<tr <?php if (!$exito) { echo "bgcolor='#FADBD8'"; } else { echo "bgcolor='#D4EFDF'"; }?>>
				<td>
					<?php echo $test['entidad'];?>
				</td>
				<td>
					<?php echo $test['accion'];?>
				</td>
				<td>
					<?php echo $test['tipo'];?>
				</td>
				<td>
					<?php echo $test['prueba']; ?>
					
				</td>
				<td>
					<?php 
					
					if (is_array($test['datos'])){
						foreach ($test['datos'] as $key => $value) {
							echo $key.'='.$value.'<br>';
						}
					}
					else{
						echo $test['datos']; 
					}
					?>
				</td>
				<td>
					<?php echo $test['RespEsperada'];?>
					<br>

					<p class='<?php echo $test['RespEsperada']; ?>'></p>
				</td>
				<td>
					<?php echo $test['RespObtenida'];?>
					<br>

					<p class='<?php echo $test['RespObtenida']; ?>'></p>
				</td>
				<td>
					<?php if ($exito == true) { echo 'TRUE'; } else { echo 'FALSE'; } ?>
				</td>
				
			</tr>
<?php
		}
?>
		</table>

<?php
	
}

?>
