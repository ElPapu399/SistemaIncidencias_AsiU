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
    private String tipoAccion;
    private Integer usuarioId;
    private String usuarioNombre;
    private String comentario;
    private Integer tecnicoAnteriorId;
    private String tecnicoAnteriorNombre;
    private Integer tecnicoNuevoId;
    private String tecnicoNuevoNombre;
    private LocalDateTime fechaCambio;
}

