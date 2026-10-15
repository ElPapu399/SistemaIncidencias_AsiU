package com.proyecto.incidenciasback.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PerfilRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100, message = "El nombre debe tener como máximo 100 caracteres") String nombre,
        @NotBlank(message = "El apellido es obligatorio")
        @Size(max = 100, message = "El apellido debe tener como máximo 100 caracteres") String apellido,
        @Size(max = 20, message = "El teléfono debe tener como máximo 20 caracteres") String telefono,
        @Size(max = 100, message = "La carrera debe tener como máximo 100 caracteres") String carrera) {
}
