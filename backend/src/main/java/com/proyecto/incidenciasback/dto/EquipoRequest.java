package com.proyecto.incidenciasback.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record EquipoRequest(
        @NotBlank(message = "El código es obligatorio") @Size(max = 50) String codigo,
        @NotBlank(message = "El tipo es obligatorio") @Size(max = 50) String tipo,
        @Size(max = 100) String marca,
        @Size(max = 100) String modelo,
        @Size(max = 100) String numeroSerie,
        @PastOrPresent(message = "La adquisición no puede ser futura") LocalDate fechaAdquisicion,
        @NotNull(message = "Selecciona un laboratorio") @Positive Integer ubicacionId) {
}
