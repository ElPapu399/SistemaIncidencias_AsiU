package com.proyecto.incidenciasback.storage;

import org.springframework.core.io.Resource;
import java.io.IOException;
import java.io.InputStream;

public interface AdjuntoStorage {
    void guardar(String nombre, InputStream contenido, String contentType) throws IOException;
    Resource cargar(String nombre);
    void eliminar(String nombre);
}
