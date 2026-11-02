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
public class NotificacionResponse {
    private Integer id;
    private Integer usuarioId;
    private String tipo;
    private String titulo;
    private String mensaje;
    private Integer incidenciaId;
    private String codigoTicket;
    private boolean leida;
    private LocalDateTime fechaCreacion;
}

