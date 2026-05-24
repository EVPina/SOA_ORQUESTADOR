package com.orquestador.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class OrquestadorService {

    private final WebClient usuariosWebClient;
    private final WebClient ventasWebClient;
    private final WebClient qrWebClient;

    public OrquestadorService(WebClient usuariosWebClient, 
                               WebClient ventasWebClient, 
                               WebClient qrWebClient) {
        this.usuariosWebClient = usuariosWebClient;
        this.ventasWebClient = ventasWebClient;
        this.qrWebClient = qrWebClient;
    }

    public Mono<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("orquestador", "UP");
        health.put("mensaje", "Orquestador funcionando");
        health.put("timestamp", LocalDateTime.now());
        return Mono.just(health);
    }

    public Mono<Map<String, Object>> workflowEjemplo(Map<String, Object> request) {
        System.out.println("Ejecutando workflow de ejemplo: " + request);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Workflow ejecutado correctamente");
        response.put("dataRecibida", request);
        response.put("timestamp", LocalDateTime.now());
        
        return Mono.just(response);
    }
}