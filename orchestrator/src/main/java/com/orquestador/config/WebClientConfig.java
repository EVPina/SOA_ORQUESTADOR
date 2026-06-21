package com.orquestador.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

   // ✅ Usar las propiedades de application.yml directamente
    @Value("${servicios.usuarios.url}")
    private String usuariosUrl;

    @Value("${servicios.ventas.url}")
    private String ventasUrl;

    @Value("${servicios.cocina.url}")
    private String cocinaUrl;

    @Value("${servicios.inventario.url}")
    private String inventarioUrl;

    @Value("${servicios.finanzas.url}")
    private String finanzasUrl;

    @Value("${servicios.qr.url}")
    private String qrUrl;

    @Value("${servicios.mesas.url}")
    private String mesasUrl;

    @Value("${servicios.clientes.url}")
    private String clientesUrl;

    @Bean
    public WebClient usuariosWebClient() {
        return WebClient.builder()
                .baseUrl(usuariosUrl)
                .build();
    }

    @Bean
    public WebClient cocinaWebClient() {
        return WebClient.builder()
                .baseUrl(cocinaUrl)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Bean
    public WebClient inventarioWebClient() {
        return WebClient.builder()
                .baseUrl(inventarioUrl)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Bean
    public WebClient finanzasWebClient() {
        return WebClient.builder()
                .baseUrl(finanzasUrl)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Bean
    public WebClient qrWebClient() {
        return WebClient.builder()
                .baseUrl(qrUrl)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
    @Bean
    public WebClient mesasWebClient() {
        return WebClient.builder()
                .baseUrl(mesasUrl)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
    @Bean
    public WebClient clientesWebClient() {
        return WebClient.builder()
                .baseUrl(clientesUrl)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
    @Bean
    public WebClient ventasWebClient() {
        return WebClient.builder()
                .baseUrl(ventasUrl)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}