package com.proyecto.incidenciasback.controller;

import com.proyecto.incidenciasback.config.SecurityConfig;
import com.proyecto.incidenciasback.dto.NotificacionResponse;
import com.proyecto.incidenciasback.model.Rol;
import com.proyecto.incidenciasback.model.Usuario;
import com.proyecto.incidenciasback.repository.UsuarioRepository;
import com.proyecto.incidenciasback.security.AuthHelper;
import com.proyecto.incidenciasback.security.JwtAuthFilter;
import com.proyecto.incidenciasback.security.JwtUtil;
import com.proyecto.incidenciasback.service.NotificacionService;
import io.jsonwebtoken.Jwts;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NotificacionController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, AuthHelper.class})
class NotificacionControllerTest {

    @Autowired MockMvc mvc;
    @MockBean NotificacionService notificacionService;
    @MockBean UsuarioRepository usuarios;
    @MockBean JwtUtil jwtUtil;

    private Usuario autenticar(String rolNombre) {
        when(jwtUtil.validateAndGetClaims("token"))
                .thenReturn(Jwts.claims().subject("usuario@example.com").add("rol", rolNombre).build());
        Rol rol = new Rol();
        rol.setId(2);
        rol.setNombre(rolNombre);
        Usuario usuario = new Usuario();
        usuario.setId(10);
        usuario.setNombre("Carlos");
        usuario.setApellido("Mendoza");
        usuario.setCorreo("usuario@example.com");
        usuario.setRol(rol);
        usuario.setEstado("Activo");
        usuario.setPasswordHash("hash");
        when(usuarios.findByCorreo("usuario@example.com")).thenReturn(Optional.of(usuario));
        return usuario;
    }

    @Test
    void listarNotificacionesRetornaListaParaUsuarioAutenticado() throws Exception {
        autenticar("TECNICO_ESPECIALISTA");
        NotificacionResponse notif = new NotificacionResponse(
                1, 10, "ASIGNACION", "Ticket asignado", "Se te ha asignado INC-2026-0001",
                5, "INC-2026-0001", false, LocalDateTime.now()
        );
        when(notificacionService.listarPorUsuario(10)).thenReturn(List.of(notif));

        mvc.perform(get("/api/notificaciones").header("Authorization", "Bearer token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].tipo").value("ASIGNACION"))
                .andExpect(jsonPath("$[0].titulo").value("Ticket asignado"))
                .andExpect(jsonPath("$[0].codigoTicket").value("INC-2026-0001"))
                .andExpect(jsonPath("$[0].leida").value(false));

        verify(notificacionService).listarPorUsuario(10);
    }

    @Test
    void conteoNoLeidasRetornaTotal() throws Exception {
        autenticar("ESTUDIANTE");
        when(notificacionService.contarNoLeidas(10)).thenReturn(3L);

        mvc.perform(get("/api/notificaciones/no-leidas/conteo").header("Authorization", "Bearer token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(3));

        verify(notificacionService).contarNoLeidas(10);
    }

    @Test
    void marcarComoLeidaLlamaAlServicio() throws Exception {
        autenticar("TECNICO_ESPECIALISTA");

        mvc.perform(put("/api/notificaciones/1/leer").header("Authorization", "Bearer token"))
                .andExpect(status().isOk());

        verify(notificacionService).marcarComoLeida(1, 10);
    }

    @Test
    void marcarTodasComoLeidasLlamaAlServicio() throws Exception {
        autenticar("TECNICO_ESPECIALISTA");

        mvc.perform(put("/api/notificaciones/leer-todas").header("Authorization", "Bearer token"))
                .andExpect(status().isOk());

        verify(notificacionService).marcarTodasComoLeidas(10);
    }
}

