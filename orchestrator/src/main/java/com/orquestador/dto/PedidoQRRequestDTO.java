package com.orquestador.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
public class PedidoQRRequestDTO {
    private UUID mesaId;
    private String clienteEmail;
    private String clienteNombre;
    private String clienteTelefono;
    private List<Map<String, Object>> items;
    private Double total;
}