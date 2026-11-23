
<?php

include_once './base/mappingBase.php';
include_once './base/mapping.php';

class busqueda_MODEL extends mappingBase {

    private $limite = 5;

    /**
     * Ejecuta la búsqueda global aplicando los permisos de cada módulo.
     */
    public function buscarGlobal($texto, $idGrupo, $idUsuario) {

        $texto = trim($texto);
        $id = (($idGrupo === 2) ? $idUsuario : null);

        $resultados = array(
            'usuarios' => array(),
            'facultades' => array(),
            'edificios' => array()
        );

        $permisos = array(
            'usuarios' => 'USER',
            'facultades' => 'FACULTAD',
            'edificios' => 'EDIFICIO',
        );

        foreach ($permisos as $clave => $funcionalidad) {

            if (!$this->tienePermisoBusqueda($idGrupo, $funcionalidad)) {
                continue;
            }

            switch ($clave) {

                case 'usuarios':
                    $resultados['usuarios'] = $this->buscarUsuarios($texto);
                    break;

                case 'facultades':
                    $resultados['facultades'] = $this->buscarFacultades($texto);
                    break;

                case 'edificios':
                    $resultados['edificios'] = $this->buscarEdificios($texto,$id);
                    break;
                
            }
        }

        return $resultados;
    }

    /**
     * Comprueba si un grupo tiene permiso SEARCH sobre una funcionalidad.
     */
    public function tienePermisoBusqueda($idGrupo, $funcionalidad) {

        $idGrupo = intval($idGrupo);
        $funcionalidadEscapada = addslashes($funcionalidad);

        $map = new mapping('tiene_permiso');

        $sql = "SELECT 1
                FROM tiene_permiso tp
                INNER JOIN accion a ON a.id_accion = tp.id_accion
                INNER JOIN funcionalidad f ON f.id_func = tp.id_func
                WHERE tp.id_grupo = {$idGrupo}
                  AND a.nom_accion = 'SEARCH'
                  AND f.nom_func = '{$funcionalidadEscapada}'
                LIMIT 1";

        $resultado = $map->lanzarqueryconresults($sql);        
        
        if (!$resultado['ok']) {
            $detalle = is_string($resultado['resource']) ? $resultado['resource'] : '';
            throw new Exception('Error al comprobar los permisos. '.$detalle);
        }

        return is_array($resultado['resource']) && count($resultado['resource']) > 0;
    }

    /**
     * Búsqueda de usuarios.
     * Nunca devuelve la contraseña.
     */
    private function buscarUsuarios($texto) {
        $patron = $this->prepararTexto($texto);
        $limite = intval($this->limite);
        $sql = "SELECT
                    id_usuario,
                    nom_usuario,
                    apell_usuario,
                    email
                FROM usuario
                WHERE nom_usuario LIKE {$patron}
                   OR apell_usuario LIKE {$patron}
                   OR email LIKE {$patron}
                ORDER BY apell_usuario, nom_usuario
                LIMIT {$limite}";

        return $this->consultar('usuario', $sql);
    }

    /**
     * Búsqueda de facultades.
     */
    private function buscarFacultades($texto) {
        $patron = $this->prepararTexto($texto);
        $limite = intval($this->limite);    
        $sql = "SELECT
                    id_facultad,
                    nom_facultad
                FROM facultad
                WHERE nom_facultad LIKE {$patron}
                ORDER BY nom_facultad
                LIMIT {$limite}";

        return $this->consultar('facultad', $sql);
    }

    /**
     * Búsqueda de edificios por nombre o por sus gestores.
     * Los gestores son usuarios con id_grupo = 2.
     */
    private function buscarEdificios($texto, $idUsuario = null) {
        $patron = $this->prepararTexto($texto);
        $limite = intval($this->limite);

        $sql = "SELECT
                    e.id_edificio,
                    e.nom_edificio,
                    e.dir_edificio,
                    (
                        SELECT GROUP_CONCAT(
                            DISTINCT CONCAT_WS(' ', u.nom_usuario, u.apell_usuario)
                            ORDER BY u.apell_usuario, u.nom_usuario
                            SEPARATOR ', '
                        )
                        FROM gestor_edificio ge
                        INNER JOIN usuario u ON u.id_usuario = ge.id_usuario
                        WHERE ge.id_edificio = e.id_edificio
                        AND ge.anho_acad_edificio = e.anho_acad_edificio
                        AND u.id_grupo = 2
                    ) AS gestores
                FROM edificio e
                WHERE (
                    e.nom_edificio LIKE {$patron}
                    OR EXISTS (
                        SELECT 1
                        FROM gestor_edificio ge
                        INNER JOIN usuario u ON u.id_usuario = ge.id_usuario
                        WHERE ge.id_edificio = e.id_edificio
                        AND ge.anho_acad_edificio = e.anho_acad_edificio
                        AND u.id_grupo = 2
                        AND (
                            u.nom_usuario LIKE {$patron}
                            OR u.apell_usuario LIKE {$patron}
                            OR CONCAT_WS(' ', u.nom_usuario, u.apell_usuario) LIKE {$patron}
                            OR CONCAT_WS(' ', u.apell_usuario, u.nom_usuario) LIKE {$patron}
                        )
                    )
        )";

        // Si es gestor, limitar a sus edificios asignados en ese año.
        if ($idUsuario !== null) {
            $idUsuarioInt = intval($idUsuario);
            $sql .= " AND EXISTS (
                SELECT 1
                FROM gestor_edificio ge
                WHERE ge.id_edificio = e.id_edificio
                AND ge.anho_acad_edificio = e.anho_acad_edificio
                AND ge.id_usuario = {$idUsuarioInt}
            )";
        }

        $sql .= " ORDER BY e.nom_edificio LIMIT {$limite}";

        return $this->consultar('edificio', $sql);
    }

    /**
     * Ejecuta una consulta preparada y devuelve sus filas (o array vacío si no hay resultados).
     */
    private function consultar($tabla, $sql) {

        $map = new mapping($tabla);
        $resultado = $map->lanzarqueryconresults($sql);
        if (!$resultado['ok']) {
            $detalle = is_string($resultado['resource']) ? $resultado['resource'] : '';
            throw new Exception('Error al ejecutar una consulta: ' . $detalle);
        }
        if (!is_array($resultado['resource'])) {
            return array();
        }

        return $resultado['resource'];
    }

    /**
     * Prepara el texto para buscarlo literalmente.
     */
    private function prepararTexto($texto) {
        $texto = addcslashes($texto, '\\%_');
        $texto = addslashes($texto);

        return "'%".$texto."%'";
    }

}

?>
