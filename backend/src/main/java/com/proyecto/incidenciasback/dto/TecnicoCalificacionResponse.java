package com.proyecto.incidenciasback.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TecnicoCalificacionResponse {

    private Integer tecnicoId;
    private String tecnicoNombre;
    private String tecnicoApellido;
    private String especialidad;
    private Double promedioCalificacion;
    private Integer totalCalificaciones;
    private List<ComentarioCalificacion> comentarios;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ComentarioCalificacion {
        private Integer incidenciaId;
        private String codigoTicket;
        private String tituloIncidencia;
        private Integer calificacion;
        private String motivo;
        private String comentario;
        private String estudianteNombre;
        private LocalDateTime fechaCierre;
    }
}
