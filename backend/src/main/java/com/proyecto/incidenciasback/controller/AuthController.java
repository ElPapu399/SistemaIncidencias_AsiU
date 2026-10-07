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
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/recuperar")
    public ResponseEntity<RecuperarPasswordResponse> recuperar(@Valid @RequestBody RecuperarPasswordRequest request) {
        return ResponseEntity.ok(authService.solicitarRecuperacion(request));
    }

    @PostMapping("/restablecer")
    public ResponseEntity<MensajeResponse> restablecer(@Valid @RequestBody RestablecerPasswordRequest request) {
        return ResponseEntity.ok(authService.restablecerPassword(request));
    }
}
