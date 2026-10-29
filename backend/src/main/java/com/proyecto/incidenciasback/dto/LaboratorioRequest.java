package com.proyecto.incidenciasback.dto;

import jakarta.validation.constraints.*;

public record LaboratorioRequest(
        @NotBlank(message = "El nombre es obligatorio") @Size(max = 50) String nombre,
        @NotBlank(message = "El pabellón es obligatorio") @Size(max = 50) String pabellon,
        @NotNull(message = "El piso es obligatorio") @Min(0) Integer piso,
        @Min(value = 1, message = "La capacidad debe ser positiva") Integer capacidad,
        @Positive Integer encargadoId,
        @Pattern(regexp = "Operativo|Mantenimiento", message = "Estado de laboratorio no válido") String estado) {
}
