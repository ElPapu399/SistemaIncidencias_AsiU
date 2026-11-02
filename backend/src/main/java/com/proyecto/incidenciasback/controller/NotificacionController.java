package com.proyecto.incidenciasback.controller;

import com.proyecto.incidenciasback.dto.NotificacionResponse;
import com.proyecto.incidenciasback.model.Usuario;
import com.proyecto.incidenciasback.security.AuthHelper;
import com.proyecto.incidenciasback.service.NotificacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

    private final NotificacionService notificacionService;
    private final AuthHelper authHelper;

    public NotificacionController(NotificacionService notificacionService, AuthHelper authHelper) {
        this.notificacionService = notificacionService;
        this.authHelper = authHelper;
    }

    @GetMapping
    public ResponseEntity<List<NotificacionResponse>> listarNotificaciones() {
        Usuario usuario = authHelper.obtenerUsuarioAutenticado();
        return ResponseEntity.ok(notificacionService.listarPorUsuario(usuario.getId()));
    }

    @GetMapping("/no-leidas/conteo")
    public ResponseEntity<Map<String, Long>> contarNoLeidas() {
        Usuario usuario = authHelper.obtenerUsuarioAutenticado();
        long conteo = notificacionService.contarNoLeidas(usuario.getId());
        return ResponseEntity.ok(Map.of("total", conteo));
    }

    @PutMapping("/{id}/leer")
    public ResponseEntity<Void> marcarComoLeida(@PathVariable Integer id) {
        Usuario usuario = authHelper.obtenerUsuarioAutenticado();
        notificacionService.marcarComoLeida(id, usuario.getId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/leer-todas")
    public ResponseEntity<Void> marcarTodasComoLeidas() {
        Usuario usuario = authHelper.obtenerUsuarioAutenticado();
        notificacionService.marcarTodasComoLeidas(usuario.getId());
        return ResponseEntity.ok().build();
    }
}

