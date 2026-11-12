<?php

//Archivo para implementar tokens JWT

define('SERVER', "http://localhost");
define('SECRET_KEY', '71YMT');  /// secret key can be a random string and keep in secret from anyone
define('ALGORITHM', 'HS256');

require_once "./base/JWT/JWT.php";

class MiToken {

    public static function devuelveToken($tokenFront) {
                $secretKey = base64_decode(SECRET_KEY);
                $DecodedDataArray = JWT::decode($tokenFront, $secretKey);
                $payload = $DecodedDataArray;
            return $payload;
    }

        /*Las bibliotecas de las que depende el soporte de MCrypt no se han actualizado
        en años y MCrypt ya no debería considerarse un método viable o seguro para cifrar
        datos. Además, MCrypt ha quedado obsoleto en PHP 5 y se eliminó por completo en
        PHP 7. Si tiene algún código que ejecute MCrypt, debe refactorizarlo para usar 
        una biblioteca de cifrado más moderna.
        
        Según lo sugerido por @rqLizard , puede usar openssl_encrypt / openssl_decrypt _ ​​PHP 
        en lugar de eso, que proporciona una alternativa mucho mejor para implementar 
        AES ( Estándar de cifrado avanzado) también conocido como cifrado Rijndael.
        
        Advertencia
        Esta función está OBSOLETA en PHP 7.1.0. y ELIMINADA en PHP 7.2.0.
        Las alternativas a esta función son:
        random_bytes()*/

    public static function creaToken($usuario, $contrasena, $datosUsuario = null) {
        
        $tokenId = base64_encode(random_bytes(32));
        $issuedAt = time();
        //$notBefore = $issuedAt;
        // a la hora de expiracion no le añado nada para poder usar el token directamente 
        // si le pongo mas tiempo tengo que esperar para poder usar el token
        $expire = $issuedAt + 7200; // añado 1 hora --> ¿2 horas creo?
        $serverName = SERVER;

        // crea el array data para usuario
        // almaceno los datos del usuario para identificarlo 

        
        if (is_array($datosUsuario)) {
            $datos = $datosUsuario;
        }
        else {
            $datos = [
                'id' => $contrasena,
                'name' => $usuario,
            ];
        }

        $payload = [
            'iat' => $issuedAt, // cuando se genero el token
            'jti' => $tokenId, // identificador del token
            'iss' => $serverName, // servidor
            //'nbf' => $notBefore, // se podra usar no antes de
            'exp' => $expire, // cuando expira
            'data' => $datos
        ];

        $secretKey = base64_decode(SECRET_KEY);

        $jwt = JWT::encode(
                        $payload, //Data to be encoded in the JWT
                        $secretKey // The signing key
                        
        );

        $tokenJWT = 'Bearer '.$jwt;

        return $tokenJWT;
    }

    public static function verTokenCaducados($tokens){
            $tokensCaducados = JWT::verTokensCaducados($tokens);
        return $tokensCaducados;
    }
}
