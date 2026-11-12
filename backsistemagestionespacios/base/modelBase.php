<?php

include_once './base/mapping.php';

class modelBase {

    public $tabla;
    public $clave       = array();
    public $foraneas    = array();
    public $autoincrement = array();
    public $unicos      = array();
    public $valores     = array();
    public $listaAtributos       = array();
    public $listaAtributosSelect = array();
    public $empieza    = 0;
    public $filaspagina = 25;

    /**
     * Realiza un search CON PAGINACION
     * @return array
     */
    function SEARCH() {
        $map = new mapping($this->tabla);

        $valoresFiltro = array();
        foreach ($this->listaAtributos as $attr) {
            $valoresFiltro[$attr] = isset($this->valores[$attr]) ? $this->valores[$attr] : '';
        }

        $atributos = !empty($this->listaAtributos) ? $this->listaAtributos : null;

        $res = $map->SEARCH($this->tabla, $atributos, $valoresFiltro, $this->empieza, $this->filaspagina, $this->foraneas);

        // Total sin paginación
        $resTotal = $map->SEARCH($this->tabla, $atributos, $valoresFiltro, 'nulo', 'nulo', null);
        $total = is_array($resTotal['resource']) ? count($resTotal['resource']) : 0;

        $res['total']             = $total;
        $res['empieza']           = $this->empieza;
        $res['filas']             = $this->filaspagina;
        $res['criteriosbusqueda'] = $valoresFiltro;

        return $res;
    }

    /**
     * Realiza un search by SIN PAGINACION
     * @return array
     */
    function SEARCH_BY() {
        $map = new mapping($this->tabla);
        return $map->SEARCH_BY($this->tabla, $this->valores, $this->foraneas);
    }

    /**
     * Realiza un add
     * @return array
     */
    function ADD() {
        $map = new mapping($this->tabla);
        return $map->ADD($this->tabla, $this->listaAtributos, $this->valores, $this->autoincrement);
    }

    /**
     * Realiza un edit
     * @return array
     */
    function EDIT() {
        $map = new mapping($this->tabla);
        return $map->EDIT($this->tabla, $this->valores, $this->clave);
    }

    /**
     * Realiza un delete
     * @return array
     */
    function DELETE() {
        $map = new mapping($this->tabla);
        return $map->DELETE($this->tabla, $this->clave, $this->valores);
    }
}

?>
