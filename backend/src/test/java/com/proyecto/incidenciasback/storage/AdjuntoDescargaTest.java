package com.proyecto.incidenciasback.storage;

import com.proyecto.incidenciasback.controller.ArchivoAdjuntoController;
import com.proyecto.incidenciasback.exception.GlobalExceptionHandler;
import com.proyecto.incidenciasback.service.ArchivoAdjuntoService;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AdjuntoDescargaTest {
    @Test void devuelveWebpConContenidoYTipoCorrectos() throws Exception {
        var service = mock(ArchivoAdjuntoService.class);
        when(service.cargarArchivo(24, "foto.webp")).thenReturn(new ByteArrayResource(new byte[]{1, 2, 3}));
        MockMvcBuilders.standaloneSetup(new ArchivoAdjuntoController(service)).setControllerAdvice(new GlobalExceptionHandler()).build()
                .perform(get("/api/adjuntos/24/foto.webp"))
                .andExpect(status().isOk()).andExpect(content().contentType("image/webp"))
                .andExpect(content().bytes(new byte[]{1, 2, 3}));
    }

    @Test void distingueArchivoAusenteDeAlmacenamientoInaccesible() throws Exception {
        var service = mock(ArchivoAdjuntoService.class);
        when(service.cargarArchivo(24, "ausente.webp")).thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Archivo no encontrado"));
        when(service.cargarArchivo(24, "sinpermiso.webp")).thenThrow(new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Almacenamiento no disponible"));
        var mvc = MockMvcBuilders.standaloneSetup(new ArchivoAdjuntoController(service)).setControllerAdvice(new GlobalExceptionHandler()).build();
        mvc.perform(get("/api/adjuntos/24/ausente.webp")).andExpect(status().isNotFound());
        mvc.perform(get("/api/adjuntos/24/sinpermiso.webp")).andExpect(status().isServiceUnavailable());
    }
}
