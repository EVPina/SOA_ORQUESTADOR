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
    private final WebClient qrWebClient;
    private final WebClient clientesWebClient;
    private final WebClient ventasWebClient;

    public Mono<Map<String, Object>> healthCheck() {
        return Mono.zip(
            checkService(usuariosWebClient, "usuarios"),
            checkService(qrWebClient, "qr"),
            checkService(clientesWebClient, "clientes"),
            checkService(ventasWebClient, "ventas")
        ).map(tuple -> {
            Map<String, Object> health = new HashMap<>();
            health.put("orquestador", "UP");
            health.putAll(tuple.getT1());
            health.putAll(tuple.getT2());
            health.putAll(tuple.getT3());
            health.putAll(tuple.getT4());
            health.put("timestamp", LocalDateTime.now());
            return health;
        });
    }

    private Mono<Map<String, Object>> checkService(WebClient client, String name) {
        return client.get()
            .uri("/actuator/health")
            .retrieve()
            .bodyToMono(Map.class)
            .map(r -> {
                Map<String, Object> result = new HashMap<>();
                result.put(name, "UP");
                return result;
            })
            .onErrorResume(e -> {
                Map<String, Object> result = new HashMap<>();
                result.put(name, "DOWN - " + e.getMessage());
                return Mono.just(result);
            });
    }

    public Mono<Map<String, Object>> workflowEjemplo(Map<String, Object> request) {
        log.info("Ejecutando workflow de ejemplo: {}", request);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Workflow ejecutado");
        response.put("timestamp", LocalDateTime.now());
        
        return Mono.just(response);
    }
}