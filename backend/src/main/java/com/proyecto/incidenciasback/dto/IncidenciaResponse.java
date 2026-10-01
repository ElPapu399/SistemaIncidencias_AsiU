package com.proyecto.incidenciasback.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class IncidenciaResponse {
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

    private String solucionTecnica;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaInicioAtencion;
    private LocalDateTime fechaCierre;

    // Trazabilidad de asignación y reasignación
    private Boolean fueReasignada;
    private Integer tecnicoAnteriorId;
    private String tecnicoAnteriorNombre;
    private String reasignadoPorNombre;
    private String motivoReasignacion;
    private LocalDateTime fechaReasignacion;
    private String asignadoPorNombre;

    // Constructor de compatibilidad sin trazabilidad
    public IncidenciaResponse(Integer id, String codigoTicket, String titulo, String descripcion, String estado,
                              Integer estudianteId, String estudianteNombre,
                              Integer tecnicoId, String tecnicoNombre,
                              Integer categoriaId, String categoriaNombre, String especialidadNombre,
                              Integer prioridadId, String prioridadNivel,
                              Integer ubicacionId, String ubicacionTexto,
                              Integer equipoId, String equipoCodigo,
                              String solucionTecnica, LocalDateTime fechaCreacion,
                              LocalDateTime fechaInicioAtencion, LocalDateTime fechaCierre) {
        this(id, codigoTicket, titulo, descripcion, estado,
                estudianteId, estudianteNombre, tecnicoId, tecnicoNombre,
                categoriaId, categoriaNombre, especialidadNombre,
                prioridadId, prioridadNivel, ubicacionId, ubicacionTexto,
                equipoId, equipoCodigo, solucionTecnica, fechaCreacion,
                fechaInicioAtencion, fechaCierre,
                false, null, null, null, null, null, null);
    }
}
