package com.proyecto.incidenciasback.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class SolicitudReasignacionResponse {
    private Integer id;
    private Integer incidenciaId;
    private String codigoTicket;
    private String tituloIncidencia;
    private Integer tecnicoSolicitanteId;
    private String tecnicoSolicitanteNombre;
    private String motivo;
    private String estado;
    private Integer revisadoPorId;
    private String revisadoPorNombre;
    private String comentarioRespuesta;
    private Integer tecnicoNuevoId;
    private String tecnicoNuevoNombre;
    private LocalDateTime fechaSolicitud;
    private LocalDateTime fechaRespuesta;
}
