package com.proyecto.incidenciasback.service;

import com.proyecto.incidenciasback.dto.LoginRequest;
import com.proyecto.incidenciasback.dto.LoginResponse;
import com.proyecto.incidenciasback.model.Rol;
import com.proyecto.incidenciasback.model.Usuario;
import com.proyecto.incidenciasback.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/**
 * Pruebas unitarias de AuthService: acceso correcto y credenciales inválidas.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(usuarioRepository, passwordEncoder);
    }

    private Usuario crearUsuario(String correo, String rawPassword) {
        Rol rol = new Rol();
        rol.setId(1);
        rol.setNombre("ADMIN");

        Usuario usuario = new Usuario();
        usuario.setId(1);
        usuario.setNombre("Admin");
        usuario.setApellido("Sistema");
        usuario.setCorreo(correo);
        usuario.setPasswordHash(passwordEncoder.encode(rawPassword));
        usuario.setRol(rol);
        return usuario;
    }

    @Test
    @DisplayName("Acceso correcto: credenciales válidas retornan LoginResponse")
    void login_credencialesValidas_retornaUsuario() {
        Usuario usuario = crearUsuario("admin@universidad.edu.pe", "admin123");
        when(usuarioRepository.findByCorreo("admin@universidad.edu.pe"))
                .thenReturn(Optional.of(usuario));

        LoginRequest request = new LoginRequest();
        request.setCorreo("admin@universidad.edu.pe");
        request.setPassword("admin123");

        LoginResponse response = authService.login(request);

        assertThat(response.getCorreo()).isEqualTo("admin@universidad.edu.pe");
        assertThat(response.getRol()).isEqualTo("ADMIN");
    }

    @Test
    @DisplayName("Credenciales inválidas: password incorrecto lanza excepción")
    void login_passwordIncorrecto_lanzaExcepcion() {
        Usuario usuario = crearUsuario("admin@universidad.edu.pe", "admin123");
        when(usuarioRepository.findByCorreo("admin@universidad.edu.pe"))
                .thenReturn(Optional.of(usuario));

        LoginRequest request = new LoginRequest();
        request.setCorreo("admin@universidad.edu.pe");
        request.setPassword("password-incorrecto");

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Correo o contraseña incorrectos");
    }

    @Test
    @DisplayName("Credenciales inválidas: correo inexistente lanza excepción")
    void login_correoInexistente_lanzaExcepcion() {
        when(usuarioRepository.findByCorreo("no-existe@universidad.edu.pe"))
                .thenReturn(Optional.empty());

        LoginRequest request = new LoginRequest();
        request.setCorreo("no-existe@universidad.edu.pe");
        request.setPassword("cualquiera123");

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Correo o contraseña incorrectos");
    }
}
