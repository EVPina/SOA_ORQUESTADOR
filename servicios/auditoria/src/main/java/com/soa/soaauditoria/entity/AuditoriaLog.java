package com.soa.soaauditoria.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "auditoria_logs")
@Data
public class AuditoriaLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "usuario_id")
    private String usuarioId;

    private String rol;

    private String accion;

    @Column(name = "microservicio_origen")
    private String microservicioOrigen;

    @Column(name = "entidad_afectada")
    private String entidadAfectada;

    @Column(name = "entidad_id")
    private String entidadId;

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    @Column(name = "ip_origen")
    private String ipOrigen;

    private String estado;
    
    private String detalles;

    @PrePersist
    protected void onCreate() {
        if (fechaHora == null) {
            fechaHora = LocalDateTime.now();
        }
    }
}
