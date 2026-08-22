package com.proyecto.incidenciasback.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {
    private Integer id;
    private String nombre;
    private String apellido;
    private String correo;
    private String rol;
}
