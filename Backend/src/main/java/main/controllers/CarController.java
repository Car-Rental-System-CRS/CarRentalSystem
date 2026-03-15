package main.controllers;

import lombok.RequiredArgsConstructor;
import main.dtos.APIResponse;
import main.dtos.request.CreateCarRequest;
import main.dtos.response.CarResponse;
import main.dtos.response.MediaFileResponse;
import main.dtos.response.PageResponse;
import main.entities.Car;
import main.services.CarService;
import main.specification.CarSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    @PreAuthorize("hasRole('STAFF') and hasAuthority('CAR_CREATE')")
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
            @RequestParam(required = false) UUID typeId,
            Pageable pageable
    ) {

        Specification<Car> specification = Specification.where(CarSpecification.getLicensePlateLike(licensePlate))
                .and(CarSpecification.getImportDateFrom(importFrom))
                .and(CarSpecification.getImportDateTo(importTo))
                .and(CarSpecification.getTypeId(typeId));

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
    @PreAuthorize("hasRole('STAFF') and hasAuthority('CAR_EDIT')")
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

    @PostMapping(value = "/{id}/damage-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STAFF') and hasAuthority('CAR_EDIT')")
    public ResponseEntity<APIResponse<List<MediaFileResponse>>> uploadDamageImages(
            @PathVariable UUID id,
            @RequestParam("images") MultipartFile[] images,
            @RequestParam(value = "imageDescriptions", required = false) List<String> imageDescriptionsList) {

        if (images == null || images.length == 0) {
            throw new IllegalArgumentException("No images provided");
        }

        if (images.length > 10) {
            throw new IllegalArgumentException("Maximum 10 damage images are allowed per request");
        }

        String[] imageDescriptions = imageDescriptionsList != null
                ? imageDescriptionsList.toArray(String[]::new) : new String[0];

        List<MediaFileResponse> data = carService.addDamageImages(id, images, imageDescriptions);
        return ResponseEntity.ok(
                APIResponse.<List<MediaFileResponse>>builder()
                        .success(true)
                        .message("Damage images uploaded")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @DeleteMapping("/{id}/damage-images/{imageId}")
    @PreAuthorize("hasRole('STAFF') and hasAuthority('CAR_EDIT')")
    public ResponseEntity<APIResponse<Void>> deleteDamageImage(
            @PathVariable UUID id,
            @PathVariable UUID imageId) {
        carService.removeDamageImage(id, imageId);
        return ResponseEntity.ok(
                APIResponse.<Void>builder()
                        .success(true)
                        .message("Damage image deleted")
                        .data(null)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STAFF') and hasAuthority('CAR_DELETE')")
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
