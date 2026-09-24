package com.proyecto.incidenciasback.service;

import com.proyecto.incidenciasback.dto.LoginRequest;
import com.proyecto.incidenciasback.dto.LoginResponse;
import com.proyecto.incidenciasback.dto.MensajeResponse;
import com.proyecto.incidenciasback.dto.RecuperarPasswordRequest;
import com.proyecto.incidenciasback.dto.RecuperarPasswordResponse;
import com.proyecto.incidenciasback.dto.RestablecerPasswordRequest;
import com.proyecto.incidenciasback.model.Rol;
import com.proyecto.incidenciasback.model.Usuario;
import com.proyecto.incidenciasback.repository.UsuarioRepository;
import com.proyecto.incidenciasback.security.JwtUtil;
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

    @Mock
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(usuarioRepository, passwordEncoder, jwtUtil);
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
        when(jwtUtil.generateToken(usuario)).thenReturn("mock-jwt-token");

        LoginRequest request = new LoginRequest();
        request.setCorreo("admin@universidad.edu.pe");
        request.setPassword("admin123");

        LoginResponse response = authService.login(request);

        assertThat(response.getCorreo()).isEqualTo("admin@universidad.edu.pe");
        assertThat(response.getRol()).isEqualTo("ADMIN");
        assertThat(response.getToken()).isEqualTo("mock-jwt-token");
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

    @Test
    @DisplayName("Recuperación: correo existente genera código")
    void solicitarRecuperacion_correoExistente_retornaCodigo() {
        Usuario usuario = crearUsuario("admin@universidad.edu.pe", "admin123");
        when(usuarioRepository.findByCorreo("admin@universidad.edu.pe"))
                .thenReturn(Optional.of(usuario));

        RecuperarPasswordRequest request = new RecuperarPasswordRequest();
        request.setCorreo("admin@universidad.edu.pe");

        RecuperarPasswordResponse response = authService.solicitarRecuperacion(request);

        assertThat(response.getCodigo()).isNotBlank();
        assertThat(response.getCodigo()).hasSize(6);
        assertThat(response.getMensaje()).contains("código");
    }

    @Test
    @DisplayName("Recuperación: correo inexistente no revela si existe")
    void solicitarRecuperacion_correoInexistente_noDevuelveCodigo() {
        when(usuarioRepository.findByCorreo("no-existe@universidad.edu.pe"))
                .thenReturn(Optional.empty());

        RecuperarPasswordRequest request = new RecuperarPasswordRequest();
        request.setCorreo("no-existe@universidad.edu.pe");

        RecuperarPasswordResponse response = authService.solicitarRecuperacion(request);

        assertThat(response.getCodigo()).isNull();
        assertThat(response.getMensaje()).isEqualTo(
                "Si el correo está registrado, te enviaremos un código de verificación.");
    }

    @Test
    @DisplayName("Restablecer: código válido actualiza la contraseña")
    void restablecerPassword_codigoValido_actualizaHash() {
        Usuario usuario = crearUsuario("admin@universidad.edu.pe", "admin123");
        when(usuarioRepository.findByCorreo("admin@universidad.edu.pe"))
                .thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(usuario)).thenReturn(usuario);

        RecuperarPasswordRequest recuperar = new RecuperarPasswordRequest();
        recuperar.setCorreo("admin@universidad.edu.pe");
        String codigo = authService.solicitarRecuperacion(recuperar).getCodigo();

        RestablecerPasswordRequest restablecer = new RestablecerPasswordRequest();
        restablecer.setCorreo("admin@universidad.edu.pe");
        restablecer.setCodigo(codigo);
        restablecer.setNuevaPassword("nueva123");

        MensajeResponse response = authService.restablecerPassword(restablecer);

        assertThat(response.getMensaje()).contains("Contraseña actualizada");
        assertThat(passwordEncoder.matches("nueva123", usuario.getPasswordHash())).isTrue();
    }

    @Test
    @DisplayName("Restablecer: código inválido lanza excepción")
    void restablecerPassword_codigoInvalido_lanzaExcepcion() {
        Usuario usuario = crearUsuario("admin@universidad.edu.pe", "admin123");
        when(usuarioRepository.findByCorreo("admin@universidad.edu.pe"))
                .thenReturn(Optional.of(usuario));

        RecuperarPasswordRequest recuperar = new RecuperarPasswordRequest();
        recuperar.setCorreo("admin@universidad.edu.pe");
        authService.solicitarRecuperacion(recuperar);

        RestablecerPasswordRequest restablecer = new RestablecerPasswordRequest();
        restablecer.setCorreo("admin@universidad.edu.pe");
        restablecer.setCodigo("000000");
        restablecer.setNuevaPassword("nueva123");

        assertThatThrownBy(() -> authService.restablecerPassword(restablecer))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("El código es inválido o ha expirado");
    }
}