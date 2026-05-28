package com.orquestador.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class PagoRequestDTO {
    private UUID pedidoId;
    private Double monto;
    private String metodoPago;
    private String referencia;
}