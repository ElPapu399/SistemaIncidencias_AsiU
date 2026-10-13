package com.proyecto.incidenciasback.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class IncidenciaDetalleResponse {
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
    private String equipoTipo;
    private String solucionTecnica;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaInicioAtencion;
    private LocalDateTime fechaCierre;
    private Integer calificacion;
    private String motivoCalificacion;
    private String comentarioCalificacion;
    private List<HistorialEstadoResponse> historial;
    private List<ArchivoAdjuntoResponse> adjuntos;
}
