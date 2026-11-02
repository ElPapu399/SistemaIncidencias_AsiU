package com.proyecto.incidenciasback.controller;

import com.proyecto.incidenciasback.config.SecurityConfig;
import com.proyecto.incidenciasback.dto.TecnicoCalificacionResponse;
import com.proyecto.incidenciasback.model.Rol;
import com.proyecto.incidenciasback.model.Usuario;
import com.proyecto.incidenciasback.repository.UsuarioRepository;
import com.proyecto.incidenciasback.security.AuthHelper;
import com.proyecto.incidenciasback.security.JwtAuthFilter;
import com.proyecto.incidenciasback.security.JwtUtil;
import com.proyecto.incidenciasback.service.IncidenciaService;
import io.jsonwebtoken.Jwts;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(IncidenciaController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, AuthHelper.class})
class IncidenciaCalificacionControllerTest {

    @Autowired MockMvc mvc;
    @MockBean IncidenciaService incidenciaService;
    @MockBean UsuarioRepository usuarios;
    @MockBean JwtUtil jwtUtil;

    private Usuario autenticar(String rolNombre) {
        when(jwtUtil.validateAndGetClaims("token"))
                .thenReturn(Jwts.claims().subject("tecnico@example.com").add("rol", rolNombre).build());
        Rol rol = new Rol();
        rol.setId(3);
        rol.setNombre(rolNombre);
        Usuario usuario = new Usuario();
        usuario.setId(15);
        usuario.setNombre("Jorge");
        usuario.setApellido("Ramos");
        usuario.setCorreo("tecnico@example.com");
        usuario.setRol(rol);
        usuario.setEstado("Activo");
        usuario.setPasswordHash("hash");
        when(usuarios.findByCorreo("tecnico@example.com")).thenReturn(Optional.of(usuario));
        return usuario;
    }

    @Test
    void obtenerMisCalificacionesRetornaDatosDelTecnicoAutenticado() throws Exception {
        autenticar("TECNICO_ESPECIALISTA");

        TecnicoCalificacionResponse.ComentarioCalificacion comentario =
                new TecnicoCalificacionResponse.ComentarioCalificacion(
                        1, "INC-2026-0001", "PC no enciende", 5, "Excelente atención",
                        "Solucionado muy rápido", "Juan Perez", LocalDateTime.now()
                );

        TecnicoCalificacionResponse response = new TecnicoCalificacionResponse(
                15, "Jorge", "Ramos", "Hardware", 5.0, 1, List.of(comentario)
        );

        when(incidenciaService.obtenerCalificacionesPorTecnico(15)).thenReturn(response);

        mvc.perform(get("/api/incidencias/mis-calificaciones").header("Authorization", "Bearer token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tecnicoId").value(15))
                .andExpect(jsonPath("$.tecnicoNombre").value("Jorge"))
                .andExpect(jsonPath("$.promedioCalificacion").value(5.0))
                .andExpect(jsonPath("$.totalCalificaciones").value(1))
                .andExpect(jsonPath("$.comentarios[0].calificacion").value(5))
                .andExpect(jsonPath("$.comentarios[0].estudianteNombre").value("Juan Perez"));

        verify(incidenciaService).obtenerCalificacionesPorTecnico(15);
    }

    @Test
    void obtenerCalificacionesTecnicosRetornaLista() throws Exception {
        autenticar("ADMIN");

        TecnicoCalificacionResponse response = new TecnicoCalificacionResponse(
                15, "Jorge", "Ramos", "Hardware", 4.5, 2, Collections.emptyList()
        );

        when(incidenciaService.obtenerCalificacionesTecnicos()).thenReturn(List.of(response));

        mvc.perform(get("/api/incidencias/calificaciones-tecnicos").header("Authorization", "Bearer token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].tecnicoId").value(15))
                .andExpect(jsonPath("$[0].promedioCalificacion").value(4.5));

        verify(incidenciaService).obtenerCalificacionesTecnicos();
    }
}

