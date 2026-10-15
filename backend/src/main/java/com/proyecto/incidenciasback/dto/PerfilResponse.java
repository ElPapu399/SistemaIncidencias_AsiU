package com.proyecto.incidenciasback.dto;

public record PerfilResponse(Integer id, String nombre, String apellido, String correo, String rol,
                             String telefono, String carrera, String especialidad) {
}
