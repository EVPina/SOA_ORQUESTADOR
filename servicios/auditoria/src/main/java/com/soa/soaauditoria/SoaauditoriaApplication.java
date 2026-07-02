package com.soa.soaauditoria;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class SoaauditoriaApplication {
    public static void main(String[] args) {
        SpringApplication.run(SoaauditoriaApplication.class, args);
    }
}
