package com.proyecto.incidenciasback.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CambiarEstadoRequest {

    @NotBlank(message = "El estado es obligatorio")
    private String estado;

    // Obligatorio cuando estado = "Resuelta" o "Resuelto"
    private String solucionTecnica;

    // ID del usuario que realiza el cambio (opcional si la petición incluye token JWT)
    private Integer usuarioId;

    // Comentario opcional para el historial
    private String comentario;
}
