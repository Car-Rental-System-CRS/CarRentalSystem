package main.controllers;

import lombok.RequiredArgsConstructor;
import main.dtos.APIResponse;
import main.dtos.request.CreateCarRequest;
import main.dtos.response.CarResponse;
import main.services.CarService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
public class CarController {

    private final CarService carService;

    @PostMapping
    public ResponseEntity<APIResponse<CarResponse>> create(@RequestBody CreateCarRequest request) {
        CarResponse data = carService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                APIResponse.<CarResponse>builder()
                        .success(true)
                        .message("Car created")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @GetMapping("/{carId}")
    public ResponseEntity<APIResponse<CarResponse>> getById(@PathVariable UUID carId) {
        CarResponse data = carService.getById(carId);
        return ResponseEntity.ok(
                APIResponse.<CarResponse>builder()
                        .success(true)
                        .message("OK")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<APIResponse<List<CarResponse>>> getAll() {
        List<CarResponse> data = carService.getAll();
        return ResponseEntity.ok(
                APIResponse.<List<CarResponse>>builder()
                        .success(true)
                        .message("OK")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @PutMapping("/{carId}")
    public ResponseEntity<APIResponse<CarResponse>> update(
            @PathVariable UUID carId,
            @RequestBody CreateCarRequest request) {
        CarResponse data = carService.update(carId, request);
        return ResponseEntity.ok(
                APIResponse.<CarResponse>builder()
                        .success(true)
                        .message("Car updated")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @DeleteMapping("/{carId}")
    public ResponseEntity<APIResponse<Void>> delete(@PathVariable UUID carId) {
        carService.delete(carId);
        return ResponseEntity.ok(
                APIResponse.<Void>builder()
                        .success(true)
                        .message("Car deleted")
                        .data(null)
                        .timestamp(Instant.now())
                        .build()
        );
    }
}
