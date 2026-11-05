package com.proyecto.incidenciasback.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuditoriaLogResponse {
    private String id;
    private LocalDateTime fecha;
    private String tipo;
    private String tipoAccion;
    private Integer usuarioId;
    private String usuarioNombre;
    private String usuarioRol;
    private String usuarioEmail;
    private String entidadCodigo;
    private String entidadNombre;
    private String estadoAnterior;
    private String estadoNuevo;
    private String detalle;
}

