package main.controllers;

import lombok.RequiredArgsConstructor;
import main.dtos.APIResponse;
import main.dtos.request.CreateCarBrandRequest;
import main.dtos.response.CarBrandResponse;
import main.services.CarBrandService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/car-brands")
@RequiredArgsConstructor
public class CarBrandController {

    private final CarBrandService carBrandService;

    @PostMapping
    public ResponseEntity<APIResponse<CarBrandResponse>> create(@RequestBody CreateCarBrandRequest request) {
        CarBrandResponse data = carBrandService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                APIResponse.<CarBrandResponse>builder()
                        .success(true)
                        .message("Car brand created")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @GetMapping("/{brandId}")
    public ResponseEntity<APIResponse<CarBrandResponse>> getById(@PathVariable UUID brandId) {
        CarBrandResponse data = carBrandService.getById(brandId);
        return ResponseEntity.ok(
                APIResponse.<CarBrandResponse>builder()
                        .success(true)
                        .message("OK")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<APIResponse<List<CarBrandResponse>>> getAll() {
        List<CarBrandResponse> data = carBrandService.getAll();
        return ResponseEntity.ok(
                APIResponse.<List<CarBrandResponse>>builder()
                        .success(true)
                        .message("OK")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @PutMapping("/{brandId}")
    public ResponseEntity<APIResponse<CarBrandResponse>> update(
            @PathVariable UUID brandId,
            @RequestBody CreateCarBrandRequest request) {
        CarBrandResponse data = carBrandService.update(brandId, request);
        return ResponseEntity.ok(
                APIResponse.<CarBrandResponse>builder()
                        .success(true)
                        .message("Car brand updated")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @DeleteMapping("/{brandId}")
    public ResponseEntity<APIResponse<Void>> delete(@PathVariable UUID brandId) {
        carBrandService.delete(brandId);
        return ResponseEntity.ok(
                APIResponse.<Void>builder()
                        .success(true)
                        .message("Car brand deleted")
                        .data(null)
                        .timestamp(Instant.now())
                        .build()
        );
    }
}
