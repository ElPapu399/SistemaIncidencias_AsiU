package com.proyecto.incidenciasback.controller;

import com.proyecto.incidenciasback.dto.EspecialidadRequest;
import com.proyecto.incidenciasback.model.Especialidad;
import com.proyecto.incidenciasback.service.EspecialidadService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/especialidades")
public class EspecialidadConfiguracionController {
    private final EspecialidadService service;

    public EspecialidadConfiguracionController(EspecialidadService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Especialidad> crear(@Valid @RequestBody EspecialidadRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.guardar(null, request));
    }

    @PutMapping("/{id}")
    public Especialidad actualizar(@PathVariable Integer id, @Valid @RequestBody EspecialidadRequest request) {
        return service.guardar(id, request);
    }
}
