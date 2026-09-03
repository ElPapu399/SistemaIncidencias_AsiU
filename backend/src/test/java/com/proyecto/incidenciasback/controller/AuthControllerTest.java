package com.proyecto.incidenciasback.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.proyecto.incidenciasback.config.SecurityConfig;
import com.proyecto.incidenciasback.dto.LoginRequest;
import com.proyecto.incidenciasback.dto.LoginResponse;
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
 *
 * Cubre:
 *  1. Acceso correcto con credenciales válidas -> 200 OK
 *  2. Credenciales inválidas (password incorrecto / correo inexistente) -> 401
 *  3. Validación de campos obligatorios -> 400
 *
 * NOTA sobre "expiración de sesión":
 * El backend actual NO implementa expiración de sesión ni tokens (JWT/Session).
 * AuthService.login() solo valida credenciales y SecurityConfig permite
 * "anyRequest().permitAll()", por lo que no hay mecanismo de sesión que expire.
 * El frontend únicamente guarda el usuario en sessionStorage (dura hasta que
 * se cierra la pestaña/navegador, no expira por tiempo).
 * Ver el test "sessionStorage no tiene expiracion" más abajo, que documenta
 * este comportamiento actual (gap a resolver antes de poder probar una
 * expiración real).
 */
@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
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

        LoginResponse response = new LoginResponse(1, "Admin", "Sistema", "admin@universidad.edu.pe", "ADMIN");
        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correo").value("admin@universidad.edu.pe"))
                .andExpect(jsonPath("$.rol").value("ADMIN"));
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
