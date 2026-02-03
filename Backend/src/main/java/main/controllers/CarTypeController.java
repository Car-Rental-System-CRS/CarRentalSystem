package main.controllers;

import lombok.RequiredArgsConstructor;
import main.dtos.APIResponse;
import main.dtos.request.CreateCarTypeRequest;
import main.dtos.response.CarTypeResponse;
import main.dtos.response.PageResponse;
import main.entities.CarType;
import main.services.CarTypeService;
import main.specification.CarTypeSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/car-types")
@RequiredArgsConstructor
public class CarTypeController {

    private final CarTypeService carTypeService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<APIResponse<CarTypeResponse>> create(
            @ModelAttribute CreateCarTypeRequest request,
            @RequestParam(value = "images", required = false) MultipartFile[] images) {
        CarTypeResponse data = carTypeService.createType(request, images);
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
            @RequestParam(required = false) Double consumptionKwhPerKm,
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

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<APIResponse<CarTypeResponse>> update(
            @PathVariable UUID id,
            @ModelAttribute CreateCarTypeRequest request,
            @RequestParam(value = "images", required = false) MultipartFile[] images) {
        CarTypeResponse data = carTypeService.updateType(id, request, images);
        return ResponseEntity.ok(
                APIResponse.<CarTypeResponse>builder()
                        .success(true)
                        .message("Car type updated")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @DeleteMapping("/{id}")
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

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<APIResponse<CarTypeResponse>> addImages(
            @PathVariable UUID id,
            @RequestParam("images") MultipartFile[] images) {
        CarTypeResponse data = carTypeService.addImagesToCarType(id, images);
        return ResponseEntity.ok(
                APIResponse.<CarTypeResponse>builder()
                        .success(true)
                        .message("Images added to car type")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<APIResponse<Void>> removeImage(@PathVariable UUID imageId) {
        carTypeService.removeImageFromCarType(imageId);
        return ResponseEntity.ok(
                APIResponse.<Void>builder()
                        .success(true)
                        .message("Image removed from car type")
                        .data(null)
                        .timestamp(Instant.now())
                        .build()
        );
    }
}
