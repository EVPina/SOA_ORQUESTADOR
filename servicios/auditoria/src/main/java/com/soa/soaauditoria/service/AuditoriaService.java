package com.soa.soaauditoria.service;

import com.soa.soaauditoria.entity.AuditoriaLog;
import com.soa.soaauditoria.repository.AuditoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AuditoriaService {

    @Autowired
    private AuditoriaRepository auditoriaRepository;

    public AuditoriaLog registrarAuditoria(AuditoriaLog log) {
        return auditoriaRepository.save(log);
    }

    public List<AuditoriaLog> obtenerTodos() {
        return auditoriaRepository.findAll();
    }
}
