package main.controllers;

import main.dtos.APIResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

/**
 * Template/test controller showing the preferred response shape:
 * ResponseEntity<APIResponse<T>>
 *
 * This does NOT affect Auth; use it as a reference for future controllers.
 */
@RestController
@RequestMapping("/api/test-template")
public class TestTemplateController {

    @GetMapping("/ping")
    public ResponseEntity<APIResponse<String>> ping() {
        return ResponseEntity.ok(
                APIResponse.<String>builder()
                        .success(true)
                        .message("pong")
                        .data("pong")
                        .timestamp(Instant.now())
                        .build()
        );
    }

    /**
     * This endpoint intentionally throws to demonstrate GlobalExceptionHandler output.
     * Example: GET /api/test-template/fail?msg=anything
     */
    @GetMapping("/fail")
    public ResponseEntity<APIResponse<Object>> fail(@RequestParam(defaultValue = "Example error") String msg) {
        throw new IllegalArgumentException(msg);
    }
}

