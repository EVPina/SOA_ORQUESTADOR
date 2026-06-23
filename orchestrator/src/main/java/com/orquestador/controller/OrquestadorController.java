package com.orquestador.controller;

import com.orquestador.dto.*;
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

    // ==================== PEDIDOS ====================

    @PostMapping("/pedido/qr")
    public Mono<ResponseEntity<ApiResponseDTO<Map<String, Object>>>> pedidoQR(@RequestBody PedidoQRRequestDTO request) {
        return orquestadorService.procesarPedidoQR(request)
                .map(response -> ResponseEntity.ok(ApiResponseDTO.success("Pedido creado", response)));
    }

    @PostMapping("/pedido/mozo")
    public Mono<ResponseEntity<ApiResponseDTO<Map<String, Object>>>> pedidoMozo(@RequestBody PedidoMozoRequestDTO request) {
        return orquestadorService.procesarPedidoMozo(request)
                .map(response -> ResponseEntity.ok(ApiResponseDTO.success("Pedido creado", response)));
    }

    @GetMapping("/pedidos/mesa/{sesionMesaId}")
    public Mono<ResponseEntity<ApiResponseDTO<Object>>> obtenerInfoMesaConPedidos(@PathVariable UUID sesionMesaId) {
        return orquestadorService.obtenerInfoMesaConPedidos(sesionMesaId)
                .map(response -> ResponseEntity.ok(ApiResponseDTO.success("Pedidos obtenidos", response)));
    }

    @GetMapping("/pedidos/{pedidoId}")
    public Mono<ResponseEntity<ApiResponseDTO<Object>>> obtenerPedido(@PathVariable UUID pedidoId) {
        return orquestadorService.obtenerPedido(pedidoId)
                .map(response -> ResponseEntity.ok(ApiResponseDTO.success("Pedido obtenido", response)));
    }

    @PutMapping("/pedidos/{pedidoId}/estado")
    public Mono<ResponseEntity<ApiResponseDTO<Object>>> actualizarEstadoPedido(@PathVariable UUID pedidoId, @RequestParam String estado) {
        return orquestadorService.actualizarEstadoPedido(pedidoId, estado)
                .map(response -> ResponseEntity.ok(ApiResponseDTO.success("Estado actualizado", response)));
    }

    @GetMapping("/pedidos/total/{clienteId}")
    public Mono<ResponseEntity<ApiResponseDTO<Object>>> obtenerTotalAcumulado(@PathVariable UUID clienteId) {
        return orquestadorService.obtenerTotalAcumulado(clienteId)
                .map(response -> ResponseEntity.ok(ApiResponseDTO.success("Total obtenido", response)));
    }

    // ==================== COCINA - CAMBIO DE ESTADO ====================

   @PatchMapping("/cocina/detalle/{detalleId}/estado")
    public Mono<ResponseEntity<ApiResponseDTO<Map<String, Object>>>> cambiarEstadoCocina(
            @PathVariable UUID detalleId,
            @RequestParam String estado,
            @RequestParam UUID usuarioId,
            @RequestParam(required = false) UUID pedidoId) {
        return orquestadorService.flujoCambioEstadoCocina(detalleId, estado, usuarioId, pedidoId)
                .map(response -> {
                    if (Boolean.TRUE.equals(response.get("success"))) {
                        return ResponseEntity.ok(ApiResponseDTO.success("Estado actualizado", response));
                    } else {
                        return ResponseEntity.badRequest().body(ApiResponseDTO.error((String) response.get("error")));
                    }
                });
    }

    // ==================== COCINA - CONSULTAS ====================

    @GetMapping("/cocina/ordenes/activas")
    public Mono<ResponseEntity<ApiResponseDTO<Object>>> getOrdenesActivas() {
        return orquestadorService.getOrdenesActivas()
                .map(response -> ResponseEntity.ok(ApiResponseDTO.success("Órdenes activas", response)));
    }

    @GetMapping("/cocina/ordenes/pendientes")
    public Mono<ResponseEntity<ApiResponseDTO<Object>>> getOrdenesPendientes() {
        return orquestadorService.getOrdenesPorEstado("PENDIENTE")
                .map(response -> ResponseEntity.ok(ApiResponseDTO.success("Órdenes pendientes", response)));
    }

    @GetMapping("/cocina/ordenes/preparando")
    public Mono<ResponseEntity<ApiResponseDTO<Object>>> getOrdenesPreparando() {
        return orquestadorService.getOrdenesPorEstado("PREPARANDO")
                .map(response -> ResponseEntity.ok(ApiResponseDTO.success("Órdenes en preparación", response)));
    }

    @GetMapping("/cocina/ordenes/listos")
    public Mono<ResponseEntity<ApiResponseDTO<Object>>> getOrdenesListos() {
        return orquestadorService.getOrdenesPorEstado("LISTO")
                .map(response -> ResponseEntity.ok(ApiResponseDTO.success("Órdenes listas", response)));
    }

    // ==================== HEALTH ====================

    @GetMapping("/health")
    public Mono<ResponseEntity<Map<String, Object>>> health() {
        return orquestadorService.healthCheck()
                .map(ResponseEntity::ok);
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("Orquestador funcionando correctamente");
    }

    // ==================== AUTH ====================

    @PostMapping("/auth/login")
    public Mono<ResponseEntity<ApiResponseDTO<Map<String, Object>>>> login(@RequestBody AuthLoginRequestDTO request) {
        return orquestadorService.login(request)
                .map(response -> ResponseEntity.ok(ApiResponseDTO.success("Login exitoso", response)));
    }

    @GetMapping("/usuarios")
    public Mono<ResponseEntity<ApiResponseDTO<Map<String, Object>>>> listarUsuarios() {
        return orquestadorService.listarUsuarios()
                .map(response -> ResponseEntity.ok(ApiResponseDTO.success("Usuarios obtenidos", response)));
    }

    @GetMapping("/usuarios/{id}")
    public Mono<ResponseEntity<ApiResponseDTO<Map<String, Object>>>> obtenerUsuario(@PathVariable String id) {
        return orquestadorService.obtenerUsuario(id)
                .map(response -> ResponseEntity.ok(ApiResponseDTO.success("Usuario obtenido", response)));
    }

    // ==================== CLIENTES ====================

    @GetMapping("/cliente/{clienteId}/historial")
    public Mono<ResponseEntity<ApiResponseDTO<Map<String, Object>>>> obtenerHistorialCliente(@PathVariable UUID clienteId) {
        return orquestadorService.obtenerHistorialCliente(clienteId)
                .map(response -> ResponseEntity.ok(ApiResponseDTO.success("Historial obtenido", response)));
    }

    // ==================== INVENTARIO ====================

    @GetMapping("/inventario/insumos")
    public Mono<ResponseEntity<ApiResponseDTO<Object>>> listarInsumos() {
        return orquestadorService.listarInsumos()
                .map(response -> ResponseEntity.ok(ApiResponseDTO.success("Insumos obtenidos", response)));
    }

    @GetMapping("/inventario/insumos/stock/{insumoId}")
    public Mono<ResponseEntity<ApiResponseDTO<Object>>> consultarStock(@PathVariable UUID insumoId) {
        return orquestadorService.consultarStock(insumoId)
                .map(response -> ResponseEntity.ok(ApiResponseDTO.success("Stock consultado", response)));
    }

    @GetMapping("/inventario/movimientos/{insumoId}")
    public Mono<ResponseEntity<ApiResponseDTO<Object>>> obtenerHistorialMovimientos(@PathVariable UUID insumoId) {
        return orquestadorService.obtenerHistorialMovimientos(insumoId)
                .map(response -> ResponseEntity.ok(ApiResponseDTO.success("Historial obtenido", response)));
    }

    @GetMapping("/inventario/alertas/stock-bajo")
    public Mono<ResponseEntity<ApiResponseDTO<Object>>> obtenerAlertasStockBajo() {
        return orquestadorService.obtenerAlertasStockBajo()
                .map(response -> ResponseEntity.ok(ApiResponseDTO.success("Alertas obtenidas", response)));
    }

    // ==================== FINANZAS ====================

    @PostMapping("/pago")
    public Mono<ResponseEntity<ApiResponseDTO<Map<String, Object>>>> procesarPago(@RequestBody PagoCompletoRequestDTO request) {
        return orquestadorService.procesarPagoCompleto(request)
                .map(response -> ResponseEntity.ok(ApiResponseDTO.success("Pago procesado", response)));
    }

    @GetMapping("/caja/estado")
    public Mono<ResponseEntity<ApiResponseDTO<Object>>> obtenerEstadoCaja() {
        return orquestadorService.obtenerEstadoCaja()
                .map(response -> ResponseEntity.ok(ApiResponseDTO.success("Estado de caja", response)));
    }

    @PostMapping("/caja/apertura")
    public Mono<ResponseEntity<ApiResponseDTO<Object>>> abrirCaja(@RequestBody AperturaCajaRequestDTO request) {
        return orquestadorService.abrirCaja(request)
                .map(response -> ResponseEntity.ok(ApiResponseDTO.success("Caja abierta", response)));
    }

    @PutMapping("/caja/cierre/{cajaId}")
    public Mono<ResponseEntity<ApiResponseDTO<Object>>> cerrarCaja(
        @PathVariable UUID cajaId,
        @RequestBody CierreCajaRequestDTO request) {
    return orquestadorService.cerrarCaja(cajaId, request)
                .map(response -> ResponseEntity.ok(ApiResponseDTO.success("Caja cerrada", response)));
    }

    @GetMapping("/reportes/ventas/diario")
    public Mono<ResponseEntity<ApiResponseDTO<Object>>> reporteVentasDiario(@RequestParam String fecha) {
        return orquestadorService.obtenerReporteVentasDiario(fecha)
                .map(response -> ResponseEntity.ok(ApiResponseDTO.success("Reporte diario", response)));
    }
}