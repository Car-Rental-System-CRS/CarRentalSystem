package main.controllers;

import lombok.RequiredArgsConstructor;
import main.dtos.APIResponse;
import main.dtos.request.CreateCarRequest;
import main.dtos.response.CarResponse;
import main.dtos.response.PageResponse;
import main.entities.Car;
import main.services.CarService;
import main.specification.CarSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
public class CarController {

    private final CarService carService;

    @PostMapping
    public ResponseEntity<APIResponse<CarResponse>> create(@RequestBody CreateCarRequest request) {
        CarResponse data = carService.createCar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                APIResponse.<CarResponse>builder()
                        .success(true)
                        .message("Car created")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<APIResponse<CarResponse>> getById(@PathVariable UUID id) {
        CarResponse data = carService.getCarById(id);
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
    public ResponseEntity<APIResponse<PageResponse<CarResponse>>> getAll(
            @RequestParam(required = false) String licensePlate,
            @RequestParam(required = false) LocalDate importFrom,
            @RequestParam(required = false) LocalDate importTo,
            Pageable pageable
    ) {

        Specification<Car> specification = Specification.where(CarSpecification.getLicensePlateLike(licensePlate))
                .and(CarSpecification.getImportDateFrom(importFrom))
                .and(CarSpecification.getImportDateTo(importTo));

        Page<CarResponse> result =
                carService.getAllCars(pageable, specification);

        PageResponse<CarResponse> pageResponse =
                PageResponse.from(result);

        return ResponseEntity.ok(
                APIResponse.<PageResponse<CarResponse>>builder()
                        .success(true)
                        .message("OK")
                        .data(pageResponse)
                        .timestamp(Instant.now())
                        .build()
        );
    }


    @PutMapping("/{id}")
    public ResponseEntity<APIResponse<CarResponse>> update(
            @PathVariable UUID id,
            @RequestBody CreateCarRequest request) {
        CarResponse data = carService.updateCar(id, request);
        return ResponseEntity.ok(
                APIResponse.<CarResponse>builder()
                        .success(true)
                        .message("Car updated")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<APIResponse<Void>> delete(@PathVariable UUID id) {
        carService.deleteCar(id);
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
