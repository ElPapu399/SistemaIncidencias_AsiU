package com.proyecto.incidenciasback.controller;

import com.proyecto.incidenciasback.dto.PerfilRequest;
import com.proyecto.incidenciasback.dto.PerfilResponse;
import com.proyecto.incidenciasback.service.PerfilService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/perfil")
public class PerfilController {
    private final PerfilService service;

    public PerfilController(PerfilService service) {
        this.service = service;
    }

    @GetMapping
    public PerfilResponse obtener() {
        return service.obtener();
    }

    @PutMapping
    public PerfilResponse actualizar(@Valid @RequestBody PerfilRequest request) {
        return service.actualizar(request);
    }
}
