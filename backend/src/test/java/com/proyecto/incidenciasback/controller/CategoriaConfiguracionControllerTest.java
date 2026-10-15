package com.proyecto.incidenciasback.controller;

import com.proyecto.incidenciasback.config.SecurityConfig;
import com.proyecto.incidenciasback.dto.CategoriaConfiguracionResponse;
import com.proyecto.incidenciasback.dto.CategoriaRequest;
import com.proyecto.incidenciasback.security.JwtAuthFilter;
import com.proyecto.incidenciasback.security.JwtUtil;
import com.proyecto.incidenciasback.service.CategoriaService;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.DispatcherType;
import jakarta.servlet.RequestDispatcher;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CategoriaConfiguracionController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class})
class CategoriaConfiguracionControllerTest {
    @Autowired MockMvc mvc;
    @MockBean CategoriaService service;
    @MockBean JwtUtil jwtUtil;

    private void autenticar(String rol) {
        when(jwtUtil.validateAndGetClaims("token"))
                .thenReturn(Jwts.claims().subject("usuario@example.com").add("rol", rol).build());
    }

    @Test
    void administradorPuedeCrearCategoria() throws Exception {
        autenticar("ADMIN");
        when(service.guardar(isNull(), any(CategoriaRequest.class)))
                .thenReturn(new CategoriaConfiguracionResponse(20, "Nueva categoría", null, null, 0L));

        mvc.perform(post("/api/categorias").header("Authorization", "Bearer token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nombre":"Nueva categoría","especialidadId":2,"prioridadDefectoId":3}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(20))
                .andExpect(jsonPath("$.ticketsVinculados").value(0));
    }

    @Test
    void tecnicoNoPuedeCrearEditarNiConsultarConfiguracion() throws Exception {
        autenticar("TECNICO_ESPECIALISTA");
        mvc.perform(post("/api/categorias").header("Authorization", "Bearer token"))
                .andExpect(status().isForbidden());
        mvc.perform(put("/api/categorias/7").header("Authorization", "Bearer token"))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/categorias/configuracion").header("Authorization", "Bearer token"))
                .andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }

    @Test
    void validaCamposAntesDeGuardar() throws Exception {
        autenticar("ADMIN");
        mvc.perform(post("/api/categorias").header("Authorization", "Bearer token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nombre":"  ","especialidadId":-1}
                                """))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }

    @Test
    void usuarioSinSesionNoPuedeConsultarCatalogo() throws Exception {
        mvc.perform(get("/api/categorias/configuracion"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }

    @Test
    void errorDeRutaInexistenteConserva404EnLugarDePedirNuevoLogin() throws Exception {
        // El contenedor procesa /error en un segundo dispatch, sin el contexto del JWT.
        mvc.perform(get("/error")
                        .with(request -> { request.setDispatcherType(DispatcherType.ERROR); return request; })
                        .requestAttr(RequestDispatcher.ERROR_STATUS_CODE, 404)
                        .requestAttr(RequestDispatcher.ERROR_REQUEST_URI, "/api/ruta-inexistente"))
                .andExpect(status().isNotFound());
    }
}
