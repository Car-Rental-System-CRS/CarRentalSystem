package main.configs;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "CarRentalSystem API",
        version = "v1",
        description = "API documentation for CarRentalSystem"
    ),
    servers = {
        @Server(url = "http://localhost:8080", description = "Local")
    }
)
public class OpenApiConfig {}