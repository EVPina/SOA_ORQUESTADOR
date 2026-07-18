package com.donbelisario.gateway.config;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Valida el JWT (mismo secreto/firma que emite servicio-usuarios) para toda ruta
 * que no esté en la allowlist pública, antes de reenviar la petición al servicio destino.
 */
@Component
public class JwtAuthGlobalFilter implements GlobalFilter, Ordered {

    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    private record PublicRoute(HttpMethod method, String pattern) {}

    private static final List<PublicRoute> PUBLIC_ROUTES = List.of(
            new PublicRoute(HttpMethod.POST, "/api/v1/auth/login"),
            new PublicRoute(HttpMethod.POST, "/api/v1/clientes/login"),
            new PublicRoute(HttpMethod.POST, "/api/v1/clientes/login-google"),
            new PublicRoute(HttpMethod.POST, "/api/v1/clientes"),
            new PublicRoute(HttpMethod.GET, "/api/v1/mesas/*"),
            new PublicRoute(HttpMethod.GET, "/api/v1/asignaciones-mozo/mesa/*"),
            new PublicRoute(HttpMethod.GET, "/api/v1/usuarios/*"),
            new PublicRoute(HttpMethod.GET, "/api/v1/menu/**"),
            new PublicRoute(HttpMethod.GET, "/api/orquestador/health"),
            new PublicRoute(HttpMethod.GET, "/api/orquestador/ping"),
            new PublicRoute(HttpMethod.POST, "/api/orquestador/auth/login")
    );

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        if (isPublic(request.getMethod(), path)) {
            return chain.filter(exchange);
        }

        String authHeader = request.getHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return reject(exchange, "Falta el token de autenticación");
        }

        try {
            Jwts.parser()
                    .verifyWith(signingKey())
                    .build()
                    .parseSignedClaims(authHeader.substring(7));
        } catch (JwtException | IllegalArgumentException e) {
            return reject(exchange, "Token inválido o expirado");
        }

        return chain.filter(exchange);
    }

    private boolean isPublic(HttpMethod method, String path) {
        return PUBLIC_ROUTES.stream()
                .anyMatch(r -> r.method().equals(method) && PATH_MATCHER.match(r.pattern(), path));
    }

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    private Mono<Void> reject(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add("Content-Type", "application/json");
        DataBuffer buffer = response.bufferFactory()
                .wrap(("{\"error\":\"" + message + "\"}").getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -100;
    }
}
