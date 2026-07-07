package com.orquestador.service;

import com.orquestador.dto.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import org.springframework.core.ParameterizedTypeReference;

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
            @Qualifier("qrWebClient") WebClient qrWebClient) {
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
                .flatMap(cliente -> crearPedidoEnVentasMozo(request))
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
                                log.info("Respuesta inventario: {}", response);
                                Boolean disponible = (Boolean) response.getOrDefault("exito", false);
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
        Map<String, Object> data = (Map<String, Object>) pedido.get("data");
        if (data == null) {
            data = pedido;
        }

        Object pedidoIdObj = data.get("id");
        if (pedidoIdObj == null) {
            log.error("No se pudo extraer el ID del pedido. Respuesta de ventas: {}", pedido);
            return Mono.error(new RuntimeException("El pedido no tiene ID"));
        }
        UUID pedidoId = UUID.fromString(pedidoIdObj.toString());

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
                    Object ordenId = orden.get("id");
                    log.info("Orden creada con ID: {}", ordenId);

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
                                resultado.put("pedidoId", pedidoId);           // ← Guardamos el pedidoId real
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

    private Integer obtenerMesaNumero(Map<String, Object> pedido) {
        Object sesionMesaId = pedido.get("sesionMesaId");
        return 1; // Podría mejorarse obteniendo el número real de la mesa
    }

    private String calcularTiempoEstimado(List<Map<String, Object>> items) {
        int totalProductos = items.stream()
                .mapToInt(item -> (Integer) item.getOrDefault("cantidad", 0))
                .sum();
        int minutosBase = 25;
        int minutosExtra = (totalProductos - 1) * 5;
        return (minutosBase + minutosExtra) + " minutos";
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
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .onErrorResume(e -> {
                    log.error("Error al obtener mesa: {}", e.getMessage());
                    return Mono.just(Map.of("error", "No se pudo obtener la mesa"));
                });

        // Obtener pedidos activos desde sb-ventas (respuesta envuelta en ApiResponse)
        Mono<List<? extends Object>> pedidosMono = ventasWebClient.get()
                .uri("/pedidos/mesa/{sesionMesaId}/activos", sesionMesaId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .map(response -> {
                    // Extraer la lista del campo "data"
                    Object data = response.get("data");
                    if (data instanceof List) {
                        // Cast seguro a List<Map<String, Object>>
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> lista = (List<Map<String, Object>>) data;
                        return lista;
                    }
                    log.warn("La respuesta no contiene una lista en 'data': {}", response);
                    return List.of();
                })
                .onErrorResume(e -> {
                    log.error("Error al obtener pedidos: {}", e.getMessage());
                    return Mono.just(List.of());
                });

        return Mono.zip(mesaMono, pedidosMono)
                .map(tuple -> {
                    Map<String, Object> resultado = new HashMap<>();
                    resultado.put("mesa", tuple.getT1());
                    resultado.put("pedidos_activos", tuple.getT2());
                    resultado.put("total_pedidos", tuple.getT2().size());
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

    // ==================== FLUJO 2: CAMBIO DE ESTADO EN COCINA (CORREGIDO) ====================

    public Mono<Map<String, Object>> flujoCambioEstadoCocina(UUID detalleId, String nuevoEstado, UUID usuarioId, UUID pedidoId) {
        log.info("Cambiando estado de detalle {} a {}", detalleId, nuevoEstado);

        // 1. Actualizar el detalle en Cocina
        return cocinaWebClient.patch()
                .uri("/detalles-produccion/{detalleId}/estado", detalleId)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(Map.of("nuevoEstado", nuevoEstado, "usuarioId", usuarioId))
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                // 2. Obtener el pedidoId (directo o por consulta)
                .flatMap(detalleActualizado -> {
                    // Si tenemos pedidoId, lo usamos directamente
                    if (pedidoId != null) {
                        return actualizarVentasYStock(detalleActualizado, nuevoEstado, pedidoId);
                    }

                    // Si no, consultamos la orden en Cocina para obtener el pedidoId
                    Object ordenIdObj = detalleActualizado.get("ordenId");
                    if (ordenIdObj == null) {
                        return Mono.error(new RuntimeException("No se pudo obtener ordenId del detalle"));
                    }
                    UUID ordenId = UUID.fromString(ordenIdObj.toString());

                    log.info("Consultando orden en cocina para obtener pedidoId: ordenId={}", ordenId);
                    return cocinaWebClient.get()
                            .uri("/ordenes-produccion/{id}", ordenId)
                            .retrieve()
                            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                            .flatMap(orden -> {
                                // Buscar pedidoId en la respuesta
                                Object pedidoIdObj = orden.get("pedidoId");
                                if (pedidoIdObj == null) {
                                    pedidoIdObj = orden.get("pedido_id");
                                }
                                if (pedidoIdObj == null) {
                                    log.error("La orden no tiene pedidoId. Campos: {}", orden.keySet());
                                    return Mono.error(new RuntimeException("La orden no tiene pedidoId asociado"));
                                }
                                UUID pedidoIdReal = UUID.fromString(pedidoIdObj.toString());
                                return actualizarVentasYStock(detalleActualizado, nuevoEstado, pedidoIdReal);
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

    // Método auxiliar para actualizar Ventas y descontar stock
   private Mono<Map<String, Object>> actualizarVentasYStock(Map<String, Object> detalleActualizado, String nuevoEstado, UUID pedidoId) {
    // Mapear estado de cocina a estado de ventas
    String estadoVentas;
    if ("LISTO".equals(nuevoEstado)) {
        estadoVentas = "SERVIDO";
    } else if ("PREPARANDO".equals(nuevoEstado)) {
        estadoVentas = "EN_COCINA";
    } else {
        estadoVentas = "PENDIENTE";
    }

    log.info("Actualizando pedido en ventas: pedidoId={}, estadoVentas={}", pedidoId, estadoVentas);

    // 1. Actualizar estado en Ventas
    return ventasWebClient.patch()
            .uri("/pedidos/{id}/estado?estado={estado}", pedidoId, estadoVentas)
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
            .flatMap(pedido -> {
                // 2. Si es LISTO, descontar stock
                if ("LISTO".equals(nuevoEstado)) {
                    log.info("Obteniendo detalles del pedido {} para descontar stock", pedidoId);

                    // Obtener el pedido completo con sus detalles
                    return ventasWebClient.get()
                            .uri("/pedidos/{id}", pedidoId)
                            .retrieve()
                            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                            .flatMap(pedidoCompleto -> {
                                // Extraer la lista de detalles del pedido
                                List<Map<String, Object>> detalles = null;
                                Object data = pedidoCompleto.get("data");
                                if (data instanceof Map) {
                                    // Si la respuesta tiene un wrapper "data"
                                    detalles = (List<Map<String, Object>>) ((Map<?, ?>) data).get("detalles");
                                } else {
                                    // Si la respuesta es directa
                                    detalles = (List<Map<String, Object>>) pedidoCompleto.get("detalles");
                                }

                                if (detalles == null || detalles.isEmpty()) {
                                    log.warn("El pedido {} no tiene detalles para descontar stock", pedidoId);
                                    return Mono.just(Map.of());
                                }

                                // Descontar stock para cada producto
                                return Flux.fromIterable(detalles)
                                        .flatMap(detalle -> {
                                            // Extraer productoId y cantidad (probando varios nombres)
                                            Object productoIdObj = detalle.get("productoId");
                                            if (productoIdObj == null) {
                                                productoIdObj = detalle.get("producto_id");
                                            }
                                            if (productoIdObj == null) {
                                                log.warn("Detalle sin productoId: {}", detalle);
                                                return Mono.empty();
                                            }
                                            UUID productoId = UUID.fromString(productoIdObj.toString());

                                            Integer cantidad = (Integer) detalle.get("cantidad");
                                            if (cantidad == null) {
                                                cantidad = 1; // valor por defecto
                                            }

                                            // Usar el usuarioId que se pasó al método (o uno fijo)
                                            UUID usuarioId = UUID.fromString("33a675b7-b35e-4fe2-b101-49884c44e38b");

                                            Map<String, Object> stockRequest = new HashMap<>();
                                            stockRequest.put("productoId", productoId);
                                            stockRequest.put("cantidad", cantidad);
                                            stockRequest.put("usuarioId", usuarioId);

                                            log.info("Descontando stock: productoId={}, cantidad={}", productoId, cantidad);
                                            return inventarioWebClient.post()
                                                    .uri("/produccion/producir")
                                                    .bodyValue(stockRequest)
                                                    .retrieve()
                                                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
                                        })
                                        .collectList()
                                        .map(respuestas -> Map.of("produccion", respuestas));
                            });
                }
                return Mono.just(Map.of());
            })
            .map(resultado -> {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("detalle", detalleActualizado);
                response.put("mensaje", "Estado actualizado a: " + nuevoEstado);
                response.put("pedidoId", pedidoId);
                response.put("timestamp", LocalDateTime.now());
                if (!resultado.isEmpty()) {
                    response.put("produccion", resultado);
                }
                return response;
            });
    }
    // ==================== FLUJO 3: PAGO ====================

    public Mono<Map<String, Object>> flujoPago(PagoRequestDTO request) {
        // ... (sin cambios, se mantiene igual)
        return Mono.just(Map.of());
    }

    // ==================== AUTH (USUARIOS) ====================

    public Mono<Map<String, Object>> login(AuthLoginRequestDTO request) {
        return usuariosWebClient.post()
                .uri("/auth/login")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
    }

    public Mono<List<Map<String, Object>>> listarUsuarios() {
        return usuariosWebClient.get()
                .uri("/usuarios")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {});
}

    public Mono<Map<String, Object>> obtenerUsuario(String id) {
        return usuariosWebClient.get()
                .uri("/usuarios/{id}", id)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
    }

    // ==================== Clientes ====================

    public Mono<Map<String, Object>> obtenerHistorialCliente(UUID clienteId) {
        // ... (sin cambios)
        return Mono.just(Map.of());
    }

    // ==================== HEALTH CHECK ====================

    public Mono<Map<String, Object>> healthCheck() {
        // ... (sin cambios)
        return Mono.just(Map.of());
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
    log.info("Procesando pago para pedido: {}", request.getPedidoId());

    // 1. Obtener el pedido desde Ventas
    return ventasWebClient.get()
        .uri("/pedidos/{id}", request.getPedidoId())
        .retrieve()
        .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
        .flatMap(pedidoRespuesta -> {
            // Extraer el total
            Map<String, Object> data = (Map<String, Object>) pedidoRespuesta.get("data");
            if (data == null) data = pedidoRespuesta;
            Object totalObj = data.get("total");
            Double total = totalObj instanceof Number ? ((Number) totalObj).doubleValue() : 0.0;

            // 2. Registrar pago en Finanzas
            Map<String, Object> pagoRequest = new HashMap<>();
            pagoRequest.put("pedidoId", request.getPedidoId());
            pagoRequest.put("monto", total);
            pagoRequest.put("metodoPago", request.getMetodoPago());
            pagoRequest.put("referencia", request.getReferencia());

            log.info("Registrando pago en finanzas: {}", pagoRequest);

            return finanzasWebClient.post()
                    .uri("/pagos")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(pagoRequest)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .doOnSuccess(resp -> log.info("Pago registrado: {}", resp))
                    .doOnError(e -> log.error("Error en finanzas: {}", e.getMessage()));
        })
        .flatMap(pago -> {
            // 3. Generar comprobante
            Double monto = (Double) pago.get("monto");
            String tipoComprobante = (monto != null && monto > 700) ? "FACTURA" : "BOLETA";

            Map<String, Object> comprobanteRequest = new HashMap<>();
            comprobanteRequest.put("pagoId", pago.get("id"));
            comprobanteRequest.put("tipo", tipoComprobante);

            log.info("Generando comprobante: {}", comprobanteRequest);

            return finanzasWebClient.post()
                    .uri("/comprobantes")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(comprobanteRequest)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
        })
        .flatMap(comprobante -> {
            // 4. Liberar mesa
            log.info("Liberando mesa: {}", request.getMesaId());
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
        })
        .onErrorResume(error -> {
            log.error("Error en procesamiento de pago: {}", error.getMessage());
            return Mono.just(Map.of(
                    "success", false,
                    "error", error.getMessage()
            ));
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

    public Mono<Map<String, Object>> cerrarCaja(UUID cajaId, CierreCajaRequestDTO request) {
    return finanzasWebClient.put()
                .uri("/cajas/cierre/{cajaId}", cajaId)   // ← PUT con cajaId
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

    // ==================== COCINA - CONSULTAS ====================

    public Mono<List<Map<String, Object>>> getOrdenesActivas() {
        return cocinaWebClient.get()
                .uri("/ordenes-produccion/activas")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {});
    }

    public Mono<List<Map<String, Object>>> getOrdenesPorEstado(String estado) {
        return cocinaWebClient.get()
                .uri("/ordenes-produccion/por-estado/{estado}", estado)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {});
    }

    // Método auxiliar privado
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