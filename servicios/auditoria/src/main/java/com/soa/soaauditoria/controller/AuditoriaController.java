package com.soa.soaauditoria.controller;

import com.soa.soaauditoria.entity.AuditoriaLog;
import com.soa.soaauditoria.service.AuditoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auditoria")
public class AuditoriaController {

    @Autowired
    private AuditoriaService auditoriaService;

    @PostMapping
    public ResponseEntity<AuditoriaLog> registrarAuditoria(@RequestBody AuditoriaLog log) {
        return ResponseEntity.ok(auditoriaService.registrarAuditoria(log));
    }

    @GetMapping
    public ResponseEntity<List<AuditoriaLog>> obtenerAuditoria() {
        return ResponseEntity.ok(auditoriaService.obtenerTodos());
    }
}
