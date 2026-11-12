<?php

include_once './base/appServiceBase.php';

class qa_cleanup_SERVICE extends appServiceBase {

    // tabla => columna que debe empezar por 'QA', o null si hay que mirar las tablas padre
    private $tablasPermitidas = array(
        'edificio'       => 'nom_edificio',
        'planta'         => 'nom_planta',
        'facultad'       => 'nom_facultad',
        'grupo_usuarios' => 'nom_grupo',
        'usuario'        => 'nom_usuario',
        'accion'         => 'nom_accion',
        'funcionalidad'  => 'nom_func',
        'espacio'        => 'nom_espacio',
        'ocupante'       => 'tipo_ocupante',
        'tiene_permiso'  => null,
        'ocupa'          => null
    );

    // tabla de relacion => tablas padre que deben estar marcadas como QA
    private $padresRelacion = array(
        'tiene_permiso' => array(
            array('camposFk' => array('id_grupo'), 'clavesP' => array('id_grupo'), 'tablaPadre' => 'grupo_usuarios', 'columnaP' => 'nom_grupo'),
            array('camposFk' => array('id_accion'), 'clavesP' => array('id_accion'), 'tablaPadre' => 'accion', 'columnaP' => 'nom_accion'),
            array('camposFk' => array('id_func'), 'clavesP' => array('id_func'), 'tablaPadre' => 'funcionalidad', 'columnaP' => 'nom_func')
        ),
        'ocupa' => array(
            array('camposFk' => array('tipo_ocupante'), 'clavesP' => array('tipo_ocupante'), 'tablaPadre' => 'ocupante', 'columnaP' => 'tipo_ocupante'),
            array('camposFk' => array('id_espacio'), 'clavesP' => array('id_espacio'), 'tablaPadre' => 'espacio', 'columnaP' => 'nom_espacio')
        )
    );

    /**
     * Inicializa el servicio de limpieza QA y declara el parámetro obligatorio.
     *
     * @return void
     */
    function inicializarRest() {
        $this->notnull = array('LIMPIAR' => array('filas'));
        $this->modelo = new stdClass();
        $this->modelo->tabla = 'qa_cleanup';
    }

    /**
     * Elimina filas de prueba de las tablas permitidas.
     *
     * Cada fila solo se borra si sus datos identificativos son válidos y el
     * registro, o todos sus registros padre, está marcado con el prefijo QA.
     * Las filas no autorizadas se devuelven en la lista de omitidas.
     *
     * @return array Resultado de la limpieza con las filas borradas y omitidas.
     */
    function LIMPIAR() {
        $filas = json_decode($_POST['filas'], true);
        if (!is_array($filas)) {
            return array('ok' => false, 'code' => 'FILAS_INVALIDAS_KO');
        }

        include_once './base/mapping.php';
        $map = new mapping('');

        $borradas = array();
        $omitidas = array();

        foreach ($filas as $fila) {
            $tabla   = isset($fila['tabla']) ? $fila['tabla'] : '';
            $valores = (isset($fila['valores']) && is_array($fila['valores'])) ? $fila['valores'] : array();

            if (!array_key_exists($tabla, $this->tablasPermitidas)) {
                $omitidas[] = "{$tabla}: tabla no permitida";
                continue;
            }

            $where = $this->construirWhere($valores);
            if ($where === null) {
                $omitidas[] = "{$tabla}: sin condiciones validas";
                continue;
            }

            if (!$this->esFilaQA($map, $tabla, $valores)) {
                $omitidas[] = "{$tabla} ({$where}): no parece una fila QA, se omite por seguridad";
                continue;
            }

            $res = $map->lanzarquery("DELETE FROM `{$tabla}` WHERE {$where}");
            if ($res['ok']) {
                $borradas[] = "{$tabla} ({$where})";
            } else {
                $omitidas[] = "{$tabla} ({$where}): " . (isset($res['code']) ? $res['code'] : 'error');
            }
        }

        return array('ok' => true, 'code' => 'LIMPIEZA_QA_OK', 'resource' => array(
            'borradas' => $borradas,
            'omitidas' => $omitidas
        ));
    }

    /**
     * Construye condiciones SQL seguras a partir de los identificadores recibidos.
     *
     * Solo acepta nombres de campo con el formato permitido y valores numéricos
     * o cadenas simples; devuelve null si no queda ninguna condición válida.
     *
     * @param array $valores Valores que formarán las condiciones WHERE.
     * @return string|null Condiciones SQL sin la palabra WHERE, o null si son inválidas.
     */
    private function construirWhere($valores) {
        $condiciones = array();
        foreach ($valores as $campo => $valor) {
            if (!preg_match('/^[a-z_]+$/', $campo)) continue;
            if (is_int($valor) || ctype_digit((string) $valor)) {
                $condiciones[] = "`{$campo}` = " . intval($valor);
            } elseif (is_string($valor) && preg_match('/^[a-zA-Z0-9 _-]+$/', $valor)) {
                $condiciones[] = "`{$campo}` = '" . addslashes($valor) . "'";
            }
        }
        if (empty($condiciones)) return null;
        return implode(' AND ', $condiciones);
    }

    /**
     * Comprueba que una fila pertenece a los datos QA antes de eliminarla.
     *
     * Para tablas directas comprueba su columna identificativa. Para tablas de
     * relación exige que todos los registros padre asociados estén marcados como QA.
     *
     * @param mapping $map Instancia usada para consultar la base de datos.
     * @param string $tabla Tabla que contiene la fila.
     * @param array $valores Claves de la fila que se quiere comprobar.
     * @return bool True si la fila puede considerarse una fila QA.
     */
    private function esFilaQA($map, $tabla, $valores) {
        $columna = $this->tablasPermitidas[$tabla];

        if ($columna !== null) {
            return $this->campoEmpiezaPorQA($map, $tabla, $columna, $valores);
        }

        if (!isset($this->padresRelacion[$tabla])) return false;
        foreach ($this->padresRelacion[$tabla] as $cfg) {
            $valoresPadre = array();
            foreach ($cfg['camposFk'] as $indice => $campoFk) {
                $clavePadre = $cfg['clavesP'][$indice];
                if (!isset($valores[$campoFk])) return false;
                $valoresPadre[$clavePadre] = $valores[$campoFk];
            }
            if (!$this->campoEmpiezaPorQA(
                $map,
                $cfg['tablaPadre'],
                $cfg['columnaP'],
                $valoresPadre
            )) {
                return false;
            }
        }
        return true;
    }

    /**
     * Comprueba si una columna de una fila comienza por el prefijo QA.
     *
     * @param mapping $map Instancia usada para consultar la base de datos.
     * @param string $tabla Tabla que se consulta.
     * @param string $columna Columna cuyo valor se valida.
     * @param array $valores Condiciones que identifican la fila.
     * @return bool True si existe la fila y el valor comienza por QA.
     */
    private function campoEmpiezaPorQA($map, $tabla, $columna, $valores) {
        $where = $this->construirWhere($valores);
        if ($where === null) return false;

        $res = $map->lanzarqueryconresults(
            "SELECT `{$columna}` FROM `{$tabla}` WHERE {$where} LIMIT 1"
        );
        if (!$res['ok'] || empty($res['resource'])) return false;

        return isset($res['resource'][0][$columna])
            && strpos($res['resource'][0][$columna], 'QA') === 0;
    }
}
?>
