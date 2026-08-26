package com.proyecto.incidenciasback.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class UsuarioResponse {
    private Integer id;
    private String nombre;
    private String apellido;
    private String correo;
    private String rol;
    private String especialidad;
    private LocalDateTime fechaCreacion;
}
