package com.proyecto.incidenciasback.dto;

import jakarta.validation.constraints.*;

public record EquipoEstadoRequest(
        @NotBlank(message = "Selecciona un estado")
        @Pattern(regexp = "Operativo|En reparación|Mantenimiento|Dado de baja", message = "Estado de equipo no válido") String estado,
        @NotBlank(message = "Indica el motivo del cambio") @Size(max = 500) String motivo) {
}
