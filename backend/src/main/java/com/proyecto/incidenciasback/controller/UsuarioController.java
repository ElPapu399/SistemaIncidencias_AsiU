package com.proyecto.incidenciasback.controller;

import com.proyecto.incidenciasback.dto.UsuarioRequest;
import com.proyecto.incidenciasback.dto.UsuarioResponse;
import com.proyecto.incidenciasback.dto.UsuarioUpdateRequest;
import com.proyecto.incidenciasback.model.Especialidad;
import com.proyecto.incidenciasback.model.Rol;
import com.proyecto.incidenciasback.repository.EspecialidadRepository;
import com.proyecto.incidenciasback.repository.RolRepository;
import com.proyecto.incidenciasback.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final RolRepository rolRepository;
    private final EspecialidadRepository especialidadRepository;

    public UsuarioController(UsuarioService usuarioService,
            RolRepository rolRepository,
            EspecialidadRepository especialidadRepository) {
        this.usuarioService = usuarioService;
        this.rolRepository = rolRepository;
        this.especialidadRepository = especialidadRepository;
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

    // ==================== listas ====================

    @GetMapping("/roles")
    public ResponseEntity<List<Rol>> listarRoles() {
        return ResponseEntity.ok(rolRepository.findAll());
    }

    @GetMapping("/especialidades")
    public ResponseEntity<List<Especialidad>> listarEspecialidades() {
        return ResponseEntity.ok(especialidadRepository.findAll());
    }
}
