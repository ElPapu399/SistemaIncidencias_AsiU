package com.proyecto.incidenciasback.controller;

import com.proyecto.incidenciasback.dto.CategoriaConfiguracionResponse;
import com.proyecto.incidenciasback.dto.CategoriaRequest;
import com.proyecto.incidenciasback.service.CategoriaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaConfiguracionController {
    private final CategoriaService service;

    public CategoriaConfiguracionController(CategoriaService service) {
        this.service = service;
    }

    @GetMapping("/configuracion")
    public List<CategoriaConfiguracionResponse> listar() {
        return service.listar();
    }

    @PostMapping
    public ResponseEntity<CategoriaConfiguracionResponse> crear(@Valid @RequestBody CategoriaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.guardar(null, request));
    }

    @PutMapping("/{id}")
    public CategoriaConfiguracionResponse actualizar(@PathVariable Integer id,
                                                    @Valid @RequestBody CategoriaRequest request) {
        return service.guardar(id, request);
    }
}
