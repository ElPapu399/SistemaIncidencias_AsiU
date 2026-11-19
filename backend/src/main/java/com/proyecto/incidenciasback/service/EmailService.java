package com.proyecto.incidenciasback.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.proyecto.incidenciasback.model.Incidencia;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

  private static final Logger log = LoggerFactory.getLogger(EmailService.class);

  private final JavaMailSender mailSender;
  private final ObjectMapper objectMapper;
  private final HttpClient httpClient;

  @Value("${brevo.api-key:}")
  private String brevoApiKey;

  @Value("${spring.mail.password:}")
  private String mailPassword;

  @Value("${app.mail.from:${spring.mail.username:soporte.asiu@gmail.com}}")
  private String fromEmail;

  @Value("${app.frontend.url:https://sistema-incidencias-asiu.onrender.com}")
  private String frontendUrl;

  public EmailService(JavaMailSender mailSender, ObjectMapper objectMapper) {
    this.mailSender = mailSender;
    this.objectMapper = objectMapper;
    this.httpClient = HttpClient.newHttpClient();
  }

  @Async
  public void enviarCodigoRecuperacion(String destinatario, String codigo) {
    String html = """
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #facc15, #f97316); padding: 12px 18px; border-radius: 12px;">
              <span style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: 1px;">ASIU</span>
            </div>
          </div>
          <h2 style="color: #1e293b; text-align: center; margin-bottom: 8px;">Recuperación de contraseña</h2>
          <p style="color: #64748b; text-align: center; font-size: 14px; margin-bottom: 24px;">
            Usa el siguiente código para restablecer tu contraseña. Este código expira en <strong>15 minutos</strong>.
          </p>
          <div style="background: #0f172a; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #facc15;">%s</span>
          </div>
          <p style="color: #94a3b8; text-align: center; font-size: 12px;">
            Si no solicitaste este cambio, puedes ignorar este correo de manera segura.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          <p style="color: #94a3b8; text-align: center; font-size: 11px;">
            Sistema de Incidencias Universitarias &middot; ASIU
          </p>
        </div>
        """
        .formatted(codigo);

    enviar(destinatario, "ASIU – Código de recuperación de contraseña", html);
  }

  @Async
  public void enviarCorreoResolucionIncidencia(Incidencia incidencia) {
    if (incidencia.getEstudiante() == null || incidencia.getEstudiante().getCorreo() == null) {
      log.warn("No se pudo enviar correo de resolución: estudiante o correo nulo para incidencia {}",
          incidencia.getId());
      return;
    }

    String destinatario = incidencia.getEstudiante().getCorreo();
    String nombreEstudiante = incidencia.getEstudiante().getNombre() != null
        ? (incidencia.getEstudiante().getNombre()
            + (incidencia.getEstudiante().getApellido() != null ? " " + incidencia.getEstudiante().getApellido() : ""))
        : "Estudiante";
    String ticket = incidencia.getCodigoTicket() != null ? incidencia.getCodigoTicket() : ("INC-" + incidencia.getId());
    String titulo = incidencia.getTitulo() != null ? incidencia.getTitulo() : "Incidencia";
    String tecnico = (incidencia.getTecnico() != null && incidencia.getTecnico().getNombre() != null)
        ? (incidencia.getTecnico().getNombre()
            + (incidencia.getTecnico().getApellido() != null ? " " + incidencia.getTecnico().getApellido() : ""))
        : "Equipo técnico ASIU";
    String fecha = incidencia.getFechaCierre() != null
        ? incidencia.getFechaCierre().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
        : DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").format(java.time.LocalDateTime.now());
    String solucion = (incidencia.getSolucionTecnica() != null && !incidencia.getSolucionTecnica().isBlank())
        ? incidencia.getSolucionTecnica()
        : "Solución implementada por el equipo técnico.";

    String calificarUrl = (frontendUrl != null ? frontendUrl.replaceAll("/+$", "")
        : "https://sistema-incidencias-asiu.onrender.com")
        + "/dashboard/mis-incidencias";

    String html = """
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #facc15, #f97316); padding: 12px 18px; border-radius: 12px;">
              <span style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: 1px;">ASIU</span>
            </div>
          </div>
          <h2 style="color: #1e293b; text-align: center; margin-bottom: 8px;">&#10003; Tu incidencia fue resuelta</h2>
          <p style="color: #64748b; text-align: center; font-size: 14px; margin-bottom: 24px;">
            Hola <strong>%s</strong>, tu ticket ha sido marcado como resuelto. Por favor ingresa al sistema y <strong>califica la atención recibida</strong> para cerrar el ticket.
          </p>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="color: #94a3b8; padding: 6px 0; width: 40%%;">Ticket</td>
                <td style="color: #0f172a; font-weight: 600; padding: 6px 0;">%s</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; padding: 6px 0;">Incidencia</td>
                <td style="color: #0f172a; padding: 6px 0;">%s</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; padding: 6px 0;">Técnico</td>
                <td style="color: #0f172a; padding: 6px 0;">%s</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; padding: 6px 0;">Resuelta el</td>
                <td style="color: #0f172a; padding: 6px 0;">%s</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; padding: 6px 0;">Solución aplicada</td>
                <td style="color: #0f172a; padding: 6px 0;">%s</td>
              </tr>
            </table>
          </div>
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="%s" style="display: inline-block; background: linear-gradient(135deg, #facc15, #f97316); color: #0f172a; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 12px;">
              Calificar atención &rarr;
            </a>
          </div>
          <p style="color: #94a3b8; text-align: center; font-size: 12px;">
            Sin tu calificación el ticket permanece abierto. Si ya lo calificaste, puedes ignorar este mensaje.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          <p style="color: #94a3b8; text-align: center; font-size: 11px;">
            Sistema de Incidencias Universitarias &middot; ASIU
          </p>
        </div>
        """
        .formatted(nombreEstudiante, ticket, titulo, tecnico, fecha, solucion, calificarUrl);

    enviar(destinatario, "ASIU – Tu ticket " + ticket + " fue resuelto — Califica la atención", html);
  }

  private void enviar(String destinatario, String asunto, String html) {
    String apiKey = (brevoApiKey != null && !brevoApiKey.isBlank()) ? brevoApiKey.trim() : "";
    if (apiKey.isBlank() && mailPassword != null && mailPassword.trim().startsWith("xkeysib-")) {
      apiKey = mailPassword.trim();
    }

    // Si tenemos clave de API de Brevo, usamos HTTP (puerto 443 HTTPS - nunca
    // bloqueado en Render/Railway)
    if (!apiKey.isBlank()) {
      enviarViaBrevoHttp(destinatario, asunto, html, apiKey);
      return;
    }

    // Si no hay API key, intentamos SMTP tradicional
    enviarViaSmtp(destinatario, asunto, html);
  }

  private void enviarViaBrevoHttp(String destinatario, String asunto, String html, String apiKey) {
    try {
      if (fromEmail == null || fromEmail.isBlank()) {
        log.warn("No se pudo enviar correo a {}: remitente 'app.mail.from' no configurado", destinatario);
        return;
      }
      Map<String, Object> payload = Map.of(
          "sender", Map.of("name", "Sistema ASIU", "email", fromEmail.trim()),
          "to", List.of(Map.of("email", destinatario.trim())),
          "subject", asunto,
          "htmlContent", html);
      String json = objectMapper.writeValueAsString(payload);

      HttpRequest request = HttpRequest.newBuilder()
          .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
          .header("api-key", apiKey)
          .header("Content-Type", "application/json")
          .header("Accept", "application/json")
          .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
          .build();

      HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

      if (response.statusCode() >= 200 && response.statusCode() < 300) {
        log.info("Correo enviado con éxito vía Brevo API a {}: {}", destinatario, asunto);
      } else {
        log.error("Brevo API respondió con error ({}) al enviar a {}: {}", response.statusCode(), destinatario,
            response.body());
      }
    } catch (Exception e) {
      log.error("Error al conectar con Brevo API para {} ({}): {}", destinatario, asunto, e.getMessage());
    }
  }

  private void enviarViaSmtp(String destinatario, String asunto, String html) {
    try {
      if (fromEmail == null || fromEmail.isBlank()) {
        log.warn("No se pudo enviar correo a {}: remitente 'app.mail.from' no configurado", destinatario);
        return;
      }
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
      helper.setFrom(fromEmail, "Sistema ASIU");
      helper.setTo(destinatario);
      helper.setSubject(asunto);
      helper.setText(html, true);
      mailSender.send(message);
      log.info("Correo enviado exitosamente vía SMTP a {}: {}", destinatario, asunto);
    } catch (Exception e) {
      log.error("Error al enviar correo vía SMTP a {} ({}): {}", destinatario, asunto, e.getMessage());
    }
  }
}
