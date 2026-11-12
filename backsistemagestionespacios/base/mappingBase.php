<?php

class mappingBase {

    public $query; //la query
    public $feedback = array();
    private static $conn = null;//singleton de la conexion

    protected function getConn() {
        if (self::$conn === null) {
            self::$conn = new mysqli(host, user, pass, BD); //Define la conexion PARA MYSQL OJO
            if (self::$conn->connect_error) {
                self::$conn = null;
                return null;
            }
            self::$conn->set_charset('utf8');
        }
        return self::$conn;
    }

    /**
     * Ejecuta un SELECT de query-
     * ok false, code DB_CONNECTION_ERROR si falla la conexion
     * ok false, code QUERY_ERROR si hay conexion pero la query peta
     * ok true, RECORDSET_VACIO si 0 filas 
     * ok true, RECORDSET_DATOS y datos como array en resorce si todo bien
     * @return void
     */
    function get_results_from_query() { 
        $conn = $this->getConn();
        if (!$conn) {
            $this->feedback = array('ok' => false, 'code' => 'DB_CONNECTION_ERROR', 'resource' => '');
            return;
        }
        $result = $conn->query($this->query);
        if ($result === false) {
            $this->feedback = array('ok' => false, 'code' => 'QUERY_ERROR', 'resource' => $conn->error);
            return;
        }
        if ($result->num_rows == 0) {
            $this->feedback = array('ok' => true, 'code' => 'RECORDSET_VACIO', 'resource' => '');
            return;
        }
        $rows = array();
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }
        $this->feedback = array('ok' => true, 'code' => 'RECORDSET_DATOS', 'resource' => $rows);
    }

        /**
     * Ejecuta un query no SELECT
     * ok false, code DB_CONNECTION_ERROR si falla la conexion
     * ok false, code QUERY_ERROR si hay conexion pero la query peta
     * ok true, QUERY_OK si todo bien y el id si es un insert en resource
     * @return void
     */
    function execute_single_query() {
        $conn = $this->getConn();
        if (!$conn) {
            $this->feedback = array('ok' => false, 'code' => 'DB_CONNECTION_ERROR', 'resource' => '');
            return;
        }
        $result = $conn->query($this->query);
        if ($result === false) {
            $this->feedback = array('ok' => false, 'code' => 'QUERY_ERROR', 'resource' => $conn->error);
        } else {
            $this->feedback = array('ok' => true, 'code' => 'QUERY_OK', 'resource' => '');
            if ($conn->insert_id > 0) {
                $this->feedback['resource'] = $conn->insert_id;
            }
        }
    }

        /**
     * Ejecuta un SELECT de query y devuelve 1 fila-
     * ok false, code DB_CONNECTION_ERROR si falla la conexion
     * ok false, code QUERY_ERROR si hay conexion pero la query peta
     * ok true, RECORDSET_DATOS y en resource la row recuperada o 0 SI VACIO si todo bien
     * @return void
     */
    function get_one_result_from_query() {
        $conn = $this->getConn();
        if (!$conn) {
            $this->feedback = array('ok' => false, 'code' => 'DB_CONNECTION_ERROR', 'resource' => '');
            return;
        }
        $result = $conn->query($this->query);
        if ($result === false) {
            $this->feedback = array('ok' => false, 'code' => 'QUERY_ERROR', 'resource' => '');
            return;
        }
        $row = $result->fetch_row();
        $this->feedback = array('ok' => true, 'code' => 'RECORDSET_DATOS', 'resource' => isset($row[0]) ? $row[0] : 0);
    }
}

?>
