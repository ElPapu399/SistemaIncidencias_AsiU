package com.proyecto.incidenciasback.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EquipoResponse {
    private Integer id;
    private String codigo;
    private String tipo;
    private String marca;
    private String modelo;
    private Integer ubicacionId;
    private String ubicacionTexto;
    private String estado;
}
