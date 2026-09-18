package com.proyecto.incidenciasback.controller;

import com.proyecto.incidenciasback.dto.UsuarioRequest;
import com.proyecto.incidenciasback.dto.UsuarioResponse;
import com.proyecto.incidenciasback.dto.UsuarioUpdateRequest;
import com.proyecto.incidenciasback.model.Usuario;
import com.proyecto.incidenciasback.repository.UsuarioRepository;
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

/**
 * Controlador para la gestión de usuarios (estudiantes, técnicos y administradores).
 */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;
    private final IncidenciaService incidenciaService;

    public UsuarioController(UsuarioService usuarioService,
                             UsuarioRepository usuarioRepository,
                             IncidenciaService incidenciaService) {
        this.usuarioService = usuarioService;
        this.usuarioRepository = usuarioRepository;
        this.incidenciaService = incidenciaService;
    }

    // ==================== USUARIOS para el CRUD ====================

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listarUsuarios(@RequestParam(required = false) String rol) {
        if (rol != null && !rol.isBlank()) {
            return ResponseEntity.ok(usuarioService.listarPorRol(rol));
        }
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> obtenerUsuario(@PathVariable Integer id) {
        return ResponseEntity.ok(usuarioService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> crearUsuario(@Valid @RequestBody UsuarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.crearUsuario(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> actualizarUsuario(@PathVariable Integer id,
                                                             @Valid @RequestBody UsuarioUpdateRequest request) {
        return ResponseEntity.ok(usuarioService.actualizarUsuario(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> eliminarUsuario(@PathVariable Integer id) {
        usuarioService.eliminarUsuario(id);
        return ResponseEntity.ok(Map.of("mensaje", "Usuario eliminado correctamente"));
    }

    // ==================== TÉCNICOS por especialidad ====================

    @GetMapping("/tecnicos")
    public ResponseEntity<List<Map<String, Object>>> listarTecnicos(
            @RequestParam(required = false) Integer especialidadId) {

        List<Usuario> tecnicos;
        List<String> rolesEspecialistas = List.of("TECNICO_ESPECIALISTA", "TECNICO");
        if (especialidadId != null) {
            tecnicos = usuarioRepository.findByRolNombreInAndEspecialidadId(rolesEspecialistas, especialidadId);
        } else {
            tecnicos = usuarioRepository.findByRolNombreIn(rolesEspecialistas);
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
}
