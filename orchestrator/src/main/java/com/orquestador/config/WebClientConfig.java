package com.orquestador.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${servicios.usuarios.url}")
    private String usuariosUrl;

    @Value("${servicios.qr.url}")
    private String qrUrl;

    @Value("${servicios.clientes.url}")
    private String clientesUrl;

    @Value("${servicios.ventas.url}")
    private String ventasUrl;

    @Bean
    public WebClient usuariosWebClient() {
        return WebClient.builder().baseUrl(usuariosUrl).build();
    }

    @Bean
    public WebClient qrWebClient() {
        return WebClient.builder().baseUrl(qrUrl).build();
    }

    @Bean
    public WebClient clientesWebClient() {
        return WebClient.builder().baseUrl(clientesUrl).build();
    }

    @Bean
    public WebClient ventasWebClient() {
        return WebClient.builder().baseUrl(ventasUrl).build();
    }
}