package com.proyecto.incidenciasback.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RespuestaSolicitudRequest {

    @NotBlank(message = "La decisión es obligatoria (APROBADA o RECHAZADA)")
    private String decision;

    private String comentario;

    private Integer tecnicoNuevoId;
}
