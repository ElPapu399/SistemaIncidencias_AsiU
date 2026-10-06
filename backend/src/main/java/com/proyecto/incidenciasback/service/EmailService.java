package com.proyecto.incidenciasback.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final Resend resend;

    @Value("${app.mail.from:onboarding@resend.dev}")
    private String fromEmail;

    public EmailService(@Value("${resend.api-key:re_placeholder}") String apiKey) {
        this.resend = new Resend(apiKey);
    }

    /**
     * Envía el código de verificación por correo electrónico usando Resend (HTTPS).
     * Se ejecuta en un hilo separado (@Async) para no bloquear la respuesta HTTP del usuario.
     */
    @Async
    public void enviarCodigoRecuperacion(String destinatario, String codigo) {
        try {
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
                """.formatted(codigo);

            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(destinatario)
                    .subject("ASIU – Código de recuperación de contraseña")
                    .html(html)
                    .build();

            resend.emails().send(params);
            log.info("Código de recuperación enviado con éxito a {}", destinatario);

        } catch (ResendException e) {
            log.error("Error al enviar correo de recuperación a {}: {}", destinatario, e.getMessage());
        }
    }
}
