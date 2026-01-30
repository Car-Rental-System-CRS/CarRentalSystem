package main.controllers.payos;

import lombok.RequiredArgsConstructor;
import main.services.payos.PayosService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payos")
@RequiredArgsConstructor
public class PayosController {

    private final PayosService payosService;

    @PostMapping("/create")
    public Map<String, String> createPayment() {
        return null;
    }
}
