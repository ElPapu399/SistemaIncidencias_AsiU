package com.proyecto.incidenciasback.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CambiarEstadoRequest {

    @NotBlank(message = "El estado es obligatorio")
    private String estado;

    private String solucionTecnica;
    private Integer usuarioId;
    private String comentario;
}
