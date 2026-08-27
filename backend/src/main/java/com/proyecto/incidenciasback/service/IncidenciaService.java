package com.proyecto.incidenciasback.service;

import com.proyecto.incidenciasback.model.Incidencia;
import com.proyecto.incidenciasback.repository.IncidenciaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IncidenciaService {

    private final IncidenciaRepository incidenciaRepository;

    public IncidenciaService(IncidenciaRepository incidenciaRepository) {
        this.incidenciaRepository = incidenciaRepository;
    }

    public List<Incidencia> listarTodas() {
        return incidenciaRepository.findAll();
    }

    public Incidencia obtenerPorId(Integer id) {
        return incidenciaRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Incidencia no encontrada con id: " + id));
    }
}