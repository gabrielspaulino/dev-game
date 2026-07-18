package com.devlearn.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Springdoc OpenAPI configuration.
 *
 * <p>Swagger UI is available at {@code /api/swagger-ui.html} in non-production
 * environments. The raw OpenAPI spec is at {@code /api/v3/api-docs}.
 */
@Configuration
public class OpenApiConfig {

    @Value("${spring.application.version:0.1.0}")
    private String version;

    @Bean
    public OpenAPI devLeapOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("DevLeap API")
                .version(version)
                .description("Gamified learning platform for software developers. " +
                    "All authenticated endpoints require a valid Supabase JWT in the " +
                    "Authorization header: `Bearer <token>`.")
                .contact(new Contact()
                    .name("DevLeap Team")
                    .url("https://github.com/devlearn"))
                .license(new License()
                    .name("MIT")
                    .url("https://opensource.org/licenses/MIT")))
            .servers(List.of(
                new Server().url("/api").description("Current server")
            ));
    }
}
