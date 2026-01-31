package main.controllers;

import lombok.RequiredArgsConstructor;
import main.dtos.APIResponse;
import main.dtos.request.CreateCarTypeRequest;
import main.dtos.response.CarFeatureResponse;
import main.dtos.response.CarTypeResponse;
import main.dtos.response.PageResponse;
import main.entities.CarFeature;
import main.entities.CarType;
import main.services.CarTypeService;
import main.specification.CarFeatureSpecification;
import main.specification.CarTypeSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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
        CarTypeResponse data = carTypeService.createType(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                APIResponse.<CarTypeResponse>builder()
                        .success(true)
                        .message("Car type created")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<APIResponse<CarTypeResponse>> getById(@PathVariable UUID id) {
        CarTypeResponse data = carTypeService.getTypeById(id);
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
    public ResponseEntity<APIResponse<PageResponse<CarTypeResponse>>> getAll(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer numberOfSeats,
            @RequestParam(required = false) double consumptionKwhPerKm,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            Pageable pageable
    ) {

        Specification<CarType> specification =
                Specification.where(CarTypeSpecification.getTypeNameSpecification(name))
                        .and(CarTypeSpecification.getTypeNumberOfSeatsSpecification(numberOfSeats))
                        .and(CarTypeSpecification.getConsumptionLessThanOrEqual(consumptionKwhPerKm))
                        .and(CarTypeSpecification.getPriceGreaterThanOrEqual(minPrice))
                        .and(CarTypeSpecification.getPriceLessThanOrEqual(maxPrice));

        Page<CarTypeResponse> result =
                carTypeService.getAllTypes(pageable, specification);

        PageResponse<CarTypeResponse> pageResponse =
                PageResponse.from(result);

        return ResponseEntity.ok(
                APIResponse.<PageResponse<CarTypeResponse>>builder()
                        .success(true)
                        .message("OK")
                        .data(pageResponse)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<APIResponse<CarTypeResponse>> update(
            @PathVariable UUID id,
            @RequestBody CreateCarTypeRequest request) {
        CarTypeResponse data = carTypeService.updateType(id, request);
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
    public ResponseEntity<APIResponse<Void>> delete(@PathVariable UUID id) {
        carTypeService.deleteType(id);
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
