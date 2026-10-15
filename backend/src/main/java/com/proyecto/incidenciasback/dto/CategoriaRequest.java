package com.proyecto.incidenciasback.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CategoriaRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100, message = "El nombre debe tener como máximo 100 caracteres") String nombre,
        @NotNull(message = "Selecciona una especialidad") @Positive Integer especialidadId,
        @NotNull(message = "Selecciona una prioridad") @Positive Integer prioridadDefectoId) {
}
