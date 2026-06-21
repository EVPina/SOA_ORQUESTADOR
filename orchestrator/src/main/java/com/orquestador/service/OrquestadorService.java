package com.orquestador.service;
import org.springframework.http.MediaType;
import com.orquestador.dto.PedidoRequestDTO;
import com.orquestador.dto.AperturaCajaRequestDTO;
import com.orquestador.dto.AuthLoginRequestDTO;
import com.orquestador.dto.CierreCajaRequestDTO;
import com.orquestador.dto.PagoCompletoRequestDTO;
import com.orquestador.dto.PagoRequestDTO;
import com.orquestador.dto.PedidoMozoRequestDTO;
import com.orquestador.dto.PedidoQRRequestDTO;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Qualifier;
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
@Slf4j
public class OrquestadorService {

    private final WebClient usuariosWebClient;
    private final WebClient ventasWebClient;
    private final WebClient cocinaWebClient;
    private final WebClient inventarioWebClient;
    private final WebClient finanzasWebClient;
    private final WebClient clientesWebClient;
    private final WebClient mesasWebClient;
    private final WebClient qrWebClient;

     public OrquestadorService(
        @Qualifier("usuariosWebClient") WebClient usuariosWebClient,
        @Qualifier("ventasWebClient") WebClient ventasWebClient,
        @Qualifier("cocinaWebClient") WebClient cocinaWebClient,
        @Qualifier("inventarioWebClient") WebClient inventarioWebClient,
        @Qualifier("finanzasWebClient") WebClient finanzasWebClient,
        @Qualifier("clientesWebClient") WebClient clientesWebClient,
        @Qualifier("mesasWebClient") WebClient mesasWebClient,
        @Qualifier("qrWebClient") WebClient qrWebClient
    ) {
        this.usuariosWebClient = usuariosWebClient;
        this.ventasWebClient = ventasWebClient;
        this.cocinaWebClient = cocinaWebClient;
        this.inventarioWebClient = inventarioWebClient;
        this.finanzasWebClient = finanzasWebClient;
        this.clientesWebClient = clientesWebClient;
        this.mesasWebClient = mesasWebClient;
        this.qrWebClient = qrWebClient;
    }

     // ==================== FLUJO PEDIDO QR ====================
    
    public Mono<Map<String, Object>> procesarPedidoQR(PedidoQRRequestDTO request) {
        log.info("Procesando pedido QR para mesa: {}", request.getMesaId());
        
        // Paso 1: Buscar o registrar cliente
        return buscarOCrearCliente(request.getClienteEmail(), request.getClienteNombre(), request.getClienteTelefono())
            .flatMap(cliente -> ocuparMesa(request.getMesaId()).thenReturn(cliente))
            .flatMap(cliente -> verificarStockItems(request.getItems()).thenReturn(cliente))
            .flatMap(cliente -> {
                UUID clienteId = extractClienteId(cliente);
                return crearPedidoEnVentas(request, clienteId);
            })
            .flatMap(pedido -> enviarOrdenACocina(pedido, request.getItems()))
            .onErrorResume(error -> {
                log.error("Error en pedido QR: {}", error.getMessage());
                return Mono.just(Map.of(
                    "success", false,
                    "error", error.getMessage(),
                    "timestamp", LocalDateTime.now()
                ));
            });
    }

    // ==================== FLUJO PEDIDO MOZO ====================
    
    public Mono<Map<String, Object>> procesarPedidoMozo(PedidoMozoRequestDTO request) {
        log.info("Procesando pedido asistido por mozo para mesa: {}", request.getMesaId());
        
        return clientesWebClient.get()
                .uri("/clientes/{id}", request.getClienteId())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
            .flatMap(cliente -> ocuparMesa(request.getMesaId()).thenReturn(cliente))
            .flatMap(cliente -> verificarStockItems(request.getItems()).thenReturn(cliente))
            .flatMap(cliente -> {
                return crearPedidoEnVentasMozo(request);
            })
            .flatMap(pedido -> enviarOrdenACocina(pedido, request.getItems()))
            .onErrorResume(error -> {
                log.error("Error en pedido mozo: {}", error.getMessage());
                return Mono.just(Map.of(
                    "success", false,
                    "error", error.getMessage(),
                    "timestamp", LocalDateTime.now()
                ));
            });
    }

    // ==================== MÉTODOS AUXILIARES ====================
    
    private Mono<Map<String, Object>> buscarOCrearCliente(String email, String nombre, String telefono) {
        if (email == null || email.isEmpty()) {
            Map<String, Object> anonimo = new HashMap<>();
            anonimo.put("id", "anonimo-" + System.currentTimeMillis());
            return Mono.just(anonimo);
        }
        
        return clientesWebClient.get()
                .uri("/clientes/buscar?valor={email}", email)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .onErrorResume(error -> {
                    Map<String, Object> nuevoCliente = new HashMap<>();
                    nuevoCliente.put("email", email);
                    nuevoCliente.put("nombre", nombre);
                    nuevoCliente.put("telefono", telefono);
                    nuevoCliente.put("password", "123456");
                    return clientesWebClient.post()
                            .uri("/clientes/registro")
                            .bodyValue(nuevoCliente)
                            .retrieve()
                            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
                });
    }

    private Mono<Void> ocuparMesa(UUID mesaId) {
        return mesasWebClient.put()
                .uri("/mesas/{id}/asignar", mesaId)
                .retrieve()
                .toBodilessEntity()
                .then();
    }

    private Mono<Void> verificarStockItems(List<Map<String, Object>> items) {
        if (items == null || items.isEmpty()) {
            return Mono.empty();
        }
        
        return Flux.fromIterable(items)
                .flatMap(item -> {
                    String productoId = (String) item.get("productoId");
                    Integer cantidad = (Integer) item.get("cantidad");
                    
                    Map<String, Object> stockRequest = new HashMap<>();
                    stockRequest.put("productoId", productoId);
                    stockRequest.put("cantidad", cantidad);
                    stockRequest.put("usuarioId", "11111111-1111-1111-1111-111111111111");
                    
                    return inventarioWebClient.post()
                            .uri("/produccion/verificar")
                            .bodyValue(stockRequest)
                            .retrieve()
                            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                            .doOnNext(response -> {
                                log.info("Respuesta inventario: {}", response);  // ← Ver qué devuelve
                                Boolean disponible = (Boolean) response.getOrDefault("exito", false);
                                // También puede venir como "disponible"
                                if (response.containsKey("disponible")) {
                                    disponible = (Boolean) response.get("disponible");
                                }
                                
                                if (!Boolean.TRUE.equals(disponible)) {
                                    String mensaje = (String) response.getOrDefault("mensaje", "Stock insuficiente");
                                    throw new RuntimeException(mensaje + " para producto: " + productoId);
                                }
                            });
                })
                .then();
    }

    private Mono<Map<String, Object>> crearPedidoEnVentas(PedidoQRRequestDTO request, UUID clienteId) {
        Map<String, Object> pedidoRequest = new HashMap<>();
        pedidoRequest.put("sesionMesaId", request.getMesaId());
        pedidoRequest.put("clienteId", clienteId);
        pedidoRequest.put("origen", "QR");
        pedidoRequest.put("detalles", request.getItems());
        pedidoRequest.put("total", request.getTotal());
        
        return ventasWebClient.post()
                .uri("/pedidos")
                .bodyValue(pedidoRequest)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .doOnNext(respuesta -> log.info("Respuesta de ventas: {}", respuesta));
    }

    private Mono<Map<String, Object>> crearPedidoEnVentasMozo(PedidoMozoRequestDTO request) {
        Map<String, Object> pedidoRequest = new HashMap<>();
        pedidoRequest.put("sesionMesaId", request.getMesaId());
        pedidoRequest.put("clienteId", request.getClienteId());
        pedidoRequest.put("usuarioTomoId", request.getMozoId());
        pedidoRequest.put("origen", "MOZO");
        pedidoRequest.put("detalles", request.getItems());
        pedidoRequest.put("total", request.getTotal());
        pedidoRequest.put("notas", request.getNotas());
        
        return ventasWebClient.post()
                .uri("/pedidos")
                .bodyValue(pedidoRequest)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
    }

  private Mono<Map<String, Object>> enviarOrdenACocina(Map<String, Object> pedido, List<Map<String, Object>> items) {
     // Extraer el objeto "data" que contiene la información del pedido
    Map<String, Object> data = (Map<String, Object>) pedido.get("data");
    if (data == null) {
        // Si la respuesta no tiene "data", asumimos que el mapa es directo (fallback)
        data = pedido;
    }

    Object pedidoIdObj = data.get("id");
    if (pedidoIdObj == null) {
        log.error("No se pudo extraer el ID del pedido. Respuesta de ventas: {}", pedido);
        return Mono.error(new RuntimeException("El pedido no tiene ID"));
    }
    UUID pedidoId = UUID.fromString(pedidoIdObj.toString());

    // Crear la orden con el ID extraído
    Map<String, Object> ordenRequest = new HashMap<>();
    ordenRequest.put("pedidoId", pedidoId);
    ordenRequest.put("mesaNumero", obtenerMesaNumero(pedido));
    ordenRequest.put("usuarioJefeId", "33a675b7-b35e-4fe2-b101-49884c44e38b");

    log.info("Creando orden de producción para pedido: {}", pedidoId);
    
    return cocinaWebClient.post()
            .uri("/ordenes-produccion")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(ordenRequest)
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
            .flatMap(orden -> {
                // 2. Obtener el ID de la orden creada
                Object ordenId = orden.get("id");
                log.info("Orden creada con ID: {}", ordenId);
                
                // 3. Crear los detalles usando el ID de la orden
                return Flux.fromIterable(items)
                    .flatMap(item -> {
                        String productoNombre = (String) item.get("nombre");
                        if (productoNombre == null) {
                            productoNombre = (String) item.get("productoNombre");
                        }
                        if (productoNombre == null) {
                            productoNombre = "Producto sin nombre";
                        }
                        
                        Integer cantidad = (Integer) item.get("cantidad");
                        
                        Map<String, Object> detalleRequest = new HashMap<>();
                        detalleRequest.put("ordenId", ordenId);
                        detalleRequest.put("productoNombre", productoNombre);
                        detalleRequest.put("cantidad", cantidad);
                        detalleRequest.put("estado", "PENDIENTE");
                        
                        log.info("Creando detalle: producto={}, cantidad={}", productoNombre, cantidad);
                        
                        return cocinaWebClient.post()
                                .uri("/detalles-produccion")
                                .contentType(MediaType.APPLICATION_JSON)
                                .bodyValue(detalleRequest)
                                .retrieve()
                                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
                    })
                    .collectList()
                    .map(respuestas -> {
                        String primerDetalleId = (String) respuestas.get(0).get("id");
                        
                        Map<String, Object> resultado = new HashMap<>();
                        resultado.put("success", true);
                        resultado.put("pedidoId", pedido.get("id"));
                        resultado.put("ordenId", ordenId);
                        resultado.put("detalleId", primerDetalleId);
                        resultado.put("totalDetalles", respuestas.size());
                        resultado.put("mensaje", "Orden y detalles creados (" + respuestas.size() + " productos)");
                        resultado.put("tiempoEstimado", calcularTiempoEstimado(items));
                        resultado.put("timestamp", LocalDateTime.now());
                        return resultado;
                    });
            })
            .onErrorResume(error -> {
                log.error("Error al crear orden en cocina: {}", error.getMessage());
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", error.getMessage());
                return Mono.just(errorResponse);
            });
}

    // Método auxiliar para obtener el número de mesa
    private Integer obtenerMesaNumero(Map<String, Object> pedido) {
        Object sesionMesaId = pedido.get("sesionMesaId");
        // Por ahora retorna 1, idealmente deberías obtener el número de mesa de sb-mesas
        return 1;
    }
    // Método auxiliar para calcular tiempo estimado basado en cantidad de productos
    private String calcularTiempoEstimado(List<Map<String, Object>> items) {
        int totalProductos = items.stream()
            .mapToInt(item -> (Integer) item.getOrDefault("cantidad", 0))
            .sum();
        
        int minutosBase = 25;
        int minutosExtra = (totalProductos - 1) * 5;
        int totalMinutos = minutosBase + minutosExtra;
        
        return totalMinutos + " minutos";
    }

    private UUID extractClienteId(Map<String, Object> cliente) {
        Object id = cliente.get("id");
        if (id instanceof UUID) {
            return (UUID) id;
        }
        return UUID.fromString((String) id);
    }

    // ==================== OTROS ENDPOINTS ====================
    
    public Mono<Map<String, Object>> obtenerInfoMesaConPedidos(UUID sesionMesaId) {
        // Obtener estado de la mesa desde sb-mesas
        Mono<Map<String, Object>> mesaMono = mesasWebClient.get()
                .uri("/mesas/{id}", sesionMesaId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
        
        // Obtener pedidos activos desde sb-ventas
        Mono<List<Map<String, Object>>> pedidosMono = ventasWebClient.get()
                .uri("/pedidos/mesa/{sesionMesaId}/activos", sesionMesaId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {});
        
        return Mono.zip(mesaMono, pedidosMono)
                .map(tuple -> {
                    Map<String, Object> resultado = new HashMap<>();
                    resultado.put("mesa", tuple.getT1());
                    resultado.put("pedidos_activos", tuple.getT2());
                    resultado.put("total_pedidos", ((List) tuple.getT2()).size());
                    return resultado;
                });
    }
    public Mono<Map<String, Object>> obtenerPedido(UUID pedidoId) {
        return ventasWebClient.get()
                .uri("/pedidos/{pedidoId}", pedidoId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
    }

    public Mono<Map<String, Object>> actualizarEstadoPedido(UUID pedidoId, String estado) {
        return ventasWebClient.patch()
                .uri("/pedidos/{pedidoId}/estado?estado={estado}", pedidoId, estado)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
    }

    public Mono<Map<String, Object>> obtenerTotalAcumulado(UUID clienteId) {
        return ventasWebClient.get()
                .uri("/pedidos/cliente/{clienteId}", clienteId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
                .map(pedidos -> {
                    double total = pedidos.stream()
                            .filter(p -> !"CANCELADO".equals(p.get("estado")))
                            .mapToDouble(p -> ((Number) p.get("total")).doubleValue())
                            .sum();
                    return Map.of("clienteId", clienteId, "total_acumulado", total);
                });
    }
    // ==================== FLUJO 2: CAMBIO DE ESTADO EN COCINA ====================
    
    public Mono<Map<String, Object>> flujoCambioEstadoCocina(UUID detalleId, String nuevoEstado, UUID usuarioId) {
        log.info("Cambiando estado de detalle {} a {}", detalleId, nuevoEstado);
        
        return cocinaWebClient.patch()
            .uri("/detalles-produccion/{detalleId}/estado", detalleId)
            .bodyValue(Map.of("nuevoEstado", nuevoEstado, "usuarioId", usuarioId))
            .retrieve()
            .bodyToMono(Map.class)
            .flatMap(detalleActualizado -> {
                Object ordenIdObj = detalleActualizado.get("ordenId");
                UUID ordenId = ordenIdObj instanceof String ? UUID.fromString((String) ordenIdObj) : (UUID) ordenIdObj;
                
                // Actualizar estado del pedido en ventas
                return ventasWebClient.patch()
                    .uri("/pedidos/{id}/estado", ordenId)
                    .bodyValue(Map.of("estado", nuevoEstado))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .flatMap(pedido -> {
                        // Si está LISTO, descontar stock
                        if ("LISTO".equals(nuevoEstado)) {
                            return inventarioWebClient.post()
                                .uri("/produccion/producir")
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
            .uri("/pedidos/{id}", request.getPedidoId())
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
                    .uri("/pagos")
                    .bodyValue(pagoRequest)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .flatMap(pago -> {
                        // Generar comprobante
                        Map<String, Object> comprobanteRequest = new HashMap<>();
                        comprobanteRequest.put("pagoId", pago.get("id"));
                        comprobanteRequest.put("pedidoId", request.getPedidoId());
                        
                        return ventasWebClient.post()
                            .uri("/comprobantes")
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
    // ==================== AUTH (USUARIOS) ====================


    public Mono<Map<String, Object>> login(AuthLoginRequestDTO request) {
        return usuariosWebClient.post()
                .uri("/usuarios/login")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
    }

    public Mono<Map<String, Object>> listarUsuarios() {
        return usuariosWebClient.get()
                .uri("/usuarios")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
    }

    public Mono<Map<String, Object>> obtenerUsuario(String id) {
        return usuariosWebClient.get()
                .uri("/usuarios/{id}", id)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
    }

    // ==================== Clientes ====================

    public Mono<Map<String, Object>> obtenerHistorialCliente(UUID clienteId) {
    log.info("Obteniendo historial del cliente: {}", clienteId);
    
    // Paso 1: Obtener datos del cliente desde sb-clientes
    Mono<Map<String, Object>> clienteMono = clientesWebClient.get()
            .uri("/clientes/{id}", clienteId)
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
    
    // Paso 2: Obtener pedidos del cliente desde sb-ventas
    Mono<List<Map<String, Object>>> pedidosMono = ventasWebClient.get()
            .uri("/pedidos/cliente/{clienteId}", clienteId)
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
            .map(response -> {
                // ✅ Extraer la lista del campo "data"
                Object data = response.get("data");
                if (data instanceof List) {
                    return (List<Map<String, Object>>) data;
                }
                return List.of();
            });
    // Paso 3: Combinar ambas respuestas
    return Mono.zip(clienteMono, pedidosMono)
            .map(tuple -> {
                Map<String, Object> resultado = new HashMap<>();
                resultado.put("cliente", tuple.getT1());
                resultado.put("historial_pedidos", tuple.getT2());
                resultado.put("total_pedidos", ((List) tuple.getT2()).size());
                resultado.put("timestamp", LocalDateTime.now());
                return resultado;
            })
            .onErrorResume(error -> {
                log.error("Error obteniendo historial: {}", error.getMessage());
                return Mono.just(Map.of(
                    "success", false,
                    "error", "Error al obtener historial: " + error.getMessage()
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

    // ==================== INVENTARIO ====================

    public Mono<List<Map<String, Object>>> listarInsumos() {
        return inventarioWebClient.get()
                .uri("/insumos")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {});
    }

    public Mono<Map<String, Object>> consultarStock(UUID insumoId) {
        return inventarioWebClient.get()
                .uri("/insumos/stock/{id}", insumoId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
    }

    public Mono<List<Map<String, Object>>> obtenerHistorialMovimientos(UUID insumoId) {
        return inventarioWebClient.get()
                .uri("/movimientos/{insumoId}", insumoId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {});
    }

    public Mono<List<Map<String, Object>>> obtenerAlertasStockBajo() {
        return inventarioWebClient.get()
                .uri("/alertas/stock-bajo")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {});
    }

    // ==================== FINANZAS ====================

    public Mono<Map<String, Object>> procesarPagoCompleto(PagoCompletoRequestDTO request) {
        // Paso 1: Obtener pedido de sb-ventas
        return ventasWebClient.get()
                .uri("/pedidos/{pedidoId}", request.getPedidoId())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
            .flatMap(pedido -> {
                // Paso 2: Registrar pago en sb-finanzas
                Map<String, Object> pagoRequest = new HashMap<>();
                pagoRequest.put("pedidoId", request.getPedidoId());
                pagoRequest.put("monto", pedido.get("total"));
                pagoRequest.put("metodoPago", request.getMetodoPago());
                
                return finanzasWebClient.post()
                        .uri("/pagos")
                        .bodyValue(pagoRequest)
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
            })
            .flatMap(pago -> {
                // Paso 3: Generar comprobante (RN-004: factura si monto > 700)
                Double monto = (Double) pago.get("monto");
                String tipoComprobante = monto > 700 ? "FACTURA" : "BOLETA";
                
                Map<String, Object> comprobanteRequest = new HashMap<>();
                comprobanteRequest.put("pagoId", pago.get("id"));
                comprobanteRequest.put("tipo", tipoComprobante);
                
                return finanzasWebClient.post()
                        .uri("/comprobantes")
                        .bodyValue(comprobanteRequest)
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
            })
            .flatMap(comprobante -> {
                // Paso 4: Liberar mesa en sb-mesas
                return mesasWebClient.put()
                        .uri("/mesas/{id}/liberar", request.getMesaId())
                        .retrieve()
                        .toBodilessEntity()
                        .thenReturn(comprobante);
            })
            .map(comprobante -> {
                Map<String, Object> resultado = new HashMap<>();
                resultado.put("success", true);
                resultado.put("mensaje", "Pago procesado y mesa liberada");
                resultado.put("comprobante", comprobante);
                return resultado;
            });
    }

    public Mono<Map<String, Object>> obtenerEstadoCaja() {
        return finanzasWebClient.get()
                .uri("/caja/estado")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
    }

    public Mono<Map<String, Object>> abrirCaja(AperturaCajaRequestDTO request) {
        return finanzasWebClient.post()
                .uri("/caja/apertura")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
    }

    public Mono<Map<String, Object>> cerrarCaja(CierreCajaRequestDTO request) {
        return finanzasWebClient.post()
                .uri("/caja/cierre")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
    }

    public Mono<Map<String, Object>> obtenerReporteVentasDiario(String fecha) {
        return finanzasWebClient.get()
                .uri("/reportes/ventas/diario?fecha={fecha}", fecha)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
    }
}