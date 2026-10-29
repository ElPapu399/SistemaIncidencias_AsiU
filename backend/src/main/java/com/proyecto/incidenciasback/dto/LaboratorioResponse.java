package com.proyecto.incidenciasback.dto;

public record LaboratorioResponse(Integer id, String nombre, String pabellon, Integer piso, String estado,
                                   Integer capacidad, Integer encargadoId, String encargado,
                                   long cantidadPCs, long cantidadEquipos) {
}
