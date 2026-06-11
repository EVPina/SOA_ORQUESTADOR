package com.orquestador.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class PagoCompletoRequestDTO {
    private UUID pedidoId;
    private UUID mesaId;
    private String metodoPago;  // EFECTIVO, TARJETA, YAPE, PLIN, QR
    private Double monto;
    private String referencia;
}