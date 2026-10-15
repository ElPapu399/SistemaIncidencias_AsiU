package com.proyecto.incidenciasback.dto;

import com.proyecto.incidenciasback.model.Especialidad;
import com.proyecto.incidenciasback.model.Prioridad;

public record CategoriaConfiguracionResponse(Integer id, String nombre, Especialidad especialidad,
                                              Prioridad prioridadDefecto, long ticketsVinculados) {
}
