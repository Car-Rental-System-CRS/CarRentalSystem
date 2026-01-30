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

    @GetMapping("/{brandId}")
    public ResponseEntity<APIResponse<CarBrandResponse>> getById(@PathVariable UUID brandId) {
        CarBrandResponse data = carBrandService.getBrandById(brandId);
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
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        Pageable pageable = PageRequest.of(page, size);

        Specification<CarBrand> specification =
                Specification.where(CarBrandSpecification.hasName(name));

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


    @PutMapping("/{brandId}")
    public ResponseEntity<APIResponse<CarBrandResponse>> update(
            @PathVariable UUID brandId,
            @RequestBody CreateCarBrandRequest request) {
        CarBrandResponse data = carBrandService.updateBrand(brandId, request);
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
        carBrandService.deleteBrand(brandId);
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
