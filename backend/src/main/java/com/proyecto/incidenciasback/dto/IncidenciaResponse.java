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

    private Integer estudianteId;
    private String estudianteNombre;
    private Integer tecnicoId;
    private String tecnicoNombre;
    private Integer categoriaId;
    private String categoriaNombre;
    private String especialidadNombre;
    private Integer prioridadId;
    private String prioridadNivel;
    private Integer ubicacionId;
    private String ubicacionTexto;
    private Integer equipoId;
    private String equipoCodigo;
    private String solucionTecnica;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaInicioAtencion;
    private LocalDateTime fechaCierre;
    private Boolean fueReasignada;
    private Integer tecnicoAnteriorId;
    private String tecnicoAnteriorNombre;
    private String reasignadoPorNombre;
    private String motivoReasignacion;
    private LocalDateTime fechaReasignacion;
    private String asignadoPorNombre;
    private Integer calificacion;
    private String motivoCalificacion;
    private String comentarioCalificacion;

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
                false, null, null, null, null, null, null,
                null, null, null);
    }
}
