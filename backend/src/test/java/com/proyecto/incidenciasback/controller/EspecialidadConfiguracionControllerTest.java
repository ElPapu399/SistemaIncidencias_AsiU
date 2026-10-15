package com.proyecto.incidenciasback.controller;

import com.proyecto.incidenciasback.config.SecurityConfig;
import com.proyecto.incidenciasback.dto.EspecialidadRequest;
import com.proyecto.incidenciasback.model.Especialidad;
import com.proyecto.incidenciasback.security.JwtAuthFilter;
import com.proyecto.incidenciasback.security.JwtUtil;
import com.proyecto.incidenciasback.service.EspecialidadService;
import io.jsonwebtoken.Jwts;
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

@WebMvcTest(EspecialidadConfiguracionController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class})
class EspecialidadConfiguracionControllerTest {
    @Autowired MockMvc mvc;
    @MockBean EspecialidadService service;
    @MockBean JwtUtil jwtUtil;

    private void autenticar(String rol) {
        when(jwtUtil.validateAndGetClaims("token"))
                .thenReturn(Jwts.claims().subject("usuario@example.com").add("rol", rol).build());
    }

    @Test
    void administradorPuedeCrearYEditar() throws Exception {
        autenticar("ADMIN");
        Especialidad especialidad = new Especialidad();
        especialidad.setId(5);
        especialidad.setNombre("Seguridad");
        when(service.guardar(isNull(), any(EspecialidadRequest.class))).thenReturn(especialidad);
        when(service.guardar(eq(5), any(EspecialidadRequest.class))).thenReturn(especialidad);

        mvc.perform(post("/api/especialidades").header("Authorization", "Bearer token")
                        .contentType(MediaType.APPLICATION_JSON).content("""
                                {"nombre":"Seguridad","descripcion":"Seguridad informática"}
                                """))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.id").value(5));
        mvc.perform(put("/api/especialidades/5").header("Authorization", "Bearer token")
                        .contentType(MediaType.APPLICATION_JSON).content("""
                                {"nombre":"Seguridad"}
                                """))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(5));
    }

    @Test
    void tecnicoNoPuedeCrearNiEditar() throws Exception {
        autenticar("TECNICO_ESPECIALISTA");
        mvc.perform(post("/api/especialidades").header("Authorization", "Bearer token"))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.error").exists());
        mvc.perform(put("/api/especialidades/2").header("Authorization", "Bearer token"))
                .andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }

    @Test
    void validaNombreObligatorioYLimitesDeLongitud() throws Exception {
        autenticar("ADMIN");
        mvc.perform(post("/api/especialidades").header("Authorization", "Bearer token")
                        .contentType(MediaType.APPLICATION_JSON).content("""
                                {"nombre":"   "}
                                """))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/especialidades").header("Authorization", "Bearer token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"" + "a".repeat(51) + "\",\"descripcion\":\"" + "b".repeat(201) + "\"}"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }

    @Test
    void exigeSesionParaGuardar() throws Exception {
        mvc.perform(post("/api/especialidades")).andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }
}
