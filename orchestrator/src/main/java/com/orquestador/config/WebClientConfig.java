package com.orquestador.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${servicios.usuarios.url:http://localhost:8081}")
    private String usuariosUrl;

    @Value("${servicios.ventas.url:http://localhost:8085}")
    private String ventasUrl;

    @Value("${servicios.cocina.url:http://localhost:8086}")
    private String cocinaUrl;

    @Value("${servicios.inventario.url:http://localhost:8087}")
    private String inventarioUrl;

    @Value("${servicios.finanzas.url:http://localhost:8088}")
    private String finanzasUrl;

    @Value("${servicios.qr.url:http://localhost:8084}")
    private String qrUrl;

    @Value("${servicios.mesas.url:http://localhost:8083}")
    private String mesasUrl;

    @Value("${servicios.clientes.url:http://localhost:8082}")
    private String clientesUrl;

    @Bean
    public WebClient usuariosWebClient() {
        return WebClient.builder()
                .baseUrl(usuariosUrl)
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
}