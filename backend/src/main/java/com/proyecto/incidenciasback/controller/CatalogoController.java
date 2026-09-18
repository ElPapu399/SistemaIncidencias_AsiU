package com.proyecto.incidenciasback.controller;

import com.proyecto.incidenciasback.model.Categoria;
import com.proyecto.incidenciasback.model.Especialidad;
import com.proyecto.incidenciasback.model.Prioridad;
import com.proyecto.incidenciasback.model.Rol;
import com.proyecto.incidenciasback.model.Ubicacion;
import com.proyecto.incidenciasback.repository.CategoriaRepository;
import com.proyecto.incidenciasback.repository.EspecialidadRepository;
import com.proyecto.incidenciasback.repository.PrioridadRepository;
import com.proyecto.incidenciasback.repository.RolRepository;
import com.proyecto.incidenciasback.repository.UbicacionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controlador para endpoints de catálogos generales del campus
 * (roles, especialidades, categorías, ubicaciones y prioridades).
 */
@RestController
@RequestMapping("/api")
public class CatalogoController {

    private final RolRepository rolRepository;
    private final EspecialidadRepository especialidadRepository;
    private final CategoriaRepository categoriaRepository;
    private final UbicacionRepository ubicacionRepository;
    private final PrioridadRepository prioridadRepository;

    public CatalogoController(RolRepository rolRepository,
                              EspecialidadRepository especialidadRepository,
                              CategoriaRepository categoriaRepository,
                              UbicacionRepository ubicacionRepository,
                              PrioridadRepository prioridadRepository) {
        this.rolRepository = rolRepository;
        this.especialidadRepository = especialidadRepository;
        this.categoriaRepository = categoriaRepository;
        this.ubicacionRepository = ubicacionRepository;
        this.prioridadRepository = prioridadRepository;
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Rol>> listarRoles() {
        List<Rol> rolesActivos = rolRepository.findAll().stream()
                .filter(r -> !"TECNICO".equalsIgnoreCase(r.getNombre()))
                .toList();
        return ResponseEntity.ok(rolesActivos);
    }

    @GetMapping("/especialidades")
    public ResponseEntity<List<Especialidad>> listarEspecialidades() {
        return ResponseEntity.ok(especialidadRepository.findAll());
    }

    @GetMapping("/categorias")
    public ResponseEntity<List<Categoria>> listarCategorias() {
        return ResponseEntity.ok(categoriaRepository.findAll());
    }

    @GetMapping("/ubicaciones")
    public ResponseEntity<List<Ubicacion>> listarUbicaciones() {
        return ResponseEntity.ok(ubicacionRepository.findAll());
    }

    @GetMapping("/prioridades")
    public ResponseEntity<List<Prioridad>> listarPrioridades() {
        return ResponseEntity.ok(prioridadRepository.findAll());
    }
}
