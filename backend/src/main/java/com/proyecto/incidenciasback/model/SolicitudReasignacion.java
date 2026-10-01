package com.proyecto.incidenciasback.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Solicitud de reasignación creada por un técnico cuando considera
 * que no puede atender la incidencia y necesita ser reasignada.
 */
@Entity
@Table(name = "solicitudes_reasignacion")
@Getter
@Setter
public class SolicitudReasignacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "incidencia_id", nullable = false)
    private Incidencia incidencia;

    /** Técnico que solicita ser reasignado */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tecnico_solicitante_id", nullable = false)
    private Usuario tecnicoSolicitante;

    /** Motivo por el cual solicita la reasignación */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String motivo;

    /** Estado de la solicitud: PENDIENTE, APROBADA, RECHAZADA */
    @Column(nullable = false, length = 20)
    private String estado = "PENDIENTE";

    /** Admin o técnico de soporte que revisó la solicitud */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "revisado_por_id")
    private Usuario revisadoPor;

    /** Comentario del revisor al aprobar/rechazar */
    @Column(name = "comentario_respuesta", length = 500)
    private String comentarioRespuesta;

    /** Nuevo técnico asignado si la solicitud fue aprobada */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tecnico_nuevo_id")
    private Usuario tecnicoNuevo;

    @Column(name = "fecha_solicitud")
    private LocalDateTime fechaSolicitud;

    @Column(name = "fecha_respuesta")
    private LocalDateTime fechaRespuesta;

    @PrePersist
    public void prePersist() {
        if (fechaSolicitud == null) {
            fechaSolicitud = LocalDateTime.now();
        }
    }
}
