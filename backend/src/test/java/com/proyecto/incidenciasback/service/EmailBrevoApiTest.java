package com.proyecto.incidenciasback.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

public class EmailBrevoApiTest {

    @Test
    @DisplayName("Prueba local de envío con Brevo API HTTP (Puerto 443)")
    void testEnvioApiBrevo() throws Exception {
        String apiKey = System.getenv("BREVO_API_KEY");
        String from = System.getenv("MAIL_FROM");
        String to = System.getenv("MAIL_TO");

        if (apiKey == null || apiKey.isBlank()) {
            System.out.println("=================================================================");
            System.out.println("⚠️  Falta la clave BREVO_API_KEY.");
            System.out.println("Ejecuta en tu terminal:");
            System.out.println("BREVO_API_KEY=\"xkeysib-...\" MAIL_FROM=\"tu_correo_brevo@gmail.com\" MAIL_TO=\"tu_correo_destino@gmail.com\" ./mvnw test -Dtest=EmailBrevoApiTest");
            System.out.println("=================================================================");
            return;
        }

        if (from == null || from.isBlank()) {
            System.out.println("⚠️ Falta MAIL_FROM (debe ser el correo con el que te registraste en Brevo)");
            return;
        }
        if (to == null || to.isBlank()) {
            to = from;
        }

        System.out.println("\n>>> Probando Brevo API HTTP con:");
        System.out.println(">>> Remitente (FROM): " + from);
        System.out.println(">>> Destinatario (TO): " + to);
        System.out.println(">>> API Key: " + apiKey.substring(0, Math.min(10, apiKey.length())) + "...\n");

        ObjectMapper objectMapper = new ObjectMapper();
        Map<String, Object> payload = Map.of(
                "sender", Map.of("name", "Sistema ASIU (Prueba API)", "email", from.trim()),
                "to", List.of(Map.of("email", to.trim())),
                "subject", "Prueba Brevo API HTTP exitosa",
                "htmlContent", "<h3>¡La API HTTP de Brevo funciona perfectamente!</h3><p>Este correo se envió por HTTPS (Puerto 443).</p>"
        );
        String json = objectMapper.writeValueAsString(payload);

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                .header("api-key", apiKey.trim())
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(">>> Código de respuesta HTTP: " + response.statusCode());
        System.out.println(">>> Respuesta de Brevo: " + response.body() + "\n");

        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            System.out.println("✅ ¡CORREO ENVIADO CON ÉXITO VÍA BREVO API!");
        } else {
            System.out.println("❌ ERROR AL ENVIAR CON BREVO API. Revisa el mensaje arriba.");
        }
    }
}
