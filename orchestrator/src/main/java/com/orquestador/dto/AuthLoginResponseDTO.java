package com.orquestador.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthLoginResponseDTO {
    private String token;
    private String refreshToken;
    private String username;
    private String rol;
    private String nombreCompleto;
}