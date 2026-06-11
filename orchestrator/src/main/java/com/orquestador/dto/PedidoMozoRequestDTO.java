package com.orquestador.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
public class PedidoMozoRequestDTO {
    private UUID mesaId;
    private UUID clienteId;           // Cliente ya registrado
    private UUID mozoId;              // ID del mozo que toma el pedido
    private List<Map<String, Object>> items;
    private Double total;
    private String notas;
}