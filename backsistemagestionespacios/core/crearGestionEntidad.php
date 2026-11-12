<?php

//Clase para la creacion automatizada a partir de scaffolding
class managementCore{

    private $estructura=array(); //info de las columnas
    private $listaatributos=array(); //lista de los nombres de atributos
    private $autoincrementales=array(); //lista de los atributos autoincrementales
    private $nonulos=array(); //lista de atributos no nullables no autoincrementales
    private $primarias=array(); //lista de PK
    private $unicos=array(); //Lista de uniques
    private $tabla; //nombre de la tabla
    //Serie arrays pasados a string para inyectar
    private $stringarrayatributos;
    private $stringarraynonulos;
    private $stringarraynonulosservice;
    private $stringarrayprimarias;
    private $stringarrayautoincrementales;
    private $stringarrayunicos;
    private $directorioparaficheros; //directorio creado para la entidad

	function __construct(){
	}

    function ejecutarmanagementCore(){
        
        $this->tabla = $_POST['entidad'];
        
        include_once './base/mapping.php';
        $query = "show columns from ".$this->tabla;
        $mapping = new mapping('');
        $res = $mapping->lanzarqueryconresults($query);
        
        if (($res['ok'] == false)){
            $mensaje = $this->tabla;
            $respuesta = array('ok' => false, 'code' => 'TABLA_NOT_EXISTS_KO', 'resource' => $mensaje);
            return $respuesta;
        }
        else{

            $this->estructura = $res['resource'];

            foreach($this->estructura as $atributo){

                array_push($this->listaatributos, $atributo['Field']);
                
                if ($atributo['Extra'] == 'auto_increment'){
                    array_push($this->autoincrementales, $atributo['Field']);
                }
                
                if ($atributo['Null'] == 'NO' and $atributo['Extra'] != 'auto_increment'){
                    array_push($this->nonulos, $atributo['Field']);
                }
    
                if ($atributo['Key'] == 'PRI'){
                    array_push($this->primarias, $atributo['Field']);
                }

                if ($atributo['Key'] == 'UNI'){
                    array_push($this->unicos, $atributo['Field']);
                }
    
            }

            $this->crearDirectorio(); //crea el directorio de app para la entidad
            $this->crearControlador(); // crea el controlador de la entidad
            $this->creararraylistaatributos(); // crea la lista de atributos segun la bd para incluir en service y model
            $this->crearService(); // crea el service de la entidad
            $this->crearModel(); // crea el model de la entidad

            
            $mensaje = $estructura;
            $respuesta = array('ok' => true, 'code' => 'TABLA_EXISTS_OK', 'resource' => $mensaje);
            return $respuesta;

        }
    
    }

    /**
     * Crea el directorio para la entida
     */
    function crearDirectorio(){

        $directorio = dirname(__FILE__);
        $creardirectorio = 'mkdir -p '.$directorio.'/../app/'.$this->tabla;
        $this->directorioparaficheros = $directorio.'/../app/'.$this->tabla;
        $res = shell_exec($creardirectorio);
        if (stripos($res , 'Permiso denegado')){
            $mensaje = 'no se puede crear el directorio';
            $respuesta = array('ok' => false, 'code' => 'DIR_PERMISSIONS_KO', 'resource' => $mensaje);
            return $respuesta;
        }
        else{
            $mensaje = 'creado';
            $respuesta = array('ok' => true, 'code' => 'DIR_PERMISSIONS_OK', 'resource' => $mensaje);
            return $respuesta;
            
        }

    }

    /**
     * Crea el archivo del controller remplazando los placeholders
     * @return void
     */
    function crearControlador(){
        $oldFile="./core/baseFiles/baseController.php"; 
        $newFile= $this->directorioparaficheros.'/'.$this->tabla."_CONTROLLER.php"; 
        file_put_contents($newFile,str_replace('xxentidadxx',$this->tabla,file_get_contents($oldFile)));
    }

    /**
     * Prepara strings para reemplazar placeholders
     * @return void
     */
    function creararraylistaatributos(){
        
        $this->stringarrayatributos = '';

        $primero = true;
        foreach($this->listaatributos as $atributo){ //recorrer array de listaatributos para construtir string con el array a sustituir en fichero service
            if ($primero){
                $this->stringarrayatributos .= "'".$atributo."'"; 
                $primero = false;  
            }
            else{
                $this->stringarrayatributos .= ",'".$atributo."'";
            }
        }

        $this->stringarrayprimarias = '';

        $primero = true;
        foreach($this->primarias as $atributo){ //recorrer array de primarias para construtir string con el array a sustituir en fichero service
            if ($primero){
                $this->stringarrayprimarias .= "'".$atributo."'"; 
                $primero = false;  
            }
            else{
                $this->stringarrayprimarias .= ",'".$atributo."'";
            }
        }

        $this->stringarraynonulos = '';

        $primero = true;
        foreach($this->nonulos as $atributo){ //recorrer array de nonulos para construtir string con el array a sustituir en fichero service para cada accion
            if ($primero){
                $this->stringarraynonulos .= "'".$atributo."'"; 
                $primero = false;  
            }
            else{
                $this->stringarraynonulos .= ",'".$atributo."'";
            }
        }

        //crear el string de no nulos para el service compuesto de las acciones de ADD, EDIT y DELETE

        $this->stringarraynonulosservice = "'ADD' => array(".$this->stringarraynonulos."),\n\t\t\t\t\t\t";
        $this->stringarraynonulosservice .= "'EDIT' => array(".$this->stringarraynonulos."),\n\t\t\t\t\t\t";
        $this->stringarraynonulosservice .= "'DELETE' => array(".$this->stringarrayprimarias.")";

        //crear el string de autoincrementales para el model
        
        $this->stringarrayautoincrementales = '';

        $primero = true;
        foreach($this->autoincrementales as $atributo){ //recorrer array de nonulos para construtir string con el array a sustituir en fichero service para cada accion
            if ($primero){
                $this->stringarrayautoincrementales .= "'".$atributo."'"; 
                $primero = false;  
            }
            else{
                $this->stringarrayautoincrementales .= ",'".$atributo."'";
            }
        }

        // crear el string de unicos para el model

        $this->stringarrayunicos = '';

        $primero = true;
        foreach($this->unicos as $atributo){ //recorrer array de nonulos para construtir string con el array a sustituir en fichero service para cada accion
            if ($primero){
                $this->stringarrayunicos .= "'".$atributo."'"; 
                $primero = false;  
            }
            else{
                $this->stringarrayunicos .= ",'".$atributo."'";
            }
        }       
        
        
    }

    /**
     * Crea el archivo del Service reemplazando los placeholders
     * @return void
     */
    function crearService(){
        
        //crear fichero service y colocar la entidad
        $oldFile="./core/baseFiles/baseService.php"; 
        $newFile= $this->directorioparaficheros.'/'.$this->tabla."_SERVICE.php"; 
        file_put_contents($newFile,str_replace('xxentidadxx',$this->tabla,file_get_contents($oldFile)));

        //con el fichero ya creado modificar los atributos
        $this->reemplazarenArchivo($newFile, 'xxatributosxx', $this->stringarrayatributos);

        //con el fichero ya creado modificar los nulos
        $this->reemplazarenArchivo($newFile, 'xxnonulosxx', $this->stringarraynonulosservice);

    }

     /**
     * Crea el archivo del Model reemplazando los placeholders
     * @return void
     */
    function crearModel(){
        
        //crear fichero model y colocar la entidad
        $oldFile="./core/baseFiles/baseModel.php"; 
        $newFile= $this->directorioparaficheros.'/'.$this->tabla."_MODEL.php"; 
        file_put_contents($newFile,str_replace('xxentidadxx',$this->tabla,file_get_contents($oldFile)));

        //con el fichero ya creado modificar las primarias
        $this->reemplazarenArchivo($newFile, 'xxprimariasxx', $this->stringarrayprimarias);

        //con el fichero ya creado modificar los autoincrementales
        $this->reemplazarenArchivo($newFile, 'xxautoincrementalesxx', $this->stringarrayautoincrementales);

        //con el fichero ya creado modificar los unicos
        $this->reemplazarenArchivo($newFile, 'xxunicosxx', $this->stringarrayunicos);

    }

    /**
     * Reemplaza placeholders
     * @param mixed $archivo
     * @param mixed $referencia
     * @param mixed $textonuevo
     * @return void
     */
    function reemplazarenArchivo($archivo, $referencia, $textonuevo){

        $oldFile= $archivo; 
        file_put_contents($oldFile,str_replace($referencia,$textonuevo,file_get_contents($oldFile)));

    }

} //FIN DE CLASS
?>
