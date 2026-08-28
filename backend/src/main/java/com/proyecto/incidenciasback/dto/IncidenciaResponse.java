package com.proyecto.incidenciasback.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
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

    private String solucionTecnica;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaInicioAtencion;
    private LocalDateTime fechaCierre;
}
