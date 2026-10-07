package com.proyecto.incidenciasback.exception;

/**
 * Excepción lanzada cuando las credenciales de autenticación son inválidas.
 * El GlobalExceptionHandler la mapea a HTTP 401.
 */
public class AuthenticationException extends RuntimeException {

    public AuthenticationException(String message) {
        super(message);
    }
}
