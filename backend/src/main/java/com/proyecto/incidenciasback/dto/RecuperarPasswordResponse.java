package com.proyecto.incidenciasback.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RecuperarPasswordResponse {
    private String mensaje;
    private String codigo;
}
