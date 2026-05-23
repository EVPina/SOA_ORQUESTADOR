package com.orquestador.controller;

import com.orquestador.service.OrquestadorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/orquestador")
@RequiredArgsConstructor
public class OrquestadorController {

    private final OrquestadorService orquestadorService;

    @GetMapping("/health")
    public Mono<ResponseEntity<Map<String, Object>>> health() {
        return orquestadorService.healthCheck()
            .map(ResponseEntity::ok);
    }

    @PostMapping("/workflow/ejemplo")
    public Mono<ResponseEntity<Map<String, Object>>> workflowEjemplo(@RequestBody Map<String, Object> request) {
        return orquestadorService.workflowEjemplo(request)
            .map(ResponseEntity::ok);
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("Orquestador funcionando");
    }
}