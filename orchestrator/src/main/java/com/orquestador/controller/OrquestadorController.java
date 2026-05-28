package com.orquestador.controller;

import com.orquestador.dto.PedidoRequestDTO;
import com.orquestador.dto.PagoRequestDTO;
import com.orquestador.dto.ApiResponseDTO;
import com.orquestador.service.OrquestadorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/orquestador")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrquestadorController {

    private final OrquestadorService orquestadorService;

    // ==================== FLUJO 1: PEDIDO DESDE QR ====================
    
    @PostMapping("/pedido/qr")
    public Mono<ResponseEntity<ApiResponseDTO<Map<String, Object>>>> pedidoQR(@RequestBody PedidoRequestDTO request) {
        return orquestadorService.flujoPedidoQR(request)
            .map(response -> {
                if (Boolean.TRUE.equals(response.get("success"))) {
                    return ResponseEntity.ok(ApiResponseDTO.success("Pedido creado exitosamente", response));
                } else {
                    return ResponseEntity.badRequest().body(ApiResponseDTO.error((String) response.get("error")));
                }
            });
    }

    // ==================== FLUJO 2: CAMBIO DE ESTADO EN COCINA ====================
    
    @PatchMapping("/cocina/detalle/{detalleId}/estado")
    public Mono<ResponseEntity<ApiResponseDTO<Map<String, Object>>>> cambiarEstadoCocina(
            @PathVariable UUID detalleId,
            @RequestParam String estado,
            @RequestParam UUID usuarioId) {
        return orquestadorService.flujoCambioEstadoCocina(detalleId, estado, usuarioId)
            .map(response -> {
                if (Boolean.TRUE.equals(response.get("success"))) {
                    return ResponseEntity.ok(ApiResponseDTO.success("Estado actualizado", response));
                } else {
                    return ResponseEntity.badRequest().body(ApiResponseDTO.error((String) response.get("error")));
                }
            });
    }

    // ==================== FLUJO 3: PAGO ====================
    
    @PostMapping("/pago")
    public Mono<ResponseEntity<ApiResponseDTO<Map<String, Object>>>> registrarPago(@RequestBody PagoRequestDTO request) {
        return orquestadorService.flujoPago(request)
            .map(response -> {
                if (Boolean.TRUE.equals(response.get("success"))) {
                    return ResponseEntity.ok(ApiResponseDTO.success("Pago registrado", response));
                } else {
                    return ResponseEntity.badRequest().body(ApiResponseDTO.error((String) response.get("error")));
                }
            });
    }

    // ==================== HEALTH CHECK ====================
    
    @GetMapping("/health")
    public Mono<ResponseEntity<Map<String, Object>>> health() {
        return orquestadorService.healthCheck()
            .map(ResponseEntity::ok);
    }
    
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("Orquestador funcionando correctamente");
    }
}