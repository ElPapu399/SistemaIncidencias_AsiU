package com.proyecto.incidenciasback.service;

import com.proyecto.incidenciasback.model.Incidencia;
import com.proyecto.incidenciasback.model.Usuario;
import jakarta.mail.Session;
import jakarta.mail.Part;
import jakarta.mail.Multipart;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import static org.junit.jupiter.api.Assertions.assertTrue;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Properties;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailService, "fromEmail", "soporte.asiu@gmail.com");
        ReflectionTestUtils.setField(emailService, "frontendUrl", "https://sistema-incidencias-asiu.onrender.com");
    }

    private MimeMessage crearMimeMessageMock() {
        return new MimeMessage(Session.getInstance(new Properties()));
    }

    @Test
    @DisplayName("enviarCodigoRecuperacion: envía mensaje correctamente vía JavaMailSender")
    void enviarCodigoRecuperacion_enviaExitosamente() {
        when(mailSender.createMimeMessage()).thenReturn(crearMimeMessageMock());

        emailService.enviarCodigoRecuperacion("alumno@universidad.edu.pe", "123456");

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("enviarCorreoResolucionIncidencia: envía mensaje con datos completos")
    void enviarCorreoResolucionIncidencia_conDatosCompletos_envia() {
        when(mailSender.createMimeMessage()).thenReturn(crearMimeMessageMock());

        Usuario estudiante = new Usuario();
        estudiante.setNombre("Juan");
        estudiante.setApellido("Pérez");
        estudiante.setCorreo("juan.perez@universidad.edu.pe");

        Usuario tecnico = new Usuario();
        tecnico.setNombre("Carlos");
        tecnico.setApellido("Gómez");

        Incidencia incidencia = new Incidencia();
        incidencia.setId(42);
        incidencia.setCodigoTicket("INC-2026-0042");
        incidencia.setTitulo("Monitor no enciende");
        incidencia.setEstudiante(estudiante);
        incidencia.setTecnico(tecnico);
        incidencia.setSolucionTecnica("Se cambió cable HDMI defectuoso");
        incidencia.setFechaCierre(LocalDateTime.now());

        emailService.enviarCorreoResolucionIncidencia(incidencia);

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    private String extraerHtml(Part part) throws Exception {
        if (part.isMimeType("text/html")) return (String) part.getContent();
        if (part.getContent() instanceof Multipart multipart) {
            StringBuilder html = new StringBuilder();
            for (int i = 0; i < multipart.getCount(); i++) html.append(extraerHtml(multipart.getBodyPart(i)));
            return html.toString();
        }
        return "";
    }

    @ParameterizedTest
    @ValueSource(strings = {"http://localhost:5173", "https://sistema-incidencias-asiu.onrender.com/"})
    void correoApuntaALaIncidenciaEnElEntornoConfigurado(String frontend) throws Exception {
        ReflectionTestUtils.setField(emailService, "frontendUrl", frontend);
        MimeMessage message = crearMimeMessageMock();
        when(mailSender.createMimeMessage()).thenReturn(message);
        Usuario estudiante = new Usuario();
        estudiante.setCorreo("estudiante@example.com");
        Incidencia incidencia = new Incidencia();
        incidencia.setId(42);
        incidencia.setEstudiante(estudiante);
        emailService.enviarCorreoResolucionIncidencia(incidencia);
        message.saveChanges();
        assertTrue(extraerHtml(message).contains(frontend.replaceAll("/+$", "") + "/dashboard/mis-incidencias?calificar=42"));
    }

    @Test
    @DisplayName("enviarCorreoResolucionIncidencia: si estudiante es nulo no envía ni falla")
    void enviarCorreoResolucionIncidencia_estudianteNulo_noEnvia() {
        Incidencia incidencia = new Incidencia();
        incidencia.setId(1);

        emailService.enviarCorreoResolucionIncidencia(incidencia);

        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("enviarCorreoResolucionIncidencia: si ocurre excepción de envío la captura sin propagarla")
    void enviar_excepcionNoSePropaga() {
        when(mailSender.createMimeMessage()).thenReturn(crearMimeMessageMock());
        doThrow(new RuntimeException("SMTP connection refused")).when(mailSender).send(any(MimeMessage.class));

        Usuario estudiante = new Usuario();
        estudiante.setCorreo("alumno@universidad.edu.pe");
        Incidencia incidencia = new Incidencia();
        incidencia.setEstudiante(estudiante);

        // No debe lanzar excepción
        emailService.enviarCorreoResolucionIncidencia(incidencia);

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }
}
