package com.proyecto.incidenciasback.storage;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageException;
import com.google.cloud.storage.StorageOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import java.io.IOException;
import java.io.InputStream;

@Component
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "gcs")
public class GcsAdjuntoStorage implements AdjuntoStorage {
    private static final Logger log = LoggerFactory.getLogger(GcsAdjuntoStorage.class);
    private final Storage storage;
    private final String bucket;

    @Autowired
    public GcsAdjuntoStorage(@Value("${app.storage.bucket:}") String bucket) {
        this(bucket, cliente(bucket));
    }

    // Permite probar el almacenamiento sin credenciales ni llamadas reales a Google.
    GcsAdjuntoStorage(String bucket, Storage storage) {
        if (bucket == null || bucket.isBlank()) throw new IllegalArgumentException("Configura GCS_BUCKET para guardar los adjuntos en Google Cloud");
        this.bucket = bucket.trim();
        this.storage = storage;
    }

    private static Storage cliente(String bucket) {
        if (bucket == null || bucket.isBlank()) throw new IllegalArgumentException("Falta configurar GCS_BUCKET");
        // ADC usa GOOGLE_APPLICATION_CREDENTIALS, tanto con JSON como con OIDC.
        return StorageOptions.getDefaultInstance().getService();
    }

    private ResponseStatusException fallo(String operacion, StorageException e) {
        log.error("Cloud Storage: fallo al {} un adjunto (código {})", operacion, e.getCode(), e);
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "No se pudo acceder al almacenamiento de adjuntos. Revisa la configuración de Cloud Storage.", e);
    }

    @Override
    public void guardar(String nombre, InputStream contenido, String contentType) throws IOException {
        BlobInfo info = BlobInfo.newBuilder(bucket, nombre)
                .setContentType(contentType == null ? "application/octet-stream" : contentType).build();
        try {
            storage.createFrom(info, contenido, 2 * 1024 * 1024, Storage.BlobWriteOption.doesNotExist());
        } catch (StorageException e) {
            throw fallo("guardar", e);
        }
    }

    @Override
    public Resource cargar(String nombre) {
        try {
            return new ByteArrayResource(storage.readAllBytes(BlobId.of(bucket, nombre)));
        } catch (StorageException e) {
            if (e.getCode() == 404) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Archivo no encontrado");
            throw fallo("leer", e);
        }
    }

    @Override
    public void eliminar(String nombre) {
        try {
            storage.delete(BlobId.of(bucket, nombre));
        } catch (StorageException e) {
            throw fallo("eliminar", e);
        }
    }
}
