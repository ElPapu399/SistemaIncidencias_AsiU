package com.proyecto.incidenciasback.controller;

import com.proyecto.incidenciasback.dto.UsuarioRequest;
import com.proyecto.incidenciasback.dto.UsuarioResponse;
import com.proyecto.incidenciasback.dto.UsuarioUpdateRequest;
import com.proyecto.incidenciasback.model.Categoria;
import com.proyecto.incidenciasback.model.Especialidad;
import com.proyecto.incidenciasback.model.Prioridad;
import com.proyecto.incidenciasback.model.Rol;
import com.proyecto.incidenciasback.model.Ubicacion;
import com.proyecto.incidenciasback.model.Usuario;
import com.proyecto.incidenciasback.repository.*;
import com.proyecto.incidenciasback.service.IncidenciaService;
import com.proyecto.incidenciasback.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final RolRepository rolRepository;
    private final EspecialidadRepository especialidadRepository;
    private final CategoriaRepository categoriaRepository;
    private final UbicacionRepository ubicacionRepository;
    private final PrioridadRepository prioridadRepository;
    private final UsuarioRepository usuarioRepository;
    private final IncidenciaService incidenciaService;

    public UsuarioController(UsuarioService usuarioService,
            RolRepository rolRepository,
            EspecialidadRepository especialidadRepository,
            CategoriaRepository categoriaRepository,
            UbicacionRepository ubicacionRepository,
            PrioridadRepository prioridadRepository,
            UsuarioRepository usuarioRepository,
            IncidenciaService incidenciaService) {
        this.usuarioService = usuarioService;
        this.rolRepository = rolRepository;
        this.especialidadRepository = especialidadRepository;
        this.categoriaRepository = categoriaRepository;
        this.ubicacionRepository = ubicacionRepository;
        this.prioridadRepository = prioridadRepository;
        this.usuarioRepository = usuarioRepository;
        this.incidenciaService = incidenciaService;
    }

    // ==================== USUARIOS para el CRUD ====================

    @GetMapping("/usuarios")
    public ResponseEntity<List<UsuarioResponse>> listarUsuarios() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @GetMapping("/usuarios/{id}")
    public ResponseEntity<?> obtenerUsuario(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(usuarioService.obtenerPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/usuarios")
    public ResponseEntity<?> crearUsuario(@Valid @RequestBody UsuarioRequest request) {
        try {
            UsuarioResponse response = usuarioService.crearUsuario(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/usuarios/{id}")
    public ResponseEntity<?> actualizarUsuario(@PathVariable Integer id,
            @Valid @RequestBody UsuarioUpdateRequest request) {
        try {
            UsuarioResponse response = usuarioService.actualizarUsuario(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== TÉCNICOS por especialidad ====================

    @GetMapping("/usuarios/tecnicos")
    public ResponseEntity<List<Map<String, Object>>> listarTecnicos(
            @RequestParam(required = false) Integer especialidadId) {

        List<Usuario> tecnicos;
        if (especialidadId != null) {
            tecnicos = usuarioRepository.findByRolNombreAndEspecialidadId("TECNICO", especialidadId);
        } else {
            tecnicos = usuarioRepository.findByRolNombre("TECNICO");
        }

        List<Map<String, Object>> resultado = tecnicos.stream().map(t -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", t.getId());
            map.put("nombre", t.getNombre());
            map.put("apellido", t.getApellido());
            map.put("correo", t.getCorreo());
            map.put("especialidad", t.getEspecialidad() != null ? t.getEspecialidad().getNombre() : null);
            map.put("incidenciasActivas", incidenciaService.contarIncidenciasActivas(t.getId()));
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(resultado);
    }

    // ==================== CATÁLOGOS ====================

    @GetMapping("/roles")
    public ResponseEntity<List<Rol>> listarRoles() {
        return ResponseEntity.ok(rolRepository.findAll());
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
