package main.controllers;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import main.dtos.APIResponse;
import main.dtos.request.CreateCarTypeRequest;
import main.dtos.response.CarAvailabilityResponse;
import main.dtos.response.CarResponse;
import main.dtos.response.CarTypeResponse;
import main.dtos.response.PageResponse;
import main.entities.CarType;
import main.services.CarTypeService;
import main.specification.CarTypeSpecification;

@RestController
@RequestMapping("/api/car-types")
@RequiredArgsConstructor
public class CarTypeController {

    private final CarTypeService carTypeService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STAFF') and hasAuthority('CAR_TYPE_CREATE')")
    public ResponseEntity<APIResponse<CarTypeResponse>> create(
            @ModelAttribute CreateCarTypeRequest request,
            @RequestParam(value = "images", required = false) MultipartFile[] images,
            @RequestParam(value = "imageDescriptions", required = false) List<String> imageDescriptionsList) {
        
        // Convert List to array for service method
        String[] imageDescriptions = imageDescriptionsList != null ? 
                        imageDescriptionsList.toArray(String[]::new) : new String[0];
        
        CarTypeResponse data = carTypeService.createType(request, images, imageDescriptions);
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

    @GetMapping("/{id}/availability")
    public ResponseEntity<APIResponse<CarAvailabilityResponse>> checkAvailability(
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime pickupDateTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime returnDateTime
    ) {
        CarAvailabilityResponse data = carTypeService.checkAvailability(id, pickupDateTime, returnDateTime);
        return ResponseEntity.ok(
                APIResponse.<CarAvailabilityResponse>builder()
                        .success(true)
                        .message("OK")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

        @GetMapping("/{id}/available-cars")
        public ResponseEntity<APIResponse<List<CarResponse>>> getAvailableCars(
                        @PathVariable UUID id,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime pickupDateTime,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime returnDateTime
        ) {
                List<CarResponse> data = carTypeService.getAvailableCars(id, pickupDateTime, returnDateTime);
                return ResponseEntity.ok(
                                APIResponse.<List<CarResponse>>builder()
                                                .success(true)
                                                .message("OK")
                                                .data(data)
                                                .timestamp(Instant.now())
                                                .build()
                );
        }

    @GetMapping
    public ResponseEntity<APIResponse<PageResponse<CarTypeResponse>>> getAll(
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "numberOfSeats", required = false) Integer numberOfSeats,
            @RequestParam(value = "consumptionKwhPerKm", required = false) Double consumptionKwhPerKm,
            @RequestParam(value = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(value = "maxPrice", required = false) BigDecimal maxPrice,
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
    @PreAuthorize("hasRole('STAFF') and hasAuthority('CAR_TYPE_EDIT')")
    public ResponseEntity<APIResponse<CarTypeResponse>> update(
            @PathVariable UUID id,
            @ModelAttribute CreateCarTypeRequest request,
            @RequestParam(value = "images", required = false) MultipartFile[] images,
            @RequestParam(value = "imageDescriptions", required = false) List<String> imageDescriptionsList) {
        
        // Convert List to array for service method
        String[] imageDescriptions = imageDescriptionsList != null ? 
                        imageDescriptionsList.toArray(String[]::new) : new String[0];
        
        CarTypeResponse data = carTypeService.updateType(id, request, images, imageDescriptions);
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
    @PreAuthorize("hasRole('STAFF') and hasAuthority('CAR_TYPE_DELETE')")
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
    @PreAuthorize("hasRole('STAFF') and hasAuthority('CAR_TYPE_IMAGE_MANAGE')")
    public ResponseEntity<APIResponse<CarTypeResponse>> addImages(
            @PathVariable UUID id,
            @RequestParam("images") MultipartFile[] images,
            @RequestParam(value = "imageDescriptions", required = false) List<String> imageDescriptionsList) {
        
        // Convert List to array for service method
        String[] imageDescriptions = imageDescriptionsList != null ? 
                        imageDescriptionsList.toArray(String[]::new) : new String[0];
        
        CarTypeResponse data = carTypeService.addImagesToCarType(id, images, imageDescriptions);
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
    @PreAuthorize("hasRole('STAFF') and hasAuthority('CAR_TYPE_IMAGE_MANAGE')")
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
