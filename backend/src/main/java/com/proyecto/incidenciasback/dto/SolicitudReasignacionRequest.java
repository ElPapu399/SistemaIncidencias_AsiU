package com.proyecto.incidenciasback.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SolicitudReasignacionRequest {

    @NotBlank(message = "El motivo de la reasignación es obligatorio")
    private String motivo;
}
