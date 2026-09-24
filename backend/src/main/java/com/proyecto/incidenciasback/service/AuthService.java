package com.proyecto.incidenciasback.service;

import com.proyecto.incidenciasback.dto.LoginRequest;
import com.proyecto.incidenciasback.dto.LoginResponse;
import com.proyecto.incidenciasback.dto.MensajeResponse;
import com.proyecto.incidenciasback.dto.RecuperarPasswordRequest;
import com.proyecto.incidenciasback.dto.RecuperarPasswordResponse;
import com.proyecto.incidenciasback.dto.RestablecerPasswordRequest;
import com.proyecto.incidenciasback.model.Usuario;
import com.proyecto.incidenciasback.repository.UsuarioRepository;
import com.proyecto.incidenciasback.security.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private static final long CODIGO_TTL_SECONDS = 15 * 60;
    private static final String MENSAJE_RECUPERACION =
            "Si el correo está registrado, te enviaremos un código de verificación.";

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final SecureRandom secureRandom = new SecureRandom();
    private final Map<String, CodigoRecuperacion> codigosRecuperacion = new ConcurrentHashMap<>();

    public AuthService(UsuarioRepository usuarioRepository,
                       BCryptPasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse login(LoginRequest request) {
        // Buscar usuario por correo
        Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo())
                .orElseThrow(() -> new RuntimeException("Correo o contraseña incorrectos"));

        // Verificar contraseña con BCrypt
        if (!passwordEncoder.matches(request.getPassword(), usuario.getPasswordHash())) {
            throw new RuntimeException("Correo o contraseña incorrectos");
        }

        // Generar token JWT
        String token = jwtUtil.generateToken(usuario);

        return new LoginResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getCorreo(),
                usuario.getRol().getNombre(),
                token
        );
    }

    public RecuperarPasswordResponse solicitarRecuperacion(RecuperarPasswordRequest request) {
        String correo = request.getCorreo().trim().toLowerCase();
        Optional<Usuario> usuario = usuarioRepository.findByCorreo(correo);

        if (usuario.isEmpty()) {
            return new RecuperarPasswordResponse(MENSAJE_RECUPERACION, null);
        }

        String codigo = String.format("%06d", secureRandom.nextInt(1_000_000));
        codigosRecuperacion.put(correo, new CodigoRecuperacion(
                passwordEncoder.encode(codigo),
                Instant.now().plusSeconds(CODIGO_TTL_SECONDS)
        ));

        // Sin servidor de correo configurado: el código se devuelve para completar el flujo en demo.
        return new RecuperarPasswordResponse(MENSAJE_RECUPERACION, codigo);
    }

    public MensajeResponse restablecerPassword(RestablecerPasswordRequest request) {
        String correo = request.getCorreo().trim().toLowerCase();
        CodigoRecuperacion registro = codigosRecuperacion.get(correo);

        if (registro == null || Instant.now().isAfter(registro.expiraEn())) {
            codigosRecuperacion.remove(correo);
            throw new RuntimeException("El código es inválido o ha expirado");
        }

        if (!passwordEncoder.matches(request.getCodigo(), registro.codigoHash())) {
            throw new RuntimeException("El código es inválido o ha expirado");
        }

        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("El código es inválido o ha expirado"));

        usuario.setPasswordHash(passwordEncoder.encode(request.getNuevaPassword()));
        usuarioRepository.save(usuario);
        codigosRecuperacion.remove(correo);

        return new MensajeResponse("Contraseña actualizada. Ya puedes iniciar sesión.");
    }

    private record CodigoRecuperacion(String codigoHash, Instant expiraEn) {
    }
}
