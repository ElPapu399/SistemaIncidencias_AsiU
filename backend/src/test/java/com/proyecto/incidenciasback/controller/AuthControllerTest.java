package com.proyecto.incidenciasback.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.proyecto.incidenciasback.config.JwtConfig;
import com.proyecto.incidenciasback.config.SecurityConfig;
import com.proyecto.incidenciasback.dto.LoginRequest;
import com.proyecto.incidenciasback.dto.LoginResponse;
import com.proyecto.incidenciasback.security.JwtAuthFilter;
import com.proyecto.incidenciasback.security.JwtUtil;
import com.proyecto.incidenciasback.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Pruebas del flujo de autenticación (login).
 */
@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, JwtUtil.class, JwtConfig.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @Test
    @DisplayName("Acceso correcto: credenciales válidas devuelve 200 y datos de usuario")
    void loginConCredencialesValidas_deberiaRetornar200() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setCorreo("admin@universidad.edu.pe");
        request.setPassword("admin123");

        LoginResponse response = new LoginResponse(1, "Admin", "Sistema", "admin@universidad.edu.pe", "ADMIN", "mock-jwt-token");
        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correo").value("admin@universidad.edu.pe"))
                .andExpect(jsonPath("$.rol").value("ADMIN"))
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    @DisplayName("Credenciales inválidas: password incorrecto devuelve 401")
    void loginConPasswordIncorrecto_deberiaRetornar401() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setCorreo("admin@universidad.edu.pe");
        request.setPassword("password-incorrecto");

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new RuntimeException("Correo o contraseña incorrectos"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Correo o contraseña incorrectos"));
    }

    @Test
    @DisplayName("Credenciales inválidas: correo inexistente devuelve 401")
    void loginConCorreoInexistente_deberiaRetornar401() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setCorreo("no-existe@universidad.edu.pe");
        request.setPassword("cualquiera123");

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new RuntimeException("Correo o contraseña incorrectos"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Validación: correo vacío devuelve 400")
    void loginConCorreoVacio_deberiaRetornar400() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setCorreo("");
        request.setPassword("admin123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Validación: formato de correo inválido devuelve 400")
    void loginConCorreoFormatoInvalido_deberiaRetornar400() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setCorreo("no-es-un-correo");
        request.setPassword("admin123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Validación: password vacío devuelve 400")
    void loginConPasswordVacio_deberiaRetornar400() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setCorreo("admin@universidad.edu.pe");
        request.setPassword("");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
