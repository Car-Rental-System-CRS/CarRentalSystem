package main.controllers;

import lombok.RequiredArgsConstructor;
import main.dtos.APIResponse;
import main.dtos.request.CreateCarTypeRequest;
import main.dtos.response.CarTypeResponse;
import main.services.CarTypeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/car-types")
@RequiredArgsConstructor
public class CarTypeController {

    private final CarTypeService carTypeService;

    @PostMapping
    public ResponseEntity<APIResponse<CarTypeResponse>> create(@RequestBody CreateCarTypeRequest request) {
        CarTypeResponse data = carTypeService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                APIResponse.<CarTypeResponse>builder()
                        .success(true)
                        .message("Car type created")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @GetMapping("/{typeId}")
    public ResponseEntity<APIResponse<CarTypeResponse>> getById(@PathVariable UUID typeId) {
        CarTypeResponse data = carTypeService.getById(typeId);
        return ResponseEntity.ok(
                APIResponse.<CarTypeResponse>builder()
                        .success(true)
                        .message("OK")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<APIResponse<List<CarTypeResponse>>> getAll() {
        List<CarTypeResponse> data = carTypeService.getAll();
        return ResponseEntity.ok(
                APIResponse.<List<CarTypeResponse>>builder()
                        .success(true)
                        .message("OK")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @PutMapping("/{typeId}")
    public ResponseEntity<APIResponse<CarTypeResponse>> update(
            @PathVariable UUID typeId,
            @RequestBody CreateCarTypeRequest request) {
        CarTypeResponse data = carTypeService.update(typeId, request);
        return ResponseEntity.ok(
                APIResponse.<CarTypeResponse>builder()
                        .success(true)
                        .message("Car type updated")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @DeleteMapping("/{typeId}")
    public ResponseEntity<APIResponse<Void>> delete(@PathVariable UUID typeId) {
        carTypeService.delete(typeId);
        return ResponseEntity.ok(
                APIResponse.<Void>builder()
                        .success(true)
                        .message("Car type deleted")
                        .data(null)
                        .timestamp(Instant.now())
                        .build()
        );
    }
}
