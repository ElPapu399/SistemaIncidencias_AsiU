package com.proyecto.incidenciasback.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IncidenciaRequest {

    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;

    @NotNull(message = "La categoría es obligatoria")
    private Integer categoriaId;

    @NotNull(message = "La prioridad es obligatoria")
    private Integer prioridadId;

    @NotNull(message = "La ubicación es obligatoria")
    private Integer ubicacionId;

    @NotNull(message = "El estudiante es obligatorio")
    private Integer estudianteId;
}
