package com.orquestador.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrquestadorService {

    private final WebClient usuariosWebClient;
    private final WebClient ventasWebClient;
    private final WebClient qrWebClient;

    public Mono<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("orquestador", "UP");
        health.put("timestamp", LocalDateTime.now());
        health.put("mensaje", "Orquestador funcionando");
        
        return Mono.just(health);
    }

    public Mono<Map<String, Object>> workflowEjemplo(Map<String, Object> request) {
        log.info("Ejecutando workflow de ejemplo: {}", request);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Workflow ejecutado correctamente");
        response.put("dataRecibida", request);
        response.put("timestamp", LocalDateTime.now());
        
        return Mono.just(response);
    }
}