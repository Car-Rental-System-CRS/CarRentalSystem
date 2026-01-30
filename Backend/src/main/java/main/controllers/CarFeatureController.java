package main.controllers;

import lombok.RequiredArgsConstructor;
import main.dtos.APIResponse;
import main.dtos.request.CreateCarFeatureRequest;
import main.dtos.response.CarBrandResponse;
import main.dtos.response.CarFeatureResponse;
import main.dtos.response.PageResponse;
import main.entities.CarBrand;
import main.entities.CarFeature;
import main.services.CarFeatureService;
import main.specification.CarBrandSpecification;
import main.specification.CarFeatureSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
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
        CarFeatureResponse data = carFeatureService.createFeature(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                APIResponse.<CarFeatureResponse>builder()
                        .success(true)
                        .message("Car feature created")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<APIResponse<CarFeatureResponse>> getById(@PathVariable UUID id) {
        CarFeatureResponse data = carFeatureService.getFeatureById(id);
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
    public ResponseEntity<APIResponse<PageResponse<CarFeatureResponse>>> getAll(
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        Pageable pageable = PageRequest.of(page, size);

        Specification<CarFeature> specification =
                Specification.where(CarFeatureSpecification.hasName(name));

        Page<CarFeatureResponse> result =
                carFeatureService.getAllFeatures(pageable, specification);

        PageResponse<CarFeatureResponse> pageResponse =
                PageResponse.from(result);

        return ResponseEntity.ok(
                APIResponse.<PageResponse<CarFeatureResponse>>builder()
                        .success(true)
                        .message("OK")
                        .data(pageResponse)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<APIResponse<CarFeatureResponse>> update(
            @PathVariable UUID id,
            @RequestBody CreateCarFeatureRequest request) {
        CarFeatureResponse data = carFeatureService.updateFeature(id, request);
        return ResponseEntity.ok(
                APIResponse.<CarFeatureResponse>builder()
                        .success(true)
                        .message("Car feature updated")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<APIResponse<Void>> delete(@PathVariable UUID id) {
        carFeatureService.deleteFeature(id);
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
