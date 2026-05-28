package com.orquestador.service;

import com.orquestador.dto.PedidoRequestDTO;
import com.orquestador.dto.PagoRequestDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrquestadorService {

    private final WebClient usuariosWebClient;
    private final WebClient ventasWebClient;
    private final WebClient cocinaWebClient;
    private final WebClient inventarioWebClient;
    private final WebClient finanzasWebClient;
    private final WebClient qrWebClient;

    // ==================== FLUJO 1: PEDIDO DESDE QR ====================
    public Mono<Map<String, Object>> flujoPedidoQR(PedidoRequestDTO request) {
    log.info("Iniciando flujo de pedido desde QR: {}", request);
    
    List<Map<String, Object>> items = request.getItems();
    
    // Paso 1: Registrar/Autenticar cliente (opcional)
    // Paso 1: Registrar/Autenticar cliente (CORREGIDO COMPLETO)
    Mono<Map<String, Object>> clienteMono;
    if (request.getClienteEmail() != null && !request.getClienteEmail().isEmpty()) {
        
        // Datos para REGISTRO
        Map<String, Object> registerData = new HashMap<>();
        registerData.put("username", request.getClienteEmail());
        registerData.put("email", request.getClienteEmail());
        registerData.put("password", "123456");
        registerData.put("nombreCompleto", request.getClienteNombre());
        registerData.put("rol", "CLIENTE");
        
        // Datos para LOGIN (cuando el usuario ya existe)
        Map<String, Object> loginData = new HashMap<>();
        loginData.put("username", request.getClienteEmail());
        loginData.put("password", "123456");
        
        clienteMono = usuariosWebClient.post()
            .uri("/api/auth/register")
            .bodyValue(registerData)
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
            .onErrorResume(e -> {
                log.warn("Usuario ya existe, intentando login: {}", request.getClienteEmail());
                return usuariosWebClient.post()
                    .uri("/api/auth/login")
                    .bodyValue(loginData)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
            });
    } else {
        Map<String, Object> anonimo = new HashMap<>();
        anonimo.put("id", "anonimo-" + System.currentTimeMillis());
        anonimo.put("tipo", "ANONIMO");
        clienteMono = Mono.just(anonimo);
    }
    
    return clienteMono
    .flatMap(cliente -> {
        // Paso 2: Verificar stock para cada item
        return Flux.fromIterable(items)
            .flatMap(item -> {
                Object productoIdObj = item.get("productoId");
                UUID productoId = productoIdObj instanceof String ? UUID.fromString((String) productoIdObj) : (UUID) productoIdObj;
                Integer cantidad = item.get("cantidad") instanceof Integer ? (Integer) item.get("cantidad") : Integer.parseInt(item.get("cantidad").toString());
                
                Map<String, Object> verificarRequest = new HashMap<>();
                verificarRequest.put("productoId", productoId);
                verificarRequest.put("cantidad", cantidad);
                verificarRequest.put("usuarioId", UUID.fromString("11111111-1111-1111-1111-111111111111"));
                
                log.info("Verificando stock: producto={}, cantidad={}", productoId, cantidad);
                
                return inventarioWebClient.post()
                    .uri("/api/v1/produccion/verificar")
                    .bodyValue(verificarRequest)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .doOnNext(verificacion -> {
                        Boolean disponible = (Boolean) verificacion.getOrDefault("disponible", false);
                        if (!disponible) {
                            throw new RuntimeException("Stock insuficiente para producto: " + productoId);
                        }
                    });
            })
            .then(Mono.just(cliente));  // ← IMPORTANTE: Mantiene el cliente después de verificar stock
    })
    .flatMap(cliente -> {
        // Paso 3: Crear pedido en ventas
        Object clienteIdObj = cliente.get("id");
        UUID clienteId = clienteIdObj instanceof String ? UUID.fromString((String) clienteIdObj) : (UUID) clienteIdObj;
        
        Map<String, Object> pedidoRequest = new HashMap<>();
        pedidoRequest.put("clienteId", clienteId);
        pedidoRequest.put("items", items);
        pedidoRequest.put("total", request.getTotal());
        
        return ventasWebClient.post()
            .uri("/api/v1/pedidos")
            .bodyValue(pedidoRequest)
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
    })
    .flatMap(pedido -> {
        // Paso 4: Enviar a cocina
        Map<String, Object> detalleRequest = new HashMap<>();
        detalleRequest.put("ordenId", pedido.get("id"));
        detalleRequest.put("productos", items);
        detalleRequest.put("estado", "PENDIENTE");
        
        return cocinaWebClient.post()
            .uri("/api/v1/detalles-produccion")
            .bodyValue(detalleRequest)
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
            .map(respuesta -> {
                Map<String, Object> resultado = new HashMap<>();
                resultado.put("success", true);
                resultado.put("pedidoId", pedido.get("id"));
                resultado.put("detalleId", respuesta.get("id"));
                resultado.put("mensaje", "Pedido enviado a cocina");
                resultado.put("tiempoEstimado", "25 minutos");
                resultado.put("timestamp", LocalDateTime.now());
                return resultado;
            });
    })
    
        .flatMap(cliente -> {
            // Paso 3: Crear pedido en ventas
            Object clienteIdObj = cliente.get("id");
            UUID clienteId = clienteIdObj instanceof String ? UUID.fromString((String) clienteIdObj) : (UUID) clienteIdObj;
            
            Map<String, Object> pedidoRequest = new HashMap<>();
            pedidoRequest.put("clienteId", clienteId);
            pedidoRequest.put("items", items);
            pedidoRequest.put("total", request.getTotal());
            
            return ventasWebClient.post()
                .uri("/api/v1/pedidos")
                .bodyValue(pedidoRequest)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
        })
        .flatMap(pedido -> {
            // Paso 4: Enviar a cocina
            Map<String, Object> detalleRequest = new HashMap<>();
            detalleRequest.put("ordenId", pedido.get("id"));
            detalleRequest.put("productos", items);
            detalleRequest.put("estado", "PENDIENTE");
            
            return cocinaWebClient.post()
                .uri("/api/v1/detalles-produccion")
                .bodyValue(detalleRequest)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .map(respuesta -> {
                    Map<String, Object> resultado = new HashMap<>();
                    resultado.put("success", true);
                    resultado.put("pedidoId", pedido.get("id"));
                    resultado.put("detalleId", respuesta.get("id"));
                    resultado.put("mensaje", "Pedido enviado a cocina");
                    resultado.put("tiempoEstimado", "25 minutos");
                    resultado.put("timestamp", LocalDateTime.now());
                    return resultado;
                });
        })
        .onErrorResume(error -> {
            log.error("Error en flujo de pedido QR: {}", error.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", error.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now());
            return Mono.just(errorResponse);
        });
}
    // ==================== FLUJO 2: CAMBIO DE ESTADO EN COCINA ====================
    
    public Mono<Map<String, Object>> flujoCambioEstadoCocina(UUID detalleId, String nuevoEstado, UUID usuarioId) {
        log.info("Cambiando estado de detalle {} a {}", detalleId, nuevoEstado);
        
        return cocinaWebClient.patch()
            .uri("/api/v1/detalles-produccion/{detalleId}/estado", detalleId)
            .bodyValue(Map.of("nuevoEstado", nuevoEstado, "usuarioId", usuarioId))
            .retrieve()
            .bodyToMono(Map.class)
            .flatMap(detalleActualizado -> {
                Object ordenIdObj = detalleActualizado.get("ordenId");
                UUID ordenId = ordenIdObj instanceof String ? UUID.fromString((String) ordenIdObj) : (UUID) ordenIdObj;
                
                // Actualizar estado del pedido en ventas
                return ventasWebClient.patch()
                    .uri("/api/v1/pedidos/{id}/estado", ordenId)
                    .bodyValue(Map.of("estado", nuevoEstado))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .flatMap(pedido -> {
                        // Si está LISTO, descontar stock
                        if ("LISTO".equals(nuevoEstado)) {
                            return inventarioWebClient.post()
                                .uri("/api/v1/produccion/producir")
                                .bodyValue(Map.of("pedidoId", ordenId))
                                .retrieve()
                                .bodyToMono(Map.class)
                                .map(produccion -> Map.of("produccion", produccion));
                        }
                        return Mono.just(Map.of());
                    })
                    .map(resultado -> {
                        Map<String, Object> response = new HashMap<>();
                        response.put("success", true);
                        response.put("detalle", detalleActualizado);
                        response.put("mensaje", "Estado actualizado a: " + nuevoEstado);
                        response.put("timestamp", LocalDateTime.now());
                        if (!resultado.isEmpty()) {
                            response.put("produccion", resultado);
                        }
                        return response;
                    });
            })
            .onErrorResume(error -> {
                log.error("Error en cambio de estado: {}", error.getMessage());
                return Mono.just(Map.of(
                    "success", false,
                    "error", error.getMessage(),
                    "timestamp", LocalDateTime.now()
                ));
            });
    }

    // ==================== FLUJO 3: PAGO ====================
    
    public Mono<Map<String, Object>> flujoPago(PagoRequestDTO request) {
        log.info("Procesando pago para pedido: {}", request.getPedidoId());
        
        return ventasWebClient.get()
            .uri("/api/v1/pedidos/{id}", request.getPedidoId())
            .retrieve()
            .bodyToMono(Map.class)
            .flatMap(pedido -> {
                // Registrar pago en ventas
                Map<String, Object> pagoRequest = new HashMap<>();
                pagoRequest.put("pedidoId", request.getPedidoId());
                pagoRequest.put("monto", request.getMonto());
                pagoRequest.put("metodoPago", request.getMetodoPago());
                pagoRequest.put("referencia", request.getReferencia());
                
                return ventasWebClient.post()
                    .uri("/api/v1/pagos")
                    .bodyValue(pagoRequest)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .flatMap(pago -> {
                        // Generar comprobante
                        Map<String, Object> comprobanteRequest = new HashMap<>();
                        comprobanteRequest.put("pagoId", pago.get("id"));
                        comprobanteRequest.put("pedidoId", request.getPedidoId());
                        
                        return ventasWebClient.post()
                            .uri("/api/v1/comprobantes")
                            .bodyValue(comprobanteRequest)
                            .retrieve()
                            .bodyToMono(Map.class)
                            .flatMap(comprobante -> {
                                // Registrar ingreso en finanzas
                                return finanzasWebClient.post()
                                    .uri("/movimientos/ingreso")
                                    .bodyValue(Map.of(
                                        "monto", request.getMonto(),
                                        "descripcion", "Pago de pedido " + request.getPedidoId(),
                                        "metodoPago", request.getMetodoPago(),
                                        "referencia", pago.get("id")
                                    ))
                                    .retrieve()
                                    .bodyToMono(Map.class)
                                    .map(finanza -> {
                                        Map<String, Object> response = new HashMap<>();
                                        response.put("success", true);
                                        response.put("pedidoId", request.getPedidoId());
                                        response.put("pagoId", pago.get("id"));
                                        response.put("comprobanteId", comprobante.get("id"));
                                        response.put("mensaje", "Pago registrado exitosamente");
                                        response.put("timestamp", LocalDateTime.now());
                                        return response;
                                    });
                            });
                    });
            })
            .onErrorResume(error -> {
                log.error("Error en procesamiento de pago: {}", error.getMessage());
                return Mono.just(Map.of(
                    "success", false,
                    "error", error.getMessage(),
                    "timestamp", LocalDateTime.now()
                ));
            });
    }

    // ==================== HEALTH CHECK ====================
  public Mono<Map<String, Object>> healthCheck() {
    Map<String, Object> health = new HashMap<>();
    health.put("orquestador", "UP");
    health.put("mensaje", "Orquestador funcionando correctamente");
    health.put("timestamp", LocalDateTime.now());
    
    // Verificar cada servicio (opcional)
    return Mono.zip(
        checkService(usuariosWebClient, "usuarios", "/actuator/health"),
        checkService(ventasWebClient, "ventas", "/actuator/health"),
        checkService(cocinaWebClient, "cocina", "/actuator/health"),
        checkService(inventarioWebClient, "inventario", "/actuator/health"),
        checkService(finanzasWebClient, "finanzas", "/actuator/health")
    ).map(tuple -> {
        health.putAll(tuple.getT1());
        health.putAll(tuple.getT2());
        health.putAll(tuple.getT3());
        health.putAll(tuple.getT4());
        health.putAll(tuple.getT5());
        return health;
    }).onErrorReturn(health);
}

// Método auxiliar corregido
private Mono<Map<String, Object>> checkService(WebClient client, String name, String path) {
    return client.get()
        .uri(path)
        .retrieve()
        .bodyToMono(Map.class)
        .map(r -> {
            Map<String, Object> result = new HashMap<>();
            result.put(name, "UP");
            return result;
        })
        .onErrorResume(e -> {
            Map<String, Object> result = new HashMap<>();
            result.put(name, "DOWN");
            return Mono.just(result);
        });
}
}