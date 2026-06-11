package com.orquestador.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CierreCajaRequestDTO {
    private UUID usuarioId;
    private BigDecimal montoFinalReal;
}