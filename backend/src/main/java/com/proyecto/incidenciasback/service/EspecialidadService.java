package com.proyecto.incidenciasback.service;

import com.proyecto.incidenciasback.dto.EspecialidadRequest;
import com.proyecto.incidenciasback.model.Especialidad;
import com.proyecto.incidenciasback.repository.EspecialidadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
public class EspecialidadService {
    private final EspecialidadRepository especialidades;

    public EspecialidadService(EspecialidadRepository especialidades) {
        this.especialidades = especialidades;
    }

    @Transactional
    public Especialidad guardar(Integer id, EspecialidadRequest request) {
        String nombre = request.nombre().trim();
        if (nombre.isBlank()) throw new IllegalArgumentException("El nombre es obligatorio");
        especialidades.findByNombreIgnoreCase(nombre).ifPresent(existente -> {
            if (!Objects.equals(existente.getId(), id)) {
                throw new IllegalArgumentException("Ya existe una especialidad con ese nombre");
            }
        });
        Especialidad especialidad = id == null ? new Especialidad() : especialidades.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Especialidad no encontrada"));
        especialidad.setNombre(nombre);
        especialidad.setDescripcion(request.descripcion() == null ? null : request.descripcion().trim());
        // Se conserva el ID al editar para mantener los vínculos con categorías y técnicos.
        return especialidades.save(especialidad);
    }
}
