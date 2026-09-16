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
    private Integer rolId;
    private String rol;
    private Integer especialidadId;
    private String especialidad;
    private String telefono;
    private String carrera;
    private String estado;
    private LocalDateTime fechaCreacion;
}
