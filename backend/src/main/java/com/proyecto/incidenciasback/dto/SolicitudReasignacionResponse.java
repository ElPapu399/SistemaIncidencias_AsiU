package com.proyecto.incidenciasback.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * DTO de respuesta para una solicitud de reasignación.
 */
@Getter
@AllArgsConstructor
public class SolicitudReasignacionResponse {
    private Integer id;
    private Integer incidenciaId;
    private String codigoTicket;
    private String tituloIncidencia;

    // Técnico que solicita
    private Integer tecnicoSolicitanteId;
    private String tecnicoSolicitanteNombre;

    private String motivo;
    private String estado;

    // Revisor (admin o técnico de soporte)
    private Integer revisadoPorId;
    private String revisadoPorNombre;
    private String comentarioRespuesta;

    // Técnico nuevo (si fue aprobada)
    private Integer tecnicoNuevoId;
    private String tecnicoNuevoNombre;

    private LocalDateTime fechaSolicitud;
    private LocalDateTime fechaRespuesta;
}
