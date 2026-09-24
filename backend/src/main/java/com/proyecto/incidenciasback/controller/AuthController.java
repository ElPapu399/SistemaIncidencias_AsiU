package com.proyecto.incidenciasback.controller;

import com.proyecto.incidenciasback.dto.LoginRequest;
import com.proyecto.incidenciasback.dto.LoginResponse;
import com.proyecto.incidenciasback.dto.MensajeResponse;
import com.proyecto.incidenciasback.dto.RecuperarPasswordRequest;
import com.proyecto.incidenciasback.dto.RecuperarPasswordResponse;
import com.proyecto.incidenciasback.dto.RestablecerPasswordRequest;
import com.proyecto.incidenciasback.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @PostMapping("/recuperar")
    public ResponseEntity<RecuperarPasswordResponse> recuperar(@Valid @RequestBody RecuperarPasswordRequest request) {
        return ResponseEntity.ok(authService.solicitarRecuperacion(request));
    }

    @PostMapping("/restablecer")
    public ResponseEntity<?> restablecer(@Valid @RequestBody RestablecerPasswordRequest request) {
        try {
            MensajeResponse response = authService.restablecerPassword(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
