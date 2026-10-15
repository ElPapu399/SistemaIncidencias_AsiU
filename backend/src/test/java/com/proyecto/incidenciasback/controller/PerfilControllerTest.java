package com.proyecto.incidenciasback.controller;

import com.proyecto.incidenciasback.config.SecurityConfig;
import com.proyecto.incidenciasback.model.Especialidad;
import com.proyecto.incidenciasback.model.Rol;
import com.proyecto.incidenciasback.model.Usuario;
import com.proyecto.incidenciasback.repository.UsuarioRepository;
import com.proyecto.incidenciasback.security.AuthHelper;
import com.proyecto.incidenciasback.security.JwtAuthFilter;
import com.proyecto.incidenciasback.security.JwtUtil;
import com.proyecto.incidenciasback.service.PerfilService;
import io.jsonwebtoken.Jwts;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PerfilController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, AuthHelper.class, PerfilService.class})
class PerfilControllerTest {
    @Autowired MockMvc mvc;
    @MockBean UsuarioRepository usuarios;
    @MockBean JwtUtil jwtUtil;

    private Usuario autenticar(String rolNombre) {
        when(jwtUtil.validateAndGetClaims("token"))
                .thenReturn(Jwts.claims().subject("sesion@example.com").add("rol", rolNombre).build());
        Rol rol = new Rol();
        rol.setId(2);
        rol.setNombre(rolNombre);
        Usuario usuario = new Usuario();
        usuario.setId(7);
        usuario.setNombre("María");
        usuario.setApellido("García");
        usuario.setCorreo("sesion@example.com");
        usuario.setRol(rol);
        usuario.setEstado("Activo");
        usuario.setPasswordHash("hash-no-publico");
        usuario.setCarrera("Ingeniería de Sistemas");
        when(usuarios.findByCorreo("sesion@example.com")).thenReturn(Optional.of(usuario));
        return usuario;
    }

    @Test
    void muestraUsuarioDelTokenSinExponerPassword() throws Exception {
        autenticar("ESTUDIANTE");
        mvc.perform(get("/api/perfil").header("Authorization", "Bearer token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.nombre").value("María"))
                .andExpect(jsonPath("$.carrera").value("Ingeniería de Sistemas"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void guardaDatosPersonalesPeroIgnoraIdYPrivilegiosDelNavegador() throws Exception {
        Usuario usuario = autenticar("ESTUDIANTE");
        when(usuarios.save(usuario)).thenReturn(usuario);
        mvc.perform(put("/api/perfil").header("Authorization", "Bearer token")
                        .contentType(MediaType.APPLICATION_JSON).content("""
                                {"nombre":"  María José  ","apellido":"  García López  ",
                                 "telefono":"987-654-321","carrera":"  Ingeniería de Software  ",
                                 "id":99,"rolId":1,"rol":"ADMIN","correo":"otro@example.com",
                                 "estado":"Inactivo","passwordHash":"otro-hash"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.nombre").value("María José"))
                .andExpect(jsonPath("$.apellido").value("García López"))
                .andExpect(jsonPath("$.correo").value("sesion@example.com"))
                .andExpect(jsonPath("$.rol").value("ESTUDIANTE"))
                .andExpect(jsonPath("$.carrera").value("Ingeniería de Software"));
        assertThat(usuario.getEstado()).isEqualTo("Activo");
        assertThat(usuario.getPasswordHash()).isEqualTo("hash-no-publico");
        verify(usuarios).save(usuario);
        verify(usuarios, never()).findById(anyInt());
    }

    @Test
    void tecnicoConservaEspecialidadYCarreraSinPermitirReasignacion() throws Exception {
        Usuario usuario = autenticar("TECNICO_ESPECIALISTA");
        Especialidad especialidad = new Especialidad();
        especialidad.setId(3);
        especialidad.setNombre("Software");
        usuario.setEspecialidad(especialidad);
        when(usuarios.save(usuario)).thenReturn(usuario);
        mvc.perform(put("/api/perfil").header("Authorization", "Bearer token")
                        .contentType(MediaType.APPLICATION_JSON).content("""
                                {"nombre":"Lucía","apellido":"Ramos","telefono":"",
                                 "carrera":"Otra carrera","especialidadId":999}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.especialidad").value("Software"))
                .andExpect(jsonPath("$.carrera").value("Ingeniería de Sistemas"));
        assertThat(usuario.getEspecialidad()).isSameAs(especialidad);
        assertThat(usuario.getTelefono()).isNull();
    }

    @Test
    void rechazaNombresEnBlancoYCamposDemasiadoLargos() throws Exception {
        when(jwtUtil.validateAndGetClaims("token"))
                .thenReturn(Jwts.claims().subject("sesion@example.com").add("rol", "ESTUDIANTE").build());
        mvc.perform(put("/api/perfil").header("Authorization", "Bearer token")
                        .contentType(MediaType.APPLICATION_JSON).content("""
                                {"nombre":"   ","apellido":"García"}
                                """))
                .andExpect(status().isBadRequest());
        mvc.perform(put("/api/perfil").header("Authorization", "Bearer token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"" + "a".repeat(101) + "\",\"apellido\":\"García\"}"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(usuarios);
    }

    @Test
    void exigeSesionParaLeerYGuardar() throws Exception {
        mvc.perform(get("/api/perfil")).andExpect(status().isUnauthorized());
        mvc.perform(put("/api/perfil")).andExpect(status().isUnauthorized());
        verifyNoInteractions(usuarios);
    }
}
