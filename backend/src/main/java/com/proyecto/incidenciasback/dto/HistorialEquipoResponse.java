package com.proyecto.incidenciasback.dto;

import java.time.LocalDateTime;

public record HistorialEquipoResponse(
    Integer id,
    Integer equipoId,
    String equipoCodigo,
    String equipoTipo,
    Integer usuarioId,
    String usuarioNombre,
    String estadoAnterior,
    String estadoNuevo,
    String motivo,
    LocalDateTime fecha
) {}
