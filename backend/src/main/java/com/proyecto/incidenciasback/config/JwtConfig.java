package com.proyecto.incidenciasback.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Getter;
import lombok.Setter;

/**
 * Configuración JWT leída desde application.yaml bajo "app.jwt".
 */
@Configuration
@ConfigurationProperties(prefix = "app.jwt")
@Getter
@Setter
public class JwtConfig {

    /**
     * Clave secreta HMAC-SHA256 para firmar los tokens.
     * En producción usar una clave fuerte y no commitearla.
     */
    private String secret = "clave-secreta-por-defecto-cambiar-en-produccion-min-32-chars!!";

    /**
     * Tiempo de expiración del token en milisegundos.
     * Default: 30 minutos = 1800000 ms.
     */
    private long expirationMs = 1800000;
}
