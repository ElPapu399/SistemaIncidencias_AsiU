package com.proyecto.incidenciasback.service;

import com.proyecto.incidenciasback.dto.NotificacionResponse;
import com.proyecto.incidenciasback.model.Incidencia;
import com.proyecto.incidenciasback.model.Notificacion;
import com.proyecto.incidenciasback.model.Usuario;
import com.proyecto.incidenciasback.repository.NotificacionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;

    public NotificacionService(NotificacionRepository notificacionRepository) {
        this.notificacionRepository = notificacionRepository;
    }

    @Transactional
    public void crearNotificacion(Usuario usuario, String tipo, String titulo, String mensaje, Incidencia incidencia) {
        if (usuario == null) {
            return;
        }
        Notificacion notif = new Notificacion();
        notif.setUsuario(usuario);
        notif.setTipo(tipo);
        notif.setTitulo(titulo);
        notif.setMensaje(mensaje);
        notif.setIncidencia(incidencia);
        notif.setLeida(false);
        notificacionRepository.save(notif);
    }

    @Transactional(readOnly = true)
    public List<NotificacionResponse> listarPorUsuario(Integer usuarioId) {
        return notificacionRepository.findTop30ByUsuarioIdOrderByFechaCreacionDesc(usuarioId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long contarNoLeidas(Integer usuarioId) {
        return notificacionRepository.countByUsuarioIdAndLeidaFalse(usuarioId);
    }

    @Transactional
    public void marcarComoLeida(Integer notificacionId, Integer usuarioId) {
        notificacionRepository.marcarComoLeida(notificacionId, usuarioId);
    }

    @Transactional
    public void marcarTodasComoLeidas(Integer usuarioId) {
        notificacionRepository.marcarTodasComoLeidas(usuarioId);
    }

    private NotificacionResponse toResponse(Notificacion n) {
        return new NotificacionResponse(
                n.getId(),
                n.getUsuario() != null ? n.getUsuario().getId() : null,
                n.getTipo(),
                n.getTitulo(),
                n.getMensaje(),
                n.getIncidencia() != null ? n.getIncidencia().getId() : null,
                n.getIncidencia() != null ? n.getIncidencia().getCodigoTicket() : null,
                n.isLeida(),
                n.getFechaCreacion()
        );
    }
}

