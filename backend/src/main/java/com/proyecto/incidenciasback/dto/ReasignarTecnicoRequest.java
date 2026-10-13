package com.proyecto.incidenciasback.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReasignarTecnicoRequest {

    @NotNull(message = "El nuevo técnico es obligatorio")
    private Integer tecnicoNuevoId;

    @NotBlank(message = "El motivo de la reasignación es obligatorio")
    private String motivo;
}
