package com.proyecto.incidenciasback.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class HistorialEstadoResponse {
    private Integer id;
    private String estadoAnterior;
    private String estadoNuevo;
    private Integer usuarioId;
    private String usuarioNombre;
    private String comentario;
    private LocalDateTime fechaCambio;
}
