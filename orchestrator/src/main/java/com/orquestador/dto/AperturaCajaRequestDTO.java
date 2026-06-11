package com.orquestador.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class AperturaCajaRequestDTO {
    private UUID usuarioId;
    private BigDecimal montoInicial;
}