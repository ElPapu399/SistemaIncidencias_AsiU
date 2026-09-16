package com.proyecto.incidenciasback.service;

import com.proyecto.incidenciasback.dto.EquipoResponse;
import com.proyecto.incidenciasback.model.Equipo;
import com.proyecto.incidenciasback.repository.EquipoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EquipoService {

    private final EquipoRepository equipoRepository;

    public EquipoService(EquipoRepository equipoRepository) {
        this.equipoRepository = equipoRepository;
    }

    public List<EquipoResponse> listarTodos() {
        return equipoRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<EquipoResponse> listarPorUbicacion(Integer ubicacionId) {
        return equipoRepository.findByUbicacionId(ubicacionId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public EquipoResponse obtenerPorId(Integer id) {
        Equipo equipo = equipoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipo no encontrado con id: " + id));
        return toResponse(equipo);
    }

    private EquipoResponse toResponse(Equipo e) {
        return new EquipoResponse(
                e.getId(),
                e.getCodigo(),
                e.getTipo(),
                e.getMarca(),
                e.getModelo(),
                e.getUbicacion() != null ? e.getUbicacion().getId() : null,
                e.getUbicacion() != null
                        ? e.getUbicacion().getPabellon() + " - " + e.getUbicacion().getAulaLaboratorio()
                        : null,
                e.getEstado()
        );
    }
}
