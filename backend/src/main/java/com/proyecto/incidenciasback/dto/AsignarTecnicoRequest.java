package com.proyecto.incidenciasback.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AsignarTecnicoRequest {

    @NotNull(message = "El técnico es obligatorio")
    private Integer tecnicoId;
}
