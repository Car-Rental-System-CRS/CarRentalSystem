package main.controllers;

import lombok.RequiredArgsConstructor;
import main.dtos.APIResponse;
import main.dtos.request.CreateCarBrandRequest;
import main.dtos.response.CarBrandResponse;
import main.dtos.response.PageResponse;
import main.entities.CarBrand;
import main.services.CarBrandService;
import main.specification.CarBrandSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/car-brands")
@RequiredArgsConstructor
public class CarBrandController {

    private final CarBrandService carBrandService;

    @PostMapping
    @PreAuthorize("hasRole('STAFF') and hasAuthority('CAR_BRAND_CREATE')")
    public ResponseEntity<APIResponse<CarBrandResponse>> create(@RequestBody CreateCarBrandRequest request) {
        CarBrandResponse data = carBrandService.createBrand(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                APIResponse.<CarBrandResponse>builder()
                        .success(true)
                        .message("Car brand created")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<APIResponse<CarBrandResponse>> getById(@PathVariable UUID id) {
        CarBrandResponse data = carBrandService.getBrandById(id);
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
    public ResponseEntity<APIResponse<PageResponse<CarBrandResponse>>> getAll(
            @RequestParam(required = false) String name,
            Pageable pageable
    ) {

        Specification<CarBrand> specification =
                Specification.where(CarBrandSpecification.getBrandNameSpecification(name));

        Page<CarBrandResponse> result =
                carBrandService.getAllBrands(pageable, specification);

        PageResponse<CarBrandResponse> pageResponse =
                PageResponse.from(result);

        return ResponseEntity.ok(
                APIResponse.<PageResponse<CarBrandResponse>>builder()
                        .success(true)
                        .message("OK")
                        .data(pageResponse)
                        .timestamp(Instant.now())
                        .build()
        );
    }


    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STAFF') and hasAuthority('CAR_BRAND_EDIT')")
    public ResponseEntity<APIResponse<CarBrandResponse>> update(
            @PathVariable UUID id,
            @RequestBody CreateCarBrandRequest request) {
        CarBrandResponse data = carBrandService.updateBrand(id, request);
        return ResponseEntity.ok(
                APIResponse.<CarBrandResponse>builder()
                        .success(true)
                        .message("Car brand updated")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STAFF') and hasAuthority('CAR_BRAND_DELETE')")
    public ResponseEntity<APIResponse<Void>> delete(@PathVariable UUID id) {
        carBrandService.deleteBrand(id);
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
