package com.proyecto.incidenciasback.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EspecialidadRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 50, message = "El nombre debe tener como máximo 50 caracteres") String nombre,
        @Size(max = 200, message = "La descripción debe tener como máximo 200 caracteres") String descripcion) {
}
