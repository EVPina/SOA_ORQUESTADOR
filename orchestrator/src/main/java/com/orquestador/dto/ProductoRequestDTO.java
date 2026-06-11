package com.orquestador.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductoRequestDTO {
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private String categoria;
    private Boolean disponible;
    private String imagenUrl;
}