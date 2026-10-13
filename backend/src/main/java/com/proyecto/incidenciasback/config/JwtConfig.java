package com.proyecto.incidenciasback.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Getter;
import lombok.Setter;

@Configuration
@ConfigurationProperties(prefix = "app.jwt")
@Getter
@Setter
public class JwtConfig {

    private String secret = "clave-secreta-por-defecto-cambiar-en-produccion-min-32-chars!!";
    private long expirationMs = 1800000;
}
