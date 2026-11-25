package com.example.api_gateway.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class HomeController {
    @GetMapping("/")
    public Map<String, Object> inicio() {
        return Map.of(
            "aplication", "API GATEWAY Microservicios Factura",
            "mensaje", "Funcionando correctamente",
            "version", "1.0.0",
            "servicios", Map.of(
                "clientes", "/api/clientes",
                "productos", "/api/productos",
                "facturas", "/api/facturas"
            )
        );
    }
}
