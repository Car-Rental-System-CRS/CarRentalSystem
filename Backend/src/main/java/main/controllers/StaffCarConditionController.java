package main.controllers;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import main.dtos.response.CarConditionResponse;
import main.services.CarConditionService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import main.dtos.APIResponse;
import main.entities.MediaFile;
import main.services.MediaFileService;

@RestController
@RequestMapping("/api/staff/car-conditions")
@RequiredArgsConstructor
public class StaffCarConditionController {

    private final MediaFileService mediaFileService;
    private final CarConditionService carConditionService;

    @PostMapping(value = "/{carConditionId}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STAFF') and hasAuthority('BOOKING_MANAGE')")
    public ResponseEntity<APIResponse<Void>> uploadPhoto(
            @PathVariable UUID carConditionId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder) {

        mediaFileService.uploadCarConditionPhoto(carConditionId, file, description, displayOrder);
        return ResponseEntity.ok(
                APIResponse.<Void>builder()
                        .success(true)
                        .message("Photo uploaded successfully")
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("hasRole('STAFF') and hasAuthority('BOOKING_MANAGE')")
    public ResponseEntity<APIResponse<List<CarConditionResponse>>> getByBookingId(
            @PathVariable UUID bookingId) {
        List<CarConditionResponse> result = carConditionService.getByBookingId(bookingId);
        return ResponseEntity.ok(
                APIResponse.<List<CarConditionResponse>>builder()
                        .success(true)
                        .message("OK")
                        .data(result)
                        .timestamp(Instant.now())
                        .build()
        );
    }
}