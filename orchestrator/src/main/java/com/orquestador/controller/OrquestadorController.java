package com.orquestador.controller;

import com.orquestador.service.OrquestadorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/orquestador")
@RequiredArgsConstructor
@Slf4j  // ← ESTA ANOTACIÓN ES NECESARIA
public class OrquestadorController {

    private final OrquestadorService orquestadorService;

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("Orquestador funcionando correctamente");
    }

    @GetMapping("/health")
    public Mono<ResponseEntity<Map<String, Object>>> health() {
        return orquestadorService.healthCheck()
            .map(ResponseEntity::ok);
    }

    @PostMapping("/workflow-ejemplo")
    public Mono<Map<String, Object>> workflowEjemplo(@RequestBody Map<String, Object> request) {
        log.info("Ejecutando workflow de ejemplo: {}", request);  // ← log funciona con @Slf4j
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Workflow ejecutado correctamente");
        response.put("dataRecibida", request);
        response.put("timestamp", LocalDateTime.now());
        
        return Mono.just(response);
    }
}