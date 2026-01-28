package main.controllers;

import lombok.RequiredArgsConstructor;
import main.dtos.APIResponse;
import main.dtos.request.CreateCarFeatureRequest;
import main.dtos.response.CarFeatureResponse;
import main.services.CarFeatureService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/car-features")
@RequiredArgsConstructor
public class CarFeatureController {

    private final CarFeatureService carFeatureService;

    @PostMapping
    public ResponseEntity<APIResponse<CarFeatureResponse>> create(@RequestBody CreateCarFeatureRequest request) {
        CarFeatureResponse data = carFeatureService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                APIResponse.<CarFeatureResponse>builder()
                        .success(true)
                        .message("Car feature created")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @GetMapping("/{featureId}")
    public ResponseEntity<APIResponse<CarFeatureResponse>> getById(@PathVariable UUID featureId) {
        CarFeatureResponse data = carFeatureService.getById(featureId);
        return ResponseEntity.ok(
                APIResponse.<CarFeatureResponse>builder()
                        .success(true)
                        .message("OK")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<APIResponse<List<CarFeatureResponse>>> getAll() {
        List<CarFeatureResponse> data = carFeatureService.getAll();
        return ResponseEntity.ok(
                APIResponse.<List<CarFeatureResponse>>builder()
                        .success(true)
                        .message("OK")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @PutMapping("/{featureId}")
    public ResponseEntity<APIResponse<CarFeatureResponse>> update(
            @PathVariable UUID featureId,
            @RequestBody CreateCarFeatureRequest request) {
        CarFeatureResponse data = carFeatureService.update(featureId, request);
        return ResponseEntity.ok(
                APIResponse.<CarFeatureResponse>builder()
                        .success(true)
                        .message("Car feature updated")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @DeleteMapping("/{featureId}")
    public ResponseEntity<APIResponse<Void>> delete(@PathVariable UUID featureId) {
        carFeatureService.delete(featureId);
        return ResponseEntity.ok(
                APIResponse.<Void>builder()
                        .success(true)
                        .message("Car feature deleted")
                        .data(null)
                        .timestamp(Instant.now())
                        .build()
        );
    }
}
