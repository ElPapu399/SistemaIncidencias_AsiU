package com.proyecto.incidenciasback.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO enriquecido para el detalle de una incidencia (GET /api/incidencias/{id}).
 * Incluye historial de estados (timeline), archivos adjuntos y equipo.
 */
@Getter
@AllArgsConstructor
public class IncidenciaDetalleResponse {
    private Integer id;
    private String codigoTicket;
    private String titulo;
    private String descripcion;
    private String estado;

    // Estudiante
    private Integer estudianteId;
    private String estudianteNombre;

    // Técnico (puede ser null)
    private Integer tecnicoId;
    private String tecnicoNombre;

    // Categoría y especialidad
    private Integer categoriaId;
    private String categoriaNombre;
    private String especialidadNombre;

    // Prioridad
    private Integer prioridadId;
    private String prioridadNivel;

    // Ubicación
    private Integer ubicacionId;
    private String ubicacionTexto;

    // Equipo (puede ser null)
    private Integer equipoId;
    private String equipoCodigo;
    private String equipoTipo;

    // Solución y fechas
    private String solucionTecnica;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaInicioAtencion;
    private LocalDateTime fechaCierre;

    // Timeline (historial de cambios de estado)
    private List<HistorialEstadoResponse> historial;

    // Archivos adjuntos (evidencia fotográfica)
    private List<ArchivoAdjuntoResponse> adjuntos;
}
