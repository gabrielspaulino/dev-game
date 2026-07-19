package com.devlearn.health;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Lightweight health check endpoints.
 *
 * <p>Provides quick up/down signals for load balancers, deployment pipelines,
 * and the frontend connectivity check. For detailed health information
 * (including database connectivity), use the Actuator endpoint at
 * {@code /api/actuator/health}.
 */
@RestController
@Tag(name = "Health", description = "Application health endpoints")
public class HealthController {

    /**
     * Simple health check used by the Render / Replit proxy health check.
     * Path: {@code GET /api/healthz}
     */
    @GetMapping("/healthz")
    @Operation(summary = "Simple health check", description = "Returns UP when the application is running.")
    public ResponseEntity<Map<String, String>> healthz() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }

    /**
     * API v1 health check used by the frontend connectivity screen.
     * Path: {@code GET /api/v1/health}
     */
    @GetMapping("/v1/health")
    @Operation(summary = "API v1 health", description = "Returns UP when the API v1 layer is operational.")
    public ResponseEntity<Map<String, String>> v1Health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}
