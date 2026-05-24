package com.orquestador.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient webClient() {
        return WebClient.builder().build();
    }
    
    @Bean
    public WebClient usuariosWebClient() {
        return WebClient.builder().baseUrl("http://localhost:8081").build();
    }
    
    @Bean
    public WebClient ventasWebClient() {
        return WebClient.builder().baseUrl("http://localhost:8082").build();
    }
    
    @Bean
    public WebClient qrWebClient() {
        return WebClient.builder().baseUrl("http://localhost:8083").build();
    }
}