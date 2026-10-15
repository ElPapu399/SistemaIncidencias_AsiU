package com.proyecto.incidenciasback.service;

import com.proyecto.incidenciasback.dto.CategoriaConfiguracionResponse;
import com.proyecto.incidenciasback.dto.CategoriaRequest;
import com.proyecto.incidenciasback.model.Categoria;
import com.proyecto.incidenciasback.repository.CategoriaRepository;
import com.proyecto.incidenciasback.repository.EspecialidadRepository;
import com.proyecto.incidenciasback.repository.IncidenciaRepository;
import com.proyecto.incidenciasback.repository.PrioridadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class CategoriaService {
    private final CategoriaRepository categorias;
    private final EspecialidadRepository especialidades;
    private final PrioridadRepository prioridades;
    private final IncidenciaRepository incidencias;

    public CategoriaService(CategoriaRepository categorias, EspecialidadRepository especialidades,
                            PrioridadRepository prioridades, IncidenciaRepository incidencias) {
        this.categorias = categorias;
        this.especialidades = especialidades;
        this.prioridades = prioridades;
        this.incidencias = incidencias;
    }

    @Transactional(readOnly = true)
    public List<CategoriaConfiguracionResponse> listar() {
        var conteos = incidencias.contarPorCategoria().stream().collect(Collectors.toMap(
                IncidenciaRepository.ConteoCategoria::getCategoriaId,
                IncidenciaRepository.ConteoCategoria::getTotal));
        return categorias.findAll().stream()
                .map(categoria -> respuesta(categoria, conteos.getOrDefault(categoria.getId(), 0L)))
                .toList();
    }

    @Transactional
    public CategoriaConfiguracionResponse guardar(Integer id, CategoriaRequest request) {
        String nombre = request.nombre().trim();
        if (nombre.isBlank()) throw new IllegalArgumentException("El nombre es obligatorio");
        categorias.findByNombreIgnoreCase(nombre).ifPresent(existente -> {
            if (!Objects.equals(existente.getId(), id)) {
                throw new IllegalArgumentException("Ya existe una categoría con ese nombre");
            }
        });

        Categoria categoria = id == null ? new Categoria() : categorias.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));
        var especialidad = especialidades.findById(request.especialidadId())
                .orElseThrow(() -> new IllegalArgumentException("Especialidad no encontrada"));
        var prioridad = prioridades.findById(request.prioridadDefectoId())
                .orElseThrow(() -> new IllegalArgumentException("Prioridad no encontrada"));
        categoria.setNombre(nombre);
        categoria.setEspecialidad(especialidad);
        categoria.setPrioridadDefecto(prioridad);
        Categoria guardada = categorias.save(categoria);
        return respuesta(guardada, id == null ? 0L : incidencias.countByCategoriaId(id));
    }

    private CategoriaConfiguracionResponse respuesta(Categoria categoria, long tickets) {
        return new CategoriaConfiguracionResponse(categoria.getId(), categoria.getNombre(),
                categoria.getEspecialidad(), categoria.getPrioridadDefecto(), tickets);
    }
}
