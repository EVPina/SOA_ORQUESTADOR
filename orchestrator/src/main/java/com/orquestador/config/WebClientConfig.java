package com.orquestador.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${servicios.usuarios.url:http://localhost:8081}")
    private String usuariosUrl;

    @Value("${servicios.ventas.url:http://localhost:8082}")
    private String ventasUrl;

    @Value("${servicios.qr.url:http://localhost:8083}")
    private String qrUrl;

    @Bean
    public WebClient usuariosWebClient() {
        return WebClient.builder()
                .baseUrl(usuariosUrl)
                .build();
    }

    @Bean
    public WebClient ventasWebClient() {
        return WebClient.builder()
                .baseUrl(ventasUrl)
                .build();
    }

    @Bean
    public WebClient qrWebClient() {
        return WebClient.builder()
                .baseUrl(qrUrl)
                .build();
    }
}